import axios from 'axios';

export const geminiChatHandler = async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY not set in environment.' });
  }
  if (!message) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
    // Use the free tier supported model and endpoint
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: message }] }]
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini API.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.error?.message || err.message });
  }
}; 