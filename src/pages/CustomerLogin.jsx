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

  // Pre-fill phone from URL and try auto-login
  useEffect(() => {
    const refPhone = searchParams.get('loginref') || searchParams.get('ref')
    if (refPhone) {
      setPhone(refPhone)
      // Try auto-login without PIN
      handleAutoLogin(refPhone)
    }
  }, [searchParams])

  const handleAutoLogin = async (phoneNumber) => {
    setLoading(true)
    try {
      const customer = await customerApi.autoLogin(phoneNumber)
      onLogin(customer)
      navigate('/dashboard')
    } catch (err) {
      console.error('Auto-login failed:', err)
      // Keep phone filled, user will need to enter PIN
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center px-4 py-6 sm:py-12">
      {/* Decorative flowers - hidden on small mobile */}
      <div className="fixed top-10 left-4 text-pink-200 text-5xl sm:text-6xl md:text-7xl opacity-30 sm:opacity-50 pointer-events-none">🌸</div>
      <div className="fixed top-20 right-4 text-rose-200 text-4xl sm:text-5xl md:text-6xl opacity-30 sm:opacity-50 pointer-events-none">🌺</div>
      <div className="hidden sm:block fixed bottom-20 left-1/4 text-fuchsia-200 text-5xl opacity-50 pointer-events-none">🌷</div>
      <div className="fixed bottom-10 right-4 text-pink-200 text-4xl sm:text-5xl md:text-6xl opacity-30 sm:opacity-50 pointer-events-none">💐</div>

      <div className="max-w-md w-full relative">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-3 sm:mb-4">
            <span className="text-5xl sm:text-6xl">💅✨</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent px-2">
            Cafe Encanta Nails
          </h1>
          <p className="text-gray-600 mt-2 sm:mt-3 text-base sm:text-lg px-4">Ingresa tu número y PIN para continuar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-pink-100 mx-2 sm:mx-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-pink-500 text-sm sm:text-base">Iniciando sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  📱 Número de Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +1234567890"
                  className="w-full px-3 sm:px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base"
                  required
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  🔐 PIN (4 dígitos)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full px-3 sm:px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-center font-mono text-xl sm:text-2xl tracking-widest"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 min-h-[48px]"
              >
                💅 Iniciar Sesión
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 mt-5 sm:mt-6 text-xs sm:text-sm px-2">
            ¿Primera vez? <span className="text-pink-500">Tu PIN fue enviado por el salón</span>
          </p>
        </div>

        {/* Decorative */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-pink-300 text-xs sm:text-sm">✨ Salon de Uñas ✨</p>
        </div>
      </div>
    </div>
  )
}
