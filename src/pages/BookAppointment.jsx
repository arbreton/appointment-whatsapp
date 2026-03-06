import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentApi } from '../api'
import { SERVICE_TYPES, DEPOSIT_AMOUNT } from '../constants'

export default function BookAppointment({ customer }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    serviceType: 'manicure',
    paymentType: 'waitlist',
    amount: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const serviceTypes = SERVICE_TYPES

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (serviceId) => {
    const service = serviceTypes.find(s => s.id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
      amount: service ? service.price : 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const selectedService = serviceTypes.find(s => s.id === formData.serviceType)
    const amount = selectedService ? selectedService.price : 0

    const appointmentData = {
      customerPhone: customer.phone,
      customerName: customer.name,
      appointmentDate: `${formData.date}T${formData.time}:00`,
      serviceType: selectedService ? selectedService.name : formData.serviceType,
      paymentType: formData.paymentType,
      amount: amount,
      paidAmount: formData.paymentType === 'waitlist' ? 0 :
        formData.paymentType === 'min_deposit' ? DEPOSIT_AMOUNT : amount,
      paymentStatus: formData.paymentType === 'waitlist' ? 'none' : 'pending_payment',
      status: formData.paymentType === 'waitlist' ? 'waitlist' : 'confirmed',
      notes: formData.notes
    }

    try {
      const response = await appointmentApi.create(appointmentData)
      const appointment = response;

      // If it's a paid appointment, redirect to Stripe
      if (formData.paymentType !== 'waitlist') {
        const paymentResponse = await fetch('/.netlify/functions/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointment._id,
            amount: appointmentData.paidAmount,
            customerName: appointment.customerName,
            serviceType: appointment.serviceType
          })
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.url) {
          window.location.href = paymentData.url;
          return; // Stop here, browser will redirect
        } else {
          throw new Error(paymentData.error || 'Error al iniciar el pago');
        }
      }

      // If waitlist, just go to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al reservar. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 px-1">Reservar Cita</h1>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100">
          <form onSubmit={handleSubmit}>
            {/* Service Type */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Selecciona Servicio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {serviceTypes.map((service) => (
                  <label
                    key={service.id}
                    className={`p-2.5 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${formData.serviceType === service.id
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                      }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.id}
                      checked={formData.serviceType === service.id}
                      onChange={() => handleServiceChange(service.id)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm sm:text-base">{service.name}</span>
                      <span className="text-pink-600 font-semibold text-sm sm:text-base">${service.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Selecciona Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base"
                required
              />
            </div>

            {/* Time */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Selecciona Hora
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base bg-white"
                required
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Option */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Opción de Pago
              </label>
              <div className="space-y-2 sm:space-y-3">
                <label className={`flex p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${formData.paymentType === 'waitlist'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
                  }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="waitlist"
                    checked={formData.paymentType === 'waitlist'}
                    onChange={handleChange}
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="ml-2 sm:ml-3">
                    <div className="font-medium text-sm sm:text-base">Unirse a Lista de Espera</div>
                    <div className="text-xs sm:text-sm text-gray-500">Paga después de tu cita</div>
                  </div>
                </label>

                <label className={`flex p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${formData.paymentType === 'min_deposit'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
                  }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="min_deposit"
                    checked={formData.paymentType === 'min_deposit'}
                    onChange={handleChange}
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="ml-2 sm:ml-3">
                    <div className="font-medium text-sm sm:text-base">Pagar Depósito Mínimo (${DEPOSIT_AMOUNT})</div>
                    <div className="text-xs sm:text-sm text-gray-500">Asegura tu lugar con un depósito</div>
                  </div>
                </label>

                <label className={`flex p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${formData.paymentType === 'full'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
                  }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === 'full'}
                    onChange={handleChange}
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="ml-2 sm:ml-3">
                    <div className="font-medium text-sm sm:text-base">Pagar Monto Completo</div>
                    <div className="text-xs sm:text-sm text-gray-500">Paga el monto completo ahora</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Solicitudes Especiales (Opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="¿Alguna solicitud especial?"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-base h-20 sm:h-24 resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 min-h-[48px]"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
