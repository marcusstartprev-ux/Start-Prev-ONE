import { NextRequest, NextResponse } from 'next/server'
import menus from '../../data/seed/menus.json'

export async function GET() {
  return NextResponse.json(menus)
}