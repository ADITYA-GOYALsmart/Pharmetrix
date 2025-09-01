import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

// Small hook to detect mobile viewport width
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < breakpoint : false)
  
  // Update on resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}

export default function Auth() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const isMobile = useIsMobile(768)

  return (
    <main style={pageWrap} aria-labelledby="auth-title">
      {/* Background accents */}
      <div style={bgLayer} />
      <div style={bgAccentLeft} />
      <div style={bgAccentRight} />

      <div style={{ ...contentWrap, ...(isMobile ? contentWrapMobile : null) }}>
        {/* Left promo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ ...promoPane, ...(isMobile ? promoPaneMobile : null) }}
        >
          <div style={logoTile}>
            <img src="/title-logo.png" alt="Pharmetrix" style={{ height: 36 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <motion.h1 id="auth-title" style={{ ...promoTitle, ...(isMobile ? promoTitleMobile : null) }}>
            Manage stock. Monitor storage. Sell with confidence.
          </motion.h1>
          <motion.p style={{ ...promoText, ...(isMobile ? { textAlign: 'center' } : null) }}>
            A unified platform for inventory, POS, real‑time monitoring, and edge intelligence—built for modern pharmacies.
          </motion.p>

          <motion.ul variants={stagger} initial="hidden" animate="show" style={{ ...promoList, ...(isMobile ? promoListMobile : null) }}>
            {[
              'Barcode scanning & POS receipts',
              '24/7 temperature & humidity tracking',
              'Automated alerts and expiry management',
              'Optional computer vision & live streaming'
            ].map((item) => (
              <motion.li key={item} variants={fadeUp} style={{ ...promoListItem, ...(isMobile ? { justifyContent: 'center' } : null) }}>
                <span style={checkIcon}>✓</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>

          <div style={{ marginTop: 16, color: '#fff', opacity: 0.9, textAlign: isMobile ? 'center' : 'left' }}>
            <span>New here?</span>{' '}
            <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>Explore the landing page</Link>
          </div>
        </motion.div>

        {/* Right card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ ...card, ...(isMobile ? cardMobile : null) }}
        >
          <motion.div style={{ ...cardHeader, ...(isMobile ? { flexDirection: 'row' } : null) }}>
            <button
              type="button"
              onClick={() => setMode('signup')}
              aria-pressed={mode === 'signup'}
              style={{ ...tabBtn, ...(mode === 'signup' ? tabBtnActive : {}) }}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              aria-pressed={mode === 'login'}
              style={{ ...tabBtn, ...(mode === 'login' ? tabBtnActive : {}) }}
            >
              Sign In
            </button>
          </motion.div>

          <motion.form
            variants={stagger}
            initial="hidden"
            animate="show"
            onSubmit={(e) => e.preventDefault()}
            aria-describedby="auth-disclaimer"
            style={form}
          >
            {mode === 'signup' && (
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Full Name</span>
                <input type="text" placeholder="Jane Doe" required style={input} />
              </motion.label>
            )}

            <motion.label variants={fadeUp} style={label}>
              <span style={labelText}>Email</span>
              <input type="email" placeholder="you@example.com" required style={input} />
            </motion.label>

            <motion.label variants={fadeUp} style={label}>
              <span style={labelText}>Password</span>
              <input type="password" placeholder="••••••••" required style={input} />
            </motion.label>

            {mode === 'signup' && (
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Confirm Password</span>
                <input type="password" placeholder="••••••••" required style={input} />
              </motion.label>
            )}

            <motion.button
              variants={fadeUp}
              type="submit"
              style={submitBtn}
              disabled
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </motion.button>

            <motion.p variants={fadeUp} id="auth-disclaimer" style={disclaimer}>
              This is an early preview. Backend integration is in progress—{mode === 'signup' ? 'account creation' : 'sign‑in'} may not be available yet. <strong>Coming Soon</strong>.
            </motion.p>
          </motion.form>
        </motion.div>
      </div>
    </main>
  )
}

// Styles
const pageWrap: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  display: 'grid',
  alignItems: 'center',
  background: 'linear-gradient(120deg, color-mix(in srgb, var(--secondary) 12%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
}

const bgLayer: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'var(--bg)'
}

const bgAccentLeft: React.CSSProperties = {
  position: 'absolute', left: '-10%', top: '-10%', width: 480, height: 480, borderRadius: '50%',
  background: 'radial-gradient(closest-side, color-mix(in srgb, var(--secondary) 22%, transparent), transparent 70%)'
}

const bgAccentRight: React.CSSProperties = {
  position: 'absolute', right: '-5%', bottom: '-5%', width: 520, height: 520, borderRadius: '50%',
  background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)'
}

const contentWrap: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '2rem',
  padding: '3rem 1rem',
  width: 'min(1200px, 100%)',
  margin: '0 auto'
}

const contentWrapMobile: React.CSSProperties = {
  gridTemplateColumns: '1fr',
  gap: '1rem',
}

const promoPane: React.CSSProperties = {
  color: '#fff',
  padding: '2rem',
  borderRadius: 16,
  background: 'linear-gradient(160deg, var(--primary), var(--primary-700))',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  border: '1px solid color-mix(in srgb, var(--primary) 30%, #ffffff)',
}

const promoPaneMobile: React.CSSProperties = {
  textAlign: 'center',
}

const logoTile: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 14,
  padding: '10px 12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  marginBottom: 16,
}

const promoTitle: React.CSSProperties = {
  color: '#fff',
  fontSize: '2rem',
  lineHeight: 1.2,
}

const promoTitleMobile: React.CSSProperties = {
  fontSize: '1.6rem',
}

const promoText: React.CSSProperties = {
  marginTop: 8,
  color: 'rgba(255,255,255,0.9)'
}

const promoList: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '1rem 0 0',
  display: 'grid',
  gap: '.5rem'
}

const promoListMobile: React.CSSProperties = {
  justifyItems: 'center',
}

const promoListItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '.6rem'
}

const checkIcon: React.CSSProperties = {
  display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 999,
  background: 'color-mix(in srgb, var(--secondary) 40%, #ffffff)', color: '#0b142a', fontWeight: 900
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 16,
  boxShadow: 'var(--shadow)',
  padding: '1.25rem',
  alignSelf: 'center'
}

const cardMobile: React.CSSProperties = {
  maxWidth: 600,
  width: '100%',
  margin: '0 auto',
}

const cardHeader: React.CSSProperties = {
  display: 'flex', gap: '.5rem', marginBottom: '1rem'
}

const tabBtn: React.CSSProperties = {
  flex: 1,
  padding: '.75rem 1rem',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: '#fff',
  color: 'var(--text)',
  fontWeight: 700
}

const tabBtnActive: React.CSSProperties = {
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 92%, #ffffff), var(--primary-700))',
  color: '#fff',
  borderColor: 'var(--primary)'
}

const form: React.CSSProperties = {
  display: 'grid', gap: '.85rem'
}

const label: React.CSSProperties = {
  display: 'grid', gap: '.35rem'
}

const labelText: React.CSSProperties = {
  color: 'var(--text)', fontWeight: 700
}

const input: React.CSSProperties = {
  padding: '.8rem 1rem',
  borderRadius: 12,
  border: '1px solid var(--border)',
  outline: 'none'
}

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: '.9rem 1rem',
  borderRadius: 12,
  border: '1px solid var(--primary)',
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 92%, #ffffff), var(--primary-700))',
  color: '#fff',
  fontWeight: 800,
  cursor: 'not-allowed',
  opacity: 0.9
}

const disclaimer: React.CSSProperties = {
  marginTop: '.25rem', color: '#6b7280'
}