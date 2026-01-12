FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Hugging Face Spaces specific port
    PORT=7860

# Create a non-root user for security (required by some HF Spaces configurations)
RUN useradd -m -u 1000 user

# Set working directory
WORKDIR /app

# Install system dependencies if needed (e.g., git for some pip installs)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Using --no-cache-dir to keep image size smaller
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY app.py .

# Change ownership to the non-root user
RUN chown -R user:user /app

# Switch to non-root user
USER user

# Expose the port (informative documentation)
EXPOSE 7860

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
