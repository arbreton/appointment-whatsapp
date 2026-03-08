import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const sId = searchParams.get('session_id')
    if (sId) {
      verifyAndUpdatePayment(sId)
    } else {
      setStatus('error')
    }
  }, [searchParams])

  const verifyAndUpdatePayment = async (sessionId) => {
    try {
      const response = await fetch('/.netlify/functions/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const appointment = await response.json();

      if (appointment && !appointment.error) {
        setStatus('success')
      } else {
        throw new Error(appointment.error || 'Error al verificar el pago')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setStatus('error')
    }
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-fresia-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-fresia-gold font-serif italic text-xl animate-pulse">Confirmando tu reserva...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-fresia-dark flex items-center justify-center p-6">
        <div className="glass-morphism rounded-[40px] p-12 border-white/10 shadow-3xl max-w-md w-full text-center bg-white/[0.02]">
          <div className="text-5xl mb-8">🥀</div>
          <h1 className="text-3xl font-serif italic text-fresia-cream mb-4">Algo no salió como esperábamos</h1>
          <p className="text-[12px] uppercase tracking-widest font-bold opacity-40 leading-relaxed mb-10">
            Hubo un inconveniente al procesar tu transacción. No te preocupes, nuestro equipo está listo para ayudarte personalmente.
          </p>
          <Link
            to="/dashboard"
            className="block w-full py-5 rounded-2xl bg-white/5 text-fresia-cream text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-white/10 transition-all border border-white/5"
          >
            Volver al Panel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fresia-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-fresia-gold/10 rounded-full blur-[150px] animate-pulse"></div>

      <div className="glass-morphism rounded-[40px] p-12 md:p-16 border-white/10 shadow-3xl max-w-lg w-full text-center relative z-10 bg-white/[0.02] border-t border-fresia-gold/20">
        <div className="w-24 h-24 bg-fresia-gold/20 rounded-full flex items-center justify-center mx-auto mb-10 animate-fade-in">
          <span className="text-4xl text-fresia-gold">⚜️</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif italic text-fresia-cream mb-6">Transacción Exitosa</h1>

        <div className="space-y-4 mb-12">
          <p className="text-[12px] uppercase tracking-[0.2em] font-bold opacity-40">Reserva Confirmada</p>
          <p className="text-fresia-cream/80 leading-relaxed italic font-serif text-lg">
            Gracias por confiar en nuestra esencia. Tu cita ha sido agendada con la exclusividad que mereces.
          </p>
        </div>

        <div className="pt-10 border-t border-fresia-gold/10">
          <Link
            to="/dashboard"
            className="block w-full py-6 rounded-2xl bg-fresia-gold text-fresia-dark text-[10px] uppercase font-bold tracking-[0.4em] shadow-2xl hover:bg-fresia-cream transition-all duration-500"
          >
            Ver mis detalles
          </Link>
        </div>

        <p className="mt-8 text-[8px] uppercase tracking-[0.3em] font-bold opacity-20">Fresia Aesthetic & Wellness • Experiencia de Lujo</p>
      </div>
    </div>
  )
}
