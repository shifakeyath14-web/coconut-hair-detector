import { useState } from 'react'
import './Header.css'

const NAV_LINKS = [
  { label: 'Home', target: 'home' },
  { label: 'How It Works', target: 'how' },
  { label: 'About', target: 'about' },
]

function Header({ onHome, onHow, onAbout, onCount }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = {
    home: onHome,
    how: onHow,
    about: onAbout,
  }

  const go = (target) => {
    setMenuOpen(false)
    navigate[target]()
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
          onClick={() => go('home')}
          aria-label="Coconut Hair Counter home"
        >
          <span className="logo-icon" aria-hidden="true">
            🥥
          </span>
          <span className="logo-text">Coconut Hair Counter</span>
        </button>

        <nav className="header-nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.label}
              className="nav-link"
              onClick={() => go(link.target)}
            >
              {link.label}
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
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.label}
              className="mobile-link"
              onClick={() => go(link.target)}
            >
              {link.label}
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