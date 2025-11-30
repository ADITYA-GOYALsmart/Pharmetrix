import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
}

export default function Development() {
  return (
    <main className="container">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>Development</motion.h1>
      <motion.p className="subhead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}>
        About the project, its vision, and how to get in touch.
      </motion.p>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="about-dev-title" style={sectionStyle}>
        <h2 id="about-dev-title">About Dev</h2>
        <p>Pharmetrix is built with a focus on reliability and clarity. The stack includes React + Vite for the frontend, Node + Express for the primary backend, and Python at the edge for sensors and computer vision.</p>
        <ul style={listStyle}>
          <li>Frontend: React, TypeScript, Vite, SCSS</li>
          <li>Backend: Node.js, Express, MongoDB</li>
          <li>Edge: Python, FastAPI/Flask, OpenCV</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="about-product-title" style={sectionStyle}>
        <h2 id="about-product-title">About Pharmetrix</h2>
        <p>Pharmetrix integrates inventory and POS with real-time monitoring and optional AI capabilities to reduce waste, ensure compliance, and improve operational efficiency.</p>
        <ul style={listStyle}>
          <li>Reduce spoilage with proactive alerts</li>
          <li>Streamline audits and expiry management</li>
          <li>Improve visibility across locations</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="contact-title" style={sectionStyle}>
        <h2 id="contact-title">Contact</h2>
        <p>Want to collaborate or share feedback? A contact form and social links will be added here.</p>
        <ul style={listStyle}>
          <li>Email: coming soon</li>
          <li>GitHub/Docs: coming soon</li>
          <li>Roadmap: coming soon</li>
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