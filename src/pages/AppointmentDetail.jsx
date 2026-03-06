import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { appointmentApi } from '../api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function AppointmentDetail({ customer }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentOption, setPaymentOption] = useState('full')

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const fetchAppointment = async () => {
    try {
      const data = await appointmentApi.getById(id)
      setAppointment(data)
    } catch (err) {
      console.error('Error fetching appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      // Calculate payment amount based on option
      let amountToPay = 0
      if (paymentOption === 'full') {
        amountToPay = appointment.amount - appointment.paidAmount
      } else {
        // Minimum deposit
        amountToPay = Math.min(10, appointment.amount - appointment.paidAmount)
      }

      // In production, this would create a Stripe Checkout session
      // For now, we'll simulate the payment
      const stripe = await stripePromise
      
      // Simulate payment (in production, redirect to Stripe Checkout)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update appointment
      const newPaidAmount = appointment.paidAmount + amountToPay
      const newPaymentStatus = newPaidAmount >= appointment.amount ? 'paid' : 'partial'
      
      await appointmentApi.update(id, {
        paymentStatus: newPaymentStatus,
        paidAmount: newPaidAmount,
        paymentOption: paymentOption
      })

      alert(`¡Pago exitoso de $${amountToPay}! Gracias.`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error de pago. Por favor intenta de nuevo.')
    } finally {
      setProcessing(false)
      setShowPaymentModal(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Cita no encontrada</p>
          <Link to="/dashboard" className="text-pink-500 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const amountDue = appointment.amount - appointment.paidAmount
  const canPay = amountDue > 0 && appointment.paymentStatus !== 'paid'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-white/80 hover:text-white flex items-center gap-2">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">
            💅 Detalles de la Cita
          </h1>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-pink-100">
              <span className="text-gray-600">Servicio</span>
              <span className="font-semibold">{appointment.serviceType}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-pink-100">
              <span className="text-gray-600">Fecha y Hora</span>
              <span className="font-semibold">{formatDate(appointment.appointmentDate)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-pink-100">
              <span className="text-gray-600">Estado</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'waitlist' ? 'bg-yellow-100 text-yellow-800' :
                appointment.status === 'completed' ? 'bg-pink-100 text-pink-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {appointment.status === 'confirmed' ? '✓ Confirmado' :
                 appointment.status === 'waitlist' ? '⏳ Lista de espera' :
                 appointment.status === 'completed' ? '✨ Completado' : appointment.status}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-pink-100">
              <span className="text-gray-600">Monto Total</span>
              <span className="font-semibold">${appointment.amount}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-pink-100">
              <span className="text-gray-600">Ya Pagado</span>
              <span className="font-semibold text-green-600">${appointment.paidAmount || 0}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600 font-semibold">Monto Pendiente</span>
              <span className="font-bold text-pink-600 text-xl">${amountDue}</span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-6 p-4 bg-pink-50 rounded-xl">
              <h3 className="font-semibold mb-2">📝 Notas</h3>
              <p className="text-gray-600">{appointment.notes}</p>
            </div>
          )}

          {/* Payment Section */}
          {canPay && (
            <div className="mt-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                💳 Pagar Ahora - ${amountDue}
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">
                🔒 Pago seguro con Stripe (Apple Pay disponible)
              </p>
            </div>
          )}

          {appointment.paymentStatus === 'paid' && (
            <div className="mt-8 p-4 bg-green-50 rounded-xl text-center border border-green-200">
              <span className="text-3xl">✅</span>
              <p className="text-green-700 font-semibold mt-2">¡Pagado Completo!</p>
              <p className="text-green-600 text-sm">Gracias por tu visita 💅</p>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <h2 className="text-xl font-bold mb-4">💳 Opciones de Pago</h2>
              
              <div className="space-y-3 mb-6">
                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentOption === 'full' ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    value="full"
                    checked={paymentOption === 'full'}
                    onChange={(e) => setPaymentOption(e.target.value)}
                    className="w-5 h-5 text-pink-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Pago Completo</p>
                    <p className="text-sm text-gray-500">${amountDue}</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentOption === 'deposit' ? 'border-pink-400 bg-pink-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    value="deposit"
                    checked={paymentOption === 'deposit'}
                    onChange={(e) => setPaymentOption(e.target.value)}
                    className="w-5 h-5 text-pink-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Depósito Mínimo</p>
                    <p className="text-sm text-gray-500">$10 (resto al terminar)</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {processing ? 'Procesando...' : 'Pagar'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                � Apple Pay disponible en el siguiente paso
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
