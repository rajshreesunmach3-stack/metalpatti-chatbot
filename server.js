const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `You are a friendly and knowledgeable sales assistant for MetalPatti, a premium stainless steel decorative profiles manufacturer based in Pune, India.

COMPANY INFO:
- Name: MetalPatti (by FeCuNi)
- Established: 2016
- Location: S-29, Parvati Industrial Estate, Pune-Satara Road, Pune 411009, Maharashtra, India
- Phone/WhatsApp: +91 8805606363
- Email: sales@metalpatti.com
- Tagline: "Quality Beyond Measure"
- 250+ products, 750+ satisfied clients, 10+ European & Japanese machines

PRODUCT CATEGORIES:
1. T Profiles – Decorative trim for tiles and floors
2. U Profiles – Modern wall and panel accents
3. Transition Profiles – Trim for level differences between surfaces
4. Tile Edging Profiles – Corner protection for tiles
5. Corner Protection Profiles – L-shaped wall corner trim
6. Skirting Profiles – Base trim for walls
7. Stair Nosing Profiles – Anti-slip edge protection for stairs
8. Decorative Sheets – Stainless steel decorative sheets
9. Custom Profiles – Tailor-made solutions for specific needs

MATERIALS & FINISHES:
- Material: Premium Stainless Steel
- Special Coating: PVD (Physical Vapor Deposition) coating
- Available Finishes: Gold, Rose Gold, Black, Silver/Brushed, Mirror finish
- Protective Films: 70-micron Novacel laser film + 30-micron quality film for scratch protection

MANUFACTURING:
- Advanced V-grooving machines
- 7-axis Amada press brake for precision
- Inventory of up to 10,000 PVD-coated stainless steel sheets
- Strict dimensional accuracy and supervised handling

USE CASES:
- Interior wall cladding and decorative accents
- Bathroom and kitchen tile edging
- Flooring transitions between rooms
- Staircase edge protection
- Skirting boards
- Corner guards in commercial and residential spaces
- Hotels, offices, showrooms, luxury homes

HOW TO RESPOND:
- Be warm, helpful and conversational
- Give detailed, useful answers — don't cut answers too short
- If asked about specific products, explain what they are and where they're used
- If asked about finishes, list all available options with use case suggestions
- If asked about installation, give general guidance
- If asked about pricing or bulk orders, say: "Prices vary based on size, finish & quantity. Contact us on WhatsApp: +91 8805606363 or email sales@metalpatti.com for a quote."
- If asked for contact info, always share: Phone/WhatsApp +91 8805606363, Email: sales@metalpatti.com
- Never make up specific prices or dimensions
- Always suggest the user contact the team for custom requirements`;

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
      reply: 'Prices vary based on product type, finish, size & quantity. For an accurate quote, contact us:\n📞 WhatsApp: +91 8805606363\n📧 Email: sales@metalpatti.com\nOur team will get back to you quickly!'
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
