import * as dotenv from 'dotenv'
import { join } from 'path'
dotenv.config({ path: join(process.cwd(), '.env') })

import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

import ws from 'ws'
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment.')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
