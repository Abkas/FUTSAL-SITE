import React, { useState } from 'react'
import styles from '../pages/css/HomePage.module.css'
import '../pages/css/FooterOverride.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { FaFutbol } from 'react-icons/fa'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import aboutUsStyles from '../pages/css/AboutUsPage.module.css'


const HomePage = () => {
  const { logOut, authUser } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogin = (type) => {
    navigate('/login')
  }

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div>
      <div className={styles.hero}>
        {/* Hero background should be first */}
        <div className={styles.heroBg}>
          <img src="/firstpage/rectangle-2570.png" alt="Background" />
        </div>
        {/* Navigation */}
        <nav className={aboutUsStyles.navbar} style={{position:'relative'}}>
          <div className={aboutUsStyles.burger} style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)'}} onClick={() => setMenuOpen(v => !v)}>
            <span className={menuOpen ? aboutUsStyles.burgerOpen : ''}></span>
            <span className={menuOpen ? aboutUsStyles.burgerOpen : ''}></span>
            <span className={menuOpen ? aboutUsStyles.burgerOpen : ''}></span>
          </div>
          <div className={aboutUsStyles.logo} style={{display:'flex',alignItems:'center'}}>
            <Link to="/">
              <img src="/firstpage/logo.png" alt="match-logo" />
            </Link>
          </div>
          <div className={aboutUsStyles.matchPoint} style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'max-content'}}>
            <Link to="/" style={{textDecoration:'none',color:'inherit',fontWeight:700,fontSize:'1.5rem',letterSpacing:'1px'}}>MATCHPOINT</Link>
          </div>
          <ul className={`${aboutUsStyles.navLinks} ${menuOpen ? aboutUsStyles.showMenu : ''}`} style={{zIndex:200}}>
            <li>
              <Link to="/" className={`${aboutUsStyles.navLink} ${aboutUsStyles.active_page}`} onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/about-us" className={aboutUsStyles.navLink} onClick={closeMenu}>About Us</Link>
            </li>
            <li>
              <Link to="/how-it-works" className={aboutUsStyles.navLink} onClick={closeMenu}>How It Works</Link>
            </li>
          </ul>
          <div className={aboutUsStyles.navProfileLogout}>
            {authUser ? (
              <>
                <Link to="/profile" title="Profile" className={aboutUsStyles.profileLink} onClick={closeMenu}>
                  <User size={28} style={{ verticalAlign: 'middle' }} />
                </Link>
                <button className={aboutUsStyles.btnLogout} onClick={() => { handleLogout(); closeMenu(); }}>
                  <LogOut size={22} style={{ verticalAlign: 'middle' }} />
                  <span className={aboutUsStyles.logoutText} style={{ fontWeight: 500 }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className={aboutUsStyles.btnSignup} onClick={closeMenu}
                  style={{
                    padding: '10px 25px',
                    borderRadius: 30,
                    border: '2px solid #111',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    color: '#111',
                    marginRight: 8,
                    transition: 'all 0.2s',
                    boxShadow: 'none',
                    textDecoration: 'none',
                  }}
                  onMouseOver={e => { e.target.style.backgroundColor = '#111'; e.target.style.color = '#fff'; }}
                  onMouseOut={e => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#111'; }}
                >
                  Sign Up
                </Link>
                <Link to="/login" className={aboutUsStyles.btnLogin} onClick={closeMenu}
                  style={{
                    padding: '10px 25px',
                    borderRadius: 30,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    backgroundColor: '#111',
                    color: '#fff',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseOver={e => { e.target.style.backgroundColor = '#333'; }}
                  onMouseOut={e => { e.target.style.backgroundColor = '#111'; }}
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </nav>
        {/* Hero Content */}
        <div className={styles.heroContent}>
          <h1>Where Games Begin &<br />Teams Unite</h1>
          <button
            className={styles.btnFindGames}
            onClick={() => {
              const section = document.getElementById('popularGamesSection');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Find Games
          </button>
        </div>
      </div>

      <section className={styles.features}>
        <h2>Everything You Need For Gaming Matchmaking</h2>
        <p className={styles.subtitle}>
          Our platform provides all the tools you need to find teammates, join tournaments,<br />
          and elevate your gaming experience.
        </p>
        <div className={styles.featureCards}>
          <div className={styles.featureCard}>
            <div className={styles.iconTrophy}>
              <img src="/firstpage/mdi-light-trophy0.svg" alt="Trophy" />
            </div>
            <h3>TOURNAMENTS</h3>
            <p>PARTICIPATE IN EXCITING TOURNAMENTS TEAM UP AND COMPETE TO WIN</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconSearch}>
              <img src="/firstpage/group0.svg" alt="Search" />
            </div>
            <h3>QUICK JOIN</h3>
            <p>FIND AVAILABLE GAMES AND PLAYERS, NO WAITING — JOIN PICK UP GAMES AND PLAY</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconShield}>
              <img src="/firstpage/material-symbols-light-verified-user-outline-rounded0.svg" alt="Shield" />
            </div>
            <h3>VERIFIED & SECURE</h3>
            <p>PLAY WORRY-FREE WITH VERIFIED USERS, SECURE PAYMENTS, AND TRUSTED VENUES</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconCourt}>
              <img src="/firstpage/group1.svg" alt="Court" />
            </div>
            <h3>BOOK COURTS</h3>
            <p>FIND AND BOOK NEARBY FUTSAL COURTS EASILY — PICK A TIME, RESERVE, AND PLAY</p>
          </div>
        </div>
      </section>

      <section className={styles.trustedBy}>
        <p>Trusted by 2000+ users</p>
        <div className={styles.trustedIcons}>
          <FaFutbol className={styles.ballIcon} />
          <FaFutbol className={styles.ballIcon} />
          <FaFutbol className={styles.ballIcon} />
          <FaFutbol className={styles.ballIcon} />
          <FaFutbol className={styles.ballIcon} />
        </div>
      </section>

      <section id="popularGamesSection" className={styles.popularGames}>
        <h2>Popular Games</h2>
        <div className={styles.gameCards}>
          <Link to="/futsalhome" className={styles.gameCard}>
            <div className={styles.gameCardInner}>
              <img src="/firstpage/rectangle-2740.png" alt="Soccer" />
            </div>
          </Link>
          <div className={`${styles.gameCard} ${styles.disabledGameCard}`}
            tabIndex={0}
          >
            <div className={styles.gameCardInner}>
              <span className={styles.comingSoonInfo} style={{opacity: 1}}>Coming Soon</span>
              <img src="/firstpage/rectangle-2750.png" alt="Basketball" />
            </div>
          </div>
          <div className={`${styles.gameCard} ${styles.disabledGameCard}`}
            tabIndex={0}
          >
            <div className={styles.gameCardInner}>
              <span className={styles.comingSoonInfo} style={{opacity: 1}}>Coming Soon</span>
              <img src="/firstpage/rectangle-2760.png" alt="Volleyball" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.moments}>
        <h2>Cherished Moments</h2>
        <div className={styles.momentsGrid}>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-060.png" alt="Soccer player kicking ball" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-050.png" alt="Futsal match" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-040.png" alt="Indoor volleyball" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-030.png" alt="Tennis balls" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-020.png" alt="Team photo" />
          </div>
          <div className={styles.momentItem}>
            <img src="/firstpage/image-010.png" alt="Basketball dunk" />
          </div>
        </div>
      </section>

      <section className={styles.social}>
         <h2>Follow Us</h2>
        <div className={styles.socialIcons}>
          <a href="https://www.facebook.com/" className={styles.socialIcon}><FaFacebookF /></a>
          <a href="https://www.instagram.com/" className={styles.socialIcon}><FaInstagram /></a>
          <a href="https://www.linkedin.com/" className={styles.socialIcon}><FaLinkedinIn /></a>
          <a href="https://x.com/" className={styles.socialIcon}><FaTwitter /></a>
        </div>
      </section>

      <section className={styles.testimonials}>
        <h2>Testimonials</h2>
        <div className={styles.testimonialCards}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic0.svg" alt="Profile 1" />
            </div>
            <p className={styles.testimonialText}>Match Point has made it so easy to find and book futsal tournaments effortlessly. Connecting from players from near and far has been amazing.</p>
            <p className={styles.testimonialName}>SAMUEL JOHNSON</p>
            <p className={styles.testimonialTitle}>Community Tournament User</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic1.svg" alt="Profile 2" />
            </div>
            <p className={styles.testimonialText}>Booking fields is incredibly easy to fill our futsal team last minute. Finding matches has been a full-squad and an awesome game!</p>
            <p className={styles.testimonialName}>JASMINE ANDREWS</p>
            <p className={styles.testimonialTitle}>Regular Player</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic2.svg" alt="Profile 3" />
            </div>
            <p className={styles.testimonialText}>Formed a basketball court, joined a match quickly, and made lasting ties since joining. The app brings players of all skill levels together.</p>
            <p className={styles.testimonialName}>MICHAEL LAWRENCE</p>
            <p className={styles.testimonialTitle}>Casual Sportsman</p>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialProfile}>
              <img src="/firstpage/userpic3.svg" alt="Profile 4" />
            </div>
            <p className={styles.testimonialText}>The verified & reliable platform to manage our entire team's weekly games. All event coordination is streamlined and every verified player.</p>
            <p className={styles.testimonialName}>SARAH WILLIAMS</p>
            <p className={styles.testimonialTitle}>Team Captain</p>
          </div>
        </div>
        <button className={styles.btnMoreTestimonials}>More Happy Customers</button>
      </section>      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Company Info Column */}
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
            </div>            <p className={styles.footerAbout}>
              Match Point is your ultimate platform for finding teammates, joining tournaments, and elevating your gaming experience.
            </p>            <div className={styles.footerContact}>
              <p><i className="fas fa-map-marker-alt"></i> Kathmandu, Nepal</p>
              <p><i className="fas fa-phone"></i> 123456789</p>
              <p><i className="fas fa-envelope"></i> info@matchpoint.com</p>
            </div>
          </div>
            {/* Quick Links Column */}          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/futsalhome">Futsal</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
            </ul>
          </div>
            {/* Support Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Support</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/how-it-works#faq">FAQs</Link></li>
              <li><Link to="/about-us#contact">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Legal</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="#">Terms of Service</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Cookie Policy</Link></li>
              <li><Link to="#">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>&copy; {new Date().getFullYear()} Match Point. All rights reserved.</p>
          </div>
          <div className={styles.footerBottomLinks}>
            <Link to="#">Sitemap</Link>
            <Link to="#">Accessibility</Link>
            <Link to="#">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


export default HomePage