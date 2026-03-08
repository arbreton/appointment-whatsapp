import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { customerApi } from '../api'

export default function CustomerLogin({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const refPhone = searchParams.get('loginref') || searchParams.get('ref')
    const refPin = searchParams.get('p')
    if (refPhone && refPin) {
      setPhone(refPhone)
      handleAutoLogin(refPhone, refPin)
    } else if (refPhone) {
      setPhone(refPhone)
    }
  }, [searchParams])

  const handleAutoLogin = async (phoneNumber, pinValue) => {
    setLoading(true)
    try {
      const customer = await customerApi.autoLogin(phoneNumber, pinValue)
      onLogin(customer)
      navigate('/dashboard')
    } catch (err) {
      console.error('Auto-login failed:', err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const customer = await customerApi.login(phone, pin)
      onLogin(customer)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tu número y PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fresia-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/hero.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-fresia-dark via-fresia-dark/80 to-transparent"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <span className="text-4xl">🌸</span>
            <span className="font-serif text-3xl font-bold tracking-tight text-fresia-cream uppercase">FRESIA</span>
          </Link>
          <div className="w-12 h-0.5 bg-fresia-gold mx-auto mb-6"></div>
          <h1 className="text-fresia-cream font-serif text-4xl mb-4">Bienvenido</h1>
          <p className="text-fresia-cream/50 font-light tracking-wide uppercase text-[10px]">Tu santuario de belleza personal</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[40px] p-10 border-white/10 shadow-2xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-fresia-dark/60 font-medium uppercase tracking-[0.2em] text-xs">Verificando Credenciales</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-fresia-dark/40 ml-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+5216181234567"
                  className="input-premium bg-white shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-fresia-dark/40 ml-1">PIN Secreto</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  className="input-premium bg-white shadow-sm text-center font-mono text-3xl tracking-[1em]"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs italic border border-red-100 animate-fade-in">
                  ✦ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-sm uppercase tracking-[0.3em]"
              >
                Acceder al Dashboard
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-fresia-gold/10 text-center">
            <p className="text-[10px] text-fresia-dark/40 uppercase tracking-widest leading-relaxed">
              ¿No tienes un PIN? <br />
              <span className="text-fresia-rose font-bold">Contacta al salón vía WhatsApp</span>
            </p>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] uppercase tracking-[0.5em] font-bold text-fresia-cream/20">
          Fresia Aesthetic & Wellness © 2024
        </p>
      </div>
    </div>
  )
}
