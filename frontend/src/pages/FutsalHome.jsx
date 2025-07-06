import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/FutsalHome.module.css'
import FutsalNavbar from '../components/FutsalNavbar'

const FutsalHome = () => {
  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <FutsalNavbar />

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.futsalText}>
              <span>F</span>
              <span>U</span>
              <span>T</span>
              <span>S</span>
              <span>A</span>
              <span>L</span>
            </div>
            <div className={styles.playersIllustration}>
              <img src="/FUTSALHOME/Screenshot 2025-05-15 231721.png" alt="Futsal Players" />
            </div>
            <div className={styles.taisaLogo}>7AISA</div>
          </div>
          <div className={styles.blueCurve}></div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.quickStartButton}>
            <Link to='/map-search'>
              <button>
                Quick Start
                <img src="/FUTSALHOME/soccer-ball-icon.png" alt="Soccer Ball" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FutsalHome