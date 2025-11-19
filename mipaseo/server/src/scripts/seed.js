import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Pet, WalkRequest, Review } from '../models/index.js'

dotenv.config()

const seedData = {
  admin: {
    role: 'ADMIN',
    name: 'Administrador',
    email: 'admin@mipaseo.com',
    phone: '+54 11 0000 0000',
    password: 'admin123',
    address: 'Oficina Central, CABA'
  },
  owners: [
    {
      role: 'OWNER',
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+54 11 5000 0001',
      password: 'password123',
      address: 'Av. Libertador 1000, Recoleta, CABA'
    },
    {
      role: 'OWNER',
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+54 11 5000 0002',
      password: 'password123',
      address: 'Av. Scalabrini Ortiz 500, Palermo, CABA'
    },
    {
      role: 'OWNER',
      name: 'María Rodríguez',
      email: 'maria.rodriguez@email.com',
      phone: '+54 11 5000 0003',
      password: 'password123',
      address: 'Av. Cabildo 2000, Belgrano, CABA'
    }
  ],
  walkers: [
    {
      role: 'WALKER',
      name: 'Pedro Martínez',
      email: 'pedro.martinez@email.com',
      phone: '+54 11 4000 0001',
      password: 'password123',
      address: 'Av. Santa Fe 1234, Palermo, CABA',
      experienceYears: 3,
      bio: 'Amante de los animales con 3 años de experiencia paseando perros. Especializado en razas grandes y con mucha energía.',
      neighborhood: 'Palermo'
    },
    {
      role: 'WALKER',
      name: 'Laura Sánchez',
      email: 'laura.sanchez@email.com',
      phone: '+54 11 4000 0002',
      password: 'password123',
      address: 'Av. Corrientes 2000, Recoleta, CABA',
      experienceYears: 5,
      bio: 'Veterinaria y paseadora profesional. Me encanta cuidar mascotas y darles el ejercicio que necesitan.',
      neighborhood: 'Recoleta'
    },
    {
      role: 'WALKER',
      name: 'Javier Torres',
      email: 'javier.torres@email.com',
      phone: '+54 11 4000 0003',
      password: 'password123',
      address: 'Av. Cabildo 1500, Belgrano, CABA',
      experienceYears: 2,
      bio: 'Estudiante universitario que ama los perros. Disponible principalmente por las tardes y fines de semana.',
      neighborhood: 'Belgrano'
    }
  ],
  pets: [
    {
      name: 'Max',
      breed: 'Labrador Retriever',
      age: 3,
      weightKg: 30,
      routine: {
        walkTimes: ['08:00', '14:00', '20:00'],
        feedingNotes: 'Come dos veces al día, mañana y noche',
        specialCare: 'Le gusta mucho el agua, cuidado cerca de fuentes'
      },
      preferences: {
        sociable: true,
        needsMuzzle: false,
        soloWalks: false
      }
    },
    {
      name: 'Luna',
      breed: 'Border Collie',
      age: 2,
      weightKg: 22,
      routine: {
        walkTimes: ['07:30', '16:00', '21:00'],
        feedingNotes: 'Comida especial para perros activos',
        specialCare: 'Muy inteligente, necesita estimulación mental'
      },
      preferences: {
        sociable: true,
        needsMuzzle: false,
        soloWalks: false
      }
    },
    {
      name: 'Rocky',
      breed: 'Bulldog Francés',
      age: 4,
      weightKg: 12,
      routine: {
        walkTimes: ['09:00', '17:00'],
        feedingNotes: 'Dos comidas pequeñas al día',
        specialCare: 'Problemas respiratorios leves, no ejercicio intenso'
      },
      preferences: {
        sociable: false,
        needsMuzzle: false,
        soloWalks: true
      }
    },
    {
      name: 'Bella',
      breed: 'Golden Retriever',
      age: 5,
      weightKg: 28,
      routine: {
        walkTimes: ['08:00', '15:00', '19:30'],
        feedingNotes: 'Dieta baja en grasa por recomendación veterinaria',
        specialCare: 'Muy amigable con otros perros y niños'
      },
      preferences: {
        sociable: true,
        needsMuzzle: false,
        soloWalks: false
      }
    }
  ]
}

const clearDatabase = async () => {
  console.log('Limpiando base de datos...')
  await Promise.all([
    User.deleteMany({}),
    Pet.deleteMany({}),
    WalkRequest.deleteMany({}),
    Review.deleteMany({})
  ])
  console.log('Base de datos limpia')
}

const createUsers = async () => {
  console.log('Creando usuarios...')

  const users = []

  // Crear administrador
  const admin = new User(seedData.admin)
  await admin.hashPassword(seedData.admin.password)
  await admin.save()
  users.push(admin)
  console.log('Administrador creado')

  // Crear dueños
  for (const ownerData of seedData.owners) {
    const user = new User(ownerData)
    await user.hashPassword(ownerData.password)
    await user.save()
    users.push(user)
  }

  // Crear paseadores
  for (const walkerData of seedData.walkers) {
    const user = new User(walkerData)
    await user.hashPassword(walkerData.password)
    await user.save()
    users.push(user)
  }

  console.log(`${users.length} usuarios creados`)
  return users
}

