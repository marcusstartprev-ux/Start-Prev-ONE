/**
 * Script to seed menus into Supabase. Usage:
 *  SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-menu.ts
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error('Set SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(1)
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabase = createClient(supabaseUrl, serviceKey)

  const file = path.join(process.cwd(), 'src/data/seed/menus.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const menus = JSON.parse(raw)

  for (const m of menus) {
    // upsert example table 'menus' expected in your Supabase
    const { data, error } = await supabase.from('menus').upsert(m)
    if (error) console.error('upsert error', error)
    else console.log('upserted', data)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
