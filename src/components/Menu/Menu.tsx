import React from 'react'
import Link from 'next/link'

type MenuItem = {
  key: string
  name: string
  path?: string
  children?: MenuItem[]
}

export default function Menu({ items }: { items: MenuItem[] }) {
  if (!items) return null
  return (
    <ul>
      {items.map((it) => (
        <li key={it.key}>
          {it.path ? <Link href={it.path}>{it.name}</Link> : it.name}
          {it.children && <Menu items={it.children} />}
        </li>
      ))}
    </ul>
  )
}