
import { useEffect, useState } from 'react'
import {
  Orbit, LogOut, ChevronLeft, ChevronRight,
  X, UserRound, LoaderCircle
} from 'lucide-react'
import { getCharacters } from '../services/characters'

const readable = (value) => {
  if (!value || value === 'unknown' || value === 'n/a') {
    return 'Desconocido'
  }
  return value
}

export default function CharacterGallery({ user, onLogout }) {
  const [characters, setCharacters] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCharacters() {
      setLoading(true)
      setError('')

      try {
        const result = await getCharacters(page)

        if (!active) return

        setCharacters(result.characters)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (err) {
        if (!active) return
        setError(err.message)
        setCharacters([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCharacters()

    return () => {
      active = false
    }
  }, [page])

  useEffect(() => {
    if (!selected) return

    const handleKey = (event) => {
      if (event.key === 'Escape') setSelected(null)
    }

    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [selected])

  return (
    <div className="galaxy-app">
      <header className="galaxy-nav">
        <div className="galaxy-logo">
          <Orbit size={27} />
          STAR WARS EXPLORER
        </div>

        <div className="galaxy-user">
          <span>
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <button onClick={onLogout} className="galaxy-logout">
            <LogOut size={17} /> Salir
          </button>
        </div>
      </header>

      <section className="galaxy-hero">
        <span className="galaxy-eyebrow">
          ARCHIVOS DE LA GALAXIA
        </span>
        <h1>Explora una galaxia muy, muy lejana</h1>
        <p>
          Descubre los personajes y sus historias a través
          de nuestros archivos galácticos.
        </p>
      </section>

      <main className="galaxy-main">
        <div className="galaxy-heading">
          <h2>Personajes de Star Wars</h2>
          {!loading && !error && (
            <span>{total} personajes</span>
          )}
        </div>

        {loading && (
          <div className="galaxy-loading" role="status">
            <LoaderCircle className="spinner" size={32} />
            <p>Cargando archivos galácticos...</p>
          </div>
        )}

        {error && (
          <div className="galaxy-error" role="alert">
            <p>No se pudieron cargar los personajes: {error}</p>
            <button onClick={() => setPage(1)}>
              Volver a la primera página
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="character-grid">
              {characters.map((character) => (
                <button
                  key={character.id}
                  className="character-card"
                  onClick={() => setSelected(character)}
                >
                  <div className="character-portrait">
                    <UserRound size={64} strokeWidth={1.2} />
                    <span className="character-number">
                      #{String(character.id).padStart(3, '0')}
                    </span>
                  </div>

                  <div className="character-info">
                    <h3>{character.name}</h3>

                    <div className="character-attribute">
                      <span>Género</span>
                      <strong>{readable(character.gender)}</strong>
                    </div>

                    <div className="character-attribute">
                      <span>Nacimiento</span>
                      <strong>{readable(character.birth_year)}</strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {characters.length === 0 && (
              <p>No se encontraron personajes.</p>
            )}

            {totalPages > 1 && (
              <div className="galaxy-pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <span>Página {page} de {totalPages}</span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="galaxy-footer">
        Star Wars Explorer — Proyecto académico con datos de SWAPI
      </footer>

      {selected && (
        <div
          className="galaxy-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <section
            className="galaxy-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalles de ${selected.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="galaxy-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Cerrar detalle"
            >
              <X size={23} />
            </button>

            <div className="galaxy-modal-header">
              <UserRound size={58} strokeWidth={1.1} />
              <h2>{selected.name}</h2>
              <p>Registro galáctico #{selected.id}</p>
            </div>

            <div className="galaxy-modal-body">
              {[
                ['Género', selected.gender],
                ['Nacimiento', selected.birth_year],
                ['Altura', selected.height === 'unknown'
                  ? 'Desconocida' : `${selected.height} cm`],
                ['Peso', selected.mass === 'unknown'
                  ? 'Desconocido' : `${selected.mass} kg`],
                ['Color de ojos', selected.eye_color],
                ['Color de cabello', selected.hair_color],
                ['Planeta de origen', selected.planets?.name],
              ].map(([label, value]) => (
                <div className="galaxy-detail" key={label}>
                  <span>{label}</span>
                  <strong>{readable(value)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
