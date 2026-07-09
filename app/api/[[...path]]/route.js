import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb, getGemini, validateEnv } from '@/lib/server-init'

export const dynamic = "force-dynamic";

export { getDb };

let isMock = false

// In-memory mock database
const MEMORY_DB = {
  products: null,
  orders: [],
  payments: [],
  users: [],
  newsletter: [],
  reviews: [],
  contacts: [],
  conversations: []
};

function createMockDb() {
  if (MEMORY_DB.products === null) {
    MEMORY_DB.products = [...(SEED_PRODUCTS || [])];
  }
  return {
    collection(colName) {
      if (!MEMORY_DB[colName]) {
        MEMORY_DB[colName] = [];
      }
      const data = MEMORY_DB[colName];

      return {
        async countDocuments() {
          return data.length;
        },
        async insertMany(docs) {
          data.push(...docs);
          return { insertedCount: docs.length };
        },
        async insertOne(doc) {
          data.push(doc);
          return { insertedId: doc.id || doc._id || Math.random().toString() };
        },
        async findOne(query) {
          return data.find(item => matchesQuery(item, query)) || null;
        },
        find(query) {
          let filtered = data.filter(item => matchesQuery(item, query));
          
          return {
            sort(sortObj) {
              const keys = Object.keys(sortObj || {});
              if (keys.length > 0) {
                const key = keys[0];
                const order = sortObj[key];
                filtered.sort((a, b) => {
                  if (a[key] < b[key]) return -1 * order;
                  if (a[key] > b[key]) return 1 * order;
                  return 0;
                });
              }
              return this;
            },
            limit(n) {
              filtered = filtered.slice(0, n);
              return this;
            },
            async toArray() {
              return filtered;
            }
          };
        },
        async updateOne(query, update, options = {}) {
          let item = data.find(i => matchesQuery(i, query));
          if (!item && options.upsert) {
            item = {};
            data.push(item);
          }
          if (item) {
            if (update.$set) {
              Object.assign(item, update.$set);
            }
            if (update.$setOnInsert && options.upsert) {
              Object.assign(item, update.$setOnInsert);
            }
            if (update.$push) {
              for (const [key, value] of Object.entries(update.$push)) {
                if (!item[key]) item[key] = [];
                if (value && typeof value === 'object' && value.$each) {
                  item[key].push(...value.$each);
                } else {
                  item[key].push(value);
                }
              }
            }
            return { modifiedCount: 1, upsertedCount: options.upsert ? 1 : 0 };
          }
          return { modifiedCount: 0 };
        }
      };
    }
  };
}

function matchesQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  
  if (query.$or) {
    return query.$or.some(subQuery => matchesQuery(item, subQuery));
  }
  
  for (const [key, value] of Object.entries(query)) {
    if (value && typeof value === 'object') {
      if (value.$gte !== undefined || value.$lte !== undefined) {
        const val = item[key];
        if (value.$gte !== undefined && val < value.$gte) return false;
        if (value.$lte !== undefined && val > value.$lte) return false;
        continue;
      }
      if (value.$regex !== undefined) {
        const val = item[key] || '';
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(val)) return false;
        continue;
      }
      if (value.$ne !== undefined) {
        if (item[key] === value.$ne) return false;
        continue;
      }
    }
    if (item[key] !== value) return false;
  }
  return true;
}
// Product seed data — premium fashion mockups
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Nebula Oversized Hoodie', slug: 'nebula-oversized-hoodie', category: 'oversized', gender: 'unisex', price: 3499, mrp: 5999, discount: 42, images: ['https://images.unsplash.com/photo-1472417583565-62e7bdeda490?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85','https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Chrome Silver','Cyber Blue'], sizes: ['S','M','L','XL','XXL'], stock: 42, rating: 4.8, reviews: 284, tags: ['bestseller','new'], description: 'Engineered from ultra-premium 480 GSM French terry. Drop shoulder cut, boxy silhouette, mirror-metallic Velora emblem. Wear the future.', material: '80% Cotton / 20% Recycled Polyester', badge: 'BESTSELLER' },
  { id: 'p2', name: 'Chrome Utility Cargo', slug: 'chrome-utility-cargo', category: 'bottoms', gender: 'men', price: 2799, mrp: 4499, discount: 38, images: ['https://images.unsplash.com/photo-1557130680-0f816eef4743?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Obsidian','Graphite'], sizes: ['28','30','32','34','36'], stock: 68, rating: 4.7, reviews: 156, tags: ['new'], description: 'Techwear cargo trousers with reinforced knee panels and reflective piping. Water-repellent finish.', material: 'Ripstop Nylon Blend', badge: 'NEW' },
  { id: 'p3', name: 'Ethereal Silk Slip Dress', slug: 'ethereal-silk-slip-dress', category: 'dresses', gender: 'women', price: 4299, mrp: 6999, discount: 39, images: ['https://images.unsplash.com/photo-1541519481457-763224276691?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fGJsYWNrfDE3ODMxMzY1ODN8MA&ixlib=rb-4.1.0&q=85','https://images.unsplash.com/photo-1574015974293-817f0ebebb74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHxfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fGJsYWNrfDE3ODMxMzY1ODN8MA&ixlib=rb-4.1.0&q=85'], colors: ['Onyx','Champagne','Ice'], sizes: ['XS','S','M','L'], stock: 24, rating: 4.9, reviews: 412, tags: ['bestseller','sale'], description: 'Bias-cut mulberry silk slip. Cowl neck, adjustable straps, unfinished raw edge. Made in Bengaluru.', material: '100% Mulberry Silk', badge: 'LIMITED' },
  { id: 'p4', name: 'Void Cropped Bomber', slug: 'void-cropped-bomber', category: 'outerwear', gender: 'women', price: 5499, mrp: 8999, discount: 39, images: ['https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Steel'], sizes: ['XS','S','M','L','XL'], stock: 18, rating: 4.9, reviews: 89, tags: ['new','bestseller'], description: 'Cropped satin bomber with holographic zipper and elasticated hem. Statement outerwear.', material: 'Satin Polyester with Recycled Lining', badge: 'NEW' },
  { id: 'p5', name: 'Titan Tech Tee', slug: 'titan-tech-tee', category: 'tops', gender: 'men', price: 1899, mrp: 2999, discount: 37, images: ['https://images.unsplash.com/photo-1508216310976-c518daae0cdc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Chrome','Deep Blue'], sizes: ['S','M','L','XL','XXL'], stock: 120, rating: 4.6, reviews: 542, tags: ['bestseller'], description: 'Heavyweight 260 GSM combed cotton. Boxy fit, drop shoulder, ribbed collar with signature Velora tab.', material: '100% Combed Cotton', badge: 'BESTSELLER' },
  { id: 'p6', name: 'Astral Wide-Leg Trouser', slug: 'astral-wide-leg-trouser', category: 'bottoms', gender: 'women', price: 3299, mrp: 4999, discount: 34, images: ['https://images.pexels.com/photos/31466152/pexels-photo-31466152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Jet','Slate'], sizes: ['XS','S','M','L','XL'], stock: 55, rating: 4.7, reviews: 203, tags: ['new'], description: 'Fluid wide-leg trousers with pleated front and satin waistband. High-rise architectural cut.', material: 'Viscose Twill', badge: 'NEW' },
  { id: 'p7', name: 'Phantom Zip Hoodie', slug: 'phantom-zip-hoodie', category: 'oversized', gender: 'men', price: 3899, mrp: 5999, discount: 35, images: ['https://images.unsplash.com/photo-1649877705659-adf38e1f68f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxvdmVyc2l6ZWQlMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Ash'], sizes: ['S','M','L','XL','XXL'], stock: 33, rating: 4.8, reviews: 178, tags: ['sale','bestseller'], description: 'Full-zip hoodie with kangaroo pocket and reflective back print. 100% brushed fleece interior.', material: '480 GSM Cotton Fleece', badge: 'SALE' },
  { id: 'p8', name: 'Lumen Corset Top', slug: 'lumen-corset-top', category: 'tops', gender: 'women', price: 2499, mrp: 3999, discount: 38, images: ['https://images.pexels.com/photos/11844304/pexels-photo-11844304.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Onyx','Ivory','Silver'], sizes: ['XS','S','M','L'], stock: 40, rating: 4.8, reviews: 312, tags: ['bestseller'], description: 'Structured corset top with metallic bone details and adjustable lacing. Statement evening piece.', material: 'Duchess Satin with Steel Boning', badge: 'BESTSELLER' },
  { id: 'p9', name: 'Quantum Denim Jacket', slug: 'quantum-denim-jacket', category: 'outerwear', gender: 'unisex', price: 4599, mrp: 7499, discount: 39, images: ['https://images.pexels.com/photos/32969128/pexels-photo-32969128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Deep Indigo','Washed Black'], sizes: ['S','M','L','XL'], stock: 28, rating: 4.7, reviews: 145, tags: ['new'], description: 'Oversized boxy denim jacket with acid-wash finish and holographic embroidery on the back panel.', material: '14oz Selvedge Denim', badge: 'NEW' },
  { id: 'p10', name: 'Nova Leather Skirt', slug: 'nova-leather-skirt', category: 'bottoms', gender: 'women', price: 3999, mrp: 6499, discount: 38, images: ['https://images.pexels.com/photos/5493535/pexels-photo-5493535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Void Black','Espresso'], sizes: ['XS','S','M','L'], stock: 22, rating: 4.9, reviews: 98, tags: ['limited','new'], description: 'Vegan leather mini skirt with asymmetric hem and side zip. Buttery-soft hand feel.', material: 'Premium Vegan Leather', badge: 'LIMITED' },
  { id: 'p11', name: 'Solstice Puffer Vest', slug: 'solstice-puffer-vest', category: 'outerwear', gender: 'unisex', price: 4199, mrp: 6299, discount: 33, images: ['https://images.unsplash.com/photo-1472417583565-62e7bdeda490?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Onyx','Metallic Silver'], sizes: ['S','M','L','XL'], stock: 36, rating: 4.6, reviews: 76, tags: ['new'], description: 'Cropped puffer vest with recycled down fill and matte metallic shell fabric.', material: 'Recycled Nylon Shell / Down Fill', badge: 'NEW' },
  { id: 'p12', name: 'Eclipse Cargo Shorts', slug: 'eclipse-cargo-shorts', category: 'bottoms', gender: 'men', price: 1999, mrp: 2999, discount: 33, images: ['https://images.unsplash.com/photo-1557130680-0f816eef4743?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Sand','Olive'], sizes: ['28','30','32','34','36'], stock: 88, rating: 4.5, reviews: 234, tags: ['sale'], description: 'Utility cargo shorts with multiple pockets and drawstring waist. Perfect drop.', material: 'Cotton Twill', badge: 'SALE' },
]

