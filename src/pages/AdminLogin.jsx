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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-800">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">✨</Link>
          <h1 className="text-3xl font-bold text-white mt-4">Login de Admin</h1>
          <p className="text-gray-400 mt-2">Ingresa la contraseña para acceder al panel</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="input-field"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-300">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
