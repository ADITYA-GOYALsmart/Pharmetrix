import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
}

export default function Support() {
  return (
    <main className="container">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>Support</motion.h1>
      <motion.p className="subhead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}>
        Resources to help you get started and master Pharmetrix.
      </motion.p>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="docs-title" style={sectionStyle}>
        <h2 id="docs-title">Docs</h2>
        <p>Documentation will include setup steps, connecting devices, configuring storage thresholds, and using the POS. You will find reference guides and troubleshooting tips.</p>
        <ul style={listStyle}>
          <li>Quickstart: install, configure, and run</li>
          <li>Connect a fridge sensor and calibrate</li>
          <li>Inventory import and barcode scanning</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="guides-title" style={sectionStyle}>
        <h2 id="guides-title">Guides</h2>
        <p>Step-by-step workflows to accomplish common tasks—from onboarding devices to managing batches, handling recalls, and reconciling stock.</p>
        <ul style={listStyle}>
          <li>Onboarding a new location and devices</li>
          <li>Setting thresholds and receiving alerts</li>
          <li>Daily sales workflow with POS</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="status-title" style={sectionStyle}>
        <h2 id="status-title">Status</h2>
        <p>The status dashboard will show the health of backend services and edge devices with live updates. Expect uptime metrics and incident history.</p>
        <ul style={listStyle}>
          <li>Service uptime and response times</li>
          <li>Edge device connectivity</li>
          <li>Incident timeline and resolutions</li>
        </ul>
      </motion.section>
    </main>
  )
}

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1rem',
  boxShadow: 'var(--shadow)',
  marginTop: '1rem'
}

const listStyle: React.CSSProperties = {
  margin: '0.5rem 0 0 1.25rem'
}