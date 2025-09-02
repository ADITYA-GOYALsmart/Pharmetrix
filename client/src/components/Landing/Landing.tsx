import './Landing.scss'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  { icon: '🧾', title: 'Inventory & POS', desc: 'Barcode scanning, batching, LIFO selling, receipts, and stock reconciliation.' },
  { icon: '🌡️', title: 'Real‑time Monitoring', desc: 'Edge sensors track temperature/humidity with live dashboard visibility.' },
  { icon: '⚠️', title: 'Automated Alerts', desc: 'Threshold‑based notifications for temp violations and low stock.' },
  { icon: '🧠', title: 'Computer Vision', desc: '12×12 vial grid counting with upgrade path to lightweight detection models.' },
  { icon: '🎥', title: 'Live Streaming', desc: 'Low‑latency camera feed from the fridge for continuous oversight.' },
  { icon: '🛰️', title: 'Edge + Cloud', desc: 'Raspberry Pi handles sensors/CV; cloud manages inventory, POS, and alerts.' },
]

const metrics = [
  { value: 'Real-Time', label: 'Temperature Tracking' },
  { value: '24/7', label: 'Monitoring' },
  { value: '99.9%', label: 'Uptime' },
  { value: 'Automated', label: 'Expiry Management' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
}

export default function Landing() {
  return (
    <>
      {/* Header */}
      <header className="header" role="banner">
        <div className="container">
          <div className="nav">
            <a href="#" className="brand" aria-label="Pharmetrix">
              <img className="brandLogo" src="/full-logo.png" alt="Pharmetrix" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              {/* <span className="brandName">Pharmetrix</span> */}
            </a>
            <nav className="links" aria-label="Primary">
              <a href="#features">Features</a>
              <a href="#metrics">Metrics</a>
              <Link className="button buttonPrimary" to="/get-started">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <motion.section className="section hero" aria-labelledby="hero-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="container heroGrid">
            <motion.div className="heroText" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <motion.h1 id="hero-title" className="h1" variants={fadeUp}>
                Smart Pharmaceutical Inventory Management
              </motion.h1>
              <motion.p className="lead" variants={fadeUp}>
                A full‑stack, cloud‑connected, edge‑enabled platform that unifies inventory & POS, real‑time storage monitoring, automated alerts, optional computer vision, and live streaming—engineered to streamline pharmacy operations.
              </motion.p>
              <motion.div className="heroCtas" variants={fadeUp}>
                <Link className="button buttonPrimary" to="/get-started">Get Started</Link>
                <a className="button buttonSecondary" href="#features">Explore Features</a>
              </motion.div>
            </motion.div>

            <motion.div className="heroVisual" aria-hidden="true" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}>
              <div className="visualCard">
                <div className="visualHeader">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="visualBody">
                  <div className="placeholderChart">
                    <div className="bar" style={{ height: '65%' }} />
                    <div className="bar" style={{ height: '88%' }} />
                    <div className="bar" style={{ height: '42%' }} />
                    <div className="bar" style={{ height: '72%' }} />
                  </div>
                  <div className="placeholderBadge">Coming Soon!</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features */}
        <section id="features" className="section" aria-labelledby="features-title">
          <div className="container">
            <h2 id="features-title" className="h2">Designed for modern pharmacy workflows</h2>
            <p className="subhead">
              Efficient inventory & POS, real‑time monitoring, proactive alerts, and optional intelligence—backed by a scalable edge + cloud architecture.
            </p>
            <div className="featuresGrid">
              {features.map((f) => (
                <motion.article key={f.title} className="featureCard" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                  <div className="featureIcon" aria-hidden="true">{f.icon}</div>
                  <h3 className="h3">{f.title}</h3>
                  <p className="featureDesc">{f.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics / Social Proof */}
        <section id="metrics" className="section metrics" aria-labelledby="metrics-title">
          <div className="container">
            <h2 id="metrics-title" className="sr-only">Key metrics</h2>
            <div className="metricsRow">
              {metrics.map((m) => (
                <motion.div key={m.label} className="metric" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                  <div className="metricValue">{m.value}</div>
                  <div className="metricLabel">{m.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA */}
        <section id="cta" className="section band" aria-labelledby="cta-title">
          <div className="container">
            <motion.div className="bandInner" initial={{ opacity: 0, scale: .98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }}>
              <h2 id="cta-title" className="h2">Streamline your pharmacy operations</h2>
              <p className="subhead">Onboard devices, monitor storage, sell with confidence—start now.</p>
              <Link className="button buttonPrimary" to="/get-started">Get Started</Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="footer" role="contentinfo">
        <div className="container footerGrid">
          <div className="footerBrand">
            <img className="footerLogo" src="/title-subtitle-logo.png" alt="Pharmetrix logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            {/* <span className="brandName">Pharmetrix</span> */}
            <p className="muted">Edge + Cloud for modern pharmaceutical workflows.</p>
          </div>

          <nav aria-label="Product">
            <h3 className="footerHeading">Product</h3>
            <ul className="footerList">
              <li><a href="#features">Features</a></li>
              <li><a href="#metrics">Metrics</a></li>
              <li><Link to="/get-started">Get Started</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="footerHeading">Development</h3>
            <ul className="footerList">
              <li><Link to="/development">About Dev</Link></li>
              <li><Link to="/development">About Pharmetrix</Link></li>
              <li><Link to="/development">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-label="Support">
            <h3 className="footerHeading">Support</h3>
            <ul className="footerList">
              <li><Link to="/support">Docs</Link></li>
              <li><Link to="/support">Guides</Link></li>
              <li><Link to="/support">Status</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="footerHeading">Legal</h3>
            <ul className="footerList">
              <li><Link to="/legal">Terms</Link></li>
              <li><Link to="/legal">Privacy</Link></li>
              <li><Link to="/legal">Security</Link></li>
            </ul>
          </nav>
        </div>
        <div className="copy">
          Copyright © {new Date().getFullYear()} Pharmetrix by Prakhar Tripathi. All rights reserved.
        </div>
      </footer>
    </>
  )
}