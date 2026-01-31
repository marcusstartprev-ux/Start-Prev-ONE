import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'

type MenuItem = {
  key: string
  name: string
  path?: string
  children?: MenuItem[]
}

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch(console.error)
  }, [])

  return (
    <Layout>
      <h1>Start-Prev-ONE</h1>
      <nav>
        {menu.map((m) => (
          <div key={m.key}>
            <strong>{m.name}</strong>
            <ul>
              {(m.children || []).map((c) => (
                <li key={c.key}>
                  {c.path ? <Link href={c.path}>{c.name}</Link> : c.name}
                  {c.children && (
                    <ul>
                      {c.children.map((cc) => (
                        <li key={cc.key}>{cc.path ? <Link href={cc.path}>{cc.name}</Link> : cc.name}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Layout>
  )
}