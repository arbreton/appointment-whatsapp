import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRICES, SERVICE_TYPES } from '../constants'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-fresia-cream overflow-x-hidden selection:bg-fresia-rose/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center glass-morphism">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-serif text-xl font-bold tracking-tight text-fresia-dark uppercase">FRESIA <span className="font-light text-fresia-rose">AESTHETIC</span></span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-fresia-dark/70">
          <a href="#services" className="hover:text-fresia-rose transition-colors">Servicios</a>
          <a href="#contact" className="hover:text-fresia-rose transition-colors">Contacto</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-premium py-2 px-6 text-[10px] uppercase tracking-widest hidden sm:block">
            Reservar
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-fresia-dark p-2 text-2xl"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-fresia-cream/95 backdrop-blur-xl z-[40] md:hidden flex flex-col items-center justify-center gap-12 animate-fade-in">
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-fresia-dark hover:text-fresia-rose">Servicios</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-fresia-dark hover:text-fresia-rose">Contacto</a>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-premium py-4 px-12 text-sm">Reservar Cita</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/hero.png"
            alt="Fresia Aesthetic Interior"
            className="w-full h-full object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-fresia-cream/20 via-transparent to-fresia-cream"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-in">
          <span className="uppercase tracking-[0.3em] text-fresia-rose font-semibold mb-4 block text-[10px]">Experiencia de Lujo</span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-fresia-dark mb-6 leading-tight">
            Eleva tu <span className="italic">Belleza Natural</span>
          </h1>
          <p className="text-base md:text-xl text-fresia-dark/70 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Indulge en tratamientos estéticos de alta gama y lujo sin igual en el corazón de la ciudad.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" className="btn-premium">
              Agendar Mi Escape
            </Link>
            <a href="#services" className="btn-outline">
              Ver Servicios
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding bg-white relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fresia-cream to-transparent pointer-events-none"></div>

        <div className="text-center mb-20 relative">
          <span className="font-serif italic text-fresia-rose text-2xl mb-2 block">Nuestra Colección</span>
          <h2 className="text-4xl md:text-6xl font-serif text-fresia-dark">Servicios Exclusivos</h2>
          <div className="w-24 h-1 bg-fresia-gold mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {SERVICE_TYPES.map((service, index) => (
            <div
              key={service.id}
              className="group glass-card p-1 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-[22px] p-8 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-fresia-rose-light flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {service.id === 'manicure' ? '💅' :
                    service.id === 'pedicure' ? '🦶' :
                      service.id === 'nails' ? '✨' :
                        service.id === 'gel' ? '💖' :
                          service.id === 'manicure_pedicure' ? '🌟' :
                            service.id === 'fill_in' ? '✨' : '🌸'}
                </div>
                <h3 className="text-2xl font-serif text-fresia-dark mb-3">{service.name}</h3>
                <p className="text-fresia-dark/60 font-light mb-6 text-sm leading-relaxed">
                  {service.id === 'manicure' ? 'Manos impecables con un acabado artesanal de alta durabilidad.' :
                    service.id === 'pedicure' ? 'Un ritual de relajación y cuidado profundo para tus pies.' :
                      service.id === 'nails' ? 'Extensiones magistrales diseñadas para destacar tu elegancia.' :
                        service.id === 'gel' ? 'Brillo espejo y color vibrante que perdura por semanas.' :
                          service.id === 'manicure_pedicure' ? 'La experiencia completa de cuidado para manos y pies.' :
                            service.id === 'fill_in' ? 'Mantén la perfección de tu set con nuestro servicio de retoque.' : 'Cuidado especializado para tu belleza.'}
                </p>
                <div className="mt-auto">
                  <span className="text-xs uppercase tracking-widest text-fresia-gold font-bold mb-1 block">Desde</span>
                  <span className="text-3xl font-serif text-fresia-dark">${PRICES[service.id]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-fresia-dark text-fresia-cream py-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fresia-rose/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fresia-gold/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
            "La estética no es solo apariencia, es un <span className="italic text-fresia-gold">estado mental</span>."
          </h2>
          <p className="text-fresia-cream/60 font-light tracking-wide uppercase text-sm">
            Diseñamos experiencias que trascienden lo visual
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-fresia-cream">
        <div className="glass-card rounded-[40px] overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-20 bg-white">
            <h2 className="text-4xl font-serif text-fresia-dark mb-6">Concierge</h2>
            <p className="text-fresia-dark/60 font-light mb-10 leading-relaxed">
              ¿Deseas una consulta personalizada o tienes alguna petición especial? Nuestro equipo de conserjería está a tu disposición.
            </p>
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-fresia-gold/30 flex items-center justify-center text-fresia-gold">📍</div>
                <span className="text-fresia-dark font-light">Calle de la Belleza #123, Colonia Luxury</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-fresia-gold/30 flex items-center justify-center text-fresia-gold">📱</div>
                <span className="text-fresia-dark font-light">+52 (618) 123 4567</span>
              </div>
            </div>
            <a
              href="https://wa.me/5216181234567"
              className="btn-premium inline-block text-center"
            >
              Hablar con un Especialista
            </a>
          </div>
          <div className="lg:w-1/2 relative min-h-[400px]">
            <img
              src="/assets/images/hero.png"
              alt="Fresia Aesthetic Details"
              className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
            />
            <div className="absolute inset-0 bg-fresia-rose/10 mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-fresia-gold/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-serif text-xl font-bold tracking-tight text-fresia-dark uppercase">FRESIA</span>
          </div>
          <div className="text-fresia-dark/40 text-xs tracking-widest uppercase">
            © 2024 FRESIA AESTHETIC. Elevando estándares.
          </div>
          <div className="flex gap-6">
            <a href="#" className="w-10 h-10 rounded-full border border-fresia-dark/10 flex items-center justify-center hover:bg-fresia-dark hover:text-white transition-all text-sm">IG</a>
            <a href="#" className="w-10 h-10 rounded-full border border-fresia-dark/10 flex items-center justify-center hover:bg-fresia-dark hover:text-white transition-all text-sm">FB</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
