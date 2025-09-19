import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
}

export default function Legal() {
  return (
    <main className="container">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>Legal</motion.h1>
      <motion.p className="subhead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}>
        Our commitment to transparency and security. Below are outlines of our core legal documents.
      </motion.p>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="terms-title" style={sectionStyle}>
        <h2 id="terms-title">Terms of Service</h2>
        <p>These terms govern your use of Pharmetrix. They cover acceptable use, limitations of liability, disclaimers, and termination policies. The final Terms will include clear guidance on user responsibilities, data usage, and platform availability.</p>
        <ul style={listStyle}>
          <li>Acceptable use and prohibited activities</li>
          <li>Subscription, billing, and service levels</li>
          <li>Liability limits and dispute resolution</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="privacy-title" style={sectionStyle}>
        <h2 id="privacy-title">Privacy Policy</h2>
        <p>We respect your privacy. We will outline what data we collect, how we use it, how long we retain it, and your rights. We aim to collect only what is needed for service functionality and quality.</p>
        <ul style={listStyle}>
          <li>Data categories: account, operational, telemetry</li>
          <li>Use cases: authentication, analytics, reliability</li>
          <li>Retention, deletion, and user rights</li>
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} aria-labelledby="security-title" style={sectionStyle}>
        <h2 id="security-title">Security</h2>
        <p>Security is built into our process—from design to deployment. We will publish our security practices, incident response, and disclosure policies. Our goal is to maintain confidentiality, integrity, and availability.</p>
        <ul style={listStyle}>
          <li>Secure development lifecycle and code review</li>
          <li>Encryption in transit and at rest (where applicable)</li>
          <li>Incident response and responsible disclosure</li>
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