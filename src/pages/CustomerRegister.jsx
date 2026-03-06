import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { customerApi } from '../api'

export default function CustomerRegister({ onLogin }) {
  const [formData, setFormData] = useState({
    phone: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Pre-fill phone from URL (admin link)
  useEffect(() => {
    const refPhone = searchParams.get('ref')
    if (refPhone) {
      setFormData(prev => ({ ...prev, phone: refPhone }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const customer = await customerApi.create(formData.phone, formData.name)
      // Save to localStorage immediately
      localStorage.setItem('customer', JSON.stringify(customer))
      onLogin(customer)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registro fallido. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-3xl sm:text-4xl">✨</Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-3 sm:mt-4 px-2">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base px-4">Regístrate para reservar tus citas</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-pink-100 mx-2 sm:mx-0">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Tu Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                className="w-full px-3 sm:px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base"
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Número de Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="w-full px-3 sm:px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base"
                required
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1 px-1">
                Usa este número para iniciar sesión en el futuro
              </p>
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
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-pink-500 hover:underline font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
