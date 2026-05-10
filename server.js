require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/validate', async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim() === '') {
    return res.status(400).json({ error: 'Please provide a business idea.' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a sharp business analyst. Analyze this business idea and respond ONLY in this exact JSON format with no extra text:

{
  "verdict": "Strong Idea" or "Needs Work" or "High Risk",
  "score": a number from 1 to 10,
  "market_opportunity": "2-3 sentences about the market size and demand",
  "competition": "2-3 sentences about who the competitors are",
  "risks": "2-3 sentences about the main risks",
  "next_steps": ["step 1", "step 2", "step 3"],
  "summary": "One punchy sentence verdict on this idea"
}

Business idea: ${idea}`,
        },
      ],
    });

    const raw = message.content[0].text.trim();
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
