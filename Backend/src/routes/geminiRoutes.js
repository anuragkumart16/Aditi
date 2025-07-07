import express from 'express';
import { geminiChatHandler } from '../controller/geminiController.js';

const router = express.Router();

router.post('/chat', geminiChatHandler);

export default router; 