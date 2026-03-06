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
      setPinMessage('¡PIN actualizado exitosamente! ✨')
      setNewPin('')
      setChangingPin(false)
    } catch (err) {
      setPinMessage('Error al cambiar PIN')
    }
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

  const getPaymentBadge = (paymentStatus) => {
    const styles = {
      none: 'bg-gray-100 text-gray-600',
      partial: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      pending_payment: 'bg-orange-100 text-orange-800'
    }
    return styles[paymentStatus] || 'bg-gray-100 text-gray-600'
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
      partial: 'Depósito pagado',
      paid: 'Pagado',
      pending_payment: 'Pagar ahora'
    }
    return texts[paymentStatus] || paymentStatus
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Beautiful Header */}
      <header className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💅✨</span>
              <div>
                <h1 className="text-xl font-bold">Cafe Encanta Nails</h1>
                <p className="text-pink-100 text-sm">Bienvenida, {customer.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Decorative flowers */}
      <div className="relative overflow-hidden h-4">
        <div className="absolute top-0 left-10 text-pink-200 text-4xl opacity-50">🌸</div>
        <div className="absolute top-0 right-20 text-rose-200 text-3xl opacity-50">🌺</div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* PIN Section - Beautiful Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-pink-100">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            🔐 Mi PIN de Acceso
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 flex-1">
              <p className="text-gray-600 text-sm mb-1">Tu PIN actual:</p>
              <div className="text-3xl font-bold text-pink-600 tracking-widest font-mono">
                {customer.pin || '••••'}
              </div>
            </div>

            {changingPin ? (
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Nuevo PIN"
                  maxLength={4}
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-center font-mono text-xl tracking-widest"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleChangePIN} 
                    className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all"
                  >
                    ✓ Guardar
                  </button>
                  <button 
                    onClick={() => { setChangingPin(false); setNewPin('') }} 
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setChangingPin(true)} 
                className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all flex items-center gap-2"
              >
                🔄 Cambiar PIN
              </button>
            )}
          </div>
          
          {pinMessage && (
            <p className="mt-2 text-green-600 font-medium flex items-center gap-2">
              ✨ {pinMessage}
            </p>
          )}
        </div>

        {/* Appointments Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📅 Mis Citas
          </h1>
          <Link
            to="/book"
            className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            ➕ Nueva Cita
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="mt-4 text-pink-500">Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <span className="text-7xl block mb-4">💅✨</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sin citas todavía</h2>
            <p className="text-gray-500 mb-6">¡Agenda tu primera cita ahora!</p>
            <Link
              to="/book"
              className="inline-block bg-gradient-to-r from-pink-400 to-rose-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              ➕ Agendar Cita
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-5 border border-pink-100 hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{apt.serviceType}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentBadge(apt.paymentStatus)}`}>
                        {getPaymentText(apt.paymentStatus)}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2">
                      📅 {formatDate(apt.appointmentDate)}
                    </p>
                    {apt.notes && (
                      <p className="text-gray-500 text-sm mt-1">📝 {apt.notes}</p>
                    )}
                    {apt.paymentStatus === 'paid' && apt.status === 'completed' && (
                      <p className="text-green-600 text-sm mt-2 font-medium">✓ Pagado - ¡Gracias por tu visita!</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(apt.paymentStatus === 'partial' || apt.paymentStatus === 'pending_payment' || apt.paymentStatus === 'none') && apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'rejected' && (
                      <Link
                        to={`/appointment/${apt._id}`}
                        className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        💳 Pagar Ahora
                      </Link>
                    )}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        disabled={cancellingId === apt._id}
                        className="px-5 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all font-medium disabled:opacity-50"
                      >
                        {cancellingId === apt._id ? '⏳' : '✕'} Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Decorative bottom flowers */}
      <div className="relative h-16 mt-8">
        <div className="absolute bottom-0 left-10 text-pink-200 text-5xl opacity-50">🌸</div>
        <div className="absolute bottom-0 right-10 text-rose-200 text-6xl opacity-50">🌺</div>
      </div>
    </div>
  )
}
