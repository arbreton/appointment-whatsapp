import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentApi, customerApi } from '../api'

export default function CustomerDashboard({ customer, onLogout }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [changingPin, setChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchAppointments()
  }, [customer.phone])

  const fetchAppointments = async () => {
    try {
      const data = await appointmentApi.getByPhone(customer.phone)
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return
    setCancellingId(appointmentId)
    try {
      await appointmentApi.cancel(appointmentId)
      setAppointments(appointments.filter(apt => apt._id !== appointmentId))
    } catch (err) {
      console.error('Error cancelling appointment:', err)
    } finally {
      setCancellingId(null)
    }
  }

  const handleChangePIN = async () => {
    if (newPin.length !== 4) {
      setPinMessage('El PIN debe tener 4 dígitos')
      return
    }
    try {
      const updatedCustomer = await customerApi.updatePIN(customer.phone, newPin)
      localStorage.setItem('customer', JSON.stringify(updatedCustomer))
      setPinMessage('✨ PIN actualizado exitosamente')
      setNewPin('')
      setChangingPin(false)
    } catch (err) {
      setPinMessage('Error al cambiar PIN')
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getFilteredAppointments = () => {
    if (activeTab === 'active') {
      return appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed')
    } else {
      return appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'completed')
    }
  }

  return (
    <div className="min-h-screen bg-fresia-cream pb-20 selection:bg-fresia-rose/30">
      {/* Premium Navigation Dashboard */}
      <nav className="glass-morphism px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-serif text-lg font-bold tracking-tight text-fresia-dark uppercase">FRESIA</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right mr-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40">Bienvenida</p>
            <p className="text-sm font-serif text-fresia-dark">{customer.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-full border border-fresia-dark/10 flex items-center justify-center hover:bg-fresia-dark hover:text-white transition-all"
            title="Cerrar Sesión"
          >
            ✕
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Right Column (Appointments) - First on mobile */}
          <section className="md:w-2/3 order-2 md:order-1">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-fresia-dark mb-2">Mis Citas</h1>
                <div className="flex gap-6 border-b border-fresia-gold/10 pb-0 shadow-[0_1px_rgba(230,190,138,0.1)]">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-all relative ${activeTab === 'active' ? 'text-fresia-dark' : 'text-fresia-dark/30 hover:text-fresia-dark/50'}`}
                  >
                    Próximas
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fresia-rose animate-fade-in"></div>}
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`pb-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-all relative ${activeTab === 'past' ? 'text-fresia-dark' : 'text-fresia-dark/30 hover:text-fresia-dark/50'}`}
                  >
                    Historial
                    {activeTab === 'past' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fresia-rose animate-fade-in"></div>}
                  </button>
                </div>
              </div>
              <Link to="/book" className="btn-premium py-3 px-6 text-xs uppercase tracking-widest hidden sm:block">
                Nueva Reserva
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              </div>
            ) : getFilteredAppointments().length === 0 ? (
              <div className="glass-card rounded-[40px] p-12 text-center border-dashed border-fresia-gold/30">
                <span className="text-4xl block mb-6 opacity-30">💅</span>
                <p className="text-fresia-dark/40 font-light italic mb-8 text-sm">No tienes citas programadas en esta sección.</p>
                <Link to="/book" className="text-fresia-rose font-bold uppercase tracking-widest text-[10px] hover:tracking-[0.2em] transition-all">Explorar Servicios →</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredAppointments().map((apt) => (
                  <div key={apt._id} className="group glass-card rounded-[32px] p-6 sm:p-8 hover:bg-white transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-fresia-rose-light/20 rounded-bl-full translate-x-12 -translate-y-12 transition-transform group-hover:translate-x-8 group-hover:-translate-y-8 pointer-events-none"></div>

                    <div className="flex justify-between items-start relative z-10 mb-6">
                      <div className="max-w-[70%]">
                        <span className={`inline-block px-3 py-1 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold mb-3 ${getStatusBadge(apt.status)}`}>
                          {getStatusText(apt.status)}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif text-fresia-dark mb-1 truncate">{apt.serviceType}</h3>
                        <div className="flex items-center gap-2 text-fresia-dark/50 text-[10px] sm:text-xs font-light tracking-wide first-letter:uppercase">
                          <span className="text-fresia-gold">✦</span> {formatDate(apt.appointmentDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-widest font-bold text-fresia-dark/30 mb-1">Monto</p>
                        <p className="text-lg sm:text-xl font-serif text-fresia-dark">${apt.amount}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-fresia-gold/10 pt-6">
                      <div className="flex gap-4">
                        {(apt.paymentStatus === 'partial' || apt.paymentStatus === 'pending_payment' || apt.paymentStatus === 'none') &&
                          apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'rejected' && (
                            <Link
                              to={`/appointment/${apt._id}`}
                              className="bg-fresia-gold/10 text-fresia-dark font-bold text-[8px] uppercase tracking-widest py-2 px-4 sm:px-6 rounded-xl hover:bg-fresia-gold hover:text-white transition-all"
                            >
                              Pagar
                            </Link>
                          )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            disabled={cancellingId === apt._id}
                            className="text-fresia-dark/30 hover:text-red-500 font-bold text-[8px] uppercase tracking-widest py-2 transition-colors"
                          >
                            {cancellingId === apt._id ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        )}
                      </div>
                      {apt.paymentStatus === 'paid' && (
                        <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-black text-fresia-rose bg-fresia-rose/5 px-3 py-1 rounded-lg">Pago Completo ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/book" className="btn-premium w-full mt-10 text-center py-5 sm:hidden">
              Nueva Reserva
            </Link>
          </section>

          {/* Left Column (Profile) - Second on mobile */}
          <aside className="md:w-1/3 space-y-6 order-1 md:order-2">
            <div className="glass-card rounded-[32px] p-6 sm:p-8">
              <div className="flex md:flex-col items-center gap-6 md:gap-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-fresia-rose-light flex items-center justify-center text-2xl md:text-3xl border-4 border-white shadow-inner flex-shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="md:text-center mt-0 md:mt-6">
                  <h2 className="font-serif text-xl md:text-2xl text-fresia-dark mb-1">{customer.name}</h2>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-fresia-dark/40 font-bold">{customer.phone}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-fresia-gold/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-fresia-dark/40">PIN de Acceso</span>
                  <span className="font-mono text-fresia-rose font-bold tracking-widest">{customer.pin}</span>
                </div>

                {changingPin ? (
                  <div className="space-y-3 animate-fade-in">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Nuevo PIN"
                      maxLength={4}
                      inputMode="numeric"
                      className="input-premium py-2 text-center text-xl tracking-[1em]"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleChangePIN} className="flex-1 bg-fresia-dark text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest">OK</button>
                      <button onClick={() => setChangingPin(false)} className="px-4 py-2 border border-fresia-dark/10 rounded-xl text-xs">✕</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setChangingPin(true)}
                    className="w-full py-3 rounded-xl border border-fresia-gold/20 text-[10px] uppercase tracking-widest font-bold hover:bg-fresia-rose-light hover:text-fresia-rose transition-all"
                  >
                    Actualizar PIN
                  </button>
                )}
                {pinMessage && <p className="mt-3 text-[10px] text-center italic text-fresia-rose">{pinMessage}</p>}
              </div>
            </div>

            <div className="glass-morphism rounded-[32px] p-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-fresia-dark/40 mb-4">¿Preguntas?</p>
              <a href="https://wa.me/5216181234567" className="text-sm font-serif text-fresia-dark hover:text-fresia-rose transition-colors underline decoration-fresia-gold">Hablar con Recepción</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
