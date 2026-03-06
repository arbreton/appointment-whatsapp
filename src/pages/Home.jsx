import { Link } from 'react-router-dom'
import { PRICES } from '../constants'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Decorative flowers background - hidden on small mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-4 text-pink-200 text-5xl sm:text-6xl md:text-8xl opacity-30 sm:opacity-40">🌸</div>
        <div className="absolute top-20 right-4 text-rose-200 text-4xl sm:text-5xl md:text-7xl opacity-30 sm:opacity-40">🌺</div>
        <div className="absolute top-40 left-1/4 text-fuchsia-200 text-3xl sm:text-4xl md:text-6xl opacity-30 sm:opacity-40">🌷</div>
        <div className="hidden sm:block absolute top-60 right-1/3 text-pink-200 text-6xl opacity-40">💐</div>
        <div className="hidden md:block absolute bottom-40 left-20 text-rose-200 text-7xl opacity-40">🌸</div>
        <div className="absolute bottom-20 right-4 text-fuchsia-200 text-5xl sm:text-6xl md:text-8xl opacity-30 sm:opacity-40">🌺</div>
      </div>

      {/* Hero Section */}
      <div className="relative py-10 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-4 sm:mb-6">
            <span className="text-5xl sm:text-6xl md:text-7xl">💅✨</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent mb-4 sm:mb-6 drop-shadow-lg px-2">
            Fresia Aesthetic
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Tus uñas perfectas, a solo un clic ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform text-base sm:text-lg"
            >
              💅 Agendar Cita
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-10 sm:py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12 flex items-center justify-center gap-2 sm:gap-3 px-2">
            <span className="text-2xl sm:text-3xl">✨</span>
            Nuestros Servicios
            <span className="text-2xl sm:text-3xl">✨</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
            {/* Manicure */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">💅</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Manicure</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Manos perfectas y cuidadas</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.manicure}</p>
            </div>

            {/* Pedicure */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">🦶</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Pedicure</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Pies suaves y hermosos</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.pedicure}</p>
            </div>

            {/* Uñas Acrílicas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">✨</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Uñas Acrílicas</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Uñas largas y elegantes</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.nails}</p>
            </div>

            {/* Uñas Gel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">💖</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Uñas Gel</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Natural look con duración</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.gel}</p>
            </div>

            {/* Mani + Pedi */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">🌟</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Mani + Pedi</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Combo completo</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.manicure_pedicure}</p>
            </div>

            {/* Relleno */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">💅</div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2">Relleno</h3>
              <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">Mantenimiento de uñas</p>
              <p className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">${PRICES.fill_in}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-10 sm:py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center px-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center justify-center gap-2">
            📱 Contáctanos
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-pink-100">
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              ¿Tienes preguntas? ¡Escríbenos por WhatsApp!
            </p>
            <a
              href="https://wa.me/5216181234567?text=Hola,%20me%20interesan%20sus%20servicios%20de%20uñas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
            >
              <span className="text-xl sm:text-2xl">💬</span>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white py-6 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto text-center px-2">
          <p className="text-lg sm:text-xl font-bold mb-2">✨ Fresia Aesthetic ✨</p>
          <p className="text-pink-100 text-sm sm:text-base">Tus uñas merecen lo mejor 💅</p>
          <p className="text-pink-100 text-xs sm:text-sm mt-3 sm:mt-4">
            © 2024 Fresia Aesthetic. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
