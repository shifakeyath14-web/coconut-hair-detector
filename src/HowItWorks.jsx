import './HowItWorks.css'

const STEPS = [
  {
    number: 1,
    icon: '📸',
    title: 'Give Us a Coconut',
    text: 'Upload a coconut image from your gallery or capture one using your camera.',
  },
  {
    number: 2,
    icon: '🔍',
    title: 'We Analyze It',
    text: 'Our highly sophisticated and slightly questionable system searches the coconut for visible fibres.',
  },
  {
    number: 3,
    icon: '🥥',
    title: 'Get Your Hair Count',
    text: 'The detected coconut fibres are counted and displayed as your final Coconut Hair Score.',
  },
]

function HowItWorks({ onCount }) {
  return (
    <section className="page">
      <div className="page-head">
        <h1>How Does It Work? 🥥</h1>
        <p>A completely unnecessary scientific process for counting coconut hair.</p>
      </div>

      <div className="steps">
        {STEPS.map((step) => (
          <article className="step-card" key={step.number}>
            <span className="step-number">{step.number}</span>
            <span className="step-icon" aria-hidden="true">
              {step.icon}
            </span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <div className="fun-note">
        <p>Scientific usefulness: 0%</p>
        <p>Entertainment value: 100%</p>
      </div>

      <button type="button" className="page-cta" onClick={onCount}>
        Count a Coconut 🥥
      </button>
    </section>
  )
}

export default HowItWorks