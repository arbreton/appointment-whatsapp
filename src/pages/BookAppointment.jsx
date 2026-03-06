import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentApi } from '../api'

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

  const serviceTypes = [
    { id: 'manicure', name: 'Manicure', price: 35 },
    { id: 'pedicure', name: 'Pedicure', price: 40 },
    { id: 'nails', name: 'Uñas (Completo)', price: 60 },
    { id: 'manicure_pedicure', name: 'Manicure + Pedicure', price: 70 },
    { id: 'nail_art', name: 'Arte de Uñas', price: 25 },
    { id: 'fill_in', name: 'Relleno', price: 45 },
    { id: 'removal', name: 'Remoción', price: 15 }
  ]

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
                  formData.paymentType === 'min_deposit' ? 10 : amount,
      paymentStatus: formData.paymentType === 'waitlist' ? 'none' : 'partial',
      status: formData.paymentType === 'waitlist' ? 'waitlist' : 'confirmed',
      notes: formData.notes
    }

    try {
      await appointmentApi.create(appointmentData)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Reservar Cita</h1>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Service Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">
                Selecciona Servicio
              </label>
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((service) => (
                  <label
                    key={service.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.serviceType === service.id
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
                    <div className="font-medium">{service.name}</div>
                    <div className="text-pink-600 font-semibold">${service.price}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Selecciona Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                className="input-field"
                required
              />
            </div>

            {/* Time */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Selecciona Hora
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input-field"
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
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-3">
                Opción de Pago
              </label>
              <div className="space-y-3">
                <label className={`flex p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentType === 'waitlist'
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="waitlist"
                    checked={formData.paymentType === 'waitlist'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Unirse a Lista de Espera</div>
                    <div className="text-sm text-gray-500">Paga después de tu cita</div>
                  </div>
                </label>

                <label className={`flex p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentType === 'min_deposit'
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="min_deposit"
                    checked={formData.paymentType === 'min_deposit'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Pagar Depósito Mínimo ($10)</div>
                    <div className="text-sm text-gray-500">Asegura tu lugar con un depósito</div>
                  </div>
                </label>

                <label className={`flex p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentType === 'full'
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === 'full'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Pagar Monto Completo</div>
                    <div className="text-sm text-gray-500">Paga el monto completo ahora</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Solicitudes Especiales (Opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="¿Alguna solicitud especial?"
                className="input-field h-24"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
