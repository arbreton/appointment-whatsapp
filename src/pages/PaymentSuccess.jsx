import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { appointmentApi } from '../api'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const appointmentId = searchParams.get('appointment_id')

    if (sessionId && appointmentId) {
      verifyAndUpdatePayment()
    } else {
      setStatus('error')
    }
  }, [searchParams])

  const verifyAndUpdatePayment = async () => {
    const appointmentId = searchParams.get('appointment_id')

    try {
      const appointment = await appointmentApi.getById(appointmentId)

      if (appointment) {
        const paidAmountArg = parseFloat(searchParams.get('amount')) || 0;
        const totalPaid = (appointment.paidAmount || 0) + paidAmountArg;
        const isFullyPaid = totalPaid >= appointment.amount;

        await appointmentApi.update(appointmentId, {
          paymentStatus: isFullyPaid ? 'paid' : 'partial',
          paidAmount: totalPaid,
          paymentMethod: 'stripe'
        })

        setStatus('success')
      } else {
        console.error('Appointment not found:', appointmentId)
        setStatus('error')
      }
    } catch (err) {
      console.error('Error updating payment:', err)
      setStatus('error')
    }
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-500 text-lg">Procesando tu pago...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100 max-w-md text-center">
          <span className="text-6xl block mb-4">😕</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Algo salió mal</h1>
          <p className="text-gray-600 mb-6">
            Hubo un problema al procesar tu pago. Por favor contacta al salón.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-gradient-to-r from-pink-400 to-rose-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100 max-w-md text-center">
        <span className="text-6xl block mb-4">✅</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-2">
          Gracias por tu pago. Tu cita ha sido confirmada.
        </p>
        <p className="text-pink-500 mb-6">
          💅 Te esperamos pronto
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-gradient-to-r from-pink-400 to-rose-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Ver mis citas
        </Link>
      </div>
    </div>
  )
}
