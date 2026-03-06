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
        setError('Contraseña inválida')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-3xl sm:text-4xl">✨</Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3 sm:mt-4 px-2">Login de Admin</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base px-4">Ingresa la contraseña para acceder al panel</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-pink-100 mx-2 sm:mx-0">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full px-3 sm:px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base"
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-300 text-sm sm:text-base">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
