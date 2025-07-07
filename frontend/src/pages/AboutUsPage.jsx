import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../pages/css/AboutUsPage.module.css'
import '../pages/css/FooterOverride.css'
import WorkModal from '../components/WorkModal'
import { FaTwitter, FaLinkedinIn, FaDribbble, FaInstagram, FaFacebookF } from 'react-icons/fa';

const AboutUsPage = () => {
  const { logOut, authUser } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogin = (type) => {
    navigate('/login')
  }

  const [selectedWork, setSelectedWork] = useState(null)

  const works = [
    {
      title: 'Project Alpha',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
      features: [
        'Lorem ipsum dolor sit amet',
        'Consectetur adipiscing elit',
        'Sed do eiusmod tempor',
        'Incididunt ut labore',
        'Dolore magna aliqua'
      ],
      link: '#'
    },
    {
      title: 'Project Beta',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
      features: [
        'Lorem ipsum dolor sit amet',
        'Consectetur adipiscing elit',
        'Sed do eiusmod tempor',
        'Incididunt ut labore',
        'Dolore magna aliqua'
      ],
      link: '#'
    },
    {
      title: 'Project Gamma',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60',
      features: [
        'Lorem ipsum dolor sit amet',
        'Consectetur adipiscing elit',
        'Sed do eiusmod tempor',
        'Incididunt ut labore',
        'Dolore magna aliqua'
      ],
      link: '#'
    }
  ];

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  // Scroll-triggered pop-in animation for elements with class 'pop-in'
  useEffect(() => {
    const popIns = document.querySelectorAll('.pop-in');
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.15 }
    );
    popIns.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Responsive burger menu close on nav link click
  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      <div className={styles.mainheader}>
        <nav className={styles.navbar} style={{position:'relative'}}>
          {/* Burger menu for mobile (left) */}
          <div className={styles.burger} style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)'}} onClick={() => setMenuOpen(v => !v)}>
            <span className={menuOpen ? styles.burgerOpen : ''}></span>
            <span className={menuOpen ? styles.burgerOpen : ''}></span>
            <span className={menuOpen ? styles.burgerOpen : ''}></span>
          </div>
          {/* Logo (hidden on mobile, left on desktop) */}
          <div className={styles.logo} style={{display:'flex',alignItems:'center'}}>
            <Link to="/">
              <img src="/firstpage/logo.png" alt="match-logo" />
            </Link>
          </div>
          {/* Centered MATCHPOINT clickable, always visible */}
          <div className={styles.matchPoint} style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'max-content'}}>
            <Link to="/" style={{textDecoration:'none',color:'inherit',fontWeight:700,fontSize:'1.5rem',letterSpacing:'1px'}}>MATCHPOINT</Link>
          </div>
          {/* Nav links (responsive, slide out) */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`} style={{zIndex:200}}>
            <li>
              <Link to="/" className={styles.navLink} onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/about-us" className={`${styles.navLink} ${styles.active_page}`} onClick={closeMenu}>About Us</Link>
            </li>
            <li>
              <Link to="/how-it-works" className={styles.navLink} onClick={closeMenu}>How It Works</Link>
            </li>
          </ul>
          {/* Profile/Logout or Auth buttons (right) */}
          <div className={styles.navProfileLogout}>
            {authUser ? (
              <>
                <Link to="/profile" title="Profile" className={styles.profileLink} onClick={closeMenu}>
                  <User size={28} style={{ verticalAlign: 'middle' }} />
                </Link>
                <button className={styles.btnLogout} onClick={() => { handleLogout(); closeMenu(); }}>
                  <LogOut size={22} style={{ verticalAlign: 'middle' }} />
                  <span className={styles.logoutText} style={{ fontWeight: 500 }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className={styles.btnSignup} onClick={closeMenu}
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
                <Link to="/login" className={styles.btnLogin} onClick={closeMenu}
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
        <section >
          <div className={styles.photocontainer}>
            <div className={styles.heroContent}>
              <img src="/aboutus/image-group.png" alt="Team of professionals" className={styles.heroImage} />
            </div>
          </div>
        </section>
      </div>

      {/* Hero Section - Minimal, Modern, Centered, No Images */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-green-50 to-white text-center px-4 py-20">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-green-700 mb-6 tracking-tight">
          We are a team
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 font-medium mb-4 max-w-2xl">
          It started with a simple question: <span className="italic text-green-600">How can we make it easier for <span className="font-bold text-green-800">players</span> and <span className="font-bold text-green-800">organizers</span> to connect?</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mb-4 max-w-2xl">
          Driven by curiosity and a passion for sports, we transformed that question into a real platform for <span className="font-semibold text-green-700">sports matchmaking</span> and <span className="font-semibold text-green-700">event management</span>.
        </p>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl">
          Our journey is all about <span className="font-bold text-green-800">learning by doing</span>, building together, and making a difference—one match at a time.
        </p>
      </section>
      {/* End Hero Section */}


      {/* End Team Introduction Section */}

      <section className={styles.team + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <h2 className={'pop-in'}>Meet Our Members</h2>
          <div className={styles.teamGrid + ' pop-in'}>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/Snapchat-790029509.jpg" alt="Team member" />
              </div>
              <h3>Shreya Tiwari</h3>
              <p>Frontend Developer</p>              <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/shreyatiwari10/" data-social="linkedin"><FaLinkedinIn /></a>
                <a href="https://www.instagram.com/" data-social="instagram"><FaInstagram /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/sc.jpeg" alt="Team member" />
              </div>
              <h3>Samir Chand</h3>
              <p>Backend Developer & Researcher</p>              <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/samirchand/" data-social="linkedin"><FaLinkedinIn /></a>
                <a href="https://www.instagram.com/" data-social="instagram"><FaInstagram /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/k.k.jpeg" alt="Team member" />
              </div>
              <h3>Kashmita Koirala</h3>
              <p>Frontend Developer</p>              <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/kassmita-koirala/" data-social="linkedin"><FaLinkedinIn /></a>
                <a href="https://www.instagram.com/" data-social="instagram"><FaInstagram /></a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src="/aboutus/am.jpeg" alt="Team member" />
              </div>
              <h3>Abhishek Magar</h3>
              <p>Backend Developer & UI Designer</p>              <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/abhishekmagar-np/" data-social="linkedin"><FaLinkedinIn /></a>
                <a href="https://www.instagram.com/" data-social="instagram"><FaInstagram /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <div className={styles.ctaContent + ' pop-in'}>
            <h2 className={'pop-in'}>We're Always Looking For Talented People For Our Agency</h2>
          </div>
          <div className={styles.ctaDecoration + ' pop-in'}>
            <div className={`${styles.dot} ${styles.dot1} pop-in`}></div>
            <div className={`${styles.dot} ${styles.dot2} pop-in`}></div>
            <div className={`${styles.dot} ${styles.dot3} pop-in`}></div>
            <div className={styles.rocket + ' pop-in'}>🚀</div>
          </div>
        </div>
      </section>

      <section className={styles.works + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <h2 className={'pop-in'}>Other Works</h2>
          <div className={styles.worksGrid + ' pop-in'}>
            {works.map((work, index) => (
              <div
                key={index}
                className={`${styles.workCard} ${index === 1 ? styles.purple : ''} ${index === 2 ? styles.imageCard : ''}`}
              >
                {index === 2 ? (
                  <div className={styles.cardOverlay}>
                    <h3>{work.title}</h3>
                    <p>{work.description.substring(0, 100)}...</p>
                    <button
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => setSelectedWork(work)}
                    >
                      Explore
                    </button>
                  </div>
                ) : (
                  <>
                    <h3>{work.title}</h3>
                    <p>{work.description.substring(0, 100)}...</p>
                    <button
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => setSelectedWork(work)}
                    >
                      Explore
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={styles.contactSection + ' pop-in'}>
        <div className={styles.container + ' pop-in'}>
          <h2 className={'pop-in'}>Get In Touch</h2>
          <div className={styles.contactContent}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Address</h3>
                  <p>Kathmandu, Nepal</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <i className="fas fa-phone"></i>
                <div>
                  <h3>Phone</h3>
                  <p>123456789</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email</h3>
                  <p>info@matchpoint.com</p>
                </div>
              </div>
              <div className={styles.contactSocial}>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaLinkedinIn /></a>
              </div>
            </div>            <div className={styles.contactForm}>
              <form onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
                e.target.reset();
              }}>
                <div className={styles.formGroup}>
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className={styles.formGroup}>
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className={styles.formGroup}>
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className={styles.formGroup}>
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className={styles.submitBtn}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

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

      <WorkModal
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        work={selectedWork}
      />
    </div>
  )
}

export default AboutUsPage