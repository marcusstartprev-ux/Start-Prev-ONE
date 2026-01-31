import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header>
        <h2>Start Prev ONE</h2>
      </header>
      <main>{children}</main>
    </div>
  )
}