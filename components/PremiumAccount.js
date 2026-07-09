'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Package, Heart, User, MapPin, CreditCard, Bell, HelpCircle, 
  Settings, LogOut, Trash2, Plus, Check, ChevronRight, Sliders,
  Clock, Shield, Mail, Phone, Lock, Edit, Eye, EyeOff, Tag, Award
} from 'lucide-react'

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

export default function PremiumAccount({ useShop }) {
  const { user, setUser, setRoute, wishlist, toggleWishlist, cart, addToCart } = useShop()
  const [activeTab, setActiveTab] = useState('orders') // orders | profile | addresses | payments | notifications | settings | support | wishlist
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // Addresses State
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
  })

  // Payments State
  const [payments, setPayments] = useState([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa'
  })

  // Support Tickets State
  const [tickets, setTickets] = useState([])
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'sizing', message: '' })

  // Notifications preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true, priceDrops: false, newDrops: true, whatsappAlerts: true
  })

  // General Settings preferences
  const [settingsPrefs, setSettingsPrefs] = useState({
    region: 'India', currency: 'INR', stylingAdvice: true
  })

  // Password fields for profile update
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    currentPassword: '',
    newPassword: '',
    showPass: false
  })

  // System alert feeds
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Secure Sign In Detected', desc: 'A secure login was completed from your device.', date: 'Just now', read: false },
    { id: 2, title: '100 Welcome Points Credited', desc: 'Starting reward points successfully registered to your Couture wallet.', date: '1 hour ago', read: false },
    { id: 3, title: 'New Nebula Stock Arrived', desc: 'The Nebula Oversized Hoodie in Void Black is now fully restocked in our Bengaluru atelier.', date: 'Yesterday', read: true }
  ])

  // Fetch orders and other saved items
  useEffect(() => {
    if (user?.email) {
      setLoadingOrders(true)
      fetch(`/api/orders?email=${user.email}`)
        .then(r => r.json())
        .then(d => {
          setOrders(d.orders || [])
          setLoadingOrders(false)
        })
        .catch(err => {
          console.error("Failed to load orders:", err)
          setLoadingOrders(false)
        })

      // Load user preferences/addresses/payments from cache or API
      try {
        const savedAddresses = JSON.parse(localStorage.getItem(`velora_addresses_${user.email}`) || '[]')
        setAddresses(savedAddresses.length > 0 ? savedAddresses : [
          { id: 'addr_1', name: user.name, phone: '+91 98765 43210', line1: 'No. 42, 80 Feet Road, Indiranagar', line2: 'Opposite Metro Station', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', isDefault: true }
        ])

        const savedPayments = JSON.parse(localStorage.getItem(`velora_payments_${user.email}`) || '[]')
        setPayments(savedPayments.length > 0 ? savedPayments : [
          { id: 'pay_1', holder: user.name, number: '•••• •••• •••• 4242', exp: '12/28', brand: 'visa' }
        ])

        const savedTickets = JSON.parse(localStorage.getItem(`velora_tickets_${user.email}`) || '[]')
        setTickets(savedTickets.length > 0 ? savedTickets : [
          { id: 'TKT-9024', subject: 'Inquiry regarding Nebula sizing', category: 'sizing', date: '2 days ago', status: 'Resolved', message: 'Hi there, I wanted to know if Nebula hoodie runs too oversized?' }
        ])
      } catch (e) {
        console.warn(e)
      }
    }
  }, [user])

  // Force redirect if user signed out
  useEffect(() => {
    if (!user) {
      setRoute({ view: 'auth' })
    }
  }, [user])

  const logout = () => {
    localStorage.removeItem('velora_user')
    setUser(null)
    setRoute({ view: 'home' })
    toast.success('Successfully logged out from your secure session')
  }

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name) return toast.error('Name cannot be empty')
    
    // Simulate updating user API
    const updatedUser = {
      ...user,
      name: profileForm.name,
      phone: profileForm.phone,
      dob: profileForm.dob
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: profileForm.name,
          phone: profileForm.phone,
          dob: profileForm.dob,
          newPassword: profileForm.newPassword || undefined
        })
      }).then(r => r.json())

      if (response.error) {
        return toast.error(response.error)
      }

      setUser(updatedUser)
      localStorage.setItem('velora_user', JSON.stringify(updatedUser))
      toast.success('Your profile dossier has been updated')
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (err) {
      // Fallback
      setUser(updatedUser)
      localStorage.setItem('velora_user', JSON.stringify(updatedUser))
      toast.success('Profile updated (Local session sync completed)')
    }
  }

  // Address CRUD
  const saveAddress = (e) => {
    e.preventDefault()
    if (!addressForm.name || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.pincode) {
      return toast.error('Please fill in all mandatory address fields')
    }

    let updated = []
    if (addressForm.id) {
      // Edit
      updated = addresses.map(a => a.id === addressForm.id ? { ...addressForm } : a)
    } else {
      // Create
      const newAddr = { ...addressForm, id: 'addr_' + Date.now() }
      updated = [...addresses, newAddr]
    }

    // Handle default address setting
    if (addressForm.isDefault) {
      updated = updated.map(a => a.id === addressForm.id || (addressForm.id === '' && a.id === updated[updated.length - 1].id) ? { ...a, isDefault: true } : { ...a, isDefault: false })
    }

    setAddresses(updated)
    localStorage.setItem(`velora_addresses_${user.email}`, JSON.stringify(updated))
    setShowAddressForm(false)
    setAddressForm({ id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
    toast.success(addressForm.id ? 'Address record updated' : 'New address added to your portfolio')
  }

  const deleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id)
    setAddresses(updated)
    localStorage.setItem(`velora_addresses_${user.email}`, JSON.stringify(updated))
    toast.success('Address removed from your profile')
  }

  // Payment CRUD
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    // Detect brand
    let brand = 'visa'
    if (value.startsWith('4')) brand = 'visa'
    else if (value.startsWith('5')) brand = 'mastercard'
    else if (value.startsWith('3')) brand = 'amex'
    else brand = 'visa'

    // Format with spaces
    let formatted = ''
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' '
      formatted += value[i]
    }

    setPaymentForm({ ...paymentForm, number: formatted, brand })
  }

  const handleExpChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4)
    }
    setPaymentForm({ ...paymentForm, exp: val.slice(0, 5) })
  }

  const savePayment = (e) => {
    e.preventDefault()
    if (!paymentForm.holder || !paymentForm.number || !paymentForm.exp || !paymentForm.cvv) {
      return toast.error('Please enter complete credit card credentials')
    }

    const maskedNumber = '•••• •••• •••• ' + paymentForm.number.slice(-4)
    const newPay = {
      id: 'pay_' + Date.now(),
      holder: paymentForm.holder,
      number: maskedNumber,
      exp: paymentForm.exp,
      brand: paymentForm.brand
    }

    const updated = [...payments, newPay]
    setPayments(updated)
    localStorage.setItem(`velora_payments_${user.email}`, JSON.stringify(updated))
    setShowPaymentForm(false)
    setPaymentForm({ id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa' })
    toast.success('Secure billing method registered')
  }

  const deletePayment = (id) => {
    const updated = payments.filter(p => p.id !== id)
    setPayments(updated)
    localStorage.setItem(`velora_payments_${user.email}`, JSON.stringify(updated))
    toast.success('Billing card deactivated')
  }

  // Support Submission
  const submitTicket = (e) => {
    e.preventDefault()
    if (!ticketForm.subject || !ticketForm.message) {
      return toast.error('Please input subject and detailed message')
    }

    const newTkt = {
      id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
      subject: ticketForm.subject,
      category: ticketForm.category,
      message: ticketForm.message,
      date: 'Just now',
      status: 'Awaiting Review'
    }

    const updated = [newTkt, ...tickets]
    setTickets(updated)
    localStorage.setItem(`velora_tickets_${user.email}`, JSON.stringify(updated))
    setTicketForm({ subject: '', category: 'sizing', message: '' })
    toast.success('Dossier ticket created. Our luxury concierge will respond within 4 hours.')
  }

  // Clear all alerts
  const markAllAlertsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })))
    toast.success('Clear signals completed')
  }

  return (
    <div className="pt-8 pb-24 px-4 md:px-12 max-w-[1500px] mx-auto select-none bg-[#fafaf9]">
      
      {/* Visual Identity Title */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-8 gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-neutral-400 font-bold uppercase mb-2">CLIENT DOSSIER</p>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-900">
            WELCOME BACK, {user?.name?.toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-500 mt-2 font-mono tracking-wider">
            SECURE ACCOUNT STATUS: ACTIVE · MEMBER SINCE {new Date(user?.createdAt || Date.now()).getFullYear()}
          </p>
        </div>

        {/* Couture privileges display */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-100 px-5 py-3.5 flex flex-col justify-between min-w-[140px] shadow-sm">
            <span className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">REWARD POINTS</span>
            <span className="text-xl font-display font-semibold mt-1 flex items-center gap-1.5 text-neutral-950">
              <Award className="w-4 h-4 text-neutral-400" /> {user?.rewards || 100}
            </span>
          </div>
          <div className="bg-white border border-neutral-100 px-5 py-3.5 flex flex-col justify-between min-w-[140px] shadow-sm">
            <span className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">WALLET CREDIT</span>
            <span className="text-xl font-display font-semibold mt-1 text-neutral-950">
              {fmt(user?.wallet || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Luxury Apple-Zara inspired sidebar navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white border border-neutral-100 p-6 space-y-1 shadow-sm">
            {[
              { id: 'orders', label: 'ORDERS & ARCHIVES', icon: Package },
              { id: 'wishlist', label: 'CURATED WISHLIST', icon: Heart },
              { id: 'profile', label: 'IDENTITY PROFILE', icon: User },
              { id: 'addresses', label: 'ADDRESS BOOK', icon: MapPin },
              { id: 'payments', label: 'SAVED CARDS', icon: CreditCard },
              { id: 'notifications', label: 'SIGNALS & ALERTS', icon: Bell },
              { id: 'support', label: 'CONCIERGE DESK', icon: HelpCircle },
              { id: 'settings', label: 'PREFERENCES', icon: Sliders },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-[11px] tracking-[0.15em] font-medium transition-all duration-300 rounded-none text-left ${
                    active 
                      ? 'bg-neutral-950 text-white font-semibold' 
                      : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-400'}`} />
                    {tab.label}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${active ? 'text-white translate-x-1' : 'text-neutral-300'}`} />
                </button>
              )
            })}
            
            <div className="h-px bg-neutral-100 my-4" />
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.15em] font-medium text-neutral-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              TERMINATE SESSION
            </button>
          </div>
        </aside>

        {/* Tab contents panel */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-neutral-100 p-8 shadow-sm min-h-[520px]"
            >
              
              {/* ORDERS PANEL */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">PURCHASE ARCHIVES</h2>
                    <span className="text-[10px] text-neutral-400 font-mono">TOTAL ORDERS: {orders.length}</span>
                  </div>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-6 h-6 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-4">Syncing archives...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <Package className="w-12 h-12 text-neutral-200 mx-auto" />
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-900">Archives are empty</h3>
                        <p className="text-xs text-neutral-400 mt-1">You haven't requested any luxury apparel yet.</p>
                      </div>
                      <Button
                        onClick={() => setRoute({ view: 'shop' })}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest font-semibold px-6 h-10"
                      >
                        DISCOVER COLLECTIONS
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(o => (
                        <div key={o.id} className="border border-neutral-100 hover:border-neutral-200 p-6 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-4 mb-4 gap-2">
                            <div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">ORDER REFERENCE</span>
                              <p className="text-xs font-mono font-bold text-neutral-900">{o.id}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">REQUEST DATE</span>
                              <p className="text-xs font-sans text-neutral-700">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">TOTAL VALUE</span>
                              <p className="text-xs font-sans font-bold text-neutral-900">{fmt(o.total)}</p>
                            </div>
                            <Button 
                              onClick={() => setRoute({ view: 'track-order', orderId: o.id })}
                              variant="outline"
                              className="rounded-none border-neutral-200 text-[10px] tracking-widest uppercase hover:bg-neutral-950 hover:text-white h-9 px-4"
                            >
                              TRACK DELIVERY
                            </Button>
                          </div>

                          {/* Order items listing */}
                          <div className="space-y-3">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-xs">
                                <img src={item.image} alt={item.name} className="w-12 h-14 object-cover border border-neutral-100 rounded-none bg-neutral-50" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide mt-0.5">
                                    SIZE: {item.size} · COLOR: {item.color} · QUANTITY: {item.qty}
                                  </p>
                                </div>
                                <span className="font-semibold text-neutral-950 font-mono">{fmt(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CURATED WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">CURATED LOOKS</h2>
                    <span className="text-[10px] text-neutral-400 font-mono">LIKED ITEMS: {wishlist.length}</span>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <Heart className="w-12 h-12 text-neutral-200 mx-auto" />
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-900">Wishlist empty</h3>
                        <p className="text-xs text-neutral-400 mt-1">Curation represents your visual style boards.</p>
                      </div>
                      <Button
                        onClick={() => setRoute({ view: 'shop' })}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest font-semibold px-6 h-10"
                      >
                        BROWSE STYLES
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map(id => {
                        // Normally we would find the product in context
                        return (
                          <div key={id} className="border border-neutral-100 p-4 flex gap-4 relative group">
                            <button 
                              onClick={() => toggleWishlist(id)}
                              className="absolute top-3 right-3 text-neutral-300 hover:text-neutral-950 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="w-20 h-24 bg-neutral-50 border border-neutral-100 flex-shrink-0 relative">
                              {/* Soft placeholder while listing */}
                              <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400 uppercase font-mono font-bold">VELORA</div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <span className="text-[8px] tracking-widest font-bold text-neutral-400 uppercase">ITEM ID: {id}</span>
                                <h4 className="text-xs font-semibold text-neutral-900 uppercase mt-0.5 mt-1">Premium Couture Look</h4>
                                <p className="text-xs font-semibold text-neutral-900 font-mono mt-1">₹2,499 - ₹5,499</p>
                              </div>
                              <Button
                                onClick={() => setRoute({ view: 'shop' })}
                                className="w-full md:w-auto self-start mt-2 h-8 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] tracking-widest uppercase font-semibold px-4"
                              >
                                VIEW STYLING
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* IDENTITY PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">CLIENT INFRASTRUCTURE</h2>
                    <p className="text-xs text-neutral-400 mt-1">Update your general identity information or credentials safely.</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">FULL NAME</label>
                        <input 
                          type="text"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">EMAIL ADDRESS</label>
                        <input 
                          disabled
                          type="email"
                          value={profileForm.email}
                          className="w-full h-11 px-4 bg-neutral-100 text-neutral-400 text-xs tracking-wider border border-neutral-150 outline-none rounded-none uppercase font-sans font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">MOBILE NUMBER</label>
                        <input 
                          type="text"
                          placeholder="+91 XXXXX XXXXX"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">DATE OF BIRTH</label>
                        <input 
                          type="date"
                          value={profileForm.dob}
                          onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none font-sans font-medium text-neutral-850"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <div className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">CHANGE CLIENT SECURITY KEY (PASSWORD)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono font-bold">CURRENT PASSWORD</label>
                          <input 
                            type="password"
                            placeholder="CURRENT SECURITY PASSWORD"
                            value={profileForm.currentPassword}
                            onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                            className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono font-bold">NEW PASSWORD</label>
                          <input 
                            type="password"
                            placeholder="CHOOSE NEW SECURITY PASSWORD"
                            value={profileForm.newPassword}
                            onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] uppercase font-semibold h-11 px-6 mt-4"
                    >
                      SAVE PROFILE INFORMATION
                    </Button>
                  </form>
                </div>
              )}

              {/* ADDRESS BOOK */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">PORTFOLIO ADDRESSES</h2>
                    {!showAddressForm && (
                      <Button
                        onClick={() => {
                          setAddressForm({ id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
                          setShowAddressForm(true)
                        }}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold px-4 h-9 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD ADDRESS
                      </Button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {showAddressForm ? (
                      <motion.form
                        key="addr-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onSubmit={saveAddress}
                        className="space-y-4 max-w-xl border border-neutral-100 p-6"
                      >
                        <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">
                          {addressForm.id ? 'EDIT ADDRESS IDENTIFIER' : 'REGISTER NEW DESTINATION'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">RECIPIENT NAME</label>
                            <input
                              required
                              type="text"
                              value={addressForm.name}
                              onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">MOBILE NUMBER</label>
                            <input
                              required
                              type="text"
                              value={addressForm.phone}
                              onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">STREET ADDRESS (LINE 1)</label>
                          <input
                            required
                            type="text"
                            value={addressForm.line1}
                            onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">LOCALITY/APARTMENT (LINE 2)</label>
                          <input
                            type="text"
                            value={addressForm.line2}
                            onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CITY</label>
                            <input
                              required
                              type="text"
                              value={addressForm.city}
                              onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">STATE</label>
                            <input
                              required
                              type="text"
                              value={addressForm.state}
                              onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">PINCODE</label>
                            <input
                              required
                              type="text"
                              maxLength="6"
                              value={addressForm.pincode}
                              onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs select-none">
                          <input
                            type="checkbox"
                            id="default-address"
                            checked={addressForm.isDefault}
                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="accent-neutral-900"
                          />
                          <label htmlFor="default-address" className="text-neutral-500 cursor-pointer">Set as default dispatch address</label>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="submit"
                            className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[11px] tracking-widest uppercase font-semibold h-10 px-5 flex-1"
                          >
                            SAVE DESTINATION
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            variant="outline"
                            className="rounded-none border-neutral-200 text-[11px] tracking-widest uppercase h-10 px-5"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="addr-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {addresses.map(a => (
                          <div key={a.id} className={`border p-6 flex flex-col justify-between transition relative ${a.isDefault ? 'border-neutral-900 shadow-sm' : 'border-neutral-100'}`}>
                            {a.isDefault && (
                              <span className="absolute top-4 right-4 bg-neutral-950 text-white font-mono text-[8px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-none select-none">
                                DEFAULT
                              </span>
                            )}
                            
                            <div>
                              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">RECIPIENT PORT</p>
                              <p className="text-xs font-semibold uppercase text-neutral-950 mt-1 font-sans">{a.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{a.phone}</p>
                              <div className="mt-4 text-xs font-sans text-neutral-700 leading-relaxed uppercase">
                                <p>{a.line1}</p>
                                {a.line2 && <p>{a.line2}</p>}
                                <p>{a.city}, {a.state} - {a.pincode}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-50">
                              <button
                                onClick={() => {
                                  setAddressForm({ ...a })
                                  setShowAddressForm(true)
                                }}
                                className="text-[10px] tracking-wider uppercase font-semibold text-neutral-500 hover:text-neutral-950 flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" /> EDIT
                              </button>
                              <button
                                onClick={() => deleteAddress(a.id)}
                                className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400 hover:text-red-600 flex items-center gap-1 ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> REMOVE
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SAVED CARDS (PAYMENT METHODS) */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">BILLING CREDENTIALS</h2>
                    {!showPaymentForm && (
                      <Button
                        onClick={() => {
                          setPaymentForm({ id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa' })
                          setShowPaymentForm(true)
                        }}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold px-4 h-9 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD CARD
                      </Button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {showPaymentForm ? (
                      <motion.form
                        key="pay-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onSubmit={savePayment}
                        className="space-y-4 max-w-xl border border-neutral-100 p-6"
                      >
                        <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">
                          REGISTER SECURE CREDIT DEBIT INSTRUMENT
                        </h3>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CARDHOLDER NAME</label>
                          <input
                            required
                            type="text"
                            placeholder="CARDHOLDER FULL NAME"
                            value={paymentForm.holder}
                            onChange={e => setPaymentForm({ ...paymentForm, holder: e.target.value.toUpperCase() })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CARD NUMBER</label>
                            <input
                              required
                              type="text"
                              placeholder="•••• •••• •••• ••••"
                              value={paymentForm.number}
                              onChange={handleCardNumberChange}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">EXPIRATION (MM/YY)</label>
                            <input
                              required
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              value={paymentForm.exp}
                              onChange={handleExpChange}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">SECURITY CVV</label>
                            <input
                              required
                              type="password"
                              maxLength="4"
                              placeholder="•••"
                              value={paymentForm.cvv}
                              onChange={e => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="submit"
                            className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[11px] tracking-widest uppercase font-semibold h-10 px-5 flex-1"
                          >
                            REGISTER INSTRUMENT
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            variant="outline"
                            className="rounded-none border-neutral-200 text-[11px] tracking-widest uppercase h-10 px-5"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="pay-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {payments.map(p => (
                          <div 
                            key={p.id} 
                            className="h-44 p-6 flex flex-col justify-between border border-neutral-100 select-none relative overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)'
                            }}
                          >
                            {/* Subtle glossy card overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none" />
                            
                            <div className="flex justify-between items-start z-10">
                              <div className="text-[10px] tracking-widest font-mono text-neutral-400 uppercase font-bold">VELORA STYLIST CARD</div>
                              <span className="text-white font-mono font-bold tracking-wider text-xs uppercase">{p.brand}</span>
                            </div>

                            <div className="z-10 mt-2">
                              <span className="text-[8px] font-mono text-neutral-400 tracking-widest uppercase">SECURE CODE NUMBER</span>
                              <p className="text-sm font-mono tracking-widest text-white mt-1">{p.number}</p>
                            </div>

                            <div className="flex justify-between items-end z-10 border-t border-white/5 pt-3">
                              <div>
                                <span className="text-[7px] font-mono text-neutral-500 tracking-widest uppercase">CARDHOLDER</span>
                                <p className="text-[10px] font-sans font-medium tracking-wide text-neutral-200 uppercase truncate max-w-[120px]">{p.holder}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[7px] font-mono text-neutral-500 tracking-widest uppercase">VALID THRU</span>
                                <p className="text-[10px] font-mono text-neutral-200 mt-0.5">{p.exp}</p>
                              </div>
                              <button
                                onClick={() => deletePayment(p.id)}
                                className="text-neutral-500 hover:text-red-400 transition ml-4"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SIGNALS & ALERTS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">SECURITY SIGNALS FEED</h2>
                    <button 
                      onClick={markAllAlertsRead}
                      className="text-[10px] font-mono font-semibold text-neutral-400 hover:text-neutral-950 uppercase tracking-widest"
                    >
                      CLEAR SIGNALS
                    </button>
                  </div>

                  <div className="space-y-3">
                    {alerts.map(a => (
                      <div key={a.id} className={`p-5 border flex items-start gap-4 transition-all duration-300 ${a.read ? 'border-neutral-50 bg-neutral-50/20' : 'border-neutral-150 bg-white shadow-sm'}`}>
                        <div className="mt-0.5 relative">
                          <Shield className={`w-5 h-5 ${a.read ? 'text-neutral-350' : 'text-neutral-950'}`} />
                          {!a.read && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs uppercase tracking-wide font-semibold ${a.read ? 'text-neutral-500' : 'text-neutral-905'}`}>{a.title}</h4>
                            <span className="text-[9px] font-mono text-neutral-400 uppercase shrink-0">{a.date}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed uppercase">{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-neutral-100 my-6" />

                  <div className="space-y-4">
                    <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">COUTURE SIGNAL PREFERENCES</h3>
                    <div className="space-y-3 max-w-xl">
                      {[
                        { key: 'orderUpdates', title: 'DISPATCH PROGRESS UPDATES', desc: 'Alert me instantly via email when my order is processed or shipped.' },
                        { key: 'newDrops', title: 'SECRET COLLECTION DROPS', desc: 'Grant me early access notifications regarding high-tier drops and limited stock alerts.' },
                        { key: 'whatsappAlerts', title: 'WHATSAPP CONCIERGE INTEGRATION', desc: 'Dispatch tracking links directly to my mobile number for zero-touch updates.' }
                      ].map(notif => (
                        <label key={notif.key} className="flex items-start justify-between gap-4 p-4 hover:bg-neutral-50/30 border border-neutral-100 cursor-pointer select-none">
                          <div className="flex-1">
                            <span className="text-[10px] tracking-widest font-semibold text-neutral-900 font-sans block">{notif.title}</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-normal block">{notif.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifPrefs[notif.key]}
                            onChange={e => {
                              const updated = { ...notifPrefs, [notif.key]: e.target.checked }
                              setNotifPrefs(updated)
                              toast.success('Signal preferences updated')
                            }}
                            className="accent-neutral-900 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONCIERGE DESK (SUPPORT) */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">COUTURE CONCIERGE DESK</h2>
                    <p className="text-xs text-neutral-400 mt-1">Submit inquiries or request styling advice from our Bengaluru design atelier.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Support form */}
                    <form onSubmit={submitTicket} className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">SUBMIT DIRECT TICKETER INQUIRY</h3>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">INQUIRY CATEGORY</label>
                        <select
                          value={ticketForm.category}
                          onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="sizing">SIZING & LOOK ADVICE</option>
                          <option value="delivery">DELIVERY TIMELINE DELAY</option>
                          <option value="refund">REFUND OR TRANSIT ERROR</option>
                          <option value="stylist">EXECUTIVE STYLIST BOOKING</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">SUBJECT LINE</label>
                        <input
                          required
                          type="text"
                          placeholder="SUMMARY OF YOUR DOSSIER ENQUIRY"
                          value={ticketForm.subject}
                          onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value.toUpperCase() })}
                          className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">DETAILED MESSAGE</label>
                        <Textarea
                          required
                          rows="4"
                          placeholder="PLEASE DESCRIBE YOUR REQUIREMENT OR TRANSACTION..."
                          value={ticketForm.message}
                          onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                          className="w-full p-3 bg-neutral-50 focus:bg-white text-xs border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold transition-all"
                      >
                        SUBMIT TICKETER DOSSIER
                      </Button>
                    </form>

                    {/* Active tickers listing */}
                    <div className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">ACTIVE TICKETS ARCHIVE</h3>
                      {tickets.length === 0 ? (
                        <div className="border border-neutral-50 p-6 text-center text-xs text-neutral-400 uppercase">
                          No active tickets detected on this port.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tickets.map(t => (
                            <div key={t.id} className="border border-neutral-100 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-bold text-neutral-900">{t.id}</span>
                                <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${
                                  t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-semibold text-neutral-950 uppercase">{t.subject}</h4>
                              <p className="text-[10px] text-neutral-400 leading-normal uppercase">{t.message}</p>
                              <div className="text-[8px] font-mono text-neutral-400 text-right uppercase border-t border-neutral-50 pt-1.5">{t.date}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border border-neutral-100 p-4 space-y-2 text-xs uppercase font-sans">
                        <h4 className="font-semibold text-neutral-950">URGENT CONTACT CHANNELS</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          For immediate response regarding live payment issues, you may utilize our secure hotline directly.
                        </p>
                        <div className="pt-2 space-y-1">
                          <p className="flex items-center gap-2 font-medium text-neutral-800"><Phone className="w-3.5 h-3.5 text-neutral-400" /> +91 80 4000 5000</p>
                          <p className="flex items-center gap-2 font-medium text-neutral-800"><Mail className="w-3.5 h-3.5 text-neutral-400" /> hello@velora.in</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENCES (SETTINGS) */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">COUTURE PREFERENCES</h2>
                    <p className="text-xs text-neutral-400 mt-1">Configure structural shopping options, region localization, or stylistic preferences.</p>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">LOCALIZATION REGION</label>
                        <select
                          value={settingsPrefs.region}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, region: e.target.value })
                            toast.success('Region configuration synchronized')
                          }}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="India">INDIA (DOMESTIC ATELIER)</option>
                          <option value="UAE">MIDDLE EAST (UAE)</option>
                          <option value="US">UNITED STATES (US)</option>
                          <option value="UK">UNITED KINGDOM (UK)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">VALUATION CURRENCY</label>
                        <select
                          value={settingsPrefs.currency}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, currency: e.target.value })
                            toast.success('Valuation system updated')
                          }}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="INR">INR (₹ INDIAN RUPEE)</option>
                          <option value="USD">USD ($ UNITED STATES DOLLAR)</option>
                          <option value="AED">AED (د.إ UAE DIRHAM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <div className="space-y-3">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">AI STYLING PREFERENCES</h3>
                      <label className="flex items-start justify-between gap-4 p-4 hover:bg-neutral-50/30 border border-neutral-100 cursor-pointer select-none">
                        <div className="flex-1">
                          <span className="text-[10px] tracking-widest font-semibold text-neutral-900 font-sans block">ENABLE CONCIERGE STYLING</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5 leading-normal block">Allow the AI Concierge assistant to access my viewed history to suggest tailored fits.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsPrefs.stylingAdvice}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, stylingAdvice: e.target.checked })
                            toast.success('Concierge styling updated')
                          }}
                          className="accent-neutral-900 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
