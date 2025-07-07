import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Users, Star } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/HowItWorks.module.css'
import '../pages/css/FooterOverride.css'
import aboutUsStyles from '../pages/css/AboutUsPage.module.css'

const HowItWorksPage = () => {  const { logOut, authUser } = useAuthStore()
  const navigate = useNavigate()
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [showAllProcesses, setShowAllProcesses] = useState(false)
  const [activeFaqIndex, setActiveFaqIndex] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }
  const handleLogin = (type) => {
    navigate('/login')
  }
  const closeMenu = () => setMenuOpen(false)

  const processes = [
    {
      icon: '/icons/profile-circle.png',
      title: 'CREATE YOUR PROFILE',
      description: 'SET YOUR PREFERRED SPORT, SKILL LEVEL, LOCATION, AND AVAILABILITY.'
    },
    {
      icon: '/icons/search.png',
      title: 'FIND TEAMS',
      description: 'SEARCH LOCAL GAMES OR GET MATCHED WITH NEARBY PLAYERS.'
    },
    {
      icon: '/icons/calender.png',
      title: 'JOIN OR HOST MATCHES',
      description: 'JOIN GAMES OR CREATE YOUR OWN WITH TIME AND PLAYER SETTINGS.'
    },
    {
      icon: '/icons/star.png',
      title: 'PLAY & BUILD CREDIBILITY',
      description: 'PLAY, GET RATED, AND GROW YOUR REPUTATION.'
    },
    {
      icon: '/icons/trophy.png',
      title: 'COMPETE IN TOURNAMENTS',
      description: 'PARTICIPATE IN LOCAL TOURNAMENTS AND WIN EXCITING PRIZES.'
    },
    {
      icon: '/icons/bolt.png',
      title: 'QUICK MATCHMAKING',
      description: 'GET INSTANTLY MATCHED WITH PLAYERS OF SIMILAR SKILL LEVELS.'
    }
  ]

  const features = [
    {
      icon: 'icons/trophy.png',
      title: 'TOURNAMENTS',
      description: 'JOIN LOCAL AND ONLINE TOURNAMENTS, TEAM UP, AND COMPETE TO WIN.'
    },
    {
      icon: 'icons/bolt.png',
      title: 'QUICK JOIN',
      description: 'JUMP INTO GAMES THAT NEED PLAYERS. NO WAITING — JUST PICK A SLOT AND PLAY.'
    },
    {
      icon: 'icons/verifies.png',
      title: 'VERIFIED',
      description: 'PLAY WORRY-FREE WITH VERIFIED USERS, SECURE PAYMENTS, AND GUARANTEED REFUNDS.'
    },
    {
      icon: 'icons/groud.png',
      title: 'BOOK COURTS',
      description: 'FIND AND BOOK NEARBY FUTSAL COURTS EASILY — PICK A TIME, CONFIRM, AND YOU\'RE SET.'
    },
    {
      icon: 'icons/star.png',
      title: 'PREMIUM',
      description: 'ACCESS EXCLUSIVE FEATURES AND PRIORITY MATCHMAKING FOR AN ENHANCED EXPERIENCE.'
    },
    {
      icon: 'icons/profile-circle.png',
      title: 'PROFILES',
      description: 'CREATE AND CUSTOMIZE YOUR PLAYER PROFILE WITH STATS AND ACHIEVEMENTS.'
    }
  ]

  const faqs = [
    {
      question: "What is MatchPoint?",
      answer: "MatchPoint is a sports matchmaking platform that connects players for local games. It helps you find teammates, join matches, and organize sports events in your area."
    },
    {
      question: "Is MatchPoint free to use?",
      answer: "Yes, MatchPoint offers free access to browse and join games. However, certain premium features like priority match recommendations or tournament hosting may require a small fee."
    },
    {
      question: "Can I use MatchPoint for all sports?",
      answer: "Yes, MatchPoint supports a wide range of sports including futsal, basketball, cricket, and more. You can find matches and teammates for any sport available in your area."
    },
    {
      question: "Do I need to pay if no matches are played?",
      answer: "No, you only pay for matches you participate in. There are no hidden fees or charges for unused services."
    },
    {
      question: "Is there a verification process for players?",
      answer: "Yes, we verify all players for safety and security. This includes profile verification, player ratings, and a community-driven review system to ensure a trustworthy environment."
    }
  ]

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index)
  }

  return (
    <div>
      <div className={aboutUsStyles.mainheader}>
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
              <Link to="/" className={aboutUsStyles.navLink} onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/about-us" className={aboutUsStyles.navLink} onClick={closeMenu}>About Us</Link>
            </li>
            <li>
              <Link to="/how-it-works" className={`${aboutUsStyles.navLink} ${aboutUsStyles.active_page}`} onClick={closeMenu}>How It Works</Link>
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
      </div>

      <main>
        {/* How MatchPoint Works Section */}
        <section className={styles.howItWorks}>
          <h1>HOW MATCHPOINT WORKS</h1>
          <p className={styles.description}>
            MatchPoint is a sports matchmaking platform that connects players with similar interests in offline games like futsal, basketball, and more. Whether you're looking for casual matches or competitive local games, MatchPoint helps you find the right team or fill missing spots quickly.
          </p>
        </section>

        {/* Game Match Process Section */}
        <section className={styles.gameMatchProcess}>
          <h2>The Game Match Process</h2>
          <div className={styles.processCards}>
            {processes.slice(0, showAllProcesses ? processes.length : 3).map((process, index) => (
              <div 
                key={index} 
                className={`${styles.processCard} ${index >= 3 ? styles.fadeInProcess : ''}`}
              >
                <div className={styles.icon}>
                  <img src={process.icon} alt={process.title} />
                </div>
                <h3>{process.title}</h3>
                <p>{process.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.seeMoreContainer}>
            <button 
              className={styles.seeMoreButton}
              onClick={() => setShowAllProcesses(!showAllProcesses)}
            >
              {showAllProcesses ? 'Show Less' : 'See More Steps'}
            </button>
          </div>
        </section>

        {/* For Players & Organizers Section */}
        <section className={styles.playersOrganizers}>
          <h2>For Players & Organizers</h2>
          <div className={styles.columnsContainer}>
            <div className={`${styles.column} ${styles.playersColumn}`}>
              <h3>For Players</h3>
              <p>Join & Play Instantly</p>
              <p className={styles.description}>
                MatchPoint connects you with like-minded players for your favorite offline sports like futsal, basketball, cricket, and more — no need to plan weeks ahead or coordinate schedules endlessly.
              </p>
              <ul className={styles.featureList}>
                <li><i className="fas fa-paper-plane"></i> Create a detailed sports profile with your preferences</li>
                <li><i className="fas fa-paper-plane"></i> Browse nearby matches actively looking for extra players</li>
                <li><i className="fas fa-paper-plane"></i> Join matches that suit your skill and schedule</li>
                <li><i className="fas fa-paper-plane"></i> Schedule gaming sessions based on your availability</li>
                <li><i className="fas fa-paper-plane"></i> Build your reputation with reviews and ratings</li>
              </ul>
              <button
                className={styles.loginButton}
                onClick={() => handleLogin('player')}
              >
                <Users size={20} />
                Login as Player
              </button>
            </div>
            <div className={`${styles.column} ${styles.organizersColumn}`}>
              <h3>For Organizers</h3>
              <p>Host games & tournaments</p>
              <p className={styles.description}>
                Whether you're managing a futsal arena, weekend games, or organizing community sports events, MatchPoint gives you the tools to make it seamless.
              </p>
              <ul className={styles.featureList}>
                <li><i className="fas fa-paper-plane"></i> Create and manage gaming events of any size</li>
                <li><i className="fas fa-paper-plane"></i> Set up tournaments with automatic bracket generation</li>
                <li><i className="fas fa-paper-plane"></i> Communicate with players through our messaging system</li>
                <li><i className="fas fa-paper-plane"></i> Schedule gaming sessions based on your availability</li>
                <li><i className="fas fa-paper-plane"></i> Build your reputation as a trusted organizer</li>
              </ul>
              <button
                className={styles.loginButton}
                onClick={() => handleLogin('organizer')}
              >
                <Star size={20} />
                Login as Organizer
              </button>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className={styles.keyFeatures}>
          <h2>Key Features</h2>
          <div className={styles.featureCards}>
            {features.slice(0, showAllFeatures ? features.length : 3).map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.featureCard} ${index >= 3 ? styles.fadeInFeature : ''}`}
              >
                <div className={styles.icon}>
                  <img src={feature.icon} alt={feature.title} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.seeMoreContainer}>
            <button 
              className={styles.seeMoreButton}
              onClick={() => setShowAllFeatures(!showAllFeatures)}
            >
              {showAllFeatures ? 'Show Less' : 'See More Features'}
            </button>
          </div>
        </section>        {/* FAQ Section */}
        <section id="faq" className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`${styles.faqItem} ${activeFaqIndex === index ? styles.active : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className={styles.faqQuestion}>
                  <div className={styles.indicator}>
                    <div className={styles.circle}></div>
                  </div>
                  <p>{faq.question}</p>
                  <i className={`fas fa-chevron-right ${styles.arrow} ${activeFaqIndex === index ? styles.rotated : ''}`}></i>
                </div>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Company Info Column */}
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <Link to="/"><img src="/firstpage/logo.png" alt="match-logo" /></Link>
            </div>            
            <p className={styles.footerAbout}>
              Match Point is your ultimate platform for finding teammates, joining tournaments, and elevating your gaming experience.
            </p>            
            <div className={styles.footerContact}>
              <p><i className="fas fa-map-marker-alt"></i> Kathmandu, Nepal</p>
              <p><i className="fas fa-phone"></i> 123456789</p>
              <p><i className="fas fa-envelope"></i> info@matchpoint.com</p>
            </div>
          </div>
          {/* Quick Links Column */}
          <div className={styles.footerColumn}>
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

export default HowItWorksPage