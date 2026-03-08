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
  const [viewMode, setViewMode] = useState('calendar')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  // ... (existing helper functions remain same)

  // Quick Actions Modal Component
  const QuickActionsModal = () => (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${showQuickActions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-fresia-dark/80 backdrop-blur-md" onClick={() => setShowQuickActions(false)}></div>
      <div className={`absolute bottom-0 left-0 w-full bg-fresia-cream rounded-t-[40px] p-8 pb-12 transition-transform duration-500 transform ${showQuickActions ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-fresia-gold/20 rounded-full mx-auto mb-8"></div>
        <h3 className="font-serif text-2xl text-fresia-dark mb-8 text-center">Acciones Rápidas</h3>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => { setShowQuickActions(false); setViewMode('create_apt') }}
            className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-fresia-gold/10 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-fresia-rose-light flex items-center justify-center text-xl">📅</div>
            <div className="text-left">
              <div className="text-sm font-bold text-fresia-dark">Nueva Cita</div>
              <div className="text-[10px] text-fresia-dark/40 uppercase tracking-widest">Agendar en un toque</div>
            </div>
          </button>

          <button
            onClick={() => { setShowQuickActions(false); setViewMode('create_customer') }}
            className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-fresia-gold/10 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-fresia-dark text-fresia-gold flex items-center justify-center text-xl">👤</div>
            <div className="text-left">
              <div className="text-sm font-bold text-fresia-dark">Nuevo Cliente</div>
              <div className="text-[10px] text-fresia-dark/40 uppercase tracking-widest">Registro rápido</div>
            </div>
          </button>

          <button
            onClick={() => { setShowQuickActions(false); setViewMode('gen_link') }}
            className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-fresia-gold/10 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-fresia-gold/20 flex items-center justify-center text-xl">🔗</div>
            <div className="text-left">
              <div className="text-sm font-bold text-fresia-dark">Generar Enlace</div>
              <div className="text-[10px] text-fresia-dark/40 uppercase tracking-widest">Link de reserva/pago</div>
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowQuickActions(false)}
          className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-fresia-dark/30"
        >
          Cerrar
        </button>
      </div>
    </div>
  )

  // Bottom Nav Component
  const BottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-fresia-gold/10 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => setViewMode('calendar')}
        className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'calendar' ? 'text-fresia-rose scale-110' : 'text-fresia-dark/30'}`}
      >
        <span className="text-xl">📅</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Hoy</span>
      </button>

      <button
        onClick={() => setViewMode('list')}
        className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'list' ? 'text-fresia-rose scale-110' : 'text-fresia-dark/30'}`}
      >
        <span className="text-xl">📋</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Gestión</span>
      </button>

      <button
        onClick={() => setShowQuickActions(true)}
        className="w-14 h-14 bg-fresia-dark text-fresia-gold rounded-2xl flex items-center justify-center text-2xl shadow-xl -mt-10 border-4 border-fresia-cream animate-bounce-subtle"
      >
        <span>🌸</span>
      </button>

      <button
        onClick={() => setViewMode('customers')}
        className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'customers' ? 'text-fresia-rose scale-110' : 'text-fresia-dark/30'}`}
      >
        <span className="text-xl">👥</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Clientes</span>
      </button>

      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-1 text-fresia-dark/30"
      >
        <span className="text-xl">✕</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Salir</span>
      </button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-fresia-cream pb-24 md:pb-0 flex flex-col md:flex-row relative overflow-x-hidden">
      <QuickActionsModal />
      <BottomNav />

      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-fresia-dark text-fresia-cream h-screen sticky top-0 flex-shrink-0 z-40">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-2xl">🌸</span>
            <span className="font-serif text-xl font-bold tracking-[0.2em] uppercase">FRESIA</span>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => setViewMode('list')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest transition-all ${viewMode === 'list' ? 'bg-fresia-gold text-fresia-dark shadow-xl' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
            >
              📋 GESTIÓN
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-fresia-gold text-fresia-dark shadow-xl' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
            >
              📅 CALENDARIO
            </button>
            <button
              onClick={() => setViewMode('customers')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-bold tracking-widest transition-all ${viewMode === 'customers' ? 'bg-fresia-gold text-fresia-dark shadow-xl' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
            >
              👥 CLIENTES
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <button onClick={onLogout} className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
              <span>✕</span> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 animate-fade-in">
        {/* Mobile View Header - Specialized */}
        <header className="md:hidden flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-serif text-sm font-bold tracking-widest text-fresia-dark uppercase">FRESIA</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-fresia-rose bg-fresia-rose/10 px-4 py-2 rounded-full">
            Admin Mode
          </div>
        </header>

        {/* Global Desktop Header (Optional, kept for consistency) */}
        <header className="hidden md:flex justify-between items-center mb-12">
          <div>
            <span className="text-fresia-rose font-serif italic text-xl mb-1 block">Master Dashboard</span>
            <h1 className="text-5xl font-serif text-fresia-dark font-bold">Resumen Fresia</h1>
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

        {/* CONTENT SWITCHER */}

        {/* VIEW: CALENDAR */}
        {viewMode === 'calendar' && (
          <div className="space-y-12">
            <h2 className="text-3xl font-serif text-fresia-dark flex items-center gap-3">
              <span className="text-fresia-gold">📅</span> Mi Agenda
            </h2>
            {loading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : Object.keys(getAppointmentsByDate()).length === 0 ? (
              <div className="glass-card rounded-[40px] p-20 text-center border-dashed border-fresia-gold/20">
                <p className="text-fresia-dark/30 italic">No hay citas registradas</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(getAppointmentsByDate()).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dayApts]) => (
                  <div key={date}>
                    <h3 className="font-serif text-xl text-fresia-dark mb-4 flex items-center gap-4">
                      {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      <div className="h-px bg-fresia-gold/20 flex-1"></div>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayApts.map(apt => (
                        <div key={apt._id} className="glass-card rounded-3xl p-6 border-white/50 hover:shadow-xl transition-all relative overflow-hidden">
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-mono text-xl font-bold text-fresia-rose">{new Date(apt.appointmentDate).getHours()}:00</span>
                            <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black ${getStatusBadge(apt.status)}`}>{getStatusText(apt.status)}</span>
                          </div>
                          <h4 className="font-serif text-lg text-fresia-dark truncate mb-1">{apt.customerName}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-fresia-dark/40 font-bold mb-6">{apt.serviceType}</p>
                          <div className="flex gap-2">
                            <button onClick={() => sendWhatsAppMessage(apt.customerPhone, `Hola ${apt.customerName}!`)} className="p-3 bg-green-50 text-green-600 rounded-xl">📱</button>
                            {apt.status === 'waitlist' && <button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="flex-1 bg-fresia-dark text-white text-[8px] font-black tracking-widest py-3 rounded-xl uppercase">Aprobar</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: LIST (MANAGEMENT) */}
        {viewMode === 'list' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white/50 p-4 rounded-3xl border border-fresia-gold/10">
              <h2 className="text-2xl font-serif text-fresia-dark">Gestión Total</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-fresia-rose"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
              </select>
            </div>

            {loading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : (
              <div className="space-y-4">
                {getFilteredAppointments().map(apt => (
                  <div key={apt._id} className="glass-card rounded-[32px] p-6 border-white/50 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/30 mb-1">
                          {new Date(apt.appointmentDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} at {new Date(apt.appointmentDate).getHours()}:00
                        </div>
                        <h4 className="text-xl font-serif text-fresia-dark">{apt.customerName}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black ${getStatusBadge(apt.status)}`}>{getStatusText(apt.status)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-fresia-gold/5">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-fresia-dark">${apt.amount}</div>
                        <div className={`text-[8px] font-black uppercase tracking-widest ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-fresia-gold'}`}>{getPaymentText(apt.paymentStatus)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateAppointmentStatus(apt._id, 'completed')} className="w-8 h-8 rounded-lg bg-fresia-rose-light text-fresia-rose text-xs">✓</button>
                        <button onClick={() => handleRejectAppointment(apt._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 text-xs">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CUSTOMERS (Integrated) */}
        {viewMode === 'customers' && (
          <div className="space-y-8 pb-10">
            <header className="flex justify-between items-center bg-white/50 p-6 rounded-[32px] border border-fresia-gold/10">
              <h2 className="text-2xl font-serif text-fresia-dark">Clientes</h2>
              <button
                onClick={() => setViewMode('create_customer')}
                className="w-10 h-10 bg-fresia-dark text-fresia-gold rounded-full flex items-center justify-center text-xl shadow-lg"
              >
                +
              </button>
            </header>

            <div className="glass-card rounded-[32px] p-4 border-white/50 shadow-xl">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 text-xl">🔍</span>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Buscar clienta..."
                  className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white/50 border-none outline-none text-fresia-dark placeholder:text-fresia-dark/20 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-4">
              {allCustomers
                .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                .slice(0, 20)
                .map(c => (
                  <div key={c._id} className="glass-card rounded-3xl p-6 border-white/50 flex items-center justify-between group hover:border-fresia-gold/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-fresia-dark text-fresia-gold flex items-center justify-center font-serif text-xl shadow-lg">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-serif text-lg text-fresia-dark">{c.name}</div>
                        <div className="text-[10px] text-fresia-dark/40 font-bold uppercase tracking-widest flex items-center gap-2">
                          {c.phone}
                          <span className="w-1 h-1 bg-fresia-gold/20 rounded-full"></span>
                          PIN: {c.pin}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => sendWhatsAppMessage(c.phone, "¡Hola!")}
                        className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      >
                        📱
                      </button>
                      <button
                        onClick={() => { const link = generateLoginLink(c.phone); copyLink(link); }}
                        className="w-10 h-10 bg-fresia-gold/10 text-fresia-gold rounded-xl flex items-center justify-center hover:bg-fresia-gold hover:text-white transition-all shadow-sm text-xs"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                ))}
              {allCustomers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length === 0 && (
                <div className="text-center py-20 opacity-30 italic">No se encontraron clientas</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: CREATE APPOINTMENT (from modal) */}
        {viewMode === 'create_apt' && (
          <div className="glass-card rounded-[40px] p-8 md:p-10 border-white/50 shadow-2xl relative">
            <button onClick={() => setViewMode('calendar')} className="absolute top-8 right-8 text-fresia-dark/30">✕</button>
            <h2 className="font-serif text-2xl text-fresia-dark mb-8 flex items-center gap-3">
              <span className="text-fresia-gold">✦</span> Agendar Nueva Cita
            </h2>
            <div className="grid grid-cols-1 gap-6 relative">
              <input
                type="tel"
                value={newAppointment.phone}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, phone: e.target.value })
                  searchCustomers(e.target.value, 'phone')
                }}
                className="input-premium bg-white h-14"
                placeholder="Teléfono (WhatsApp)"
              />
              <input
                type="text"
                value={newAppointment.name}
                onChange={(e) => {
                  setNewAppointment({ ...newAppointment, name: e.target.value })
                  searchCustomers(e.target.value, 'name')
                }}
                className="input-premium bg-white h-14"
                placeholder="Nombre"
              />
              <select
                value={newAppointment.service}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  service: e.target.value,
                  amount: PRICES[e.target.value] || 0
                })}
                className="input-premium bg-white h-14"
              >
                {SERVICE_TYPES.map(s => <option key={s.id} value={s.name}>{s.name} — ${s.price}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="input-premium bg-white h-14"
                />
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
                className="btn-premium py-5 text-sm uppercase tracking-[0.2em] shadow-xl"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        )}

        {/* VIEW: CREATE CUSTOMER (from modal) */}
        {viewMode === 'create_customer' && (
          <div className="bg-fresia-dark rounded-[40px] p-8 text-white shadow-2xl relative">
            <button onClick={() => setViewMode('calendar')} className="absolute top-8 right-8 text-white/30">✕</button>
            <h2 className="font-serif text-2xl mb-6">Registrar Cliente</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-fresia-cream text-lg"
                placeholder="Nombre"
              />
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-fresia-cream text-lg"
                placeholder="WhatsApp"
              />
              <button
                onClick={handleCreateCustomer}
                className="w-full bg-fresia-gold py-5 rounded-2xl text-fresia-dark text-xs font-bold uppercase tracking-widest shadow-xl mt-4"
              >
                Registrar Maestro
              </button>
            </div>
          </div>
        )}

        {/* VIEW: GENERATE LINK (from modal) */}
        {viewMode === 'gen_link' && (
          <div className="glass-card rounded-[40px] p-8 border-white/50 shadow-xl relative">
            <button onClick={() => setViewMode('calendar')} className="absolute top-8 right-8 text-fresia-dark/30">✕</button>
            <h2 className="font-serif text-2xl text-fresia-dark mb-6">Enlace Directo</h2>
            <div className="space-y-6">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Número del cliente"
                className="input-premium bg-white h-14"
              />
              <button
                onClick={generateBookingLink}
                className="w-full btn-premium py-5 text-xs font-bold uppercase tracking-widest"
              >
                Generar Link WhatsApp
              </button>
              {whatsappLink && (
                <div className="p-4 bg-fresia-rose-light border border-fresia-rose/10 rounded-2xl">
                  <div className="truncate text-[10px] font-mono opacity-60 mb-2">{whatsappLink}</div>
                  <button onClick={() => copyLink(whatsappLink)} className="w-full py-2 bg-fresia-dark text-white rounded-xl text-[8px] uppercase tracking-widest font-black">Copiar Enlace</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
