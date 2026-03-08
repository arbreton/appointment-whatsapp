import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { appointmentApi } from '../api'
import { DEPOSIT_PERCENTAGE } from '../constants'

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
      let amountToPay = 0
      if (paymentOption === 'full') {
        amountToPay = appointment.amount - appointment.paidAmount
      } else {
        amountToPay = Math.round(appointment.amount * DEPOSIT_PERCENTAGE)
      }

      const response = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: id,
          amount: amountToPay,
          customerName: appointment.customerName,
          serviceType: appointment.serviceType
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se pudo crear la sesión de pago')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Error de pago. Por favor intenta de nuevo.')
      setProcessing(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fresia-dark">
        <div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fresia-dark px-4 font-serif text-fresia-cream">
        <div className="text-center">
          <p className="text-2xl mb-8 italic">Cita no encontrada</p>
          <Link to="/dashboard" className="btn-premium px-12 py-4 inline-block">
            Volver
          </Link>
        </div>
      </div>
    )
  }

  const amountDue = appointment.amount - appointment.paidAmount
  const canPay = amountDue > 0 && appointment.paymentStatus !== 'paid'
  const hasPaidSomething = (appointment.paidAmount || 0) > 0

  return (
    <div className="min-h-screen bg-fresia-dark text-fresia-cream flex flex-col p-6 md:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fresia-gold/5 rounded-full blur-[120px]"></div>

      <header className="max-w-xl mx-auto w-full mb-12 relative z-10">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 hover:opacity-100 hover:text-fresia-gold transition-all block mb-12">
          ← Volver al Panel
        </Link>

        <div className="text-center">
          <span className="text-fresia-gold text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block animate-fade-in">⚜️ Fresia Aesthetic & Wellness ⚜️</span>
          <h1 className="text-4xl md:text-5xl font-serif italic text-fresia-cream">Confirmación de Cita</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full relative z-10 flex-1">
        <div className="glass-morphism rounded-[40px] p-8 md:p-12 border-white/5 shadow-2xl relative bg-white/[0.02]">
          {/* Status Ribbon */}
          <div className="absolute top-0 right-12 -translate-y-1/2">
            <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${appointment.status === 'confirmed' ? 'bg-green-500 text-white' :
                appointment.status === 'waitlist' ? 'bg-fresia-gold text-fresia-dark' : 'bg-fresia-rose text-white'
              }`}>
              {appointment.status === 'confirmed' ? 'Confirmada' :
                appointment.status === 'waitlist' ? 'Lista de espera' : appointment.status}
            </span>
          </div>

          <div className="space-y-10">
            <div className="text-center pb-10 border-b border-fresia-gold/10">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-2">Servicio Solicitado</p>
              <h2 className="text-3xl font-serif text-fresia-cream">{appointment.serviceType}</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center sm:text-left">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1">Fecha</p>
                <div className="font-serif text-xl">{new Date(appointment.appointmentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1">Horario</p>
                <div className="font-serif text-xl">{new Date(appointment.appointmentDate).getHours()}:00</div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-fresia-gold/10">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-40 uppercase tracking-widest font-bold text-[10px]">Inversión Total</span>
                <span className="font-serif text-xl">${appointment.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-40 uppercase tracking-widest font-bold text-[10px]">Depósito Recibido</span>
                <span className="font-serif text-xl text-green-400">-${appointment.paidAmount || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-fresia-gold/20">
                <span className="text-fresia-gold uppercase tracking-[0.2em] font-black text-[12px]">Saldo Pendiente</span>
                <span className="text-4xl font-serif text-fresia-cream font-bold">${amountDue}</span>
              </div>
            </div>

            {canPay ? (
              <div className="pt-8">
                {error && <p className="mb-4 text-xs text-red-400 italic font-bold">✦ {error}</p>}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-fresia-gold text-fresia-dark py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-fresia-cream transition-all duration-500"
                >
                  Realizar Pago Seguro
                </button>
                <p className="text-center text-[8px] uppercase tracking-[0.2em] font-bold opacity-20 mt-6">Pagos procesados por Stripe® • Apple Pay™ Compatible</p>
              </div>
            ) : appointment.paymentStatus === 'paid' && (
              <div className="pt-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="font-serif italic text-2xl mb-2">Gracias, {appointment.customerName}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Tu experiencia ha sido liquidada con éxito.</p>
              </div>
            )}
          </div>
        </div>

        {/* Brand footer */}
        <div className="mt-20 text-center opacity-10">
          <p className="text-[8px] uppercase tracking-[0.5em] font-bold">Elegance is the only beauty that never fades.</p>
        </div>
      </main>

      {/* Payment Modal Refined */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-fresia-dark/95 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-fade-in">
          <div className="max-w-md w-full glass-morphism rounded-[40px] p-10 border-white/10 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fresia-dark via-fresia-gold to-fresia-dark"></div>
            <h2 className="text-fresia-cream font-serif text-2xl mb-8 italic">Opciones de Pago</h2>

            <div className="space-y-4 mb-10">
              <label className={`block p-6 rounded-3xl border transition-all cursor-pointer ${paymentOption === 'full' ? 'bg-fresia-gold/10 border-fresia-gold' : 'bg-white/5 border-white/5 opacity-50'}`}>
                <input
                  type="radio" name="payOption" value="full"
                  checked={paymentOption === 'full'}
                  onChange={() => setPaymentOption('full')}
                  className="hidden"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg">Total Pendiente</h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Liquidación completa de la cita</p>
                  </div>
                  <span className="text-xl font-serif text-fresia-gold">${amountDue}</span>
                </div>
              </label>

              {!hasPaidSomething && (
                <label className={`block p-6 rounded-3xl border transition-all cursor-pointer ${paymentOption === 'deposit' ? 'bg-fresia-gold/10 border-fresia-gold' : 'bg-white/5 border-white/5 opacity-50'}`}>
                  <input
                    type="radio" name="payOption" value="deposit"
                    checked={paymentOption === 'deposit'}
                    onChange={() => setPaymentOption('deposit')}
                    className="hidden"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-lg">Depósito de Garantía</h3>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">20% para asegurar tu lugar</p>
                    </div>
                    <span className="text-xl font-serif text-fresia-gold">${Math.round(appointment.amount * DEPOSIT_PERCENTAGE)}</span>
                  </div>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="py-4 rounded-2xl bg-white/5 text-fresia-cream/50 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="py-4 rounded-2xl bg-fresia-gold text-fresia-dark text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-fresia-cream transition-all disabled:opacity-50"
              >
                {processing ? 'Enviando...' : 'Proceder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