async function seedIfEmpty() {
  const database = await getDb()
  const count = await database.collection('products').countDocuments()
  if (count === 0) {
    await database.collection('products').insertMany(SEED_PRODUCTS)
  }
}

export function cleanDoc(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

export async function GET(request, { params }) {
  try {
    const database = await getDb()
    const url = new URL(request.url)
    const path = (await params).path || []
    const route = path[0] || ''

    if (route === '' || route === 'health') {
      return NextResponse.json({ status: 'ok', brand: 'Velora' })
    }

    if (route === 'products') {
      await seedIfEmpty()
      const gender = url.searchParams.get('gender')
      const category = url.searchParams.get('category')
      const tag = url.searchParams.get('tag')
      const sort = url.searchParams.get('sort') || 'featured'
      const search = url.searchParams.get('q')
      const minPrice = parseFloat(url.searchParams.get('minPrice') || '0')
      const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '100000')

      const query = { price: { $gte: minPrice, $lte: maxPrice } }
      if (gender && gender !== 'all') query.$or = [{ gender }, { gender: 'unisex' }]
      if (category && category !== 'all') query.category = category
      if (tag) query.tags = tag
      if (search) query.name = { $regex: search, $options: 'i' }

      let sortObj = {}
      if (sort === 'price-low') sortObj = { price: 1 }
      else if (sort === 'price-high') sortObj = { price: -1 }
      else if (sort === 'rating') sortObj = { rating: -1 }
      else if (sort === 'newest') sortObj = { id: -1 }
      else sortObj = { rating: -1 }

      const products = await database.collection('products').find(query).sort(sortObj).limit(100).toArray()
      return NextResponse.json({ products: products.map(cleanDoc) })
    }

    if (route === 'product' && path[1]) {
      await seedIfEmpty()
      const product = await database.collection('products').findOne({ $or: [{ id: path[1] }, { slug: path[1] }] })
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      const related = await database.collection('products').find({ category: product.category, id: { $ne: product.id } }).limit(4).toArray()
      return NextResponse.json({ product: cleanDoc(product), related: related.map(cleanDoc) })
    }

    if (route === 'orders') {
      const email = url.searchParams.get('email')
      const orders = await database.collection('orders').find(email ? { email } : {}).sort({ createdAt: -1 }).limit(50).toArray()
      return NextResponse.json({ orders: orders.map(cleanDoc) })
    }

    if (route === 'order' && path[1]) {
      const order = await database.collection('orders').findOne({ id: path[1] })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ order: cleanDoc(order) })
    }

    if (route === 'pincode' && path[1]) {
      const pin = path[1]
      // Simple demo pincode logic
      const serviceable = /^[1-9][0-9]{5}$/.test(pin)
      const days = serviceable ? (parseInt(pin[0]) % 5) + 3 : null
      return NextResponse.json({
        serviceable, pincode: pin,
        days,
        cod: serviceable && parseInt(pin[0]) < 8,
        message: serviceable ? `Delivery in ${days}-${days + 2} days` : 'Not serviceable',
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const database = await getDb()
    const path = (await params).path || []
    const route = path[0] || ''
    const body = await request.json().catch(() => ({}))

    if (route === 'register') {
      const { email, password, name } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
      const existing = await database.collection('users').findOne({ email })
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      const user = { id: uuidv4(), email, password, name: name || email.split('@')[0], createdAt: new Date().toISOString(), rewards: 100, wallet: 0 }
      await database.collection('users').insertOne(user)
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, rewards: user.rewards, wallet: user.wallet } })
    }

    if (route === 'login') {
      const { email, password } = body
      const user = await database.collection('users').findOne({ email, password })
      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, rewards: user.rewards || 0, wallet: user.wallet || 0 } })
    }

    if (route === 'newsletter') {
      const { email } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await database.collection('newsletter').updateOne({ email }, { $set: { email, subscribedAt: new Date().toISOString() } }, { upsert: true })
      return NextResponse.json({ ok: true, message: 'Welcome to the future.' })
    }

    if (route === 'checkout') {
      const { items, address, email, name, phone, payment, coupon, subtotal, shipping, discount, total } = body
      if (!items || !items.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      const order = {
        id: 'VEL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
        items, address, email, name, phone, payment, coupon,
        subtotal, shipping, discount, total,
        status: 'confirmed', tracking: [
          { stage: 'confirmed', at: new Date().toISOString(), label: 'Order Confirmed' },
          { stage: 'processing', at: null, label: 'Processing at warehouse' },
          { stage: 'shipped', at: null, label: 'Shipped' },
          { stage: 'out-for-delivery', at: null, label: 'Out for delivery' },
          { stage: 'delivered', at: null, label: 'Delivered' },
        ],
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      }
      await database.collection('orders').insertOne(order)
      return NextResponse.json({ order: cleanDoc(order) })
    }

    if (route === 'coupon') {
      const { code, subtotal } = body
      const codes = {
        'VELORA10': { type: 'pct', value: 10, min: 0, label: '10% off' },
        'FUTURE20': { type: 'pct', value: 20, min: 2000, label: '20% off (min ₹2000)' },
        'FLAT500': { type: 'flat', value: 500, min: 3000, label: '₹500 off (min ₹3000)' },
        'FIRST15': { type: 'pct', value: 15, min: 1500, label: '15% off first order' },
      }
      const c = codes[code?.toUpperCase()]
      if (!c) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 })
      if (subtotal < c.min) return NextResponse.json({ error: `Add ₹${c.min - subtotal} more to use this` }, { status: 400 })
      const discount = c.type === 'pct' ? Math.round(subtotal * c.value / 100) : c.value
      return NextResponse.json({ code: code.toUpperCase(), discount, label: c.label })
    }

    if (route === 'review') {
      const review = { id: uuidv4(), ...body, createdAt: new Date().toISOString() }
      await database.collection('reviews').insertOne(review)
      return NextResponse.json({ review: cleanDoc(review) })
    }

    if (route === 'contact') {
      await database.collection('contacts').insertOne({ id: uuidv4(), ...body, createdAt: new Date().toISOString() })
      return NextResponse.json({ ok: true })
    }

    if (route === 'chat') {
      const { sessionId, message, context } = body
      if (!sessionId || !message) return NextResponse.json({ error: 'sessionId and message required' }, { status: 400 })

      // Load conversation history
      const conv = await database.collection('conversations').findOne({ sessionId })
      const history = (conv?.messages || []).slice(-10) // keep last 10 for context

      const systemPrompt = `You are Velora's premium AI fashion concierge for a luxury Indian clothing e-commerce brand called Velora (tagline: "Wear the Future").
      
BRAND VOICE: Warm, elegant, concise. Speak like a knowledgeable stylist at a luxury boutique. Use short paragraphs.

WHAT VELORA SELLS:
- Premium oversized hoodies (Nebula, Phantom) ₹3499-3899
- Silk slip dresses, corset tops ₹2499-4299
- Techwear cargo pants, wide-leg trousers ₹2799-3299
- Cropped bombers, denim jackets, puffer vests ₹4199-5499
- Sizes: XS-XXL / 28-36 waist / Unisex, Men, Women

POLICIES:
- Free shipping above ₹1499 · Standard delivery 3-7 days · Metros: 2-4 days
- Easy 15-day returns from delivery date · Instant refund on prepaid orders
- COD available across most PIN codes (₹49 handling fee)
- Coupons: VELORA10 (10%), FUTURE20 (20% off above ₹2000), FLAT500 (₹500 off above ₹3000), FIRST15 (15% first order)
- Materials: 480 GSM cotton fleece, mulberry silk, ripstop nylon, selvedge denim
- Made ethically in Bengaluru · Recycled packaging

STYLE: Answer product/order questions crisply. If asked about specific styling, suggest combinations. If asked to talk to human, share hello@velora.in / +91 80 4000 5000. Never invent order details — ask for order ID starting with VEL.

Keep responses under 100 words unless the user asks for detail.`

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      let reply = null

      if (isGeminiConfigured) {
        try {
          const ai = getGemini()
          const contents = [
            ...history.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ]

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            }
          })
          reply = response.text
        } catch (e) {
          console.error("Gemini failed, falling back to rule-based:", e)
        }
      } else {
        console.warn("AI Chat Concierge running in offline mode because GEMINI_API_KEY is missing.");
      }

      // Fallback: intelligent rule-based support
      if (!reply) {
        const m = message.toLowerCase()
        if (/hello|hi|hey|namaste/.test(m)) reply = `Welcome to Velora ✨ I'm your AI fashion concierge.${!isGeminiConfigured ? " (Note: Advanced Gemini AI features are currently in standard backup mode.)" : ""} I can help with product recommendations, sizing, orders, returns and shipping. What would you like to explore today?`
        else if (/size|fit|measurement/.test(m)) reply = "Velora silhouettes run oversized — if you prefer a fitted look, size down. Our chest measurements (inches): S 44, M 46, L 48, XL 50, XXL 52. Full size chart is on every product page. Which product are you sizing for?"
        else if (/deliver|shipping|when|arrive/.test(m)) reply = "Standard delivery is 3–7 business days pan-India. Metros usually receive in 2–4 days. Shipping is FREE above ₹1499 · ₹99 below. Share your pincode on any product page for exact ETA."
        else if (/return|refund|exchange/.test(m)) reply = "Easy 15-day returns from delivery date. Items must be unused with tags. Instant refund on prepaid orders, 3–5 days for COD refunds. Just email hello@velora.in with your order ID to initiate."
        else if (/coupon|discount|code|offer/.test(m)) reply = "Try these live codes: **VELORA10** (10% off), **FUTURE20** (20% off above ₹2000), **FLAT500** (₹500 off above ₹3000), **FIRST15** (15% off your first order). Apply at checkout."
        else if (/cod|cash|delivery/.test(m)) reply = "Yes, Cash on Delivery is available across most Indian PIN codes with a ₹49 handling fee. Just choose COD at checkout."
        else if (/track|order|status/.test(m)) reply = "You can track your order on the Track Order page using your order ID (format: VEL...). If you don't have it, check your confirmation email. Want me to open the tracking page?"
        else if (/hoodie|oversized|nebula/.test(m)) reply = "Our bestselling **Nebula Oversized Hoodie** (₹3499) is a 480 GSM French terry, drop-shoulder, boxy fit — available in Void Black, Chrome Silver and Cyber Blue. Try size L for signature oversized fit."
        else if (/dress|silk/.test(m)) reply = "The **Ethereal Silk Slip Dress** (₹4299) is our editor's pick — bias-cut mulberry silk, cowl neck, adjustable straps. Available in Onyx, Champagne, Ice. Runs true to size."
        else if (/cargo|pant|trouser/.test(m)) reply = "Explore the **Chrome Utility Cargo** (₹2799) for techwear vibes or the **Astral Wide-Leg Trouser** (₹3299) for architectural drama. Both come in multiple washes."
        else if (/human|agent|talk|call/.test(m)) reply = "I'll get you to a human. 📞 +91 80 4000 5000 (Mon–Sat, 10 AM – 8 PM IST) or ✉️ hello@velora.in — usually reply within a few hours."
        else if (/payment|upi|razorpay/.test(m)) reply = "We accept UPI (PhonePe/GPay/Paytm), all major cards, Netbanking, wallets and Cash on Delivery. All payments are secured with 256-bit SSL encryption."
        else if (/gift|card|wrap/.test(m)) reply = "We offer premium gift wrapping with a handwritten note — just mention it at checkout in the notes. Digital gift cards from ₹500 to ₹25,000 are also available (coming soon to your account)."
        else if (/thank|thanks|great|awesome|good/.test(m)) reply = "You're welcome ✨ Wearing the future starts with your next drop. Anything else I can help with?"
        else {
          if (!isGeminiConfigured) {
            reply = "I am Velora's fashion concierge. Currently, my advanced AI features are offline (GEMINI_API_KEY is not configured), but I am operating in standard helper mode. Velora offers premium Indian luxury fashion with free shipping above ₹1499, easy 15-day returns, and secure payment options. Please ask me about sizing, shipping, returns, payment, or specific styles like hoodies or dresses!"
          } else {
            reply = `Great question. Here's what I know: Velora offers premium Indian luxury fashion with pan-India shipping, 15-day returns, and multiple payment options including UPI and COD. Could you share a bit more about what you're looking for — sizing help, a specific product category, or order support?`
          }
        }
      }

      // Save conversation
      const now = new Date().toISOString()
      await database.collection('conversations').updateOne(
        { sessionId },
        {
          $set: { sessionId, updatedAt: now },
          $setOnInsert: { createdAt: now },
          $push: { messages: { $each: [{ role: 'user', content: message, createdAt: now }, { role: 'assistant', content: reply, createdAt: now }] } },
        },
        { upsert: true }
      )
      return NextResponse.json({ reply, sessionId })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
