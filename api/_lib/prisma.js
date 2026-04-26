import * as dotenv from 'dotenv'
import { join } from 'path'
dotenv.config({ path: join(process.cwd(), '.env') })

import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

import ws from 'ws'
neonConfig.webSocketConstructor = ws

// HARDCODED JUST FOR SEEDING
const connectionString = "postgresql://neondb_owner:npg_1oJ8azHKVtMA@ep-sweet-meadow-abitnrgk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
