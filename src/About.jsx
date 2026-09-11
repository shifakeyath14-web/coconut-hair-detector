import './About.css'

const STATS = [
  { value: '0%', label: 'Useful' },
  { value: '100%', label: 'Unnecessary' },
  { value: '∞', label: 'Coconut Curiosity' },
]

function About({ onCount }) {
  return (
    <section className="page">
      <div className="about-content">
        <h1>About Coconut Hair Counter 🥥</h1>
        <p className="about-lead">
          “Coconut Hair Counter is a completely unnecessary website created to
          answer one very important question: How many hairs does a coconut
          have?”
        </p>
        <p className="about-sub">
          “Upload or capture a coconut, let our system inspect its visible
          fibres, and discover its totally unnecessary hair count.”
        </p>

        <section className="why-section">
          <h2>Why did we make this?</h2>
          <p>“We don’t really know.”</p>
          <p>
            “There are many useful technologies in the world. We decided to use
            them for something absolutely useless.”
          </p>
        </section>

        <div className="stats">
          {STATS.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <p className="about-footer">Made for absolutely no reason. 🥥</p>

        <button type="button" className="page-cta" onClick={onCount}>
          Count a Coconut 🥥
        </button>
      </div>
    </section>
  )
}

export default About