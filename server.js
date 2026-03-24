require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PORT = process.env.PORT || 3000;
const INDEX_NAME = 'metalpatti';

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

const CATALOG_KEYWORDS = ['catalog', 'brochure', 'price list', 'designs'];
const PRICING_KEYWORDS = ['price', 'cost', 'rate', 'how much'];

function containsKeyword(message, keywords) {
  const lower = message.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

async function searchPinecone(query) {
  try {
    const index = pc.index(INDEX_NAME).namespace('products');
    const results = await index.searchRecords({
      query: { inputs: { text: query }, topK: 4 },
      fields: ['chunk_text', 'category']
    });
    return results.result?.hits?.map(h => h.fields?.chunk_text).filter(Boolean).join('\n\n') || '';
  } catch (err) {
    console.error('Pinecone error:', err.message);
    return '';
  }
}

async function askAI(userMessage, context) {
  const systemPrompt = `You are a friendly and knowledgeable sales assistant for MetalPatti, a premium stainless steel decorative profiles manufacturer based in Pune, India.

Use the context below to answer the user's question accurately. If the context is relevant, use it. If not, use your general knowledge about MetalPatti.

CONTEXT FROM KNOWLEDGE BASE:
${context}

GUIDELINES:
- Be warm, helpful, and conversational
- Give detailed and useful answers
- Always suggest contacting the team for pricing, bulk orders, or custom requirements
- Contact: WhatsApp/Phone +91 8805606363 | Email: sales@metalpatti.com
- Never make up specific prices or dimensions
- If asked for contact info, always share it`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('OpenRouter error:', err);
    throw new Error('AI service error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
}

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  // Catalog intent
  if (containsKeyword(message, CATALOG_KEYWORDS)) {
    return res.json({
      reply: "Here's our Metalpatti catalog 👇",
      catalog: 'https://drive.google.com/file/d/1vSeJELrB7jSg4t_d-if2_xJ6_Fo6ieFy/view?usp=sharing'
    });
  }

  // Pricing intent
  if (containsKeyword(message, PRICING_KEYWORDS)) {
    return res.json({
      reply: 'Prices vary based on product type, finish, size & quantity.\n\n📞 WhatsApp: +91 8805606363\n📧 Email: sales@metalpatti.com\n\nOur team will get back to you quickly with the best quote!'
    });
  }

  // RAG: search Pinecone + ask AI
  try {
    const context = await searchPinecone(message);
    const reply = await askAI(message, context);

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI.' });
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Metalpatti chatbot running on http://localhost:${PORT}`);
});
