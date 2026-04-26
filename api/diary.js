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
      const entries = await prisma.diaryEntry.findMany({
        orderBy: { fecha: 'desc' }
      })
      return res.status(200).json(entries)
    }

    if (req.method === 'POST') {
      // Create or update (upsert) based on fecha
      const { fecha, notas, humor, horas_sueno, ejercicio } = req.body
      
      if (!fecha) {
        return res.status(400).json({ error: 'Fecha is required' })
      }

      const entry = await prisma.diaryEntry.upsert({
        where: { fecha },
        update: {
          notas,
          humor,
          horas_sueno,
          ejercicio
        },
        create: {
          fecha,
          notas,
          humor,
          horas_sueno,
          ejercicio
        }
      })
      
      return res.status(201).json(entry)
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'ID is required' })
      
      await prisma.diaryEntry.delete({
        where: { id }
      })
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    console.error('Diary API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error', details: error.message })
  }
}
