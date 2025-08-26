import { motion } from 'framer-motion';
import './Welcome.scss';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="animated-bg">
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i}
            className="bg-circle"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          />
        ))}
      </div>
      
      <div className="content">
        <motion.div 
          className="logo-container"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="logo">
            <span className="pill-icon">💊</span>
            <span className="logo-text">Pharmetrix</span>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Pharmetrix
        </motion.h1>
        
        <motion.div 
          className="tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p>Pharmetrix is a full-stack, cloud-connected, edge-enabled application designed to manage pharmaceutical stock efficiently while monitoring storage conditions in real-time. It integrates inventory management, POS, IoT sensors, computer vision, live streaming, and motion detection to provide a robust solution for pharmacy management.</p>
          <div className="goals">
            <h2>Goals</h2>
              <p>Efficient inventory and POS management.</p>
              <p>Real-time monitoring of storage conditions.</p>
              <p>Automated alerts for temperature violations and stock shortages.</p>
              <p>Optional computer vision for vial counting.</p>
              <p>Optional motion detection for security and monitoring.</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="coming-soon"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="badge">
            <span>Experience the next-gen pharma ops</span>
          </div>
          <p>Real-time insights. Beautiful UI. Built for scale.</p>
        </motion.div>
        
        <motion.div 
          className="features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="feature">
            <div className="feature-icon">📊</div>
            <div className="feature-text">
              <h3>Real-time Monitoring</h3>
              <p>Track inventory levels and conditions in real-time</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <div className="feature-text">
              <h3>Computer Vision</h3>
              <p>Automated vial counting and verification</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🌡️</div>
            <div className="feature-text">
              <h3>Temperature Control</h3>
              <p>Monitor storage conditions with IoT sensors</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <p>© 2025 Pharmetrix — Prakhar Tripathi</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;