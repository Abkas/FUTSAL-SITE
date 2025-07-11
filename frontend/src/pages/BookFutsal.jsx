import React, { useState, useEffect } from 'react'
import styles from './css/BookFutsal.module.css'
import homeStyles from './css/HomePage.module.css'
import { Link, useNavigate } from 'react-router-dom'
import FutsalCard from '../components/FutsalCard'
import QuickJoinSection from '../components/QuickJoinSection'
import futsalService from '../services/futsalService'
import { Search, MapPin, Clock, Star, Award, Plus } from 'lucide-react'
import FutsalNavbar from '../components/FutsalNavbar'


const BookFutsal = () => {
  const navigate = useNavigate();
  const [futsals, setFutsals] = useState([]);
  const [displayedFutsals, setDisplayedFutsals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const futsalsPerPage = 3;

  useEffect(() => {
    fetchFutsals();
  }, []);

  useEffect(() => {
    // Update displayed futsals based on expanded state
    if (isExpanded) {
      setDisplayedFutsals(futsals);
    } else {
      setDisplayedFutsals(futsals.slice(0, futsalsPerPage));
    }
  }, [futsals, isExpanded]);

  const fetchFutsals = async () => {
    try {
      setLoading(true);
      const response = await futsalService.getAllFutsals();
      console.log('Fetched futsals:', response);
      
      if (response && Array.isArray(response.message)) {
        setFutsals(response.message);
      } else {
        setFutsals([]); 
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching futsals:', err);
      setError('Failed to fetch futsals. Please try again later.');
      setFutsals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // If search is empty, show all
    if (!searchQuery.trim()) {
      setDisplayedFutsals(isExpanded ? futsals : futsals.slice(0, futsalsPerPage));
      return;
    }
    // Filter by name or location (case-insensitive)
    const filtered = futsals.filter(futsal =>
      (futsal.name && futsal.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (futsal.location && futsal.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setDisplayedFutsals(isExpanded ? filtered : filtered.slice(0, futsalsPerPage));
  };

  const handleToggleFutsals = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = futsals.filter(futsal =>
      (futsal.name && futsal.name.toLowerCase().includes(value.toLowerCase())) ||
      (futsal.location && futsal.location.toLowerCase().includes(value.toLowerCase()))
    );
    setSearchResults(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (futsalId) => {
    navigate(`/futsal/${futsalId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  return (
    <div className={styles.body}>
      {/* Remove the main .container wrapper to allow full width */}
            <FutsalNavbar />

      {/* Main Content */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Find Players & Book</h1>
            <h1 className={styles.heroTitle}>Your Futsal Game!</h1>
            <p className={styles.subtitle}>Join an existing match or create your own—easy & hassle-free</p>
            
            <div className={styles.searchBarWrapper} style={{ position: 'relative' }}>
              <form onSubmit={handleSearch} className={styles.searchForm} autoComplete="off">
                <div className={styles.searchInput}>
                  <MapPin className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {searchQuery && searchResults.length === 0 && showSuggestions && (
                    <span
                      style={{ color: '#e74c3c', fontWeight: 700, marginLeft: 8, cursor: 'pointer', fontSize: 18 }}
                      onClick={handleClearSearch}
                      title="Clear"
                    >&#10005;</span>
                  )}
                </div>
                {/* Suggestions dropdown */}
                {showSuggestions && searchQuery && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px #0001',
                    zIndex: 20,
                    maxHeight: 220,
                    overflowY: 'auto',
                    padding: '0.5rem 0',
                  }}>
                    {searchResults.length > 0 ? (
                      searchResults.map(futsal => (
                        <div
                          key={futsal._id}
                          style={{ padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                          onClick={() => handleSuggestionClick(futsal._id)}
                        >
                          <img src={futsal.futsalPhoto || '/default-futsal.jpg'} alt={futsal.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', marginRight: 8 }} />
                          <span style={{ fontWeight: 600 }}>{futsal.name}</span>
                          {futsal.location && (
                            <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{futsal.location}</span>
                          )}
                        </div>
                      ))
                    ) : (
                      searchQuery && (
                        <div style={{ padding: '10px 18px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>No match for "{searchQuery}"</span>
                          <span
                            style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
                            onClick={handleClearSearch}
                            title="Clear"
                          >&#10005;</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                <button type="submit" className={styles.searchButton}>
                  <Search className={styles.searchIcon} />
                  Search
                </button>
              </form>
            </div>
            
            {/* <div className={styles.actionButtons}>
              <button className={styles.btnFindTournament} onClick={() => navigate('/tournaments')} type="button">Find a Tournament</button>
              <button className={styles.btnHostTournament} onClick={() => navigate('/tournaments')} type="button">Host a Tournament</button>
            </div> */}
          </div>
        </section>

        <section className={styles.futsalNearYou}>
          <div className={styles.fullWidthSection}>
            <h2 className={styles.sectionTitle}># Futsal Near You</h2>
            
            {loading ? (
              <div className={styles.loading}>Loading futsals...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : futsals.length === 0 ? (
              <div className={styles.noFutsals}>No futsals found</div>
            ) : (
              <>
                <div className={styles.futsalGrid}>
                  {displayedFutsals.map((futsal) => (
                    <FutsalCard 
                      key={futsal._id} 
                      futsal={futsal}
                    />
                  ))}
                </div>
                
                {futsals.length > futsalsPerPage && (
                  <div className={styles.seeMore}>
                    <button 
                      className={styles.btnSeeMore}
                      onClick={handleToggleFutsals}
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className={styles.quickJoin}>
          <div className={styles.fullWidthSection}>
            <h2 className={styles.sectionTitle}># Quick Join Available Slots</h2>
            
            {loading ? (
              <div className={styles.loading}>Loading futsals...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : futsals.length === 0 ? (
              <div className={styles.noFutsals}>No futsals found</div>
            ) : (
              <div className={styles.venueList}>
                {futsals.map((futsal) => (
                  <QuickJoinSection 
                    key={futsal._id} 
                    futsal={futsal}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.offers}>
          <div className={styles.fullWidthSection}>
            <h2 className={styles.sectionTitle}># Offers Going On</h2>
            <div className={styles.noOffersBox}>
              <span className={styles.sadEmoji} role="img" aria-label="Sad">😔</span>
              <div className={styles.noOffersTitle}>
                No offers available right now
              </div>
              <div className={styles.noOffersSubtext}>
                Please check back later for exciting deals!
              </div>
            </div>
          </div>
        </section>

        <section className={styles.howToJoinSection}>
          <div className={styles.fullWidthSection}>
            <h2 className={styles.sectionTitle}># How to Join</h2>
            <div className={styles.howToJoinContent}>
              <div className={styles.joinStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Select Your Time</h3>
                  <p>Choose your preferred date and time slot from available options</p>
                </div>
              </div>
              <div className={styles.joinStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Book Your Seats</h3>
                  <p>Select the number of seats you want to book for the game</p>
                </div>
              </div>
              <div className={styles.joinStep}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Complete Payment</h3>
                  <p>Make the payment securely and get ready to play!</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={homeStyles.footer}>
  <div className={homeStyles.footerContainer}>
    {/* Company Info Column */}
    <div className={homeStyles.footerColumn}>
      <div className={homeStyles.footerLogo}>
        <Link to="/">
          <img src="/firstpage/logo.png" alt="match-logo" />
        </Link>
      </div>
      <p className={homeStyles.footerAbout}>
        Match Point is your ultimate platform for finding teammates, joining tournaments, and elevating your gaming experience.
      </p>
      <div className={homeStyles.footerContact}>
        <p><i className="fas fa-map-marker-alt"></i> Kathmandu, Nepal</p>
        <p><i className="fas fa-phone"></i> 123456789</p>
        <p><i className="fas fa-envelope"></i> info@matchpoint.com</p>
      </div>
    </div>
    {/* Quick Links Column */}
    <div className={homeStyles.footerColumn}>
      <h3 className={homeStyles.footerHeading}>Quick Links</h3>
      <ul className={homeStyles.footerLinks}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about-us">About Us</Link></li>
        <li><Link to="/how-it-works">How It Works</Link></li>
        <li><Link to="/futsalhome">Futsal</Link></li>
        <li><Link to="/tournaments">Tournaments</Link></li>
      </ul>
    </div>
    {/* Support Column */}
    <div className={homeStyles.footerColumn}>
      <h3 className={homeStyles.footerHeading}>Support</h3>
      <ul className={homeStyles.footerLinks}>
        <li><Link to="/how-it-works">FAQs</Link></li>
        <li><Link to="/about-us">Contact Us</Link></li>
      </ul>
    </div>
    {/* Legal Column */}
    <div className={homeStyles.footerColumn}>
      <h3 className={homeStyles.footerHeading}>Legal</h3>
      <ul className={homeStyles.footerLinks}>
        <li><Link to="#">Terms of Service</Link></li>
        <li><Link to="#">Privacy Policy</Link></li>
        <li><Link to="#">Cookie Policy</Link></li>
        <li><Link to="#">Refund Policy</Link></li>
      </ul>
    </div>
  </div>
  <div className={homeStyles.footerBottom}>
    <div className={homeStyles.copyright}>
      <p>&copy; {new Date().getFullYear()} Match Point. All rights reserved.</p>
    </div>
    <div className={homeStyles.footerBottomLinks}>
      <Link to="#">Sitemap</Link>
      <Link to="#">Accessibility</Link>
      <Link to="#">Cookies</Link>
    </div>
  </div>
</footer>
    </div>
  )
}

export default BookFutsal