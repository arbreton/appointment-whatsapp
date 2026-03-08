import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentApi } from '../api'
import { SERVICE_TYPES, DEPOSIT_PERCENTAGE, TIME_SLOTS, APPOINTMENT_DURATION_MINS } from '../constants'

export default function BookAppointment({ customer }) {
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    date: getTomorrowDate(),
    time: '10:00',
    serviceType: 'manicure',
    paymentType: 'waitlist',
    amount: SERVICE_TYPES.find(s => s.id === 'manicure')?.price || 0,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (formData.date) {
      fetchAppointmentsForDate(formData.date)
    }
  }, [formData.date])

  const fetchAppointmentsForDate = async (date) => {
    try {
      const data = await appointmentApi.getByDate(date)
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments for date:', err)
    }
  }

  const isSlotAvailable = (time) => {
    if (!formData.date) return true
    const slotDate = new Date(`${formData.date}T${time}:00`)
    const slotTime = slotDate.getTime()
    const DURATION_MS = APPOINTMENT_DURATION_MINS * 60 * 1000

    return !appointments.some(apt => {
      const aptTime = new Date(apt.appointmentDate).getTime()
      const isOverlap = Math.abs(slotTime - aptTime) < DURATION_MS
      return isOverlap && apt.status !== 'cancelled' && apt.status !== 'rejected'
    })
  }

  const handleServiceChange = (serviceId) => {
    const service = SERVICE_TYPES.find(s => s.id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
      amount: service ? service.price : 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSlotAvailable(formData.time)) {
      setError('Este horario ya no está disponible. Por favor elige otro.')
      return
    }

    setError('')
    setLoading(true)

    const selectedService = SERVICE_TYPES.find(s => s.id === formData.serviceType)
    const amount = selectedService ? selectedService.price : 0
    const localDate = new Date(`${formData.date}T${formData.time}:00`)

    const appointmentData = {
      customerPhone: customer.phone,
      customerName: customer.name,
      appointmentDate: localDate.toISOString(),
      serviceType: selectedService ? selectedService.name : formData.serviceType,
      paymentType: formData.paymentType,
      amount: amount,
      paidAmount: 0,
      paymentStatus: formData.paymentType === 'waitlist' ? 'none' : 'pending_payment',
      status: formData.paymentType === 'waitlist' ? 'waitlist' : 'confirmed',
      notes: formData.notes
    }

    try {
      if (formData.paymentType === 'waitlist') {
        await appointmentApi.create(appointmentData)
        navigate('/dashboard')
        return
      }

      const stripeAmount = formData.paymentType === 'min_deposit'
        ? Math.round(amount * DEPOSIT_PERCENTAGE)
        : amount;

      const paymentResponse = await fetch('/.netlify/functions/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: stripeAmount,
          customerName: appointmentData.customerName,
          serviceType: appointmentData.serviceType,
          appointmentData: {
            ...appointmentData,
            amount: String(appointmentData.amount),
            paidAmount: '0',
            paymentStatus: 'pending_payment',
            status: 'confirmed',
          }
        })
      });

      const paymentData = await paymentResponse.json();
      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error(paymentData.error || 'Error al iniciar el pago');
      }
    } catch (err) {
      setError(err.message || 'Error al reservar. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const availableSlots = TIME_SLOTS.filter(isSlotAvailable)

  return (
    <div className="min-h-screen bg-fresia-cream pb-20 selection:bg-fresia-rose/30">
      {/* Navigation */}
      <nav className="p-6 sticky top-0 z-50 glass-morphism flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-fresia-dark/50 hover:text-fresia-rose transition-colors uppercase tracking-[0.2em] text-[10px] font-black"
        >
          <span className="text-lg">←</span> Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-serif text-sm font-bold tracking-tight text-fresia-dark uppercase">FRESIA</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 animate-fade-in">
        <header className="text-center mb-12">
          <span className="font-serif italic text-fresia-rose text-xl sm:text-2xl mb-2 block">Reserva tu Experiencia</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-fresia-dark font-bold leading-tight">Agendar Nueva Cita</h1>
          <div className="w-12 h-1 bg-fresia-gold mx-auto mt-6"></div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Service Selection */}
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-fresia-dark/40 font-bold mb-6 border-b border-fresia-gold/20 pb-2">1. Selecciona el Servicio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceChange(service.id)}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 ${formData.serviceType === service.id
                    ? 'bg-fresia-dark text-white border-fresia-dark shadow-xl scale-[1.02]'
                    : 'bg-white border-fresia-gold/20 text-fresia-dark hover:border-fresia-rose'
                    }`}
                >
                  <div className={`text-2xl mb-4 ${formData.serviceType === service.id ? 'opacity-100' : 'opacity-50'}`}>
                    {service.id === 'manicure' ? '💅' :
                      service.id === 'pedicure' ? '🦶' :
                        service.id === 'nails' ? '✨' :
                          service.id === 'gel' ? '💖' :
                            service.id === 'manicure_pedicure' ? '🌟' :
                              service.id === 'fill_in' ? '✨' : '🌸'}
                  </div>
                  <h3 className="font-serif text-lg mb-1">{service.name}</h3>
                  <p className={`text-xs font-bold ${formData.serviceType === service.id ? 'text-fresia-gold' : 'text-fresia-rose'}`}>
                    ${service.price} MXN
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Date & Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-fresia-dark/40 font-bold mb-6 border-b border-fresia-gold/20 pb-2">2. Elige la Fecha</h2>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={getTomorrowDate()}
                className="input-premium bg-white shadow-inner"
                required
              />
            </section>

            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-fresia-dark/40 font-bold mb-6 border-b border-fresia-gold/20 pb-2">3. Elige la Hora</h2>
              <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto p-2 scrollbar-hide">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, time }))}
                    className={`py-3 rounded-lg border text-sm font-medium transition-all ${formData.time === time
                      ? 'bg-fresia-rose text-white border-fresia-rose shadow-md'
                      : 'bg-white border-fresia-gold/10 text-fresia-dark hover:border-fresia-gold'
                      }`}
                  >
                    {time}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <p className="col-span-3 text-center py-8 text-fresia-dark/40 italic text-sm">No hay horarios disponibles</p>
                )}
              </div>
            </section>
          </div>

          {/* Payment Section */}
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-fresia-dark/40 font-bold mb-6 border-b border-fresia-gold/20 pb-2">4. Modalidad de Pago</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'waitlist', label: 'Lista de Espera', desc: 'Paga en el salón' },
                { id: 'min_deposit', label: 'Depósito (20%)', desc: `Asegura tu lugar con $${Math.round(formData.amount * DEPOSIT_PERCENTAGE)}` },
                { id: 'full', label: 'Monto Total', desc: `Saldar $${formData.amount} ahora` }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: opt.id }))}
                  className={`p-6 rounded-2xl border text-left transition-all ${formData.paymentType === opt.id
                    ? 'bg-fresia-rose-light border-fresia-rose text-fresia-rose ring-2 ring-fresia-rose/20'
                    : 'bg-white border-fresia-gold/10 text-fresia-dark hover:border-fresia-gold'
                    }`}
                >
                  <div className="font-serif text-lg mb-1">{opt.label}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-fresia-dark/40 font-bold mb-6 border-b border-fresia-gold/20 pb-2">5. Notas Especiales (Opcional)</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Ej: ¿Prefieres algún estilo de diseño?"
              className="input-premium bg-white h-32 resize-none"
            />
          </section>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 italic">
              ✦ {error}
            </div>
          )}

          <div className="pt-8 border-t border-fresia-gold/20 flex flex-col items-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full max-w-md py-5 text-xl tracking-[0.2em] uppercase"
            >
              {loading ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
            <p className="mt-6 text-fresia-dark/30 text-[10px] uppercase tracking-[0.3em] font-medium">Fresia Aesthetic & Wellness</p>
          </div>
        </form>
      </main>
    </div>
  )
}
