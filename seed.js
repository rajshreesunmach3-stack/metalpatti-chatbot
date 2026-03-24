require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const INDEX_NAME = 'metalpatti';

const PRODUCT_DATA = [
  // Company Overview
  {
    id: 'company-overview',
    text: 'MetalPatti is a premium stainless steel decorative profiles manufacturer established in 2016, operated by FeCuNi. Located at S-29, Parvati Industrial Estate, Pune-Satara Road, Pune 411009, Maharashtra, India. We have 250+ products, 750+ satisfied clients, and 10+ European and Japanese machines. Our tagline is "Quality Beyond Measure". Contact: +91 8805606363, sales@metalpatti.com.',
    category: 'company'
  },
  // T Profiles
  {
    id: 't-profiles',
    text: 'T Profiles by MetalPatti are decorative stainless steel trim profiles shaped like the letter T. They are used to cover joints between two flooring surfaces at the same level, such as between tiles and wooden flooring. They provide a clean, professional finish at floor transitions. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror finishes with PVD coating.',
    category: 'product'
  },
  // U Profiles
  {
    id: 'u-profiles',
    text: 'U Profiles by MetalPatti are modern stainless steel wall and panel accent profiles shaped like the letter U. They are used to frame tiles, panels, glass, or mirrors on walls. Ideal for bathrooms, kitchens, and accent walls. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror finishes with PVD coating.',
    category: 'product'
  },
  // Transition Profiles
  {
    id: 'transition-profiles',
    text: 'Transition Profiles by MetalPatti are used to bridge level differences between two flooring surfaces such as tiles to carpet, tiles to wood, or room to room transitions. They provide a smooth, safe, and aesthetically pleasing transition. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror finishes.',
    category: 'product'
  },
  // Tile Edging Profiles
  {
    id: 'tile-edging',
    text: 'Tile Edging Profiles by MetalPatti provide corner protection and a finished edge for tiles. They prevent chipping and cracking at exposed tile edges. Commonly used in bathrooms, kitchens, balconies, and around steps. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror PVD finishes.',
    category: 'product'
  },
  // Corner Protection
  {
    id: 'corner-profiles',
    text: 'Corner Protection Profiles by MetalPatti are L-shaped stainless steel profiles used to protect and decorate wall corners. They prevent damage from impacts and give a sharp, clean look to corners in homes, offices, hotels, and showrooms. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror finishes.',
    category: 'product'
  },
  // Skirting
  {
    id: 'skirting-profiles',
    text: 'Skirting Profiles by MetalPatti are used as base trim at the junction of walls and floors. They protect the base of walls and give a premium finished look to interiors. Perfect for living rooms, bedrooms, offices, and commercial spaces. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror PVD finishes.',
    category: 'product'
  },
  // Stair Nosing
  {
    id: 'stair-nosing',
    text: 'Stair Nosing Profiles by MetalPatti are placed on the edge of stair steps to provide anti-slip protection and a clean finish. They improve safety and aesthetics of staircases in homes, offices, hotels, malls, and commercial spaces. Available in Gold, Rose Gold, Black, Silver/Brushed, and Mirror finishes.',
    category: 'product'
  },
  // Decorative Sheets
  {
    id: 'decorative-sheets',
    text: 'Decorative Stainless Steel Sheets by MetalPatti are used for wall cladding, furniture accents, lift interiors, reception desks, and feature walls. They are available in PVD-coated finishes: Gold, Rose Gold, Black, Silver/Brushed, and Mirror. Protected with 70-micron Novacel laser film and 30-micron secondary film to prevent scratches.',
    category: 'product'
  },
  // Custom Profiles
  {
    id: 'custom-profiles',
    text: 'MetalPatti offers Custom Profile manufacturing for clients with specific design requirements. Using a 7-axis Amada press brake, we can create any shape or size of stainless steel profile. Ideal for architects, interior designers, and contractors with unique project needs. Contact us at +91 8805606363 or sales@metalpatti.com for custom orders.',
    category: 'product'
  },
  // Finishes
  {
    id: 'finishes',
    text: 'MetalPatti products are available in the following PVD-coated finishes: 1) Gold – warm luxury finish, ideal for premium interiors, 2) Rose Gold – elegant pinkish-gold tone, popular in modern homes, 3) Black – bold and contemporary, great for modern and industrial interiors, 4) Silver/Brushed – classic metallic look, suits minimal and contemporary spaces, 5) Mirror – high-gloss reflective finish, adds depth and luxury to any space. All finishes are coated using PVD (Physical Vapor Deposition) technology for durability.',
    category: 'finishes'
  },
  // Use Cases
  {
    id: 'use-cases',
    text: 'MetalPatti stainless steel profiles are used in: Residential interiors – living rooms, bedrooms, bathrooms, kitchens. Commercial spaces – offices, showrooms, retail stores. Hospitality – hotels, restaurants, cafes, resorts. Healthcare – hospitals, clinics. Educational institutions – schools, colleges. Staircases – anti-slip nosing profiles. Flooring transitions – between tiles, wood, marble. Wall cladding – feature walls, lift interiors, reception counters.',
    category: 'use-cases'
  },
  // Manufacturing
  {
    id: 'manufacturing',
    text: 'MetalPatti manufacturing capabilities include: Advanced V-grooving machines for precision cutting, 7-axis Amada press brake for complex profile shapes, Inventory of up to 10,000 PVD-coated stainless steel sheets, Double-layer protective films: 70-micron Novacel laser film + 30-micron secondary film. All products undergo strict dimensional accuracy checks and supervised handling and packaging.',
    category: 'manufacturing'
  },
  // Pricing
  {
    id: 'pricing',
    text: 'MetalPatti pricing depends on the product type, finish, size, and quantity. Bulk orders are available with competitive pricing. For accurate pricing and quotations, contact our sales team at +91 8805606363 (WhatsApp available) or email sales@metalpatti.com. Our team will respond promptly with the best pricing.',
    category: 'pricing'
  },
  // Contact
  {
    id: 'contact',
    text: 'MetalPatti contact details: Phone and WhatsApp: +91 8805606363. Email: sales@metalpatti.com. Address: S-29, Parvati Industrial Estate, Pune-Satara Road, Pune 411009, Maharashtra, India. Social Media: Facebook, Instagram, LinkedIn, YouTube. Our sales team is available for product queries, custom orders, bulk pricing, and technical assistance.',
    category: 'contact'
  },
  // Installation
  {
    id: 'installation',
    text: 'MetalPatti profiles are designed for easy installation. T and U profiles are typically fixed using adhesive or screws into the substrate. Tile edging profiles are installed during tiling before grouting. Skirting profiles are glued or mechanically fixed to the wall base. Stair nosing profiles are fixed to stair edges using adhesive or screws. Corner profiles are installed at wall corners during finishing. For best results, professional installation is recommended.',
    category: 'installation'
  },
  // FAQ
  {
    id: 'faq-minimum-order',
    text: 'Frequently Asked Question: What is the minimum order quantity at MetalPatti? MetalPatti caters to both small and bulk orders. For minimum order quantities and pricing, please contact us at +91 8805606363 or sales@metalpatti.com.',
    category: 'faq'
  },
  {
    id: 'faq-customization',
    text: 'Frequently Asked Question: Can MetalPatti make custom sizes or profiles? Yes, MetalPatti specializes in custom profiles. Using our 7-axis Amada press brake and advanced machinery, we can manufacture profiles to any specification. Contact us at +91 8805606363 to discuss your custom requirements.',
    category: 'faq'
  },
  {
    id: 'faq-delivery',
    text: 'Frequently Asked Question: Does MetalPatti deliver across India? MetalPatti is based in Pune, Maharashtra and serves clients across India. For delivery timelines and shipping costs, please contact our sales team at +91 8805606363 or sales@metalpatti.com.',
    category: 'faq'
  },
  {
    id: 'faq-pvd',
    text: 'Frequently Asked Question: What is PVD coating? PVD stands for Physical Vapor Deposition. It is a premium coating process that deposits a thin, extremely hard layer of material onto the stainless steel surface. PVD coating provides excellent durability, scratch resistance, and a luxurious finish. MetalPatti uses PVD coating for all its colored finishes including Gold, Rose Gold, and Black.',
    category: 'faq'
  }
];

async function seed() {
  console.log('Checking Pinecone index...');

  const existingIndexes = await pc.listIndexes();
  const indexNames = existingIndexes.indexes?.map(i => i.name) || [];

  if (!indexNames.includes(INDEX_NAME)) {
    console.log('Creating Pinecone index...');
    await pc.createIndexForModel({
      name: INDEX_NAME,
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: 'chunk_text' }
      },
      waitUntilReady: true
    });
    console.log('Index created!');
  } else {
    console.log('Index already exists.');
  }

  const index = pc.index(INDEX_NAME).namespace('products');

  console.log(`Upserting ${PRODUCT_DATA.length} records...`);
  const records = PRODUCT_DATA.map(item => ({
    _id: item.id,
    chunk_text: item.text,
    category: item.category
  }));

  await index.upsertRecords({ records });
  console.log('All product data seeded successfully!');
}

seed().catch(console.error);
