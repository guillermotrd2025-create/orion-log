import { prisma } from './_lib/prisma.js'

export default async function handler(req, res) {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const challenges = await prisma.challenge.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          trades: {
            orderBy: { fecha: 'asc' } // O por fecha de creación
          }
        }
      })
      return res.status(200).json(challenges)
    }

    if (req.method === 'POST') {
      const challenge = await prisma.challenge.create({
        data: req.body
      })
      return res.status(201).json(challenge)
    }

    if (req.method === 'PATCH') {
      const { id, ...data } = req.body
      const updated = await prisma.challenge.update({
        where: { id },
        data
      })
      return res.status(200).json(updated)
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error', details: error.message })
  }
}
