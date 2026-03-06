import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentApi, customerApi } from '../api'
import { SERVICE_TYPES, DEPOSIT_AMOUNT, PRICES } from '../constants'

export default function AdminDashboard({ admin, onLogout }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Customer creation
  const [newCustomer, setNewCustomer] = useState({ phone: '', name: '' })
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [createdCustomer, setCreatedCustomer] = useState(null)

  // Link generation
  const [customerPhone, setCustomerPhone] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(null)

  // New appointment from admin
  const [newAppointment, setNewAppointment] = useState({
    phone: '',
    name: '',
    service: 'Uñas Acrílicas',
    date: '',
    time: '10:00',
    amount: SERVICE_TYPES[0].price
  })

  // Customer autocomplete
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allCustomers, setAllCustomers] = useState([])

  // View mode
  const [viewMode, setViewMode] = useState('list')

  // Fetch all customers for autocomplete
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await customerApi.getAll()
        setAllCustomers(customers || [])
      } catch (err) {
        console.error('Error fetching customers:', err)
      }
    }
    fetchCustomers()
  }, [])

  // Search customers as user types
  const searchCustomers = (query, field) => {
    if (!query || query.length < 1) {
      setCustomerSuggestions([])
      setShowSuggestions(false)
      return
    }

    const lowerQuery = query.toLowerCase()
    const suggestions = allCustomers.filter(c => {
      if (field === 'phone') {
        return c.phone && c.phone.includes(query)
      } else {
        return c.name && c.name.toLowerCase().includes(lowerQuery)
      }
    }).slice(0, 5) // Limit to 5 suggestions

    setCustomerSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
  }

  // Get filtered appointments based on status
  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments.filter(apt => apt.status !== 'cancelled')
    if (filter === 'pending') {
      return appointments.filter(apt =>
        (apt.status === 'waitlist' || apt.status === 'confirmed') &&
        apt.status !== 'cancelled' &&
        apt.status !== 'completed'
      )
    }
    return appointments.filter(apt => apt.status === filter)
  }

  // Group appointments by date for calendar view
  const getAppointmentsByDate = () => {
    const filtered = getFilteredAppointments()
    const grouped = {}
    filtered.forEach(apt => {
      const date = new Date(apt.appointmentDate).toISOString().split('T')[0]
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(apt)
    })
    // Sort appointments by time within each day
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.appointmentDate).getTime()
        const timeB = new Date(b.appointmentDate).getTime()
        return timeA - timeB
      })
    })
    return grouped
  }

  // Handle selecting a customer from suggestions
  const selectCustomer = (customer) => {
    setNewAppointment({
      ...newAppointment,
      phone: customer.phone,
      name: customer.name
    })
    setShowSuggestions(false)
    setCustomerSuggestions([])
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentApi.getAll(filter)
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.phone || !newCustomer.name) return

    setCreatingCustomer(true)
    try {
      const customer = await customerApi.create(newCustomer.phone, newCustomer.name)
      setCreatedCustomer(customer)
      setNewCustomer({ phone: '', name: '' })
    } catch (err) {
      console.error('Error creating customer:', err)
    } finally {
      setCreatingCustomer(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentApi.update(appointmentId, { status: newStatus })
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, status: newStatus } : apt
      ))
    } catch (err) {
      console.error('Error updating appointment:', err)
    }
  }

  const generateLoginLink = (phone) => {
    const siteUrl = window.location.origin
    const phoneToUse = phone || customerPhone
    return `${siteUrl}/login?ref=${encodeURIComponent(phoneToUse)}`
  }

  const generateBookingLink = async () => {
    const siteUrl = window.location.origin

    // Check if customer exists
    let customer = await customerApi.getByPhone(customerPhone)

    if (!customer) {
      // Ask for name before creating
      const name = prompt('Cliente nuevo. Ingresa el nombre:')
      if (!name) return

      // Create customer
      customer = await customerApi.create(customerPhone, name)
    }

    // Generate link that auto-logs in and goes to booking
    const link = `${siteUrl}/login?ref=${encodeURIComponent(customerPhone)}&redirectTo=/book`
    setWhatsappLink(link)
  }

  const generatePaymentLink = (appointment) => {
    const siteUrl = window.location.origin
    return `${siteUrl}/appointment/${appointment._id}?ref=${encodeURIComponent(appointment.customerPhone)}`
  }

  const sendWhatsAppMessage = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(waLink, '_blank')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      waitlist: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-pink-100 text-pink-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      waitlist: 'Lista de espera',
      confirmed: 'Confirmado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    }
    return texts[status] || status
  }

  const getPaymentText = (paymentStatus) => {
    const texts = {
      none: 'Lista de espera',
      partial: 'Anticipo',
      paid: 'Pagado',
      pending_payment: 'Por pagar'
    }
    return texts[paymentStatus] || paymentStatus
  }

  const getPaymentTypeText = (paymentType) => {
    const texts = {
      efectivo: '💵 Efectivo',
      stripe: '💳 Stripe',
      transferencia: '🏦 Transferencia'
    }
    return texts[paymentType] || 'No definido'
  }

  const copyLink = (link) => {
    navigator.clipboard.writeText(link)
    alert('¡Enlace copiado al portapapeles!')
  }

  const updatePaymentStatus = async (appointmentId, newPaymentStatus, paidAmount = null) => {
    try {
      const updateData = { paymentStatus: newPaymentStatus }
      if (paidAmount !== null) {
        updateData.paidAmount = paidAmount
      }
      await appointmentApi.update(appointmentId, updateData)
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, ...updateData } : apt
      ))
    } catch (err) {
      console.error('Error updating payment:', err)
    }
  }

  const updatePaymentType = async (appointmentId, paymentType) => {
    try {
      await appointmentApi.update(appointmentId, { paymentType })
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, paymentType } : apt
      ))
    } catch (err) {
      console.error('Error updating payment type:', err)
    }
  }

  const handleCreateAppointment = async () => {
    if (!newAppointment.phone || !newAppointment.name || !newAppointment.date || !newAppointment.time) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      // Create or get customer
      let customer = await customerApi.getByPhone(newAppointment.phone)
      if (!customer) {
        customer = await customerApi.create(newAppointment.phone, newAppointment.name)
      }

      // Create appointment with date/time
      const appointmentDate = `${newAppointment.date}T${newAppointment.time}:00`
      await appointmentApi.createFromAdmin(
        newAppointment.phone,
        newAppointment.name,
        newAppointment.service,
        appointmentDate,
        newAppointment.amount
      )

      // Send WhatsApp message
      const link = generateLoginLink(newAppointment.phone)
      sendWhatsAppMessage(
        newAppointment.phone,
        `Hola ${newAppointment.name}, tu cita para ${newAppointment.service} ha sido agendada para el ${newAppointment.date} a las ${newAppointment.time}. Total: ${newAppointment.amount}. Aquí está tu link: ${link}`
      )

      // Reset form
      setNewAppointment({
        phone: '',
        name: '',
        service: 'Uñas Acrílicas',
        date: '',
        time: '10:00',
        amount: SERVICE_TYPES[0].price
      })

      alert('¡Cita creada y notificada por WhatsApp!')
      fetchAppointments()
    } catch (err) {
      console.error('Error creating appointment:', err)
      alert('Error al crear la cita')
    }
  }

  const handleApproveAppointment = async (appointmentId) => {
    try {
      await appointmentApi.update(appointmentId, { status: 'confirmed' })
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
      ))
      alert('¡Cita aprobada!')
    } catch (err) {
      console.error('Error approving appointment:', err)
    }
  }

  const handleRejectAppointment = async (appointmentId) => {
    if (!confirm('¿Estás seguro de rechazar esta cita?')) return

    try {
      await appointmentApi.update(appointmentId, { status: 'cancelled' })
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ))
    } catch (err) {
      console.error('Error rejecting appointment:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💅✨</span>
            <h1 className="text-xl font-bold">Panel de Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/customers"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              👥 Clientes
            </Link>
            <button
              onClick={onLogout}
              className="text-white/80 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Decorative */}
      <div className="relative overflow-hidden h-4">
        <div className="absolute top-0 left-10 text-pink-200 text-4xl opacity-50">🌸</div>
        <div className="absolute top-0 right-20 text-rose-200 text-3xl opacity-50">🌺</div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Customer Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-pink-100">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">Crear Nuevo Cliente</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Nombre del cliente"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            />
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              placeholder="Número de teléfono"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            />
            <button
              onClick={handleCreateCustomer}
              disabled={creatingCustomer || !newCustomer.phone || !newCustomer.name}
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {creatingCustomer ? 'Creando...' : '✨ Crear Cliente'}
            </button>
          </div>

          {createdCustomer && (
            <div className="p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
              <p className="font-semibold text-green-800 flex items-center gap-2">✓ ¡Cliente creado exitosamente!</p>
              <p className="text-sm text-gray-600">Nombre: {createdCustomer.name}</p>
              <p className="text-sm text-gray-600">Teléfono: {createdCustomer.phone}</p>
              <p className="text-2xl font-bold text-pink-600 my-2">PIN: {createdCustomer.pin}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => {
                    const link = generateLoginLink(createdCustomer.phone)
                    copyLink(link)
                  }}
                  className="bg-white border border-pink-200 text-pink-600 px-4 py-2 rounded-xl text-sm hover:bg-pink-50 transition-all"
                >
                  📋 Copiar Link
                </button>
                <button
                  onClick={() => {
                    const link = generateLoginLink(createdCustomer.phone)
                    sendWhatsAppMessage(createdCustomer.phone, `Hola ${createdCustomer.name}, tu cuenta ha sido creada. Tu PIN es: ${createdCustomer.pin}. Aquí está tu link para agendar: ${link}`)
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition-all flex items-center gap-1"
                >
                  📱 Enviar WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Generate Link Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-pink-100">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">📅 Crear Cita con Fecha/Hora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 relative">
            <div className="relative">
              <input
                type="tel"
                value={newAppointment.phone}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, phone: e.target.value })
                  searchCustomers(e.target.value, 'phone')
                }}
                onFocus={() => newAppointment.phone && searchCustomers(newAppointment.phone, 'phone')}
                placeholder="Teléfono"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              />
              {showSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-pink-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {customerSuggestions.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-pink-50 border-b border-pink-100 last:border-0"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={newAppointment.name}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, name: e.target.value })
                  searchCustomers(e.target.value, 'name')
                }}
                onFocus={() => newAppointment.name && searchCustomers(newAppointment.name, 'name')}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              />
              {showSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-pink-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {customerSuggestions.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-pink-50 border-b border-pink-100 last:border-0"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={newAppointment.service}
              onChange={(e) => setNewAppointment({
                ...newAppointment,
                service: e.target.value,
                amount: PRICES[e.target.value] || 0
              })}
              className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            >
              {SERVICE_TYPES.map(s => (
                <option key={s.id} value={s.name}>{s.name} - ${s.price}</option>
              ))}
            </select>
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            />
            <select
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            >
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="18:00">06:00 PM</option>
            </select>
            <button
              onClick={handleCreateAppointment}
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all"
            >
              ✨ Crear Cita
            </button>
          </div>
        </div>

        {/* Generate Link Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-pink-100">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">Generar Enlace para Cliente</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Número de teléfono del cliente"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            />
            <button
              onClick={generateBookingLink}
              disabled={!customerPhone}
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 whitespace-nowrap"
            >
              ✨ Generar Enlace
            </button>
          </div>
          {whatsappLink && (
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex-1 p-4 bg-pink-50 rounded-xl border border-pink-100">
                <code className="text-sm break-all text-gray-700">{whatsappLink}</code>
              </div>
              <button
                onClick={() => copyLink(whatsappLink)}
                className="bg-white border border-pink-200 text-pink-600 px-4 py-2 rounded-xl hover:bg-pink-50 transition-all"
              >
                📋 Copiar
              </button>
              <button
                onClick={() => {
                  const waMessage = `Hola, aquí está tu enlace para iniciar sesión y agendar tu cita: ${whatsappLink}`
                  sendWhatsAppMessage(customerPhone, waMessage)
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
              >
                📱 WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'confirmed', label: 'Confirmadas' },
              { key: 'completed', label: 'Completadas' },
              { key: 'cancelled', label: 'Canceladas' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${filter === item.key
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-300'
                  : 'bg-white text-gray-600 hover:bg-pink-100 border border-pink-100'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 md:ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${viewMode === 'list'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-300'
                : 'bg-white text-gray-600 hover:bg-rose-100 border border-rose-100'
                }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${viewMode === 'calendar'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-300'
                : 'bg-white text-gray-600 hover:bg-rose-100 border border-rose-100'
                }`}
            >
              📅 Calendario
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : getFilteredAppointments().length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <span className="text-6xl">📅</span>
            <p className="text-gray-500 mt-4">No se encontraron citas</p>
          </div>
        ) : viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="space-y-6">
            {Object.entries(getAppointmentsByDate()).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dayAppointments]) => (
              <div key={date} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-6 py-3">
                  <h3 className="text-white font-semibold">
                    {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    <span className="ml-2 text-white/80">({dayAppointments.length} citas)</span>
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {dayAppointments.map(apt => (
                    <div key={apt._id} className="flex items-center gap-4 p-3 rounded-xl bg-pink-50/50 hover:bg-pink-100/50 transition-colors">
                      <div className="w-20 text-center">
                        <div className="text-lg font-bold text-pink-600">
                          {new Date(apt.appointmentDate).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{apt.customerName}</div>
                        <div className="text-sm text-gray-500">{apt.serviceType}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium">${apt.amount}</div>
                        <div className={`text-xs ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {apt.paymentStatus === 'paid' ? '✓ Pagado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-pink-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Servicio</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Fecha</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Estado</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Pago</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {getFilteredAppointments().map((apt) => (
                    <tr key={apt._id} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{apt.customerName}</div>
                        <div className="text-sm text-gray-500">{apt.customerPhone}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{apt.serviceType}</td>
                      <td className="px-4 py-4 text-gray-600">{formatDate(apt.appointmentDate)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                          {getStatusText(apt.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium">${apt.paidAmount} / ${apt.amount}</div>
                          <div className={`text-xs ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                            {getPaymentText(apt.paymentStatus)}
                          </div>
                          {apt.paymentType && (
                            <div className="text-xs text-gray-500 mt-1">
                              {getPaymentTypeText(apt.paymentType)}
                            </div>
                          )}
                        </div>
                        {/* Payment Status Buttons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {apt.paymentStatus !== 'partial' && apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              onClick={() => {
                                const deposit = Math.round(apt.amount * 0.5)
                                updatePaymentStatus(apt._id, 'partial', deposit)
                              }}
                              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                              title="Marcar anticipo (50%)"
                            >
                              💰 Anticipo
                            </button>
                          )}
                          {apt.paymentStatus !== 'paid' && apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              onClick={() => updatePaymentStatus(apt._id, 'paid', apt.amount)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                              title="Marcar pagado completo"
                            >
                              ✓ Pagado
                            </button>
                          )}
                        </div>
                        {/* Payment Type Buttons */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <button
                            onClick={() => updatePaymentType(apt._id, 'efectivo')}
                            className={`text-xs px-2 py-1 rounded ${apt.paymentType === 'efectivo' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Efectivo"
                          >
                            💵
                          </button>
                          <button
                            onClick={() => updatePaymentType(apt._id, 'stripe')}
                            className={`text-xs px-2 py-1 rounded ${apt.paymentType === 'stripe' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Stripe"
                          >
                            💳
                          </button>
                          <button
                            onClick={() => updatePaymentType(apt._id, 'transferencia')}
                            className={`text-xs px-2 py-1 rounded ${apt.paymentType === 'transferencia' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Transferencia"
                          >
                            🏦
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {/* Status Actions */}
                          {apt.status === 'waitlist' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                              className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              ✓ Confirmar
                            </button>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt._id, 'completed')}
                              className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors"
                            >
                              ✓ Completar
                            </button>
                          )}
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              ✕ Cancelar
                            </button>
                          )}

                          {/* Payment Link */}
                          {apt.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => {
                                const link = generatePaymentLink(apt)
                                const amountDue = apt.amount - apt.paidAmount
                                sendWhatsAppMessage(
                                  apt.customerPhone,
                                  `Hola ${apt.customerName}, por favor completa tu pago de $${amountDue}. Paga aquí: ${link}`
                                )
                              }}
                              className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              💳 Enviar Pago
                            </button>
                          )}

                          {/* WhatsApp Actions */}
                          <button
                            onClick={() => {
                              const messages = {
                                waitlist: `¡Hola ${apt.customerName}! Estás en la lista de espera para ${apt.serviceType}. Te contactaremos pronto.`,
                                confirmed: `¡Hola ${apt.customerName}! Tu cita para ${apt.serviceType} está confirmada para el ${formatDate(apt.appointmentDate)}. ¡Nos vemos pronto! 💅`,
                                completed: `¡Hola ${apt.customerName}! Gracias por visitarnos. ¡Tus uñas quedaron hermosas! ✨`
                              }
                              sendWhatsAppMessage(apt.customerPhone, messages[apt.status] || '¡Hola!')
                            }}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 justify-center"
                          >
                            📱 WhatsApp
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
