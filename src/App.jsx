import { useEffect, useRef, useState } from 'react'
import CameraCapture from './CameraCapture.jsx'
import DetectionScreen from './DetectionScreen.jsx'
import Header from './Header.jsx'
import './App.css'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function App() {
  const [view, setView] = useState('start')
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [detectionImage, setDetectionImage] = useState(null)
  const galleryInputRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200)
  }

  const startDetection = (imageSrc) => {
    setDetectionImage(imageSrc)
    setView('detect')
  }

  const handleGallerySelected = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsOpen(false)
    const reader = new FileReader()
    reader.onload = () => startDetection(reader.result)
    reader.onerror = () => showToast("Couldn't read that image. Try another one.")
    reader.readAsDataURL(file)
  }

  const handleUsePhoto = (imageSrc) => {
    setCameraOpen(false)
    startDetection(imageSrc)
  }

  const handleReset = () => {
    setView('start')
    setDetectionImage(null)
    setToast(null)
  }

  const handleHome = () => {
    setIsOpen(false)
    setCameraOpen(false)
    handleReset()
  }

  const handleCount = () => {
    handleHome()
    setIsOpen(true)
  }

  return (
    <>
      <Header onHome={handleHome} onCount={handleCount} />
      <main className="screen">
      {view === 'start' && (
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
                onClick={() => setCameraOpen(true)}
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
            onChange={handleGallerySelected}
          />
        </div>
      )}

      {view === 'detect' && detectionImage && (
        <DetectionScreen
          imageSrc={detectionImage}
          onReset={handleReset}
          onToast={showToast}
        />
      )}

      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={handleUsePhoto}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      </main>
    </>
  )
}

export default App