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
      const customer = await customerApi.register(formData.phone, formData.name)
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">✨</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Regístrate para reservar tus citas</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Tu Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                className="input-field"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Número de Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="input-field"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Usa este número para iniciar sesión en el futuro
              </p>
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
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-pink-500 hover:underline font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
