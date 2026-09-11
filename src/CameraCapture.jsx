import { useEffect, useRef, useState } from 'react'
import './CameraCapture.css'

const getErrorMessage = (errorType) => {
  switch (errorType) {
    case 'denied':
      return 'Camera access is needed to capture your coconut 🥥'
    case 'unsupported':
      return 'Your browser doesn\u2019t support camera access.'
    case 'unavailable':
      return 'No camera device was found. Make sure one is connected.'
    default:
      return 'Couldn\u2019t start the camera. Please try again.'
  }
}

const cameraSupported =
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)

function CameraCapture({ onClose, onCapture }) {
  const [status, setStatus] = useState(cameraSupported ? 'loading' : 'error')
  const [errorType, setErrorType] = useState(cameraSupported ? 'unknown' : 'unsupported')
  const [attempt, setAttempt] = useState(0)
  const [capturedSrc, setCapturedSrc] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!cameraSupported) return

    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.play().catch(() => {})
        }
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        const name = err?.name
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setErrorType('denied')
        } else if (
          name === 'NotFoundError' ||
          name === 'DevicesNotFoundError' ||
          name === 'OverconstrainedError' ||
          name === 'NotReadableError'
        ) {
          setErrorType('unavailable')
        } else {
          setErrorType('unknown')
        }
        setStatus('error')
      })

    return () => {
      cancelled = true
      const stream = streamRef.current
      if (stream) {
        streamRef.current = null
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [attempt])

  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (video && stream && !video.srcObject) {
      video.srcObject = stream
      video.play().catch(() => {})
    }
  })

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCapturedSrc(canvas.toDataURL('image/jpeg', 0.92))
  }

  return (
    <div className="camera" role="dialog" aria-modal="true">
      <div className="camera-card">
        <div className="camera-header">
          <p className="camera-title">📷 Capture Image</p>
          <button
            type="button"
            className="close-btn"
            aria-label="Close camera"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {status === 'loading' && (
          <div className="camera-message">
            <span className="camera-spinner" aria-hidden="true" />
            <p>Starting your camera…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="camera-message">
            <span className="camera-error-emoji" aria-hidden="true">
              🥥
            </span>
            <p>{getErrorMessage(errorType)}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => {
                setStatus('loading')
                setAttempt((n) => n + 1)
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="camera-preview">
              {capturedSrc ? (
                <img src={capturedSrc} alt="Captured coconut" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted />
              )}
            </div>

            {capturedSrc ? (
              <div className="capture-actions">
                <button
                  type="button"
                  className="retake-btn"
                  onClick={() => setCapturedSrc(null)}
                >
                  Retake
                </button>
                <button
                  type="button"
                  className="use-btn"
                  onClick={() => onCapture(capturedSrc)}
                >
                  Use This Photo
                </button>
              </div>
            ) : (
              <button type="button" className="capture-btn" onClick={capturePhoto}>
                Capture Photo
              </button>
            )}
          </>
        )}

        <canvas ref={canvasRef} hidden />
      </div>
    </div>
  )
}

export default CameraCapture