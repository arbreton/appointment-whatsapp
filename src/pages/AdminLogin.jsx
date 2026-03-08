import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/.netlify/functions/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await response.json()

      if (data.success) {
        onLogin({ role: 'admin', name: 'Admin', token: data.token })
        navigate('/admin/dashboard')
      } else {
        setError('Acceso denegado: Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fresia-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fresia-gold/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fresia-rose/5 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-4xl">⚜️</span>
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-fresia-cream uppercase">ADMINISTRATION</span>
          </div>
          <p className="text-fresia-gold text-[10px] uppercase font-bold tracking-[0.4em]">Fresia Aesthetic & Wellness</p>
        </div>

        <div className="glass-morphism rounded-[40px] p-10 border-white/5 shadow-2xl bg-white/[0.03]">
          <h1 className="text-fresia-cream font-serif text-3xl mb-8 text-center italic">Panel de Gestión</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-fresia-cream/40 font-bold uppercase tracking-widest text-[10px]">Autenticando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-fresia-cream/30 ml-1">Contraseña de Maestro</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-fresia-cream outline-none focus:border-fresia-gold/50 focus:ring-4 focus:ring-fresia-gold/5 transition-all text-center tracking-[0.5em] font-mono"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-[10px] uppercase tracking-widest font-bold text-center border border-red-500/20 italic">
                  ✦ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-fresia-gold hover:bg-fresia-cream hover:text-fresia-dark text-fresia-dark py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-500"
              >
                Acceder al Sistema
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-fresia-cream/30 hover:text-fresia-gold text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
            ← Volver al Portal Público
          </Link>
        </div>
      </div>
    </div>
  )
}
