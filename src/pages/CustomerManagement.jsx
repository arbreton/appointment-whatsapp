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
  const [editingPhone, setEditingPhone] = useState(null)
  const [newPhoneVal, setNewPhoneVal] = useState('')

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
      alert(err.message)
    }
  }

  const handleEditPhone = async (oldPhone) => {
    if (!newPhoneVal.trim() || newPhoneVal === oldPhone) {
      setEditingPhone(null)
      return
    }
    try {
      const updated = await customerApi.updatePhone(oldPhone, newPhoneVal)
      setCustomers(customers.map(c => c.phone === oldPhone ? { ...c, phone: updated.phone } : c))
      setEditingPhone(null)
      setNewPhoneVal('')
    } catch (err) {
      console.error('Error updating phone:', err)
      alert(err.message)
    }
  }

  const handleDeleteCustomer = async (phone, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      await customerApi.delete(phone)
      setCustomers(customers.filter(c => c.phone !== phone))
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert(err.message)
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
    <div className="min-h-screen bg-fresia-cream flex flex-col md:flex-row">
      {/* Premium Sidebar (Consistent with AdminDashboard) */}
      <aside className="w-full md:w-64 bg-fresia-dark text-fresia-cream flex-shrink-0 sticky top-0 md:h-screen z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-2xl">⚜️</span>
            <span className="font-serif text-xl font-bold tracking-[0.2em] uppercase">FRESIA</span>
          </div>

          <nav className="space-y-4">
            <Link
              to="/admin/dashboard"
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest opacity-50 hover:opacity-100 hover:bg-white/5 transition-all text-white"
            >
              <span>📋</span> GESTIÓN
            </Link>
            <Link
              to="/admin/dashboard"
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest opacity-50 hover:opacity-100 hover:bg-white/5 transition-all text-white"
            >
              <span>📅</span> CALENDARIO
            </Link>
            <button
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest bg-fresia-gold text-fresia-dark shadow-xl"
            >
              <span>👥</span> CLIENTES
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button onClick={onLogout} className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
            <span>✕</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 animate-fade-in overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <span className="text-fresia-rose font-serif italic text-xl mb-1 block">Base de Datos</span>
            <h1 className="text-4xl md:text-5xl font-serif text-fresia-dark font-bold">Gestión de Clientes</h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowAllPins(!showAllPins)}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-fresia-dark text-white shadow-xl hover:bg-fresia-rose transition-all"
            >
              {showAllPins ? 'Ocultar PINs' : 'Mostrar PINs'}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card rounded-[40px] p-8 border-white/50 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fresia-gold/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-4xl font-serif text-fresia-dark font-bold mb-1">{customers.length}</div>
            <div className="text-[10px] uppercase tracking-widest font-black text-fresia-dark/30">Total Registrados</div>
          </div>
          <div className="glass-card rounded-[40px] p-8 border-white/50 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fresia-rose/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-4xl font-serif text-fresia-dark font-bold mb-1">
              {customers.filter(c => {
                const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
                return new Date(c.createdAt) > lastWeek;
              }).length}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-black text-fresia-dark/30">Nuevos (7 días)</div>
          </div>
          <div className="bg-fresia-dark rounded-[40px] p-8 text-fresia-cream shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">⚜️</div>
            <div className="text-4xl font-serif font-bold mb-1">VIP</div>
            <div className="text-[10px] uppercase tracking-widest font-black opacity-30">Nivel de Fidelidad</div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card rounded-[40px] p-4 mb-12 border-white/50 shadow-xl">
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 text-xl">🔍</span>
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-16 pr-8 py-6 rounded-[30px] bg-white border-none outline-none text-fresia-dark font-medium placeholder:text-fresia-dark/20 text-lg shadow-inner"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center"><div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : (
          <div className="glass-card rounded-[40px] border-white/50 shadow-2xl overflow-hidden pb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-fresia-dark text-fresia-cream/40 px-8">
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Identidad</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Contacto</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Seguridad</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Registro</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fresia-gold/5">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.phone} className="hover:bg-fresia-rose-light/20 transition-colors">
                      <td className="px-8 py-8">
                        {editingName === customer.phone ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="bg-white px-4 py-2 rounded-xl border border-fresia-gold/20 outline-none text-sm"
                              autoFocus
                            />
                            <button onClick={() => handleEditName(customer.phone)} className="text-green-500">✓</button>
                            <button onClick={() => setEditingName(null)} className="text-red-400">✕</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-fresia-dark flex items-center justify-center text-fresia-gold font-serif text-xl">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-serif text-lg text-fresia-dark">{customer.name}</div>
                              <button onClick={() => { setEditingName(customer.phone); setNewName(customer.name) }} className="text-[8px] uppercase tracking-widest font-black text-fresia-rose opacity-40 hover:opacity-100">Editar Nombre</button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        {editingPhone === customer.phone ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newPhoneVal}
                              onChange={(e) => setNewPhoneVal(e.target.value)}
                              className="bg-white px-4 py-2 rounded-xl border border-fresia-gold/20 outline-none text-sm w-32"
                              autoFocus
                            />
                            <button onClick={() => handleEditPhone(customer.phone)} className="text-green-500">✓</button>
                            <button onClick={() => setEditingPhone(null)} className="text-red-400">✕</button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-bold text-fresia-dark">{customer.phone}</div>
                            <button onClick={() => { setEditingPhone(customer.phone); setNewPhoneVal(customer.phone) }} className="text-[8px] uppercase tracking-widest font-black text-fresia-rose opacity-40 hover:opacity-100">Editar Teléfono</button>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-lg ${showAllPins ? 'text-fresia-rose font-bold' : 'text-fresia-dark/10'}`}>
                            {showAllPins ? customer.pin : '••••'}
                          </span>
                          <button onClick={() => { navigator.clipboard.writeText(customer.pin); alert('Copiado') }} className="opacity-20 hover:opacity-100 transition-opacity">📋</button>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-[10px] uppercase tracking-widest font-black text-fresia-dark/30">
                        {new Date(customer.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex gap-2">
                          <button onClick={() => handleResetPIN(customer.phone)} title="Resetear PIN" className="p-3 bg-fresia-cream rounded-xl border border-fresia-gold/20 hover:bg-fresia-gold hover:text-white transition-all">🔄</button>

                          <button
                            onClick={() => handleDeleteCustomer(customer.phone, customer.name)}
                            title="Eliminar Cliente"
                            className="p-3 bg-fresia-cream rounded-xl border border-fresia-gold/20 hover:bg-red-500 hover:text-white transition-all text-red-500"
                          >
                            🗑️
                          </button>

                          <button
                            onClick={() => {
                              const link = generateLoginLink(customer.phone)
                              sendWhatsAppMessage(customer.phone, `Hola ${customer.name}, tu acceso: ${link}`)
                            }}
                            className="flex-1 bg-green-500 text-white text-[8px] font-black tracking-widest py-3 rounded-xl uppercase hover:shadow-lg transition-all"
                          >
                            Enviar Acceso
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
    </div>
  )
}
