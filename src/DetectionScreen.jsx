import { useEffect, useState } from 'react'
import { detectFibres } from './fibreDetection.js'
import './DetectionScreen.css'

const STATUS_MESSAGES = [
  'Scanning the coconut surface...',
  'Examining the fibres...',
  'Counting visible hairs...',
  'Almost finished...',
]

const MIN_ANALYSIS_MS = 3400

function taglineFor(count) {
  if (count < 100) return 'Getting a little fuzzy! 🥥'
  if (count < 180) return 'That\u2019s a lot of coconut hair! 🥥'
  return 'A gloriously hairy coconut! 🥥'
}

function DetectionScreen({ imageSrc, onReset, onToast }) {
  const [phase, setPhase] = useState('analyzing')
  const [messageIndex, setMessageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [imageAspect, setImageAspect] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const startedAt = Date.now()
    const messageTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length)
    }, 800)

    detectFibres(imageSrc)
      .then((detection) => {
        const elapsed = Date.now() - startedAt
        const remaining = Math.max(0, MIN_ANALYSIS_MS - elapsed)
        window.setTimeout(() => {
          if (cancelled) return
          setResult(detection)
          setPhase('done')
        }, remaining)
      })
      .catch(() => {
        const elapsed = Date.now() - startedAt
        const remaining = Math.max(0, MIN_ANALYSIS_MS - elapsed)
        window.setTimeout(() => {
          if (cancelled) return
          setPhase('error')
        }, remaining)
      })

    return () => {
      cancelled = true
      window.clearInterval(messageTimer)
    }
  }, [imageSrc, retryCount])

  const shareResult = async () => {
    if (!result) return
    const text = `My coconut has ${result.fibreCount} fibres! ${taglineFor(result.fibreCount)}`

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

  const aspectRatio = result?.width
    ? `${result.width} / ${result.height}`
    : imageAspect ?? '4 / 3'

  return (
    <main className="screen">
      <div className="detect-card">
        <div className="detect-image" style={{ aspectRatio }}>
          <img
            src={imageSrc}
            alt="Coconut"
            onLoad={(event) =>
              setImageAspect(
                event.currentTarget.naturalWidth /
                  event.currentTarget.naturalHeight,
              )
            }
          />
          {phase === 'analyzing' && (
            <div className="scan-layer" aria-hidden="true">
              <div className="scan-dim" />
              <div className="scan-beam" />
            </div>
          )}
        </div>

        {phase === 'analyzing' && (
          <>
            <h1 className="detect-title">Analyzing your coconut... 🥥</h1>
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
                <span className="count-number">{result.fibreCount}</span>
                <span className="fibre-label">FIBRES</span>
              </div>
              <p className="result-tagline">
                {taglineFor(result.fibreCount)}
              </p>
              {result.confidence != null && (
                <div className="confidence">
                  <div className="confidence-row">
                    <span>AI Confidence</span>
                    <span>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div className="confidence-bar" aria-hidden="true">
                    <span style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                </div>
              )}
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

        {phase === 'error' && (
          <div className="error-card">
            <p className="error-heading">
              We couldn&apos;t analyze this coconut right now 🥥
            </p>
            <p className="error-sub">
              Something went wrong while reaching the AI service.
            </p>
            <div className="detect-actions">
              <button
                type="button"
                className="recount-btn"
                onClick={() => {
                  setMessageIndex(0)
                  setPhase('analyzing')
                  setResult(null)
                  setRetryCount((n) => n + 1)
                }}
              >
                Try Again
              </button>
              <button type="button" className="share-btn" onClick={onReset}>
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default DetectionScreen