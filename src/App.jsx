import { useEffect, useRef, useState } from 'react'
import './App.css'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsOpen(false)
    setToast(`${file.name} added — analysis comes next!`)
    window.setTimeout(() => setToast(null), 3200)
  }

  return (
    <main className="screen">
      <div className="card">
        <span className="coconut" role="img" aria-label="coconut">
          🥥
        </span>
        <h1>Coconut Hair Counter</h1>
        <p className="subtitle">Let&apos;s find out how hairy your coconut is.</p>

        {!isOpen && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => setIsOpen(true)}
          >
            <span>＋</span>
            Add Coconut Image
          </button>
        )}

        {isOpen && (
          <div className="panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <p className="panel-title">Add your coconut</p>
              <button
                type="button"
                className="close-btn"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              className="option-card"
              onClick={() => galleryInputRef.current?.click()}
            >
              <span className="option-icon" aria-hidden="true">
                🖼️
              </span>
              <span className="option-copy">
                <strong>Choose from Gallery</strong>
                <small>JPG, PNG or WEBP</small>
              </span>
            </button>

            <button
              type="button"
              className="option-card"
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className="option-icon" aria-hidden="true">
                📷
              </span>
              <span className="option-copy">
                <strong>Capture Image</strong>
                <small>Snap a fresh coconut</small>
              </span>
            </button>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          hidden
          onChange={handleImageSelected}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleImageSelected}
        />
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  )
}

export default App