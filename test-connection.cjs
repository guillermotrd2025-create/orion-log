const { Pool } = require('pg')

const connectionString = "postgresql://neondb_owner:npg_1oJ8azHKVtMA@ep-sweet-meadow-abitnrgk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

const pool = new Pool({
  connectionString,
})

async function testConnection() {
  try {
    console.log("Probando conexión a Neon...")
    const res = await pool.query('SELECT NOW() as time, current_database() as db')
    console.log("✅ Conexión exitosa a la base de datos:", res.rows[0].db)
    console.log("Hora del servidor:", res.rows[0].time)
    process.exit(0)
  } catch (err) {
    console.error("❌ Error de conexión:", err.message)
    process.exit(1)
  }
}

testConnection()
