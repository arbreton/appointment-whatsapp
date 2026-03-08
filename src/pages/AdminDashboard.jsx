import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentApi, customerApi } from '../api'
import { SERVICE_TYPES, DEPOSIT_PERCENTAGE, PRICES, TIME_SLOTS, APPOINTMENT_DURATION_MINS } from '../constants'

export default function AdminDashboard({ admin, onLogout }) {
  const [appointments, setAppointments] = useState([])
  const [dayAppointments, setDayAppointments] = useState([])
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

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // New appointment from admin
  const [newAppointment, setNewAppointment] = useState({
    phone: '',
    name: '',
    service: 'Uñas Acrílicas',
    date: getTomorrowDate(),
    time: '10:00',
    amount: PRICES['Uñas Acrílicas'] || 550
  })

  // Customer autocomplete
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allCustomers, setAllCustomers] = useState([])

  // View mode
  const [viewMode, setViewMode] = useState('list')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Helper functions
  const fetchDayAppointments = async (date) => {
    try {
      const data = await appointmentApi.getByDate(date)
      setDayAppointments(data || [])
    } catch (err) {
      console.error('Error fetching day appointments:', err)
    }
  }

  const isSlotAvailable = (time) => {
    if (!newAppointment.date) return true

    // Create a UTC timestamp for the slot to compare with stored UTC appointment dates
    const slotDate = new Date(`${newAppointment.date}T${time}:00`)
    const slotTime = slotDate.getTime()
    const DURATION_MS = APPOINTMENT_DURATION_MINS * 60 * 1000

    return !dayAppointments.some(apt => {
      const aptTime = new Date(apt.appointmentDate).getTime()
      // A slot is taken if an existing appointment starts within +/- 90 mins of the slot start
      const isOverlap = Math.abs(slotTime - aptTime) < DURATION_MS
      return isOverlap && apt.status !== 'cancelled' && apt.status !== 'rejected'
    })
  }

  const availableSlots = TIME_SLOTS.filter(isSlotAvailable)

  // Effects
  useEffect(() => {
    if (newAppointment.date) {
      fetchDayAppointments(newAppointment.date)
    }
  }, [newAppointment.date])

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
    const customer = allCustomers.find(c => c.phone === phoneToUse)
    const pinParam = customer ? `&p=${customer.pin}` : ''
    return `${siteUrl}/login?loginref=${encodeURIComponent(phoneToUse)}${pinParam}`
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
    const link = `${siteUrl}/login?loginref=${encodeURIComponent(customerPhone)}&p=${customer.pin}&redirectTo=/book`
    setWhatsappLink(link)
  }

  const generatePaymentLink = (appointment) => {
    const siteUrl = window.location.origin
    const customer = allCustomers.find(c => c.phone === appointment.customerPhone)
    const pinParam = customer ? `&p=${customer.pin}` : ''
    return `${siteUrl}/appointment/${appointment._id}?loginref=${encodeURIComponent(appointment.customerPhone)}${pinParam}`
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
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      waitlist: 'bg-fresia-gold/10 text-fresia-gold',
      confirmed: 'bg-green-50 text-green-700',
      completed: 'bg-fresia-rose/10 text-fresia-rose',
      cancelled: 'bg-red-50 text-red-600'
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
      partial: 'Depósito parcial',
      paid: 'Pagado',
      pending_payment: 'Pendiente'
    }
    return texts[paymentStatus] || paymentStatus
  }

  const getPaymentTypeText = (paymentType) => {
    const texts = {
      efectivo: '💵 Efectivo',
      stripe: '💳 Stripe',
      transferencia: '🏦 Transf.'
    }
    return texts[paymentType] || '–'
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

    if (!isSlotAvailable(newAppointment.time)) {
      alert('Este horario ya no está disponible.')
      return
    }

    try {
      // Create or get customer
      let customer = await customerApi.getByPhone(newAppointment.phone)
      if (!customer) {
        customer = await customerApi.create(newAppointment.phone, newAppointment.name)
      }

      // Create appointment with date/time
      const localDate = new Date(`${newAppointment.date}T${newAppointment.time}:00`)
      const appointmentDate = localDate.toISOString()

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
        date: getTomorrowDate(),
        time: '10:00',
        amount: PRICES['Uñas Acrílicas'] || 550
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
    <div className="min-h-screen bg-fresia-cream flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-fresia-dark p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌸</span>
          <span className="font-serif text-lg font-bold tracking-[0.2em] uppercase text-fresia-cream">FRESIA</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-fresia-gold text-2xl">☰</button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Premium Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-fresia-dark text-fresia-cream flex-shrink-0 z-[70] transition-transform duration-500 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-64 md:h-screen sticky top-0
      `}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌸</span>
              <span className="font-serif text-xl font-bold tracking-[0.2em] uppercase">FRESIA</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-fresia-gold text-2xl">✕</button>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => { setViewMode('list'); setIsSidebarOpen(false) }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest transition-all ${viewMode === 'list' ? 'bg-fresia-gold text-fresia-dark shadow-xl' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
            >
              <span>📋</span> GESTIÓN
            </button>
            <button
              onClick={() => { setViewMode('calendar'); setIsSidebarOpen(false) }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-fresia-gold text-fresia-dark shadow-xl' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
            >
              <span>📅</span> CALENDARIO
            </button>
            <Link
              to="/admin/customers"
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest opacity-50 hover:opacity-100 hover:bg-white/5 transition-all text-white"
            >
              <span>👥</span> CLIENTES
            </Link>
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <button onClick={onLogout} className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
              <span>✕</span> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 animate-fade-in overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <span className="text-fresia-rose font-serif italic text-xl mb-1 block">Master Dashboard</span>
            <h1 className="text-4xl md:text-5xl font-serif text-fresia-dark font-bold">Resumen de Citas</h1>
          </div>

          <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-fresia-gold/10">
            {['all', 'pending', 'confirmed'].map(k => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === k ? 'bg-fresia-dark text-white shadow-lg' : 'text-fresia-dark/40 hover:text-fresia-dark/60'}`}
              >
                {k === 'pending' ? 'Por Atender' : k}
              </button>
            ))}
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Quick Create Appointment */}
          <div className="glass-card rounded-[40px] p-8 md:p-10 border-white/50 shadow-2xl">
            <h2 className="font-serif text-2xl text-fresia-dark mb-8 flex items-center gap-3">
              <span className="text-fresia-gold">✦</span> Agendar Nueva Cita
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40 ml-1">Teléfono</label>
                <input
                  type="tel"
                  value={newAppointment.phone}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, phone: e.target.value })
                    searchCustomers(e.target.value, 'phone')
                  }}
                  onFocus={() => newAppointment.phone && searchCustomers(newAppointment.phone, 'phone')}
                  className="input-premium bg-white h-14"
                  placeholder="+521"
                />
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-20 w-1/2 mt-1 bg-white border border-fresia-gold/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto p-2">
                    {customerSuggestions.map((c) => (
                      <button key={c._id} onClick={() => selectCustomer(c)} className="w-full text-left p-3 hover:bg-fresia-rose-light rounded-xl transition-colors">
                        <div className="text-sm font-bold text-fresia-dark">{c.name}</div>
                        <div className="text-[10px] text-fresia-dark/40">{c.phone}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40 ml-1">Nombre</label>
                <input
                  type="text"
                  value={newAppointment.name}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, name: e.target.value })
                    searchCustomers(e.target.value, 'name')
                  }}
                  onFocus={() => newAppointment.name && searchCustomers(newAppointment.name, 'name')}
                  className="input-premium bg-white h-14"
                  placeholder="Nombre Completo"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40 ml-1">Servicio</label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment({
                    ...newAppointment,
                    service: e.target.value,
                    amount: PRICES[e.target.value] || 0
                  })}
                  className="input-premium bg-white h-14 appearance-none"
                >
                  {SERVICE_TYPES.map(s => <option key={s.id} value={s.name}>{s.name} — ${s.price}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40 ml-1">Fecha</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="input-premium bg-white h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40 ml-1">Hora</label>
                <select
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="input-premium bg-white h-14"
                >
                  {availableSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
              <button
                onClick={handleCreateAppointment}
                className="btn-premium sm:col-span-2 py-5 text-sm uppercase tracking-[0.2em] shadow-xl"
              >
                Confirmar y Notificar WhatsApp
              </button>
            </div>
          </div>

          {/* Tools Card */}
          <div className="space-y-8">
            <div className="glass-card rounded-[40px] p-8 border-white/50 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">🌍</div>
              <h2 className="font-serif text-2xl text-fresia-dark mb-6">Generador de Enlaces</h2>
              <div className="flex gap-4 mb-4">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Número del cliente"
                  className="input-premium bg-white flex-1"
                />
                <button
                  onClick={generateBookingLink}
                  className="bg-fresia-dark text-white px-8 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-fresia-rose transition-all"
                >
                  Crear
                </button>
              </div>
              {whatsappLink && (
                <div className="p-4 bg-fresia-rose-light border border-fresia-rose/10 rounded-2xl flex items-center justify-between">
                  <div className="truncate text-[10px] font-mono opacity-60 mr-4">{whatsappLink}</div>
                  <button onClick={() => copyLink(whatsappLink)} className="text-[10px] font-bold uppercase tracking-widest text-fresia-rose">Copiar</button>
                </div>
              )}
            </div>

            <div className="bg-fresia-dark rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fresia-gold/10 rounded-bl-full translate-x-12 -translate-y-12"></div>
              <h2 className="font-serif text-2xl mb-6">Nuevo Cliente</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-fresia-cream outline-none focus:border-fresia-gold/50 transition-all text-sm"
                  placeholder="Nombre"
                />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-fresia-cream outline-none focus:border-fresia-gold/50 transition-all text-sm"
                  placeholder="WhatsApp"
                />
                <button
                  onClick={handleCreateCustomer}
                  className="w-full bg-fresia-gold py-4 rounded-2xl text-fresia-dark text-xs font-bold uppercase tracking-widest shadow-xl"
                >
                  Registrar Maestro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Display */}
        {loading ? (
          <div className="py-20 text-center"><div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : viewMode === 'calendar' ? (
          <div className="space-y-12 pb-20">
            {Object.entries(getAppointmentsByDate()).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dayApts]) => (
              <div key={date}>
                <h3 className="font-serif text-2xl text-fresia-dark mb-6 flex items-center gap-4">
                  {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <div className="h-0.5 bg-fresia-gold/20 flex-1"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayApts.map(apt => (
                    <div key={apt._id} className="glass-card rounded-3xl p-6 border-white/50 hover:shadow-2xl transition-all group overflow-hidden relative">
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-mono text-2xl font-bold text-fresia-rose">{new Date(apt.appointmentDate).getHours()}:00</span>
                        <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black ${getStatusBadge(apt.status)}`}>{getStatusText(apt.status)}</span>
                      </div>
                      <h4 className="font-serif text-xl text-fresia-dark truncate mb-1">{apt.customerName}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-fresia-dark/40 font-bold mb-6">{apt.serviceType}</p>

                      <div className="flex gap-2 pt-6 border-t border-fresia-gold/10">
                        {apt.status === 'waitlist' && <button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="flex-1 bg-fresia-dark text-white text-[8px] font-black tracking-widest py-3 rounded-xl uppercase">Aprobar</button>}
                        <button onClick={() => sendWhatsAppMessage(apt.customerPhone, `Hola ${apt.customerName}!`)} className="p-3 bg-green-50 text-green-600 rounded-xl">📱</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-[40px] border-white/50 shadow-2xl overflow-hidden pb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-fresia-dark text-fresia-cream/40 overflow-hidden">
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Cliente</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Servicio</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Horario</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Pago</th>
                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-black">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fresia-gold/5">
                  {getFilteredAppointments().map((apt) => (
                    <tr key={apt._id} className="hover:bg-fresia-rose-light/20 transition-colors">
                      <td className="px-8 py-8">
                        <div className="font-serif text-lg text-fresia-dark">{apt.customerName}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/30">{apt.customerPhone}</div>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-black inline-block mb-2 ${getStatusBadge(apt.status)}`}>{getStatusText(apt.status)}</span>
                        <div className="text-sm font-medium text-fresia-dark">{apt.serviceType}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-bold text-fresia-dark">{new Date(apt.appointmentDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-[10px] uppercase tracking-widest text-fresia-rose font-bold">{new Date(apt.appointmentDate).getHours()}:00</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-xs font-bold text-fresia-dark mb-1">${apt.paidAmount} / ${apt.amount}</div>
                        <div className={`text-[8px] uppercase tracking-widest font-black mb-3 ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-fresia-gold'}`}>{getPaymentText(apt.paymentStatus)}</div>
                        <div className="flex gap-1">
                          {['efectivo', 'stripe'].map(type => (
                            <button key={type} onClick={() => updatePaymentType(apt._id, type)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${apt.paymentType === type ? 'bg-fresia-dark text-white' : 'bg-fresia-cream border border-fresia-gold/20 opacity-50'}`}>
                              {type === 'efectivo' ? '💵' : '💳'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {apt.status === 'confirmed' && <button onClick={() => updateAppointmentStatus(apt._id, 'completed')} className="text-[8px] font-black uppercase tracking-widest bg-fresia-rose text-white px-4 py-2 rounded-xl transition-all hover:shadow-lg">COMPLETAR</button>}
                            <button onClick={() => handleRejectAppointment(apt._id)} className="text-[10px] p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                          </div>
                          <button onClick={() => sendWhatsAppMessage(apt.customerPhone, `Hola ${apt.customerName}!`)} className="text-[8px] font-black uppercase tracking-widest bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 text-center">NOTIFICAR WA</button>
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
