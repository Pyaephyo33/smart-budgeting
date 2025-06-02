import React from 'react'
import { useEffect, useState } from 'react'

const App = () => {
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMsg(data.message))
  }, [])

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '100px' }}>{msg || 'Loading...'}</h1>
    </div>
  )
}

export default App
