// No need to import dotenv here, prisma.js handles it
import { prisma } from './api/_lib/prisma.js'
import { seedTrades, initialChallenge } from './src/data/initialState.js'

async function main() {
  console.log('Borrando datos existentes...')
  await prisma.trade.deleteMany({})
  await prisma.challenge.deleteMany({})

  console.log('Insertando Challenge Inicial...')
  const challenge = await prisma.challenge.create({
    data: {
      id: initialChallenge.id,
      nombre: initialChallenge.nombre,
      fecha_inicio: initialChallenge.fecha_inicio,
      resultado_final: initialChallenge.resultado_final,
      cuenta_usd: initialChallenge.cuenta_usd,
      objetivo_usd: initialChallenge.objetivo_usd,
      dd_max_usd: initialChallenge.dd_max_usd,
      limite_diario_usd: initialChallenge.limite_diario_usd,
      coste_cuenta: initialChallenge.coste_cuenta,
      dias_maximos: initialChallenge.dias_maximos,
    }
  })

  console.log('Insertando 15 Trades de prueba...')
  for (const t of seedTrades) {
    await prisma.trade.create({
      data: {
        ...t,
        challenge_id: challenge.id
      }
    })
  }

  console.log('¡Base de datos sembrada con éxito!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
