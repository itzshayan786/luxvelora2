'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles, Key, Check } from 'lucide-react'

// Mock verification code for Forgot Password
const GENERATED_OTP = '882046'

export default function PremiumAuth({ useShop }) {
  const { setUser, setRoute, cart, addToCart } = useShop()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password phases: 'email' | 'otp' | 'reset'
  const [forgotPhase, setForgotPhase] = useState('email')
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Form states
  const [f, setF] = useState({ email: '', password: '', name: '', terms: false })

  // Cart preservation / merge helper
  const preserveAndMergeCart = async (loggedInUser) => {
    try {
      // 1. Get user's existing DB cart if any (or we assume it might be saved under user.cart)
      const userEmail = loggedInUser.email
      const res = await fetch(`/api/user-cart?email=${userEmail}`).then(r => r.json()).catch(() => ({}))
      const dbCart = res.cart || []

      // 2. Merge local guest cart with DB cart
      const localCart = [...cart]
      const merged = [...localCart]
      
      for (const dbItem of dbCart) {
        const exists = merged.find(lItem => lItem.key === dbItem.key)
        if (exists) {
          // If exists in both, keep the larger quantity
          exists.qty = Math.max(exists.qty, dbItem.qty)
        } else {
          merged.push(dbItem)
        }
      }

      // 3. Save merged cart back to DB
      await fetch('/api/user-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, cart: merged })
      }).catch(err => console.error("Error saving merged cart:", err))

      // Update local storage and context if possible (parent handles updating context state)
      localStorage.setItem('velora_cart', JSON.stringify(merged))
      
      // Let's reload cart items if necessary via direct state updates or just page refresh
      // Since context is active, the parent state will watch changes or we can trigger them.
      return merged
    } catch (e) {
      console.warn("Cart merging exception:", e)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!f.email || !f.password) {
      return toast.error('Email and password are required')
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? 'login' : 'register'
      const payload = mode === 'login' 
        ? { email: f.email, password: f.password }
        : { email: f.email, password: f.password, name: f.name }

      if (mode === 'register' && !f.terms) {
        setLoading(false)
        return toast.error('Please agree to the Terms of Service & Privacy Policy')
      }

      const r = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(x => x.json())

      if (r.error) {
        toast.error(r.error)
        setLoading(false)
        return
      }

      // Preserve and merge cart
      await preserveAndMergeCart(r.user)

      localStorage.setItem('velora_user', JSON.stringify(r.user))
      setUser(r.user)
      toast.success(`Welcome ${mode === 'login' ? 'back' : 'to Velora'}, ${r.user.name}`)
      setRoute({ view: 'account' })
    } catch (err) {
      toast.error('An unexpected authentication error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password flow phases
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault()
    if (!f.email) return toast.error('Please enter your email address')
    setLoading(true)
    
    // Simulate sending email API
    setTimeout(() => {
      setLoading(false)
      setForgotPhase('otp')
      toast.success(`Security code sent to ${f.email}. For testing, use code: ${GENERATED_OTP}`)
    }, 1200)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    const enteredCode = otpVal.join('')
    if (enteredCode.length < 6) return toast.error('Please enter the full 6-digit verification code')
    
    if (enteredCode === GENERATED_OTP) {
      toast.success('Identity verified successfully')
      setForgotPhase('reset')
    } else {
      toast.error('Invalid security code. Please check your email or try again.')
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) return toast.error('Please fill out all password fields')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      // Fetch reset password route
      const r = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email, password: newPassword })
      }).then(x => x.json())

      if (r.error) {
        toast.error(r.error)
        return
      }

      toast.success('Your security password has been updated')
      setMode('login')
      setForgotPhase('email')
      setF({ ...f, password: '' })
    } catch (err) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otpVal]
    newOtp[index] = value.slice(-1)
    setOtpVal(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpVal[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 md:px-8 py-16 bg-[#fafaf9]">
      <div className="w-full max-w-md bg-white border border-black/5 rounded-none p-8 md:p-10 shadow-sm relative">
        
        {/* Zara/Louis Vuitton inspired aesthetic: Minimalistic top crown */}
        <div className="flex flex-col items-center mb-8 text-center select-none">
          <div className="text-[10px] tracking-[0.4em] text-neutral-400 font-bold uppercase mb-2">ATELIER VELORA</div>
          <h2 className="text-2xl font-display font-medium tracking-wide uppercase text-neutral-950">
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register' : 'Security Reset'}
          </h2>
          <div className="w-6 h-px bg-neutral-300 mt-3" />
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={submit}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={f.email}
                    onChange={e => setF({ ...f, email: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                  />
                </div>

                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="PASSWORD"
                    value={f.password}
                    onChange={e => setF({ ...f, password: e.target.value })}
                    className="w-full h-12 pl-10 pr-12 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] tracking-wide font-sans mt-2">
                <label className="flex items-center gap-2 text-neutral-500 cursor-pointer select-none">
                  <input type="checkbox" className="accent-neutral-900 rounded-none w-3.5 h-3.5" />
                  <span>REMEMBER ME</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-neutral-400 hover:text-neutral-950 transition underline-offset-4 hover:underline"
                >
                  FORGOT PASSWORD?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] font-medium transition-all"
              >
                {loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
              </Button>

              <div className="text-center text-xs tracking-wider text-neutral-400 mt-6">
                NEW TO VELORA?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-neutral-950 hover:underline underline-offset-4 font-semibold ml-1"
                >
                  CREATE AN ACCOUNT
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={submit}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="FULL NAME"
                    value={f.name}
                    onChange={e => setF({ ...f, name: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                  />
                </div>

                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={f.email}
                    onChange={e => setF({ ...f, email: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                  />
                </div>

                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="CHOOSE PASSWORD"
                    value={f.password}
                    onChange={e => setF({ ...f, password: e.target.value })}
                    className="w-full h-12 pl-10 pr-12 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[11px] tracking-wide font-sans text-neutral-500 mt-3 select-none">
                <input
                  required
                  id="terms-checkbox"
                  type="checkbox"
                  checked={f.terms}
                  onChange={e => setF({ ...f, terms: e.target.checked })}
                  className="accent-neutral-900 rounded-none w-3.5 h-3.5 mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms-checkbox" className="leading-snug cursor-pointer flex-1">
                  I AGREE TO THE VELORA COUTURE <span className="text-neutral-900 font-medium underline underline-offset-4">TERMS OF SERVICE</span> & <span className="text-neutral-900 font-medium underline underline-offset-4">PRIVACY CHARTER</span>. I UNDERSTAND I WILL INITIALLY EARN 100 STARTING COUTURE REWARD POINTS.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] font-medium transition-all"
              >
                {loading ? 'CREATING PROFILE...' : 'REGISTER ACCOUNT'}
              </Button>

              <div className="text-center text-xs tracking-wider text-neutral-400 mt-6">
                ALREADY HAVE AN ACCOUNT?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-neutral-950 hover:underline underline-offset-4 font-semibold ml-1"
                >
                  SIGN IN HERE
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {forgotPhase === 'email' && (
                <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                  <p className="text-xs text-neutral-500 text-center leading-relaxed tracking-wide">
                    Enter your email address below. We'll send a premium security verification OTP to reset your security credentials.
                  </p>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      required
                      type="email"
                      placeholder="ENTER EMAIL ADDRESS"
                      value={f.email}
                      onChange={e => setF({ ...f, email: e.target.value })}
                      className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] font-medium transition-all"
                  >
                    {loading ? 'SENDING OTP...' : 'SEND SECURITY OTP'}
                  </Button>
                </form>
              )}

              {forgotPhase === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <p className="text-xs text-neutral-500 text-center leading-relaxed tracking-wide">
                    A secure 6-digit verification code has been dispatched to <b className="text-neutral-950">{f.email}</b>. Please input it below.
                  </p>

                  <div className="flex justify-center gap-2 md:gap-3 my-4">
                    {otpVal.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-xl font-display font-semibold bg-neutral-50 border border-neutral-200 focus:border-neutral-950 focus:bg-white outline-none rounded-none transition"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] font-medium transition-all"
                  >
                    VERIFY OTP
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`OTP re-dispatched. For testing, use: ${GENERATED_OTP}`)
                      }}
                      className="text-neutral-400 hover:text-neutral-950 text-xs font-semibold tracking-wider uppercase underline underline-offset-4"
                    >
                      RESEND OTP CODE
                    </button>
                  </div>
                </form>
              )}

              {forgotPhase === 'reset' && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="text-xs text-neutral-500 text-center leading-relaxed tracking-wide mb-2">
                    Security verified. Please choose a strong new password for your Velora account.
                  </p>

                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      required
                      type="password"
                      placeholder="NEW PASSWORD"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                    />
                  </div>

                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      required
                      type="password"
                      placeholder="CONFIRM NEW PASSWORD"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border-b border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans uppercase rounded-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] font-medium transition-all"
                  >
                    {loading ? 'UPDATING CREDENTIALS...' : 'CONFIRM RESET'}
                  </Button>
                </form>
              )}

              <div className="text-center text-xs tracking-wider text-neutral-400 mt-6 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setForgotPhase('email')
                  }}
                  className="text-neutral-950 hover:underline underline-offset-4 font-semibold"
                >
                  BACK TO SIGN IN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
