import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Decorative flowers background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-pink-200 text-8xl opacity-40">🌸</div>
        <div className="absolute top-40 right-20 text-rose-200 text-7xl opacity-40">🌺</div>
        <div className="absolute top-60 left-1/4 text-fuchsia-200 text-6xl opacity-40">🌷</div>
        <div className="absolute top-80 right-1/3 text-pink-200 text-6xl opacity-40">💐</div>
        <div className="absolute bottom-40 left-20 text-rose-200 text-7xl opacity-40">🌸</div>
        <div className="absolute bottom-20 right-10 text-fuchsia-200 text-8xl opacity-40">🌺</div>
      </div>

      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="text-7xl">💅✨</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            Cafe Encanta Nails
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tus uñas perfectas, a solo un clic ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform"
            >
              💅 Agendar Cita
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3">
            <span className="text-3xl">✨</span> 
            Nuestros Servicios
            <span className="text-3xl">✨</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manicure */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">💅</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Manicure</h3>
              <p className="text-gray-600 text-center mb-4">Manos perfectas y cuidadas</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$35</p>
            </div>

            {/* Pedicure */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">🦶</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Pedicure</h3>
              <p className="text-gray-600 text-center mb-4">Pies suaves y hermosos</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$40</p>
            </div>

            {/* Uñas Acrílicas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">✨</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Uñas Acrílicas</h3>
              <p className="text-gray-600 text-center mb-4">Uñas largas y elegantes</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$55</p>
            </div>

            {/* Uñas Gel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">💖</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Uñas Gel</h3>
              <p className="text-gray-600 text-center mb-4">Natural look con duración</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$50</p>
            </div>

            {/* Mani + Pedi */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">🌟</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Mani + Pedi</h3>
              <p className="text-gray-600 text-center mb-4">Combo completo</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$65</p>
            </div>

            {/* Relleno */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-pink-100 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="text-5xl mb-4 text-center">💅</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Relleno</h3>
              <p className="text-gray-600 text-center mb-4">Mantenimiento de uñas</p>
              <p className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$35</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center gap-3">
            📱 Contáctanos
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100">
            <p className="text-gray-600 mb-6">
              ¿Tienes preguntas? ¡Escríbenos por WhatsApp!
            </p>
            <a
              href="https://wa.me/5216181234567?text=Hola,%20me%20interesan%20sus%20servicios%20de%20uñas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <span className="text-2xl">💬</span>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl font-bold mb-2">✨ Cafe Encanta Nails ✨</p>
          <p className="text-pink-100">Tus uñas merecen lo mejor 💅</p>
          <p className="text-pink-100 text-sm mt-4">
            © 2024 Cafe Encanta Nails. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
