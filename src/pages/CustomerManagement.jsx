import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { customerApi } from '../api'

export default function CustomerManagement({ admin, onLogout }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchPhone, setSearchPhone] = useState('')
  const [resettingPin, setResettingPin] = useState(null)
  const [showAllPins, setShowAllPins] = useState(false)
  const [editingName, setEditingName] = useState(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const data = await customerApi.getAll()
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPIN = async (phone) => {
    setResettingPin(phone)
    try {
      const updated = await customerApi.resetPIN(phone)
      setCustomers(customers.map(c => c.phone === phone ? { ...c, pin: updated.pin } : c))
      alert(`PIN reseteado para ${phone}. Nuevo PIN: ${updated.pin}`)
    } catch (err) {
      console.error('Error resetting PIN:', err)
    } finally {
      setResettingPin(null)
    }
  }

  const handleEditName = async (phone) => {
    if (!newName.trim()) return
    try {
      const updated = await customerApi.updateName(phone, newName)
      setCustomers(customers.map(c => c.phone === phone ? { ...c, name: updated.name } : c))
      setEditingName(null)
      setNewName('')
    } catch (err) {
      console.error('Error updating name:', err)
    }
  }

  const sendWhatsAppMessage = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(waLink, '_blank')
  }

  const generateLoginLink = (phone) => {
    const siteUrl = window.location.origin
    const customer = customers.find(c => c.phone === phone)
    const pinParam = customer ? `&p=${customer.pin}` : ''
    return `${siteUrl}/login?loginref=${encodeURIComponent(phone)}${pinParam}`
  }

  const filteredCustomers = searchPhone
    ? customers.filter(c => c.phone.includes(searchPhone) || c.name.toLowerCase().includes(searchPhone.toLowerCase()))
    : customers

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Beautiful Header */}
      <header className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💅✨</span>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
                <p className="text-pink-100 text-sm">Fresia Aesthetic</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                📅 Citas
              </Link>
              <button
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Decorative flowers */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-10 text-pink-200 text-6xl opacity-50">🌸</div>
        <div className="absolute top-20 right-20 text-rose-200 text-5xl opacity-50">🌺</div>
        <div className="absolute top-40 left-1/4 text-fuchsia-200 text-4xl opacity-50">🌷</div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Search Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">🔍</span>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Buscar por teléfono o nombre..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowAllPins(!showAllPins)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${showAllPins
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-300'
                : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
            >
              {showAllPins ? '🙈 Ocultar PINs' : '👁️ Mostrar PINs'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl font-bold">{customers.length}</div>
            <div className="text-pink-100">Total Clientes</div>
          </div>
          <div className="bg-gradient-to-br from-rose-400 to-fuchsia-400 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl font-bold">
              {customers.filter(c => {
                const lastWeek = new Date()
                lastWeek.setDate(lastWeek.getDate() - 7)
                return new Date(c.createdAt) > lastWeek
              }).length}
            </div>
            <div className="text-rose-100">Nuevos Esta Semana</div>
          </div>
          <div className="bg-gradient-to-br from-fuchsia-400 to-pink-400 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl font-bold">✨</div>
            <div className="text-fuchsia-100">Clientes Felices</div>
          </div>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="text-pink-500 mt-4">Cargando clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-pink-100">
            <span className="text-6xl">💅</span>
            <p className="text-gray-500 mt-4">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-pink-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                    <th className="px-6 py-4 text-left font-semibold">Teléfono</th>
                    <th className="px-6 py-4 text-left font-semibold">PIN</th>
                    <th className="px-6 py-4 text-left font-semibold">Creado</th>
                    <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer._id || customer.phone}
                      className={`hover:bg-pink-50/50 transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-pink-25'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-white font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          {editingName === customer.phone ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nuevo nombre"
                                className="px-2 py-1 rounded border border-pink-300 text-sm w-32"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditName(customer.phone)}
                                className="text-green-500 hover:text-green-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => { setEditingName(null); setNewName('') }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{customer.name}</span>
                              <button
                                onClick={() => { setEditingName(customer.phone); setNewName(customer.name) }}
                                className="text-pink-400 hover:text-pink-600 text-sm"
                                title="Editar nombre"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{customer.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-lg font-bold ${showAllPins ? 'text-pink-600' : 'text-gray-300'
                            }`}>
                            {showAllPins ? customer.pin : '••••'}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(customer.pin)
                              alert('PIN copiado!')
                            }}
                            className="text-pink-400 hover:text-pink-600 transition-colors"
                            title="Copiar PIN"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(customer.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleResetPIN(customer.phone)}
                            disabled={resettingPin === customer.phone}
                            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            title="Resetear PIN"
                          >
                            {resettingPin === customer.phone ? '⏳' : '🔄'} Reset
                          </button>
                          <button
                            onClick={() => {
                              const link = generateLoginLink(customer.phone)
                              sendWhatsAppMessage(
                                customer.phone,
                                `Hola ${customer.name}, aquí está tu enlace para iniciar sesión: ${link}`
                              )
                            }}
                            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            title="Enviar enlace"
                          >
                            📱 WhatsApp
                          </button>
                          <button
                            onClick={() => {
                              const link = generateLoginLink(customer.phone)
                              navigator.clipboard.writeText(link)
                              alert('Enlace copiado al portapapeles!')
                            }}
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                            title="Copiar enlace"
                          >
                            🔗 Copiar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Decorative bottom flowers */}
      <div className="relative mt-8">
        <div className="absolute bottom-0 left-20 text-pink-200 text-5xl opacity-50">🌸</div>
        <div className="absolute bottom-10 right-10 text-rose-200 text-6xl opacity-50">🌺</div>
      </div>
    </div>
  )
}
