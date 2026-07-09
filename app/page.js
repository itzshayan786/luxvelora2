'use client'
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronRight, ChevronLeft, Star, Truck, Shield,
  RotateCcw, CreditCard, Sparkles, Zap, Package, MapPin, ArrowRight, Plus, Minus, Trash2,
  Instagram, Twitter, Facebook, Youtube, Filter, Check, Mic, Award, Clock, Gift, Wallet, LogOut, ArrowUpRight,
  MessageCircle, Send, Bot, HelpCircle, Phone, Mail, Loader2, Truck as TruckIcon
} from 'lucide-react'

const ShopCtx = createContext(null)
const useShop = () => useContext(ShopCtx)
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

const VeloraLogo = ({ size = 'md' }) => {
  const dims = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }[size]
  return (
    <div className={`font-display font-bold ${dims} tracking-tight flex items-center gap-1.5`}>
      <span className="relative">
        <span className="silver-text">V</span>
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-500 pulse-glow" />
      </span>
      <span className="text-neutral-900">ELORA</span>
    </div>
  )
}

const TOP_MARQUEE = ['FREE SHIPPING ABOVE ₹1499', 'COD AVAILABLE PAN INDIA', 'EASY 15-DAY RETURNS', 'FLAT 20% OFF WITH CODE FUTURE20', 'NEW COLLECTION DROPPED']
const TopBar = () => (
  <div className="bg-neutral-950 border-b border-white/10 py-2 overflow-hidden">
    <div className="flex marquee whitespace-nowrap">
      {[...TOP_MARQUEE, ...TOP_MARQUEE, ...TOP_MARQUEE].map((t, i) => (
        <span key={i} className="mx-8 text-[11px] tracking-[0.3em] text-white/70 font-medium flex items-center gap-8">
          <span>{t}</span><Sparkles className="w-3 h-3 text-blue-400" />
        </span>
      ))}
    </div>
  </div>
)

