import { Link, Navigate } from 'react-router-dom'
import { Heart, Shield, Clock, Star, Users, PawPrint, Target, Eye, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import AOS from 'aos'

const Home = () => {
  const { user } = useAuth()

  // Refrescar AOS cuando se monta el componente
  useEffect(() => {
    AOS.refresh()
  }, [])

  // Si el usuario está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Animaciones para las tarjetas de características
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Paseadores Verificados',
      description: 'Todos nuestros paseadores pasan por un proceso de verificación para garantizar la seguridad de tu mascota.'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Disponibilidad Flexible',
      description: 'Encuentra paseadores disponibles cuando los necesites, con horarios adaptados a tu rutina.'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Sistema de Reseñas',
      description: 'Lee las reseñas de otros dueños y comparte tu experiencia para ayudar a la comunidad.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Cuidado Personalizado',
      description: 'Cada mascota es única. Nuestros paseadores se adaptan a las necesidades específicas de tu compañero.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Regístrate',
      description: 'Crea tu cuenta como dueño o paseador en minutos.'
    },
    {
      number: '2',
      title: 'Conecta',
      description: 'Busca paseadores cercanos o encuentra mascotas que necesiten paseos.'
    },
    {
      number: '3',
      title: 'Programa',
      description: 'Agenda los paseos según tu disponibilidad y necesidades.'
    },
    {
      number: '4',
      title: 'Disfruta',
      description: 'Tu mascota disfruta de paseos seguros mientras tú tienes tranquilidad.'
    }
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 lg:py-32 relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Conecta con paseadores de mascotas{' '}
                <motion.span 
                  className="text-secondary-400"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0)",
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 0px rgba(255,255,255,0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  confiables
                </motion.span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
                Encuentra el paseador perfecto para tu mascota. Seguro, fácil y confiable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Comenzar ahora
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Acceder a mi cuenta
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-white/20 rounded-3xl blur-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                  whileHover={{ 
                    scale: 1.05,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <PawPrint className="h-64 w-64 text-white/80" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir MiPaseo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia para ti y tu mascota
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-all border border-gray-200 cursor-pointer group"
              >
                <motion.div 
                  className="text-primary-600 mb-4"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quiénes Somos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce más sobre nuestra misión y valores
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Misión */}
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
              data-aos="fade-right"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="bg-primary-100 rounded-lg p-3 mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target className="h-8 w-8 text-primary-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Conectar a dueños de mascotas con paseadores confiables y comprometidos, 
                facilitando el cuidado y bienestar de nuestros compañeros peludos. 
                Creemos que cada mascota merece paseos seguros, divertidos y adaptados 
                a sus necesidades, mientras sus dueños tienen la tranquilidad de saber 
                que están en buenas manos.
              </p>
            </motion.div>

            {/* Visión */}
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-200"
              data-aos="fade-left"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="bg-secondary-100 rounded-lg p-3 mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Eye className="h-8 w-8 text-secondary-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Ser la plataforma líder en Argentina para el cuidado de mascotas, 
                construyendo una comunidad sólida donde dueños y paseadores trabajen 
                juntos para garantizar el bienestar y la felicidad de cada mascota. 
                Aspiramos a crear un ecosistema de confianza mutua donde todos 
                puedan prosperar.
              </p>
            </motion.div>
          </div>

          {/* Valores */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
              Nuestros Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Shield className="h-8 w-8 text-primary-600" />, title: 'Confianza', description: 'Verificamos a todos nuestros paseadores y mantenemos un sistema transparente de reseñas para garantizar la seguridad de tu mascota.', bg: 'bg-primary-100' },
                { icon: <Heart className="h-8 w-8 text-secondary-600" />, title: 'Compromiso', description: 'Nos comprometemos con el bienestar de cada mascota, entendiendo que son parte de la familia y merecen el mejor cuidado posible.', bg: 'bg-secondary-100' },
                { icon: <Sparkles className="h-8 w-8 text-primary-600" />, title: 'Excelencia', description: 'Buscamos constantemente mejorar nuestros servicios y la experiencia tanto de dueños como de paseadores, siempre con altos estándares de calidad.', bg: 'bg-primary-100' }
              ].map((valor, index) => (
                <motion.div
                  key={index}
                  className="text-center bg-white rounded-xl p-6 shadow-md border border-gray-200 cursor-pointer"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  whileHover={{ 
                    y: -10,
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className={`${valor.bg} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {valor.icon}
                  </motion.div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{valor.title}</h4>
                  <p className="text-gray-600">
                    {valor.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En solo 4 pasos podrás empezar a usar MiPaseo
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                whileHover={{ scale: 1.1, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-2xl font-bold mb-4"
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.2
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Únete a nuestra comunidad y dale a tu mascota los paseos que se merece
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Crear cuenta gratis
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <Users className="h-12 w-12 mx-auto mb-2" />, title: 'Comunidad Activa', description: 'Conectamos dueños y paseadores en toda la ciudad' },
              { icon: <PawPrint className="h-12 w-12 mx-auto mb-2" />, title: 'Mascotas Felices', description: 'Miles de paseos exitosos y mascotas contentas' },
              { icon: <Star className="h-12 w-12 mx-auto mb-2" />, title: 'Alta Calificación', description: 'Paseadores verificados y con excelentes reseñas' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-8 shadow-md border border-gray-200"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-primary-600 mb-2"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {stat.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {stat.title}
                </h3>
                <p className="text-gray-600">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

