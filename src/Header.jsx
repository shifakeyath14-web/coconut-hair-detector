import { useState } from 'react'
import './Header.css'

const NAV_LINKS = ['Home', 'How It Works', 'About']

function Header({ onHome, onCount }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const goHome = () => {
    setMenuOpen(false)
    onHome()
  }

  const startCount = () => {
    setMenuOpen(false)
    onCount()
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="logo"
          onClick={goHome}
          aria-label="Coconut Hair Counter home"
        >
          <span className="logo-icon" aria-hidden="true">
            🥥
          </span>
          <span className="logo-text">Coconut Hair Counter</span>
        </button>

        <nav className="header-nav" aria-label="Primary">
          {NAV_LINKS.map((label) => (
            <button type="button" key={label} className="nav-link" onClick={goHome}>
              {label}
            </button>
          ))}
          <button type="button" className="header-cta" onClick={startCount}>
            Count a Coconut 🥥
          </button>
        </nav>

        <button
          type="button"
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {NAV_LINKS.map((label) => (
            <button
              type="button"
              key={label}
              className="mobile-link"
              onClick={goHome}
            >
              {label}
            </button>
          ))}
          <button type="button" className="mobile-cta" onClick={startCount}>
            Count a Coconut 🥥
          </button>
        </nav>
      )}
    </header>
  )
}

export default Header