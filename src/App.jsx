
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import CharacterGallery from './components/CharacterGallery'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setError(error.message)
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!active) return
        setSession(newSession)
        setLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) setError(error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
  }

  if (loading) {
    return <main className="auth-page">Cargando...</main>
  }

  if (session) {
    return (
      <CharacterGallery
        user={session.user}
        onLogout={signOut}
      />
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">STAR WARS EXPLORER</div>
        <p className="subtitle">
          Explora una galaxia muy, muy lejana
        </p>

        <h1>Comienza tu aventura</h1>
        <p>
          Inicia sesión para explorar los personajes
          de Star Wars.
        </p>

        <button onClick={signInWithGoogle}>
          Continuar con Google
        </button>

        {error && <p className="error">{error}</p>}
      </section>
    </main>
  )
}

export default App