const Header = () => {
  const { setRoute, cart, wishlist, user, setSearchOpen, setMobileNavOpen, mobileNavOpen } = useShop()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h)
  }, [])
  const links = [
    { l: 'Shop', r: { view: 'shop' } },
    { l: 'Men', r: { view: 'shop', filter: { gender: 'men' } } },
    { l: 'Women', r: { view: 'shop', filter: { gender: 'women' } } },
    { l: 'Oversized', r: { view: 'shop', filter: { category: 'oversized' } } },
    { l: 'New', r: { view: 'shop', filter: { tag: 'new' } } },
    { l: 'Sale', r: { view: 'shop', filter: { tag: 'sale' } } },
  ]
  return (
    <>
      <TopBar />
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong border-b border-black/10' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-neutral-900"><Menu className="w-6 h-6" /></button>
          <button onClick={() => setRoute({ view: 'home' })} className="flex-shrink-0"><VeloraLogo /></button>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((x) => (
              <button key={x.l} onClick={() => setRoute(x.r)} className="text-sm font-medium text-neutral-800 hover:text-neutral-900 transition relative group tracking-wide">
                {x.l}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition"><Search className="w-5 h-5" /></button>
            <button onClick={() => setRoute({ view: user ? 'account' : 'auth' })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition"><User className="w-5 h-5" /></button>
            <button onClick={() => setRoute({ view: 'wishlist' })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition relative">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-[10px] font-bold flex items-center justify-center">{wishlist.length}</span>}
            </button>
            <button onClick={() => setRoute({ view: 'cart' })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition relative">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-[10px] font-bold flex items-center justify-center">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </button>
          </div>
        </div>
      </header>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="bg-white border-black/10 w-[85%] max-w-sm">
          <div className="mb-8"><VeloraLogo /></div>
          <div className="space-y-1">
            {links.map((x) => (
              <button key={x.l} onClick={() => { setRoute(x.r); setMobileNavOpen(false) }} className="w-full text-left py-4 px-3 rounded-lg hover:bg-black/[0.02] flex items-center justify-between border-b border-black/5">
                <span className="text-lg font-medium">{x.l}</span><ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-2">
            {[['About','about'],['Contact','contact'],['FAQ','faq'],['Size Guide','size-guide'],['Shipping','shipping'],['Track Order','track-order']].map(([p,v]) => (
              <button key={p} onClick={() => { setRoute({ view: v }); setMobileNavOpen(false) }} className="block w-full text-left py-2 text-sm text-neutral-600 hover:text-neutral-900">{p}</button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

const SearchOverlay = () => {
  const { searchOpen, setSearchOpen, setRoute, products } = useShop()
  const [q, setQ] = useState('')
  const results = useMemo(() => q.length < 2 ? [] : products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.includes(q.toLowerCase())).slice(0, 6), [q, products])
  const trending = ['Oversized Hoodie', 'Cargo', 'Silk Dress', 'Bomber']
  const startVoice = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) return toast.error('Voice search not supported')
    const r = new SR(); r.lang = 'en-IN'; r.onresult = (e) => setQ(e.results[0][0].transcript); r.start()
    toast.success('Listening...')
  }
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto pt-24 px-6">
            <div className="flex items-center gap-3 border-b border-black/15 pb-4">
              <Search className="w-6 h-6 text-neutral-600" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Velora — try 'oversized', 'silk'..." className="flex-1 bg-transparent outline-none text-2xl font-display placeholder:text-neutral-400" />
              <button onClick={startVoice} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><Mic className="w-5 h-5 text-blue-400" /></button>
              <button onClick={() => setSearchOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            {q.length < 2 ? (
              <div className="mt-8">
                <p className="text-xs tracking-[0.3em] text-neutral-500 mb-4">TRENDING</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map(t => <button key={t} onClick={() => setQ(t)} className="px-4 py-2 rounded-full glass text-sm hover:border-blue-400/50 transition">{t}</button>)}
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-2">
                {results.length === 0 ? <p className="text-neutral-500 text-center py-12">No results found</p> : results.map(p => (
                  <button key={p.id} onClick={() => { setRoute({ view: 'product', id: p.id }); setSearchOpen(false) }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/[0.02] w-full text-left">
                    <img src={p.images[0]} className="w-16 h-20 object-cover rounded-lg" alt="" />
                    <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-neutral-500">{fmt(p.price)}</p></div>
                    <ArrowUpRight className="w-5 h-5 text-neutral-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ProductCard = ({ p, idx = 0 }) => {
  const { setRoute, toggleWishlist, wishlist, addToCart } = useShop()
  const inWL = wishlist.includes(p.id)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (idx % 4) * 0.08 }}
      className="product-card group cursor-pointer"
      onClick={() => setRoute({ view: 'product', id: p.id })}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black/[0.02]">
        <img src={p.images[0]} alt={p.name} className="product-img w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {p.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] tracking-[0.2em] font-bold rounded-full glass-strong">
            {p.badge === 'NEW' && <span className="text-blue-400">● {p.badge}</span>}
            {p.badge === 'BESTSELLER' && <span className="text-amber-400">★ {p.badge}</span>}
            {p.badge === 'LIMITED' && <span className="text-purple-400">◆ {p.badge}</span>}
            {p.badge === 'SALE' && <span className="text-red-400">▼ -{p.discount}%</span>}
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }} className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition">
          <Heart className={`w-4 h-4 ${inWL ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); addToCart(p, p.sizes[0], p.colors[0]) }} className="absolute bottom-3 left-3 right-3 py-3 rounded-xl bg-neutral-900 text-white font-medium text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center gap-2 hover:bg-blue-600">
          <ShoppingBag className="w-4 h-4" /> Quick Add
        </button>
      </div>
      <div className="pt-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug line-clamp-1">{p.name}</h3>
          <div className="flex items-center gap-1 text-xs text-neutral-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating}</div>
        </div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider">{p.category}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-semibold">{fmt(p.price)}</span>
          <span className="text-xs text-neutral-500 line-through">{fmt(p.mrp)}</span>
          <span className="text-xs text-blue-400 font-bold">-{p.discount}%</span>
        </div>
      </div>
    </motion.div>
  )
}

const HERO_SLIDES = [
  { title: 'WEAR THE\nFUTURE', sub: 'The Nebula Collection · Autumn/Winter 2025', img: 'https://images.unsplash.com/photo-1472417583565-62e7bdeda490?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85', cta: 'Explore Nebula', route: { view: 'shop', filter: { category: 'oversized' } } },
  { title: 'BEYOND\nBOUNDARIES', sub: 'Oversized silhouettes · Techwear engineering', img: 'https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85', cta: 'Shop Women', route: { view: 'shop', filter: { gender: 'women' } } },
  { title: 'MADE FOR\nNIGHT', sub: 'Limited Edition · Only 200 pieces worldwide', img: 'https://images.pexels.com/photos/31466152/pexels-photo-31466152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', cta: 'View Limited', route: { view: 'shop', filter: { tag: 'limited' } } },
]

const Hero = () => {
  const { setRoute } = useShop()
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % HERO_SLIDES.length), 6000); return () => clearInterval(t) }, [])
  const s = HERO_SLIDES[i]
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: 'easeOut' }} className="absolute inset-0">
          <img src={s.img} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="aurora" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-24 md:pb-32">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="max-w-3xl">
          <p className="text-xs md:text-sm tracking-[0.4em] text-blue-400 mb-6 font-medium">● VELORA MMXXV</p>
          <AnimatePresence mode="wait">
            <motion.h1 key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }} className="text-massive font-display font-bold whitespace-pre-line silver-white neon-text">
              {s.title}
            </motion.h1>
          </AnimatePresence>
          <p className="text-white/85 text-lg md:text-xl mt-6 font-light font-serif-lux italic">{s.sub}</p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button onClick={() => setRoute(s.route)} size="lg" className="bg-white text-neutral-900 hover:bg-blue-600 hover:text-white h-14 px-8 rounded-full font-medium text-base group">
              {s.cta} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </Button>
            <Button onClick={() => setRoute({ view: 'shop' })} size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white h-14 px-8 rounded-full font-medium">
              Shop All
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} className={`h-1 transition-all ${idx === i ? 'w-12 bg-blue-400' : 'w-6 bg-white/30'} rounded-full`} />
        ))}
      </div>
    </section>
  )
}

const Collections = () => {
  const { setRoute } = useShop()
  const cols = [
    { t: 'OVERSIZED', s: 'Bold silhouettes', img: 'https://images.unsplash.com/photo-1649877705659-adf38e1f68f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxvdmVyc2l6ZWQlMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85', r: { view: 'shop', filter: { category: 'oversized' } } },
    { t: 'WOMEN', s: 'The new feminine', img: 'https://images.unsplash.com/photo-1541519481457-763224276691?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fGJsYWNrfDE3ODMxMzY1ODN8MA&ixlib=rb-4.1.0&q=85', r: { view: 'shop', filter: { gender: 'women' } } },
    { t: 'MEN', s: 'Techwear essentials', img: 'https://images.unsplash.com/photo-1508216310976-c518daae0cdc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85', r: { view: 'shop', filter: { gender: 'men' } } },
  ]
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ COLLECTIONS</p>
          <h2 className="text-huge font-display font-bold silver-text">Shop by Universe</h2>
        </div>
        <button onClick={() => setRoute({ view: 'shop' })} className="hidden md:flex items-center gap-2 text-sm hover:text-blue-400 transition">View All <ArrowRight className="w-4 h-4" /></button>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {cols.map((c, i) => (
          <motion.button
            key={c.t}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
            onClick={() => setRoute(c.r)}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
          >
            <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={c.t} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 border border-white/0 group-hover:border-blue-400/50 rounded-2xl transition" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <p className="text-xs tracking-[0.3em] text-blue-300 mb-2">{c.s}</p>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{c.t}</h3>
              <span className="inline-flex items-center gap-2 text-sm border-b border-white/40 pb-1 group-hover:border-blue-400 group-hover:text-blue-300 transition text-white">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

const FlashSale = () => {
  const [tl, setTl] = useState({ h: 4, m: 32, s: 18 })
  useEffect(() => {
    const t = setInterval(() => {
      setTl(({ h, m, s }) => {
        s--; if (s < 0) { s = 59; m-- }; if (m < 0) { m = 59; h-- }; if (h < 0) { h = 23 }
        return { h, m, s }
      })
    }, 1000); return () => clearInterval(t)
  }, [])
  const { setRoute } = useShop()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto glass-strong rounded-3xl overflow-hidden relative border border-blue-500/20">
        <div className="absolute inset-0 aurora opacity-40" />
        <div className="relative z-10 p-8 md:p-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-blue-400 fill-blue-400" /><span className="text-xs tracking-[0.3em] text-blue-400">FLASH DROP</span></div>
            <h2 className="text-huge font-display font-bold silver-text mb-4">UP TO 60% OFF</h2>
            <p className="text-neutral-600 mb-8 max-w-md">The Nebula flash drop ends soon. Premium oversized, silks and outerwear at once-a-year prices.</p>
            <div className="flex gap-3 mb-8">
              {[['HOURS', tl.h], ['MINUTES', tl.m], ['SECONDS', tl.s]].map(([l, v]) => (
                <div key={l} className="glass rounded-xl p-4 min-w-[80px] text-center border border-black/10">
                  <div className="text-3xl md:text-4xl font-display font-bold neon-text">{pad(v)}</div>
                  <div className="text-[10px] tracking-[0.2em] text-neutral-500 mt-1">{l}</div>
                </div>
              ))}
            </div>
            <Button onClick={() => setRoute({ view: 'shop', filter: { tag: 'sale' } })} size="lg" className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 h-12">Shop the Drop <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden float">
            <img src="https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85" className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}

const TrendingSection = ({ title, tag, subtitle }) => {
  const { products } = useShop()
  const filtered = useMemo(() => tag ? products.filter(p => p.tags.includes(tag)).slice(0, 8) : products.slice(0, 8), [products, tag])
  return (
    <section className="py-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ {subtitle}</p>
        <h2 className="text-huge font-display font-bold silver-text">{title}</h2>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}
      </div>
    </section>
  )
}

const Stats = () => {
  const stats = [{ n: '2M+', l: 'Happy Customers' }, { n: '500+', l: 'Cities Delivered' }, { n: '4.9★', l: 'Avg. Rating' }, { n: '15K+', l: 'Reviews' }]
  return (
    <section className="py-20 px-6 md:px-12 border-y border-black/10 relative overflow-hidden">
      <div className="aurora opacity-30" />
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="text-5xl md:text-7xl font-display font-bold silver-text neon-text mb-2">{s.n}</div>
            <div className="text-xs tracking-[0.3em] text-neutral-500">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const Reviews = () => {
  const rs = [
    { n: 'Aanya Kapoor', c: 'Mumbai', r: 5, t: 'Absolutely obsessed with the Nebula hoodie. The fabric feels next-level premium. Worth every rupee.' },
    { n: 'Arjun Malhotra', c: 'Delhi', r: 5, t: 'Better than the international brands I usually buy. The oversized fit is perfect and packaging is luxurious.' },
    { n: 'Ishita Sharma', c: 'Bengaluru', r: 5, t: 'Velora feels like the future of Indian fashion. The silk slip dress is impeccable.' },
  ]
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ REVIEWS</p>
        <h2 className="text-huge font-display font-bold silver-text">Loved by the Future</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {rs.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass p-8 rounded-2xl">
            <div className="flex gap-1 mb-4">{Array(r.r).fill().map((_, x) => <Star key={x} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            <p className="text-neutral-800 font-serif-lux italic text-lg leading-relaxed mb-6">"{r.t}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">{r.n[0]}</div>
              <div><p className="font-medium text-sm">{r.n}</p><p className="text-xs text-neutral-500">{r.c} · Verified Buyer</p></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const Trust = () => {
  const b = [
    { i: Truck, t: 'Free Shipping', s: 'Orders above ₹1499' },
    { i: RotateCcw, t: '15-Day Returns', s: 'Easy & hassle-free' },
    { i: Shield, t: 'Secure Payments', s: '100% protected' },
    { i: Award, t: 'Premium Quality', s: 'Curated & tested' },
  ]
  return (
    <section className="py-16 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {b.map(({ i: I, t, s }, x) => (
          <motion.div key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: x * 0.1 }} className="glass p-6 rounded-2xl flex items-center gap-4 hover:border-blue-400/30 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0"><I className="w-5 h-5 text-blue-400" /></div>
            <div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-neutral-500 mt-0.5">{s}</p></div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const Newsletter = () => {
  const [e, setE] = useState(''); const [ok, setOk] = useState(false)
  const sub = async () => {
    if (!e.includes('@')) return toast.error('Enter a valid email')
    await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email: e }) })
    setOk(true); toast.success('Welcome to Velora! Check your inbox.')
  }
  return (
    <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
      <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ JOIN THE FUTURE</p>
      <h2 className="text-huge font-display font-bold silver-text mb-4">Get 10% Off Your First Order</h2>
      <p className="text-neutral-600 mb-8 max-w-lg mx-auto">Be first to know about new drops, exclusive access to limited editions, and members-only offers.</p>
      {ok ? (
        <div className="glass rounded-full px-6 py-4 inline-flex items-center gap-2 text-blue-400"><Check className="w-4 h-4" /> You're on the list</div>
      ) : (
        <div className="glass rounded-full p-2 flex gap-2 max-w-md mx-auto border border-black/10">
          <input value={e} onChange={(x) => setE(x.target.value)} placeholder="your@email.com" className="flex-1 bg-transparent px-4 outline-none text-sm" />
          <Button onClick={sub} className="rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white px-6">Subscribe</Button>
        </div>
      )}
    </section>
  )
}

const Footer = () => {
  const { setRoute } = useShop()
  return (
    <footer className="border-t border-black/10 mt-24 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-12">
        <div>
          <VeloraLogo size="lg" />
          <p className="text-sm text-neutral-500 mt-4 leading-relaxed">Ultra-modern Indian luxury fashion. Engineered in Bengaluru · Delivered across India.</p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Twitter, Facebook, Youtube].map((I, i) => <button key={i} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-blue-400/50 transition"><I className="w-4 h-4" /></button>)}
          </div>
        </div>
        {[
          { t: 'Shop', l: [['Men', { view: 'shop', filter: { gender: 'men' } }], ['Women', { view: 'shop', filter: { gender: 'women' } }], ['Oversized', { view: 'shop', filter: { category: 'oversized' } }], ['New Arrivals', { view: 'shop', filter: { tag: 'new' } }], ['Sale', { view: 'shop', filter: { tag: 'sale' } }]] },
          { t: 'Help', l: [['Contact', { view: 'contact' }], ['FAQ', { view: 'faq' }], ['Size Guide', { view: 'size-guide' }], ['Shipping', { view: 'shipping' }], ['Track Order', { view: 'track-order' }]] },
          { t: 'Company', l: [['About', { view: 'about' }], ['Privacy', { view: 'privacy' }], ['Terms', { view: 'terms' }], ['Returns', { view: 'shipping' }]] },
        ].map(c => (
          <div key={c.t}>
            <h4 className="text-sm font-semibold tracking-widest mb-4">{c.t.toUpperCase()}</h4>
            <ul className="space-y-2">{c.l.map(([n, r]) => <li key={n}><button onClick={() => setRoute(r)} className="text-sm text-neutral-600 hover:text-neutral-900 transition">{n}</button></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-neutral-500">
          <p>© 2025 Velora. All rights reserved. Wear the Future.</p>
          <p>Made in India · GSTIN: 29ABCDE1234F1Z5</p>
        </div>
      </div>
    </footer>
  )
}

const HomePage = () => (
  <>
    <Hero />
    <Trust />
    <Collections />
    <TrendingSection title="Trending Now" subtitle="BESTSELLERS" tag="bestseller" />
    <FlashSale />
    <TrendingSection title="Just Landed" subtitle="NEW ARRIVALS" tag="new" />
    <Stats />
    <Reviews />
    <Newsletter />
  </>
)

const ShopPage = () => {
  const { products, route } = useShop()
  const [gender, setGender] = useState(route.filter?.gender || 'all')
  const [category, setCategory] = useState(route.filter?.category || 'all')
  const [tag, setTag] = useState(route.filter?.tag || '')
  const [sort, setSort] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    setGender(route.filter?.gender || 'all')
    setCategory(route.filter?.category || 'all')
    setTag(route.filter?.tag || '')
  }, [route])

  const filtered = useMemo(() => {
    let r = products
    if (gender !== 'all') r = r.filter(p => p.gender === gender || p.gender === 'unisex')
    if (category !== 'all') r = r.filter(p => p.category === category)
    if (tag) r = r.filter(p => p.tags.includes(tag))
    r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-low') r = [...r].sort((a, b) => a.price - b.price)
    else if (sort === 'price-high') r = [...r].sort((a, b) => b.price - a.price)
    else if (sort === 'rating') r = [...r].sort((a, b) => b.rating - a.rating)
    return r
  }, [products, gender, category, tag, sort, priceRange])

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">GENDER</p>
        {['all', 'men', 'women', 'unisex'].map(g => (
          <button key={g} onClick={() => setGender(g)} className={`block w-full text-left py-2 px-3 rounded-lg text-sm capitalize ${gender === g ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-black/[0.02]'}`}>{g}</button>
        ))}
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">CATEGORY</p>
        {['all', 'oversized', 'tops', 'bottoms', 'dresses', 'outerwear'].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`block w-full text-left py-2 px-3 rounded-lg text-sm capitalize ${category === c ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-black/[0.02]'}`}>{c}</button>
        ))}
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">PRICE: {fmt(priceRange[0])} – {fmt(priceRange[1])}</p>
        <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="mt-4" />
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">TAG</p>
        {['', 'new', 'bestseller', 'sale', 'limited'].map(t => (
          <button key={t || 'all'} onClick={() => setTag(t)} className={`inline-block m-1 px-3 py-1 rounded-full text-xs capitalize ${tag === t ? 'bg-blue-500 text-white' : 'glass'}`}>{t || 'all'}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ THE COLLECTION</p>
        <h1 className="text-huge font-display font-bold silver-text">{tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : gender !== 'all' ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All'}</h1>
        <p className="text-neutral-500 mt-2">{filtered.length} products</p>
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0"><Filters /></aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden glass rounded-full px-4 py-2 text-sm flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto glass rounded-full px-4 py-2 text-sm bg-transparent border-black/10 outline-none">
              <option value="featured" className="bg-white">Featured</option>
              <option value="price-low" className="bg-white">Price: Low to High</option>
              <option value="price-high" className="bg-white">Price: High to Low</option>
              <option value="rating" className="bg-white">Top Rated</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}
          </div>
          {filtered.length === 0 && <p className="text-center text-neutral-500 py-24">No products match your filters.</p>}
        </div>
      </div>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="bg-white border-black/10"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><Filters /></div></SheetContent>
      </Sheet>
    </div>
  )
}

const ProductPage = () => {
  const { route, setRoute, addToCart, toggleWishlist, wishlist } = useShop()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [imgIdx, setImgIdx] = useState(0)
  const [size, setSize] = useState(''); const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [pin, setPin] = useState(''); const [pinRes, setPinRes] = useState(null)

  useEffect(() => {
    fetch(`/api/product/${route.id}`).then(r => r.json()).then(d => {
      setProduct(d.product); setRelated(d.related || [])
      setSize(d.product?.sizes[0] || ''); setColor(d.product?.colors[0] || ''); setImgIdx(0)
      window.scrollTo(0, 0)
    })
  }, [route.id])

  if (!product) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full spin-slow" /></div>
  const checkPin = async () => {
    const r = await fetch(`/api/pincode/${pin}`).then(x => x.json()); setPinRes(r)
  }

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2 flex-wrap">
        <button onClick={() => setRoute({ view: 'home' })}>Home</button><ChevronRight className="w-3 h-3" />
        <button onClick={() => setRoute({ view: 'shop' })}>Shop</button><ChevronRight className="w-3 h-3" />
        <span className="text-neutral-800">{product.name}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black/[0.02] relative group">
            <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            {product.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((imgIdx - 1 + product.images.length) % product.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setImgIdx((imgIdx + 1) % product.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-24 rounded-lg overflow-hidden border-2 ${imgIdx === i ? 'border-blue-400' : 'border-transparent opacity-50'}`}>
                  <img src={im} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {product.badge && <span className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] font-bold rounded-full glass mb-4 text-blue-400">{product.badge}</span>}
          <h1 className="text-4xl md:text-5xl font-display font-bold silver-text mb-3">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {product.rating}</div>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-600">{product.reviews} reviews</span>
            <span className="text-neutral-500">·</span>
            <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> In stock</span>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-display font-bold">{fmt(product.price)}</span>
            <span className="text-lg text-neutral-500 line-through">{fmt(product.mrp)}</span>
            <span className="text-sm text-blue-400 font-bold">-{product.discount}%</span>
          </div>
          <p className="text-xs text-neutral-500 mb-8">Inclusive of all taxes · Free shipping above ₹1499</p>
          <p className="text-neutral-700 leading-relaxed mb-8 font-serif-lux text-lg italic">{product.description}</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium">Color: <span className="text-neutral-600">{color}</span></p></div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 rounded-full text-sm border transition ${color === c ? 'border-blue-400 bg-blue-500/10 text-blue-300' : 'border-black/15 hover:border-black/25'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Size: <span className="text-neutral-600">{size}</span></p>
              <button onClick={() => setRoute({ view: 'size-guide' })} className="text-xs text-blue-400 hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-[3rem] px-4 py-2.5 rounded-lg text-sm border transition ${size === s ? 'border-blue-400 bg-blue-500/10 text-blue-300' : 'border-black/15 hover:border-black/25'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="glass rounded-full flex items-center border border-black/10">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => { addToCart(product, size, color, qty); }} className="flex-1 h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white font-medium"><ShoppingBag className="w-4 h-4 mr-2" /> Add to Bag</Button>
            <button onClick={() => toggleWishlist(product.id)} className="w-12 h-12 rounded-full glass flex items-center justify-center border border-black/10 hover:border-red-400/50">
              <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          <div className="glass rounded-2xl p-5 mb-6 border border-black/10">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Check delivery</p>
            <div className="flex gap-2">
              <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter pincode" className="bg-black/[0.02] border-black/10" maxLength={6} />
              <Button onClick={checkPin} variant="outline" className="border-black/15">Check</Button>
            </div>
            {pinRes && <p className={`text-sm mt-3 ${pinRes.serviceable ? 'text-emerald-400' : 'text-red-400'}`}>{pinRes.serviceable ? `✓ Deliverable in ${pinRes.days}-${pinRes.days + 2} days${pinRes.cod ? ' · COD available' : ''}` : '✗ Not serviceable to this pincode'}</p>}
          </div>

          <Accordion type="single" collapsible className="border-t border-black/10">
            <AccordionItem value="1" className="border-black/10"><AccordionTrigger>Material & Care</AccordionTrigger><AccordionContent className="text-neutral-600">{product.material} · Machine wash cold · Do not bleach · Iron on low heat</AccordionContent></AccordionItem>
            <AccordionItem value="2" className="border-black/10"><AccordionTrigger>Shipping & Returns</AccordionTrigger><AccordionContent className="text-neutral-600">Free shipping above ₹1499. Easy 15-day return. Instant refund on prepaid orders.</AccordionContent></AccordionItem>
            <AccordionItem value="3" className="border-black/10"><AccordionTrigger>Sustainability</AccordionTrigger><AccordionContent className="text-neutral-600">Made in a certified ethical facility in Bengaluru. Recycled packaging.</AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-display font-bold mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{related.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}</div>
        </div>
      )}
    </div>
  )
}

const CartPage = () => {
  const { cart, updateCart, removeFromCart, setRoute } = useShop()
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 99
  const total = subtotal + shipping

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <ShoppingBag className="w-20 h-20 text-neutral-300 mb-6" />
      <h2 className="text-3xl font-display font-bold mb-3">Your bag is empty</h2>
      <p className="text-neutral-500 mb-8">Time to add some future to your closet.</p>
      <Button onClick={() => setRoute({ view: 'shop' })} className="rounded-full bg-neutral-900 text-white h-12 px-8">Continue Shopping</Button>
    </div>
  )

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-8">Your Bag</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((i) => (
            <div key={i.key} className="glass rounded-2xl p-4 flex gap-4 border border-black/10">
              <button onClick={() => setRoute({ view: 'product', id: i.id })} className="w-24 h-32 rounded-xl overflow-hidden bg-black/[0.02] flex-shrink-0">
                <img src={i.image} className="w-full h-full object-cover" alt="" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-neutral-500 mt-1">Size: {i.size} · Color: {i.color}</p>
                <p className="font-semibold mt-2">{fmt(i.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="glass rounded-full flex items-center border border-black/10">
                    <button onClick={() => updateCart(i.key, Math.max(1, i.qty - 1))} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => updateCart(i.key, i.qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(i.key)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-6 h-fit sticky top-24 border border-black/10">
          <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-neutral-700"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-neutral-700"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
            {subtotal < 1499 && <p className="text-xs text-blue-400">Add ₹{1499 - subtotal} more for FREE shipping</p>}
          </div>
          <div className="border-t border-black/10 my-4" />
          <div className="flex justify-between font-bold text-lg mb-6"><span>Total</span><span className="silver-text">{fmt(total)}</span></div>
          <Button onClick={() => setRoute({ view: 'checkout' })} className="w-full h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">Checkout <ArrowRight className="ml-2 w-4 h-4" /></Button>
          <div className="flex items-center justify-center gap-3 mt-4 text-neutral-500 text-xs"><Shield className="w-3.5 h-3.5" /> Secure checkout · SSL encrypted</div>
        </div>
      </div>
    </div>
  )
}

const WishlistPage = () => {
  const { products, wishlist, setRoute } = useShop()
  const items = products.filter(p => wishlist.includes(p.id))
  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <Heart className="w-20 h-20 text-neutral-300 mb-6" />
      <h2 className="text-3xl font-display font-bold mb-3">Your wishlist is empty</h2>
      <p className="text-neutral-500 mb-8">Save your favorites and revisit them anytime.</p>
      <Button onClick={() => setRoute({ view: 'shop' })} className="rounded-full bg-neutral-900 text-white h-12 px-8">Discover</Button>
    </div>
  )
  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-8">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{items.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}</div>
    </div>
  )
}

/* ============================== PAYMENT SUCCESS DIALOG ============================== */
const PaymentSuccessDialog = ({ order, onClose }) => {
  const { setRoute } = useShop()
  const [confetti, setConfetti] = useState(false)
  useEffect(() => { if (order) setTimeout(() => setConfetti(true), 200) }, [order])
  if (!order) return null

  const trackAndClose = () => { onClose(); setRoute({ view: 'track-order', orderId: order.id }) }
  const shopAndClose = () => { onClose(); setRoute({ view: 'home' }) }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Confetti dots */}
          {confetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => {
                const colors = ['bg-blue-500','bg-indigo-500','bg-purple-500','bg-emerald-500','bg-amber-400','bg-rose-400']
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: -30, x: `${(i * 17) % 100}%`, rotate: 0 }}
                    animate={{ opacity: 0, y: 700, rotate: 720 }}
                    transition={{ duration: 3 + (i % 5) * 0.4, ease: 'easeOut', delay: (i % 10) * 0.05 }}
                    className={`absolute w-2 h-3 rounded-sm ${colors[i % colors.length]}`}
                  />
                )
              })}
            </div>
          )}

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -15, 15, 0] }} transition={{ duration: 0.7, type: 'spring' }}
              className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center mb-4"
            >
              <Check className="w-14 h-14 text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-3xl font-display font-bold mb-1">Order Successfully Placed!</h2>
            <p className="text-white/90 text-sm">Thank you for shopping with Velora ✨</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">ORDER ID</p>
                <p className="font-mono text-sm font-bold text-blue-600 truncate">{order.id}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">AMOUNT PAID</p>
                <p className="font-display text-lg font-bold silver-text">{fmt(order.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">PAYMENT</p>
                <p className="text-sm font-semibold">{(order.payment || '').toUpperCase()} <span className="text-emerald-600 ml-1">✓ Verified</span></p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">DELIVERY BY</p>
                <p className="text-sm font-semibold">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">Confirmation sent to <b>{order.email}</b>. You'll receive tracking updates via email and SMS.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={trackAndClose} className="flex-1 h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600">
                <Package className="w-4 h-4 mr-2" /> Track Order
              </Button>
              <Button onClick={shopAndClose} variant="outline" className="flex-1 h-12 rounded-full border-black/15">
                Continue Shopping
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const CheckoutPage = () => {
  const { cart, setRoute, clearCart, user, updateCart, removeFromCart } = useShop()
  const [step, setStep] = useState(1)
  
  // Premium Saved Addresses state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      name: user?.name || 'Aarav Sharma',
      email: user?.email || 'aarav.sharma@gmail.com',
      phone: '9876543210',
      line1: 'Flat 402, Sunset Vista, 12th Main Road',
      line2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true
    },
    {
      id: 'addr-2',
      name: user?.name ? `${user.name} (Office)` : 'Isha Patel',
      email: user?.email || 'isha.patel@gmail.com',
      phone: '9123456789',
      line1: '15, Sea Breeze Heights, Marine Drive',
      line2: 'Backbay Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: false
    }
  ])
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    gst: ''
  })

  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeMessage, setPincodeMessage] = useState('')
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const [payment, setPayment] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)

  // Auto-fill City & State on 6-digit Pincode input
  useEffect(() => {
    const pin = form.pincode
    if (pin && pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true)
      const timer = setTimeout(() => {
        setPincodeLoading(false)
        if (pin.startsWith('560')) {
          setForm(f => ({ ...f, city: 'Bengaluru', state: 'Karnataka' }))
          setPincodeMessage('Bengaluru, Karnataka')
        } else if (pin.startsWith('400')) {
          setForm(f => ({ ...f, city: 'Mumbai', state: 'Maharashtra' }))
          setPincodeMessage('Mumbai, Maharashtra')
        } else if (pin.startsWith('110')) {
          setForm(f => ({ ...f, city: 'New Delhi', state: 'Delhi' }))
          setPincodeMessage('New Delhi, Delhi')
        } else if (pin.startsWith('600')) {
          setForm(f => ({ ...f, city: 'Chennai', state: 'Tamil Nadu' }))
          setPincodeMessage('Chennai, Tamil Nadu')
        } else if (pin.startsWith('700')) {
          setForm(f => ({ ...f, city: 'Kolkata', state: 'West Bengal' }))
          setPincodeMessage('Kolkata, West Bengal')
        } else if (pin.startsWith('500')) {
          setForm(f => ({ ...f, city: 'Hyderabad', state: 'Telangana' }))
          setPincodeMessage('Hyderabad, Telangana')
        } else {
          setPincodeMessage('Verified')
        }
      }, 400)
      return () => clearTimeout(timer)
    } else {
      setPincodeMessage('')
    }
  }, [form.pincode])

  const activeAddress = useMemo(() => {
    if (selectedAddressId === 'new') {
      return form
    }
    return addresses.find(a => a.id === selectedAddressId) || form
  }, [selectedAddressId, addresses, form])

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal > 1499 ? 0 : 99
  const discount = applied?.discount || 0
  const total = subtotal + shipping - discount

  const applyCoupon = async () => {
    const r = await fetch('/api/coupon', { method: 'POST', body: JSON.stringify({ code: coupon, subtotal }) }).then(x => x.json())
    if (r.error) return toast.error(r.error)
    setApplied(r); toast.success(`${r.label} applied!`)
  }

  const handleEditAddress = (addr, e) => {
    e.stopPropagation()
    setEditingAddressId(addr.id)
    setForm({
      name: addr.name,
      email: addr.email,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      gst: addr.gst || ''
    })
    setSelectedAddressId('new')
    setIsAddingNew(true)
  }

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation()
    setAddresses(prev => prev.filter(a => a.id !== id))
    if (selectedAddressId === id) {
      setSelectedAddressId('new')
    }
    toast.success('Address deleted')
  }

  const handleSaveAddress = () => {
    if (!form.name) return toast.error('Full name is required')
    if (!form.email || !form.email.includes('@')) return toast.error('Valid email is required')
    if (!form.phone || form.phone.length < 10) return toast.error('Valid phone number (min 10 digits) is required')
    if (!form.line1) return toast.error('Address Line 1 is required')
    if (!form.city) return toast.error('City is required')
    if (!form.state) return toast.error('State is required')
    if (!form.pincode || form.pincode.length !== 6) return toast.error('Pincode must be exactly 6 digits')

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...form } : a))
      setSelectedAddressId(editingAddressId)
      toast.success('Address updated')
    } else {
      const newId = 'addr-' + Date.now()
      const newAddr = {
        id: newId,
        ...form,
        isDefault: addresses.length === 0
      }
      setAddresses(prev => [...prev, newAddr])
      setSelectedAddressId(newId)
      toast.success('New address added')
    }
    setIsAddingNew(false)
    setEditingAddressId(null)
  }

  const placeRazorpayOrder = async () => {
    setPlacing(true);

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      const data = await orderRes.json();

      if (!data.success) {
        setPlacing(false);
        return toast.error(data.error || "Unable to create Razorpay order");
      }

      const orderPayload = {
        items: cart,
        address: activeAddress,
        email: activeAddress.email,
        name: activeAddress.name,
        phone: activeAddress.phone,
        payment: "razorpay",
        coupon: applied?.code || null,
        subtotal,
        shipping,
        discount,
        total,
      };

      await openRazorpayCheckout({
        order: data,
        prefill: {
          name: activeAddress.name,
          email: activeAddress.email,
          contact: activeAddress.phone,
        },
        description: "Velora Luxury Order",
        orderPayload,
        onVerified: (verifiedData) => {
          toast.success("Payment Successful");
          clearCart();
          setSuccessOrder(verifiedData.order);
          setPlacing(false);
        },
        onDismiss: () => {
          setPlacing(false);
        }
      });

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setPlacing(false);
    }
  };

  const placeOrder = async () => {
    if (payment === "razorpay") {
      return await placeRazorpayOrder();
    }

    setPlacing(true);

    const body = {
      items: cart,
      address: activeAddress,
      email: activeAddress.email,
      name: activeAddress.name,
      phone: activeAddress.phone,
      payment,
      coupon: applied?.code,
      subtotal,
      shipping,
      discount,
      total,
    };

    const r = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.json());

    setPlacing(false);

    if (r.error) return toast.error(r.error);

    clearCart();
    setSuccessOrder(r.order);
  };

  useEffect(() => { if (cart.length === 0 && !successOrder) setRoute({ view: 'cart' }) }, [cart, successOrder])
  if (cart.length === 0 && !successOrder) return null

  const canProceed = useMemo(() => {
    if (step === 1) {
      return (
        activeAddress.name &&
        activeAddress.email &&
        activeAddress.phone &&
        activeAddress.phone.length >= 10 &&
        activeAddress.line1 &&
        activeAddress.city &&
        activeAddress.state &&
        activeAddress.pincode &&
        activeAddress.pincode.length === 6
      )
    }
    return true
  }, [step, activeAddress])

  return (
    <div className="pt-8 pb-24 px-4 md:px-12 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-black/5">
        <div>
          <h1 className="text-huge font-display font-bold silver-text mb-1">Secure Checkout</h1>
          <p className="text-sm text-neutral-500">Every connection is encrypted with industrial 256-bit SSL protocols.</p>
        </div>
        <div className="flex items-center gap-3 text-sm mt-4 md:mt-0 flex-wrap">
          {['Delivery Address', 'Payment Method', 'Review & Pay'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <button 
                disabled={i + 1 > step && !canProceed}
                onClick={() => setStep(i + 1)}
                className={`flex items-center gap-2 transition text-xs tracking-wider uppercase font-semibold ${step === i + 1 ? 'text-blue-500 font-bold' : 'text-neutral-400 hover:text-neutral-600 disabled:opacity-40'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${step === i + 1 ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'border-neutral-300'}`}>
                  {step > i + 1 ? <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} /> : i + 1}
                </div>
                <span>{s}</span>
              </button>
              {i < 2 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-display font-bold text-neutral-900">Select Delivery Address</h2>
                  {!isAddingNew && (
                    <Button 
                      onClick={() => {
                        setEditingAddressId(null)
                        setForm({ name: '', email: user?.email || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', gst: '' })
                        setSelectedAddressId('new')
                        setIsAddingNew(true)
                      }}
                      variant="outline" 
                      className="rounded-full border-black/10 text-xs h-9 px-4 hover:bg-neutral-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add New
                    </Button>
                  )}
                </div>

                {/* Grid of Address Cards */}
                {!isAddingNew ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 border text-left flex flex-col justify-between h-[180px] ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/20 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/30' 
                              : 'border-black/10 hover:border-black/20 bg-white shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm text-neutral-900">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] tracking-wider uppercase font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 line-clamp-2 mb-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-xs text-neutral-500 mb-2">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-2">
                            <span className="text-xs text-neutral-400 font-mono">{addr.phone}</span>
                            <div className="flex gap-3 text-xs">
                              <button 
                                onClick={(e) => handleEditAddress(addr, e)} 
                                className="text-blue-500 hover:text-blue-600 font-semibold"
                              >
                                Edit
                              </button>
                              {!addr.isDefault && (
                                <button 
                                  onClick={(e) => handleDeleteAddress(addr.id, e)} 
                                  className="text-red-400 hover:text-red-500 font-semibold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Selected Check Indicator */}
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {/* Dashed Add Card */}
                    <div 
                      onClick={() => {
                        setEditingAddressId(null)
                        setForm({ name: '', email: user?.email || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', gst: '' })
                        setSelectedAddressId('new')
                        setIsAddingNew(true)
                      }}
                      className="border-2 border-dashed border-black/10 hover:border-black/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[180px] cursor-pointer transition hover:bg-neutral-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5 text-neutral-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700">Add New Shipping Address</p>
                      <p className="text-xs text-neutral-400 mt-1">For delivery anywhere in India</p>
                    </div>
                  </div>
                ) : (
                  // Address Form Slide-In
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-3xl p-6 border border-black/10 space-y-4 shadow-xl"
                  >
                    <h3 className="font-display font-semibold text-lg text-neutral-900">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Shipping Address'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Full Name *</label>
                        <Input placeholder="e.g. Shayan Akhtar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Email Address *</label>
                        <Input placeholder="e.g. shayan@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Mobile Number *</label>
                        <Input placeholder="10-digit mobile number" value={form.phone} maxLength={12} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Pincode (Auto-fills City/State) *</label>
                        <div className="relative">
                          <Input placeholder="6-digit PIN code" value={form.pincode} maxLength={6} onChange={e => setForm({ ...form, pincode: e.target.value })} className="bg-black/[0.02] border-black/10 h-11 pr-10" />
                          {pincodeLoading && (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400 absolute right-3 top-3.5" />
                          )}
                          {pincodeMessage && !pincodeLoading && (
                            <span className="absolute right-3 top-3.5 text-xs text-emerald-600 font-medium">✓ {pincodeMessage}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Street Address (Line 1) *</label>
                      <Input placeholder="House/Flat No, Building Name, Street Name" value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Landmark / Locality (Line 2)</label>
                      <Input placeholder="Area, Landmark, Colony, Suite" value={form.line2} onChange={e => setForm({ ...form, line2: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">City *</label>
                        <Input placeholder="Bengaluru" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">State *</label>
                        <Input placeholder="Karnataka" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">GSTIN for Business Invoice (Optional)</label>
                      <Input placeholder="29XXXXX0000X0Z0" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-black/5">
                      <Button 
                        onClick={() => {
                          setIsAddingNew(false)
                          setEditingAddressId(null)
                          setSelectedAddressId('addr-1')
                        }} 
                        variant="outline" 
                        className="rounded-full border-black/10 h-11 px-6 hover:bg-neutral-50 text-neutral-600"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveAddress} 
                        className="rounded-full bg-blue-500 text-white hover:bg-blue-400 h-11 px-8 shadow-lg shadow-blue-500/10"
                      >
                        Save & Use Address
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-display font-bold text-neutral-900 mb-2">Select Payment Method</h2>
                <div className="glass rounded-3xl p-6 border border-black/10 space-y-3 shadow-sm bg-white">
                  {[
                    {
                      v: "razorpay",
                      l: "Online Payments",
                      s: "UPI, Credit/Debit Cards, Net Banking, and Wallets",
                      badge: "Razorpay Secure",
                      icon: CreditCard,
                    },
                    {
                      v: "cod",
                      l: "Cash on Delivery",
                      s: "Pay with Cash or UPI upon physical package delivery",
                      badge: "₹49 handling fee",
                      icon: Package,
                    },
                  ].map((o) => {
                    const isSelected = payment === o.v
                    return (
                      <button
                        key={o.v}
                        onClick={() => setPayment(o.v)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 relative ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30"
                            : "border-black/10 hover:border-black/20 bg-white"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-500/10 text-blue-500' : 'bg-black/[0.03] text-neutral-500'
                        }`}>
                          <o.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-neutral-900 text-sm md:text-base">{o.l}</span>
                            <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-black/5">
                              {o.badge}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">{o.s}</p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-black/20"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex items-center gap-2 px-2 text-xs text-neutral-500">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Payments are processed with 256-bit encryption. We never save card details.</span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-neutral-900">Review Items & Bag</h2>
                  <button onClick={() => setRoute({ view: 'cart' })} className="text-xs text-blue-500 hover:underline font-semibold">Modify Cart</button>
                </div>

                <div className="glass rounded-3xl p-6 border border-black/10 space-y-4 bg-white shadow-sm">
                  {cart.map((item) => (
                    <div key={item.key} className="flex gap-4 items-center pb-4 last:pb-0 border-b border-black/5 last:border-0">
                      <img src={item.image} className="w-16 h-20 rounded-xl object-cover border border-black/5 flex-shrink-0" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500 mb-2">{item.size} · {item.color}</p>
                        
                        {/* Premium Inline Quantity Editor */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-black/10 rounded-full h-8 overflow-hidden bg-black/[0.01]">
                            <button 
                              onClick={() => {
                                if (item.qty > 1) {
                                  updateCart(item.key, item.qty - 1)
                                } else {
                                  removeFromCart(item.key)
                                  toast.success('Item removed')
                                }
                              }} 
                              className="w-8 h-full flex items-center justify-center hover:bg-black/[0.05] transition"
                            >
                              <Minus className="w-3 h-3 text-neutral-600" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-neutral-800">{item.qty}</span>
                            <button 
                              onClick={() => updateCart(item.key, item.qty + 1)} 
                              className="w-8 h-full flex items-center justify-center hover:bg-black/[0.05] transition"
                            >
                              <Plus className="w-3 h-3 text-neutral-600" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => {
                              removeFromCart(item.key)
                              toast.success('Item removed')
                            }} 
                            className="text-xs text-red-400 hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-sm text-neutral-900">{fmt(item.price * item.qty)}</p>
                        <p className="text-[10px] text-neutral-400">{item.qty} × {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery details briefing */}
                <div className="glass rounded-3xl p-5 border border-black/5 bg-neutral-50/50 grid md:grid-cols-2 gap-4">
                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Delivering To</p>
                    <p className="font-semibold text-neutral-800">{activeAddress.name}</p>
                    <p className="text-neutral-500 line-clamp-1">{activeAddress.line1}, {activeAddress.city}</p>
                    <p className="text-neutral-500">{activeAddress.state} - {activeAddress.pincode}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Payment Selection</p>
                    <p className="font-semibold text-neutral-800">
                      {payment === 'razorpay' ? 'Secure Credit/Debit/UPI (Razorpay)' : 'Cash on Delivery (COD)'}
                    </p>
                    <p className="text-neutral-500 mt-1">Est. Delivery: 4-6 Days (Pan-India Express)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Buttons (Back / Forward) */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button 
                onClick={() => setStep(step - 1)} 
                variant="outline" 
                className="rounded-full border-black/15 h-12 px-6"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button 
                disabled={!canProceed} 
                onClick={() => setStep(step + 1)} 
                className="rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white ml-auto h-12 px-8 shadow-lg transition"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button 
                disabled={placing} 
                onClick={placeOrder} 
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white ml-auto h-12 px-10 shadow-lg shadow-blue-500/10 font-bold tracking-wide"
              >
                {placing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing Secure Order...
                  </span>
                ) : payment === 'razorpay' ? (
                  `Pay Securely · ${fmt(total)}`
                ) : (
                  `Confirm COD Order · ${fmt(total)}`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Sidebar Column */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-black/10 sticky top-24 bg-white/70 shadow-lg backdrop-blur space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-900">Order Summary</h3>
              <p className="text-xs text-neutral-400">Indian Rupee pricing inclusive of taxes.</p>
            </div>

            {/* Coupons inside Sidebar */}
            <div className="space-y-2">
              <div className="flex gap-2 p-1.5 border border-black/10 rounded-full bg-black/[0.01]">
                <input 
                  value={coupon} 
                  onChange={e => setCoupon(e.target.value)} 
                  placeholder="Promo Code" 
                  className="flex-1 bg-transparent px-3 outline-none text-xs" 
                />
                <button 
                  onClick={applyCoupon} 
                  className="bg-neutral-900 hover:bg-blue-500 text-white rounded-full text-xs font-semibold px-4 py-2 transition"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 px-1">
                Try: <span className="font-mono bg-neutral-100 px-1 rounded">VELORA10</span>, <span className="font-mono bg-neutral-100 px-1 rounded">FUTURE20</span>
              </p>
              {applied && (
                <div className="text-[11px] bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl flex items-center justify-between border border-emerald-200">
                  <span className="font-medium">Coupon Applied: {applied.code}</span>
                  <button onClick={() => setApplied(null)} className="underline font-bold text-red-500 ml-2">Remove</button>
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="space-y-3 pt-3 border-t border-black/5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((s,i)=>s+i.qty, 0)} items)</span>
                <span className="font-medium text-neutral-900">{fmt(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-medium text-neutral-900">{fmt(shipping)}</span>
                )}
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({applied?.code})</span>
                  <span>-{fmt(discount)}</span>
                </div>
              )}

              {payment === 'cod' && (
                <div className="flex justify-between text-amber-700">
                  <span>COD Handling Fee</span>
                  <span>+₹49</span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>GST (18% Included)</span>
                <span>{fmt(Math.round((total - (payment === 'cod' ? 49 : 0)) * 0.18))}</span>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-neutral-800">Grand Total</span>
                <span className="text-2xl font-display font-bold silver-text text-blue-600">
                  {fmt(total + (payment === 'cod' ? 49 : 0))}
                </span>
              </div>
            </div>

            {/* Trust assurances block */}
            <div className="pt-4 border-t border-black/5 space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">100% Buyer Protection</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Secure payments with instant support</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">Easy 15-Day Returns</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">No-questions-asked refunds & sizes swap</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-500">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">Express Tracked Shipping</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Fulfilled by BlueDart, Delhivery & Bluedart</p>
                </div>
              </div>
            </div>

            {/* Payment Secure Badge */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-black/5 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Razorpay Secured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Mobile Bar */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-black/10 flex items-center justify-between md:hidden z-40">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Grand Total</p>
            <p className="text-xl font-bold font-display silver-text text-blue-600">
              {fmt(total + (payment === 'cod' ? 49 : 0))}
            </p>
          </div>
          <Button 
            disabled={placing} 
            onClick={placeOrder} 
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6 h-11 text-sm font-bold shadow-lg"
          >
            {placing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : payment === 'razorpay' ? (
              'Pay Securely'
            ) : (
              'Confirm Order'
            )}
          </Button>
        </div>
      )}

      <PaymentSuccessDialog order={successOrder} onClose={() => setSuccessOrder(null)} />
    </div>
  )
}

const OrderSuccessPage = () => {
  const { route, setRoute } = useShop()
  const order = route.order
  if (!order) return null
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.7 }} className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
          <Check className="w-12 h-12 text-blue-400" />
        </motion.div>
        <h1 className="text-huge font-display font-bold silver-text text-center mb-3">Order Confirmed</h1>
        <p className="text-neutral-600 text-center mb-8">Your future is on its way. Confirmation sent to <b className="text-neutral-900">{order.email}</b></p>
        <div className="glass rounded-2xl p-6 border border-black/10 space-y-4">
          <div className="flex justify-between"><span className="text-neutral-600">Order ID</span><span className="font-mono text-blue-400">{order.id}</span></div>
          <div className="flex justify-between"><span className="text-neutral-600">Amount</span><span className="font-bold">{fmt(order.total)}</span></div>
          <div className="flex justify-between"><span className="text-neutral-600">Payment</span><span>{order.payment?.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-neutral-600">Estimated Delivery</span><span>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span></div>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button onClick={() => setRoute({ view: 'track-order', orderId: order.id })} className="flex-1 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white h-12">Track Order</Button>
          <Button onClick={() => setRoute({ view: 'home' })} variant="outline" className="flex-1 rounded-full border-black/15 h-12">Continue Shopping</Button>
        </div>
      </div>
    </div>
  )
}

const TrackOrderPage = () => {
  const { route } = useShop()
  const [orderId, setOrderId] = useState(route.orderId || '')
  const [order, setOrder] = useState(null)
  const track = async (id) => {
    const useId = id || orderId
    if (!useId) return
    const r = await fetch(`/api/order/${useId}`).then(x => x.json())
    if (r.error) return toast.error('Order not found')
    setOrder(r.order)
  }
  useEffect(() => { if (route.orderId) track(route.orderId) }, [route.orderId])
  return (
    <div className="pt-12 pb-20 px-6 md:px-12 max-w-3xl mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-2">Track Order</h1>
      <p className="text-neutral-500 mb-8">Enter your order ID to check status</p>
      <div className="glass rounded-full p-2 flex gap-2 border border-black/10 mb-8">
        <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. VEL..." className="flex-1 bg-transparent px-4 outline-none" />
        <Button onClick={() => track()} className="rounded-full bg-neutral-900 text-white">Track</Button>
      </div>
      {order && (
        <div className="glass rounded-2xl p-6 border border-black/10">
          <div className="flex justify-between mb-6">
            <div><p className="text-xs text-neutral-500">ORDER</p><p className="font-mono">{order.id}</p></div>
            <div className="text-right"><p className="text-xs text-neutral-500">TOTAL</p><p className="font-bold">{fmt(order.total)}</p></div>
          </div>
          <div className="space-y-0">
            {order.tracking.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.at ? 'bg-blue-500' : 'bg-black/5'}`}>{t.at ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-neutral-500" />}</div>
                  {i < order.tracking.length - 1 && <div className={`w-px flex-1 ${t.at ? 'bg-blue-500' : 'bg-black/5'}`} />}
                </div>
                <div className="flex-1 pb-6">
                  <p className={`font-medium ${t.at ? 'text-neutral-900' : 'text-neutral-500'}`}>{t.label}</p>
                  {t.at && <p className="text-xs text-neutral-500 mt-1">{new Date(t.at).toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const AuthPage = () => {
  const { setUser, setRoute } = useShop()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ email: '', password: '', name: '' })
  const submit = async () => {
    const r = await fetch(`/api/${mode}`, { method: 'POST', body: JSON.stringify(f) }).then(x => x.json())
    if (r.error) return toast.error(r.error)
    localStorage.setItem('velora_user', JSON.stringify(r.user))
    setUser(r.user); toast.success(`Welcome ${mode === 'login' ? 'back' : 'to Velora'}, ${r.user.name}`); setRoute({ view: 'account' })
  }
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-black/10">
        <VeloraLogo size="lg" />
        <h1 className="text-3xl font-display font-bold mt-6 mb-2">{mode === 'login' ? 'Welcome back' : 'Join the future'}</h1>
        <p className="text-neutral-500 mb-6">{mode === 'login' ? 'Sign in to your account' : 'Get 100 reward points on signup'}</p>
        <div className="space-y-3">
          {mode === 'register' && <Input placeholder="Full name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="bg-black/[0.02] border-black/10 h-12" />}
          <Input placeholder="Email" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="bg-black/[0.02] border-black/10 h-12" />
          <Input placeholder="Password" type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} className="bg-black/[0.02] border-black/10 h-12" />
        </div>
        <Button onClick={submit} className="w-full mt-6 h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">{mode === 'login' ? 'Sign In' : 'Create Account'}</Button>
        <p className="text-center text-sm mt-6 text-neutral-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-blue-400 hover:underline">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
        </p>
      </div>
    </div>
  )
}

const AccountPage = () => {
  const { user, setUser, setRoute, wishlist } = useShop()
  const [orders, setOrders] = useState([])
  useEffect(() => { if (user?.email) fetch(`/api/orders?email=${user.email}`).then(r => r.json()).then(d => setOrders(d.orders || [])) }, [user])
  useEffect(() => { if (!user) setRoute({ view: 'auth' }) }, [user])
  if (!user) return null
  const logout = () => { localStorage.removeItem('velora_user'); setUser(null); setRoute({ view: 'home' }); toast.success('Signed out') }
  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] text-blue-400 mb-2">◆ MY ACCOUNT</p>
        <h1 className="text-huge font-display font-bold silver-text">Hi, {user.name}</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { i: Package, l: 'Orders', v: orders.length },
          { i: Heart, l: 'Wishlist', v: wishlist.length },
          { i: Gift, l: 'Rewards', v: user.rewards },
          { i: Wallet, l: 'Wallet', v: fmt(user.wallet) },
        ].map(x => (
          <div key={x.l} className="glass rounded-2xl p-5 border border-black/10">
            <x.i className="w-6 h-6 text-blue-400 mb-3" />
            <p className="text-2xl font-display font-bold silver-text">{x.v}</p>
            <p className="text-xs text-neutral-500 mt-1">{x.l}</p>
          </div>
        ))}
      </div>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="glass border border-black/10">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6 space-y-4">
          {orders.length === 0 ? <p className="text-neutral-500 py-8 text-center">No orders yet.</p> : orders.map(o => (
            <div key={o.id} className="glass rounded-2xl p-5 border border-black/10 flex justify-between items-center">
              <div>
                <p className="font-mono text-blue-400 text-sm">{o.id}</p>
                <p className="text-xs text-neutral-500 mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.items.length} items</p>
                <p className="font-bold mt-2">{fmt(o.total)}</p>
              </div>
              <Button onClick={() => setRoute({ view: 'track-order', orderId: o.id })} variant="outline" className="rounded-full border-black/15">Track</Button>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <div className="glass rounded-2xl p-6 border border-black/10 space-y-4 max-w-xl">
            <div><label className="text-xs text-neutral-500">Name</label><Input defaultValue={user.name} className="bg-black/[0.02] border-black/10 mt-1" /></div>
            <div><label className="text-xs text-neutral-500">Email</label><Input defaultValue={user.email} className="bg-black/[0.02] border-black/10 mt-1" disabled /></div>
            <Button className="rounded-full bg-neutral-900 text-white">Save Changes</Button>
          </div>
        </TabsContent>
        <TabsContent value="addresses" className="mt-6">
          <div className="glass rounded-2xl p-6 border border-black/10 text-neutral-600">Add addresses at checkout — they'll be saved here.</div>
        </TabsContent>
      </Tabs>
      <Button onClick={logout} variant="outline" className="mt-8 rounded-full border-black/15"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
    </div>
  )
}

const StaticPage = ({ title, subtitle, children }) => (
  <div className="pt-8 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
    <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ {subtitle}</p>
    <h1 className="text-huge font-display font-bold silver-text mb-8">{title}</h1>
    <div className="text-neutral-700 leading-relaxed space-y-4">{children}</div>
  </div>
)

const AboutPage = () => (
  <StaticPage title="Our Story" subtitle="ABOUT VELORA">
    <p className="text-2xl font-serif-lux italic text-neutral-900">"Velora exists at the intersection of Indian craftsmanship and futuristic design."</p>
    <p>Founded in 2024 in Bengaluru, Velora is India's next-generation luxury fashion house. We design for the wearer of tomorrow — the individual who refuses to compromise between artistry, sustainability and modern silhouettes.</p>
    <p>Every piece is engineered in our Bengaluru atelier using premium fabrics, ethical manufacturing partners, and obsessive attention to construction. From our signature 480 GSM oversized hoodies to our bias-cut mulberry silk slip dresses, each garment is designed to last generations.</p>
    <div className="grid grid-cols-3 gap-6 my-12">
      {[{ n: '2M+', l: 'CUSTOMERS' }, { n: '48', l: 'CITIES' }, { n: '100%', l: 'ETHICAL' }].map(x => (
        <div key={x.l} className="glass rounded-2xl p-6 border border-black/10 text-center"><p className="text-5xl font-display font-bold silver-text neon-text">{x.n}</p><p className="text-xs tracking-[0.3em] text-neutral-500 mt-2">{x.l}</p></div>
      ))}
    </div>
    <h2 className="text-2xl font-display font-bold text-white">Our Values</h2>
    <ul className="list-disc list-inside space-y-2">
      <li><b className="text-white">Craftsmanship:</b> Every stitch matters.</li>
      <li><b className="text-white">Sustainability:</b> Recycled materials, ethical wages.</li>
      <li><b className="text-white">Innovation:</b> Blending traditional textile mastery with modern design.</li>
      <li><b className="text-white">Community:</b> Building the future of Indian fashion together.</li>
    </ul>
  </StaticPage>
)

const ContactPage = () => {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const send = async () => {
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(f) })
    setSent(true); toast.success('Message sent. We\'ll respond within 24h.')
  }
  return (
    <StaticPage title="Get in Touch" subtitle="CONTACT US">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">EMAIL</p><p className="font-medium">hello@velora.in</p></div>
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">SUPPORT</p><p className="font-medium">+91 80 4000 5000</p><p className="text-xs text-neutral-500 mt-1">Mon-Sat, 10 AM to 8 PM IST</p></div>
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">ATELIER</p><p className="font-medium">Velora HQ, Indiranagar<br />Bengaluru 560038, India</p></div>
        </div>
        <div className="glass rounded-2xl p-6 border border-black/10 space-y-3">
          {sent ? <div className="text-center py-12"><Check className="w-16 h-16 text-blue-400 mx-auto mb-4" /><p>We got your message</p></div> : <>
            <Input placeholder="Your name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Textarea placeholder="Message" rows={5} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Button onClick={send} className="w-full rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">Send Message</Button>
          </>}
        </div>
      </div>
    </StaticPage>
  )
}

const FaqPage = () => {
  const faqs = [
    ['How long does delivery take?', 'Standard delivery within 3-7 business days across India. Metro cities usually receive orders in 2-4 days.'],
    ['What is your return policy?', 'Easy 15-day return from date of delivery. Items must be unused with tags. Instant refund for prepaid orders.'],
    ['Do you ship internationally?', 'We currently ship pan-India. International shipping coming Q1 2026.'],
    ['How do I know my size?', 'Check our detailed size guide on every product page. Our sizing runs slightly oversized — refer to the fit note.'],
    ['Is COD available?', 'Yes, Cash on Delivery is available for most pincodes in India with a small ₹49 handling fee.'],
    ['How can I track my order?', 'Use the order ID sent to your email on our Track Order page, or check your account dashboard.'],
    ['Are your products authentic?', 'Every Velora piece is designed and manufactured in-house at our Bengaluru atelier. 100% authentic, always.'],
  ]
  return (
    <StaticPage title="Frequently Asked" subtitle="HELP CENTER">
      <Accordion type="single" collapsible>
        {faqs.map(([q, a], i) => <AccordionItem value={String(i)} key={i} className="border-black/10"><AccordionTrigger className="text-left">{q}</AccordionTrigger><AccordionContent className="text-neutral-600">{a}</AccordionContent></AccordionItem>)}
      </Accordion>
    </StaticPage>
  )
}

const SizeGuidePage = () => (
  <StaticPage title="Size Guide" subtitle="MEASUREMENTS">
    <p>Velora silhouettes run oversized. If you prefer a fitted look, size down one.</p>
    <div className="glass rounded-2xl p-6 border border-black/10 mt-6">
      <h3 className="font-display font-bold mb-4 text-white">Unisex Tops (inches)</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-neutral-500 border-b border-black/10"><th className="text-left py-2">Size</th><th>Chest</th><th>Length</th><th>Shoulder</th></tr></thead>
        <tbody>{[['S', 44, 27, 20], ['M', 46, 28, 21], ['L', 48, 29, 22], ['XL', 50, 30, 23], ['XXL', 52, 31, 24]].map(r => <tr key={r[0]} className="border-b border-black/5"><td className="py-2 font-medium text-white">{r[0]}</td><td className="text-center">{r[1]}</td><td className="text-center">{r[2]}</td><td className="text-center">{r[3]}</td></tr>)}</tbody>
      </table>
    </div>
  </StaticPage>
)

const PolicyPage = ({ title }) => (
  <StaticPage title={title} subtitle="LEGAL">
    <p>Last updated: January 2025</p>
    <p>{title} for Velora. We take your privacy and rights seriously. This document outlines our terms in accordance with Indian law. Full document at hello@velora.in.</p>
    <h2 className="text-xl font-bold text-white mt-6">Key Points</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>All transactions are secured with 256-bit SSL encryption.</li>
      <li>We do not sell your personal information to third parties.</li>
      <li>Cookies are used only for essential functionality and analytics.</li>
      <li>Payment processing is handled by PCI-DSS compliant partners.</li>
      <li>You may request data deletion at any time by emailing hello@velora.in.</li>
    </ul>
  </StaticPage>
)

/* ============================== AI CHAT WIDGET ============================== */
const QUICK_OPTIONS = [
  { icon: Package, label: 'Track my order', q: 'How can I track my order?' },
  { icon: TruckIcon, label: 'Shipping & delivery', q: 'How long does delivery take?' },
  { icon: RotateCcw, label: 'Returns & refund', q: 'What is your return policy?' },
  { icon: Gift, label: 'Coupon codes', q: 'Show me current coupon codes' },
  { icon: Award, label: 'Size guide', q: 'Help me pick the right size' },
  { icon: CreditCard, label: 'Payment options', q: 'What payment methods do you accept?' },
  { icon: Sparkles, label: 'Product recommendations', q: 'Recommend me a best-seller product' },
  { icon: Phone, label: 'Talk to a human', q: 'I want to speak to a human agent' },
]

const AIChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi ✨ I'm **Vera**, your Velora AI concierge. I can help with sizing, orders, returns, payments and styling — powered by Gemini. How can I help today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showQuick, setShowQuick] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    let sid = ''
    try { sid = localStorage.getItem('velora_chat_sid') || '' } catch (e) {}
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      try { localStorage.setItem('velora_chat_sid', sid) } catch (e) {}
    }
    setSessionId(sid)
  }, [])

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setShowQuick(false)
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: q })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm having trouble responding right now. Try again in a moment?" }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network issue — please try again." }])
    } finally { setLoading(false) }
  }

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[70] w-16 h-16 rounded-full bg-neutral-900 text-white shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-all group pulse-glow"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
        </motion.button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22 }}
            className="fixed bottom-6 right-6 z-[70] w-[min(400px,calc(100vw-2rem))] h-[min(620px,calc(100vh-3rem))] glass-strong rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-black/10"
          >
            {/* Header */}
            <div className="bg-neutral-950 text-white p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="aurora opacity-30" />
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-neutral-950" />
              </div>
              <div className="relative flex-1">
                <p className="font-semibold text-sm">Vera · Velora Concierge</p>
                <p className="text-[11px] text-white/60 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> AI-powered · Usually replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} className="relative w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafaf9]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center mr-2 mt-1"><Bot className="w-3.5 h-3.5 text-white" /></div>}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm bubble-in ${m.role === 'user' ? 'bg-neutral-900 text-white rounded-br-md' : 'bg-white border border-black/5 text-neutral-800 rounded-bl-md shadow-sm'}`}>
                    <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center mr-2 mt-1"><Bot className="w-3.5 h-3.5 text-white" /></div>
                  <div className="bg-white border border-black/5 px-4 py-3 rounded-2xl shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Quick options */}
              {showQuick && !loading && (
                <div className="pt-3">
                  <p className="text-[11px] tracking-[0.2em] text-neutral-500 mb-2 px-1">QUICK ACTIONS</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_OPTIONS.map(opt => (
                      <button key={opt.label} onClick={() => send(opt.q)} className="text-left p-3 rounded-xl bg-white border border-black/5 hover:border-blue-400/40 hover:bg-blue-50/50 transition group">
                        <opt.icon className="w-4 h-4 text-blue-500 mb-1.5" />
                        <p className="text-xs font-medium text-neutral-800 leading-tight">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href="tel:+918040005000" className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-900 text-white justify-center hover:bg-blue-600 transition"><Phone className="w-3 h-3" /> Call us</a>
                    <a href="mailto:hello@velora.in" className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-black/10 justify-center hover:border-blue-400 transition"><Mail className="w-3 h-3" /> Email</a>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-black/5 p-3 bg-white">
              <div className="flex items-center gap-2 rounded-full bg-neutral-100 pl-4 pr-2 py-1.5">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send() }}
                  placeholder="Ask about anything..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400"
                />
                <button onClick={() => send()} disabled={loading || !input.trim()} className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 text-center mt-2">Powered by Gemini · Velora may make mistakes · <button onClick={() => { setMessages([messages[0]]); setShowQuick(true) }} className="underline hover:text-blue-500">Reset chat</button></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const App = () => {
  const [route, setRoute] = useState({ view: 'home' })
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [user, setUser] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false) })
    try {
      const savedCart = JSON.parse(localStorage.getItem('velora_cart') || '[]')
      const savedWL = JSON.parse(localStorage.getItem('velora_wl') || '[]')
      const savedUser = JSON.parse(localStorage.getItem('velora_user') || 'null')
      setCart(savedCart); setWishlist(savedWL); setUser(savedUser)
    } catch (e) {}
  }, [])
  useEffect(() => { try { localStorage.setItem('velora_cart', JSON.stringify(cart)) } catch (e) {} }, [cart])
  useEffect(() => { try { localStorage.setItem('velora_wl', JSON.stringify(wishlist)) } catch (e) {} }, [wishlist])
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo(0, 0) }, [route])

  const addToCart = (p, size, color, qty = 1) => {
    const key = `${p.id}-${size}-${color}`
    setCart(prev => {
      const exists = prev.find(i => i.key === key)
      if (exists) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { key, id: p.id, name: p.name, price: p.price, image: p.images[0], size, color, qty }]
    })
    toast.success(`Added ${p.name} to bag`)
  }
  const updateCart = (key, qty) => setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key))
  const clearCart = () => setCart([])
  const toggleWishlist = (id) => {
    setWishlist(prev => {
      if (prev.includes(id)) { toast('Removed from wishlist'); return prev.filter(x => x !== id) }
      toast.success('Added to wishlist'); return [...prev, id]
    })
  }

  const ctx = { route, setRoute, products, cart, addToCart, updateCart, removeFromCart, clearCart, wishlist, toggleWishlist, user, setUser, searchOpen, setSearchOpen, mobileNavOpen, setMobileNavOpen }

  const view = route.view || 'home'
  const pages = {
    home: <HomePage />, shop: <ShopPage />, product: <ProductPage />, cart: <CartPage />, wishlist: <WishlistPage />,
    checkout: <CheckoutPage />, 'order-success': <OrderSuccessPage />, 'track-order': <TrackOrderPage />,
    auth: <AuthPage />, account: <AccountPage />, about: <AboutPage />, contact: <ContactPage />,
    faq: <FaqPage />, 'size-guide': <SizeGuidePage />, shipping: <PolicyPage title="Shipping & Returns" />,
    privacy: <PolicyPage title="Privacy Policy" />, terms: <PolicyPage title="Terms & Conditions" />,
  }

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fafaf9]">
      <VeloraLogo size="xl" />
      <div className="mt-8 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spin-slow" />
      <p className="mt-4 text-xs tracking-[0.3em] text-neutral-500">LOADING THE FUTURE</p>
    </div>
  )

  return (
    <ShopCtx.Provider value={ctx}>
      <div className="min-h-screen bg-[#fafaf9] noise">
        <Header />
        <main>
          <AnimatePresence mode="wait">
            <motion.div key={view + JSON.stringify(route.filter || route.id || '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {pages[view] || <HomePage />}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <SearchOverlay />
        <AIChatWidget />
      </div>
    </ShopCtx.Provider>
  )
}

export default App
