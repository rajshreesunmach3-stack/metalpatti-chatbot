const express = require('express');
const app = express();

app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `You are a Metalpatti sales assistant.
Answer in simple English.
Keep answers short (max 2–3 lines).
Help users choose products.

Products:
- Decorative stainless steel pattis
- Finishes: Gold, Rose Gold, Black
- Used in interiors

If user asks for bulk or pricing, ask for contact details.
Do not give wrong or made-up answers.`;

const CATALOG_KEYWORDS = ['catalog', 'brochure', 'price list', 'designs'];
const PRICING_KEYWORDS = ['price', 'cost', 'rate'];

function containsKeyword(message, keywords) {
  const lower = message.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required and must be a string' });
  }

  // Catalog logic — no AI call needed
  if (containsKeyword(message, CATALOG_KEYWORDS)) {
    return res.json({
      reply: "Here's our Metalpatti catalog 👇",
      catalog: 'https://drive.google.com/file/d/1vSeJELrB7jSg4t_d-if2_xJ6_Fo6ieFy/view?usp=sharing'
    });
  }

  // Pricing logic — no AI call needed
  if (containsKeyword(message, PRICING_KEYWORDS)) {
    return res.json({
      reply: 'Prices depend on size & quantity. Share your number, our team will assist you.'
    });
  }

  // AI fallback via OpenRouter
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return res.status(502).json({ error: 'AI service unavailable. Please try again.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI.' });
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Metalpatti chatbot running on http://localhost:${PORT}`);
});
