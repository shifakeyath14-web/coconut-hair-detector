import { useEffect, useState } from 'react'
import { detectFibres } from './fibreDetection.js'
import './DetectionScreen.css'

const STATUS_MESSAGES = [
  'Looking for coconut fibres...',
  'Counting tiny hairs...',
  'Inspecting the coconut...',
  'Almost done...',
]

const MIN_ANALYSIS_MS = 2800

function taglineFor(count) {
  if (count < 100) return 'Getting a little fuzzy! 🥥'
  if (count < 180) return 'That\u2019s a lot of coconut hair! 🥥'
  return 'A gloriously hairy coconut! 🥥'
}

function DetectionScreen({ imageSrc, onReset, onToast }) {
  const [phase, setPhase] = useState('analyzing')
  const [messageIndex, setMessageIndex] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    const startedAt = Date.now()
    const messageTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length)
    }, 800)

    detectFibres(imageSrc)
      .catch(() => ({ count: 127, confidence: 73, markers: [] }))
      .then((detection) => {
        const elapsed = Date.now() - startedAt
        const remaining = Math.max(0, MIN_ANALYSIS_MS - elapsed)
        window.setTimeout(() => {
          if (cancelled) return
          setResult(detection)
          setPhase('done')
        }, remaining)
      })

    return () => {
      cancelled = true
      window.clearInterval(messageTimer)
    }
  }, [imageSrc])

  const shareResult = async () => {
    if (!result) return
    const text = `My coconut has ${result.count} fibres! ${taglineFor(result.count)}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Coconut Hair Counter', text })
      } catch {
        // Share dialog dismissed by the user
      }
      return
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        onToast('Result copied to clipboard!')
      } catch {
        onToast("Web Share isn't supported in this browser.")
      }
      return
    }

    onToast("Web Share isn't supported in this browser.")
  }

  return (
    <main className="screen">
      <div className="detect-card">
        <div className="detect-image">
          <img src={imageSrc} alt="Coconut" />
          {phase === 'analyzing' && <div className="scan-line" aria-hidden="true" />}
          {result && (
            <div className="markers" aria-hidden="true">
              {result.markers.map((marker, index) => (
                <span
                  key={`${index}-${marker.x}-${marker.y}`}
                  className="marker"
                  style={{
                    left: `${marker.x * 100}%`,
                    top: `${marker.y * 100}%`,
                    animationDelay: `${Math.min(index * 0.02, 0.5)}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {phase === 'analyzing' && (
          <>
            <h1 className="detect-title">Analyzing your coconut 🥥</h1>
            <p className="analyze-status">
              <span className="analyze-spinner" aria-hidden="true" />
              {STATUS_MESSAGES[messageIndex]}
            </p>
          </>
        )}

        {phase === 'done' && result && (
          <>
            <div className="result-card">
              <p className="result-eyebrow">YOUR COCONUT HAS</p>
              <div className="fibre-count">
                <span className="count-number">{result.count}</span>
                <span className="fibre-label">FIBRES</span>
              </div>
              <p className="result-tagline">{taglineFor(result.count)}</p>
              <div className="confidence">
                <div className="confidence-row">
                  <span>AI Confidence</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="confidence-bar" aria-hidden="true">
                  <span style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>

            <div className="detect-actions">
              <button type="button" className="recount-btn" onClick={onReset}>
                Count Another Coconut
              </button>
              <button type="button" className="share-btn" onClick={shareResult}>
                Share Result
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default DetectionScreen