const createPets = async (owners) => {
  console.log('Creando mascotas...')

  const pets = []

  for (let i = 0; i < seedData.pets.length; i++) {
    const petData = seedData.pets[i]
    const owner = owners[i % owners.length] // Distribuir mascotas entre dueños

    const pet = new Pet({
      ...petData,
      ownerId: owner._id
    })
    await pet.save()
    pets.push(pet)
  }

  console.log(`${pets.length} mascotas creadas`)
  return pets
}

const createWalkRequests = async (owners, walkers, pets) => {
  console.log('Creando solicitudes de paseo...')

  const walkRequests = []
  const now = new Date()

  // Solicitud pendiente
  const pendingRequest = new WalkRequest({
    ownerId: owners[0]._id,
    walkerId: walkers[0]._id,
    petId: pets[0]._id,
    scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Mañana
    durationMin: 60,
    notes: 'Primera vez, por favor tener cuidado con Max',
    status: 'PENDING'
  })
  await pendingRequest.save()
  walkRequests.push(pendingRequest)

  // Solicitud aceptada
  const acceptedRequest = new WalkRequest({
    ownerId: owners[1]._id,
    walkerId: walkers[1]._id,
    petId: pets[1]._id,
    scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
    durationMin: 45,
    notes: 'Luna es muy enérgica, necesita bastante ejercicio',
    status: 'ACCEPTED'
  })
  await acceptedRequest.save()
  walkRequests.push(acceptedRequest)

  // Solicitud completada (simular que fue programada ayer y completada)
  const completedRequest = new WalkRequest({
    ownerId: owners[2]._id,
    walkerId: walkers[0]._id,
    petId: pets[2]._id,
    scheduledAt: new Date(now.getTime() + 1 * 60 * 60 * 1000), // En 1 hora (para que no falle la validación)
    durationMin: 30,
    notes: 'Rocky no puede hacer ejercicio intenso',
    status: 'COMPLETED',
    walkerNotes: 'Todo perfecto, Rocky se portó muy bien'
  })
  await completedRequest.save()
  walkRequests.push(completedRequest)

  // Otra solicitud completada para tener más datos
  const completedRequest2 = new WalkRequest({
    ownerId: owners[0]._id,
    walkerId: walkers[1]._id,
    petId: pets[3]._id,
    scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // En 2 horas
    durationMin: 90,
    notes: 'Bella ama los parques y correr',
    status: 'COMPLETED',
    walkerNotes: 'Excelente paseo, Bella es un amor'
  })
  await completedRequest2.save()
  walkRequests.push(completedRequest2)

  console.log(`${walkRequests.length} solicitudes de paseo creadas`)
  return walkRequests
}

const createReviews = async (walkRequests) => {
  console.log('Creando reseñas...')

  const reviews = []

  // Buscar solicitudes completadas
  const completedRequests = walkRequests.filter(wr => wr.status === 'COMPLETED')

  for (const request of completedRequests) {
    const review = new Review({
      walkRequestId: request._id,
      ownerId: request.ownerId,
      walkerId: request.walkerId,
      rating: Math.floor(Math.random() * 2) + 4, // Rating entre 4 y 5
      comment: request.petId.toString().includes(request.petId.toString().slice(-1))
        ? 'Excelente servicio, muy recomendable. Mi mascota quedó muy feliz.'
        : 'Muy profesional y cariñoso con las mascotas. Definitivamente volveré a contratar.'
    })
    await review.save()
    reviews.push(review)
  }

  console.log(`${reviews.length} reseñas creadas`)
  return reviews
}

const seedDatabase = async () => {
  try {
    console.log('Iniciando seed de la base de datos...')

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Conectado a MongoDB')

    // Limpiar base de datos
    await clearDatabase()

    // Crear datos
    const users = await createUsers()
    const owners = users.filter(u => u.role === 'OWNER')
    const walkers = users.filter(u => u.role === 'WALKER')

    const pets = await createPets(owners)
    const walkRequests = await createWalkRequests(owners, walkers, pets)
    const reviews = await createReviews(walkRequests)

    console.log('\nSeed completado exitosamente!')
    console.log('\nResumen:')
    console.log(`Usuarios: ${users.length} (${owners.length} dueños, ${walkers.length} paseadores)`)
    console.log(`Mascotas: ${pets.length}`)
    console.log(`Solicitudes de paseo: ${walkRequests.length}`)
    console.log(`Reseñas: ${reviews.length}`)

    console.log('\nCredenciales de prueba:')
    console.log('Dueños:')
    owners.forEach(owner => {
      console.log(`  ${owner.email} / password123`)
    })
    console.log('Paseadores:')
    walkers.forEach(walker => {
      console.log(`  ${walker.email} / password123`)
    })

  } catch (error) {
    console.error('Error en seed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Desconectado de MongoDB')
    process.exit(0)
  }
}

// Ejecutar seed
seedDatabase()