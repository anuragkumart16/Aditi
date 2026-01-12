import os
import threading
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TextIteratorStreamer,
)


# --------------------------------------------------
# Logging
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# Configuration
# --------------------------------------------------
MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
DEVICE = "cpu"
DTYPE = torch.float32  # CPU-safe, stable

# Shared secret (must be set in HF Space + Next.js)
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")

if not INTERNAL_API_KEY:
    logger.warning("INTERNAL_API_KEY is not set. Server is NOT protected.")

# --------------------------------------------------
# Globals
# --------------------------------------------------
model = None
tokenizer = None

# --------------------------------------------------
# Lifespan (load model once)
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer
    try:
        logger.info("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

        logger.info("Loading model...")
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=DTYPE,
            device_map=DEVICE,
            low_cpu_mem_usage=True,
        )

        logger.info("Model loaded successfully.")
        yield

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise RuntimeError(e)

    finally:
        logger.info("Shutting down...")
        del model
        del tokenizer

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="LLM Streaming Engine",
    description="Pure execution engine for streaming text generation",
    version="1.0.0",
    lifespan=lifespan,
)

# --------------------------------------------------
# Request Schema
# --------------------------------------------------
class ChatRequest(BaseModel):
    prompt: str = Field(..., description="Fully constructed prompt (system + memory + user)")
    max_new_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    top_k: Optional[int] = 50

# --------------------------------------------------
# Streaming Generator
# --------------------------------------------------
def stream_generate(request: ChatRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    logger.info(f"Prompt length: {len(request.prompt)} chars")

    inputs = tokenizer(
        request.prompt,
        return_tensors="pt"
    ).to(DEVICE)

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )

    generation_kwargs = dict(
        **inputs,
        streamer=streamer,
        max_new_tokens=request.max_new_tokens,
        do_sample=True,
        temperature=request.temperature,
        top_p=request.top_p,
        top_k=request.top_k,
        pad_token_id=tokenizer.eos_token_id,
    )

    thread = threading.Thread(
        target=model.generate,
        kwargs=generation_kwargs,
    )
    thread.start()

    try:
        for token in streamer:
            yield token
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        yield "\n[ERROR]\n"
    finally:
        thread.join(timeout=1.0)

# --------------------------------------------------
# Endpoints
# --------------------------------------------------
@app.post("/chat")
async def chat(request: Request, payload: ChatRequest):
    # --- AUTH CHECK ---
    key = request.headers.get("x-internal-key")
    if key != INTERNAL_API_KEY:
        logger.warning("Unauthorized request blocked")
        raise HTTPException(status_code=401, detail="Unauthorized")

    return StreamingResponse(
        stream_generate(payload),
        media_type="text/plain",
    )

@app.get("/health")
async def health():
    if model and tokenizer:
        return {"status": "ok", "model": MODEL_ID}
    raise HTTPException(status_code=503, detail="Model not ready")

# --------------------------------------------------
# Local Dev Entry
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
