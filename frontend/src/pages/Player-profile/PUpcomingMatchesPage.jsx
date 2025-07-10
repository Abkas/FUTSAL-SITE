import React, { useState, useEffect } from 'react'
import styles from '../css/PUpcomingMatch.module.css'
import sidebarStyles from '../css/OSidebar.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Clock, Users, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import toast from 'react-hot-toast'
import { getSlotTimeStatusAndSync } from '../../utils/slotTimeStatus'
import FutsalNavbar from '../../components/FutsalNavbar'
import PlayerSidebar from '../../components/PlayerSidebar';
import Modal from 'react-modal';

const PUpcomingMatchesPage = () => {
    const { logOut, authUser } = useAuthStore();
    const navigate = useNavigate()
    const [joinedSlots, setJoinedSlots] = useState([])
    const [loading, setLoading] = useState(true)

    // Ping modal state
    const [pingModal, setPingModal] = useState({ open: false, slot: null });
    const [pingMessage, setPingMessage] = useState('');
    const [pingLoading, setPingLoading] = useState(false);

    const isOrganizer = authUser?.role === 'organizer';

    const handleLogout = () => {
        logOut()
        navigate('/login')
    }

    const fetchJoinedSlots = async () => {
        try {
            setLoading(true)
            console.log('Fetching joined slots...');
            // This endpoint returns only slots where the current player is in the players array
            const response = await axiosInstance.get('/slots/player/slots')
            if (response.data.success) {
                const slots = response.data.message;
                console.log('Joined slots:', slots);
                
                // Filter out ended matches to show only active joined slots
                const activeJoinedSlots = slots.filter(slot => {
                    const timeStatus = getSlotTimeStatusAndSync(slot, slot.date);
                    return timeStatus !== 'ended';
                });
                
                console.log('Active joined slots to display:', activeJoinedSlots);
                setJoinedSlots(activeJoinedSlots);
            } else {
                toast.error('Failed to fetch joined slots')
            }
        } catch (err) {
            console.error('Error fetching joined slots:', err)
            toast.error('Failed to fetch joined slots')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJoinedSlots()
    }, [])

    const handleCancelBooking = async (slotId) => {
        try {
            // Show confirmation dialog
            const confirmed = window.confirm('Are you sure you want to cancel this booking?');
            if (!confirmed) return;

            const response = await axiosInstance.delete(`/slots/${slotId}/cancel`);
            if (response.data.success) {
                toast.success('Booking cancelled successfully');
                fetchJoinedSlots(); // Refresh the list
            } else {
                toast.error(response.data.message || 'Failed to cancel booking');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            // Show more specific error message from the backend
            toast.error(err.response?.data?.message || 'Failed to cancel booking');
        }
    }

    const handleViewFutsal = (futsalId) => {
        if (!futsalId) {
            toast.error('Futsal details not available');
            return;
        }
        navigate(`/futsal/${futsalId}`);
    }

    const handleOpenPing = (slot) => {
        setPingModal({ open: true, slot });
        setPingMessage('');
    };
    const handleClosePing = () => setPingModal({ open: false, slot: null });
    const handleSendPing = async () => {
        if (!pingMessage.trim()) return toast.error('Message required');
        setPingLoading(true);
        try {
            await axiosInstance.post('/notifications/ping-all', {
                futsalId: pingModal.slot.futsal?._id,
                message: pingMessage,
                senderId: authUser?._id,
            });
            toast.success('Ping sent to all users!');
            handleClosePing();
        } catch (e) {
            toast.error('Failed to send ping');
        } finally {
            setPingLoading(false);
        }
    };

    return (
        <div className={styles.body} style={{ width: '100vw', margin: 0, padding: 0 }}>
            <FutsalNavbar />
            <div className={styles.container} style={{ width: '100vw', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch' }}>
                <div style={{ position: 'sticky', top: 0, left: 0, zIndex: 100 }}>
                    <PlayerSidebar style={{ marginTop: 0, height: '100%', minHeight: '100vh' }} />
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <main className={styles.content} style={{
                        width: '100%',
                        maxWidth: '1200px',
                        padding: '0 20px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginTop: '88px',
                        justifyContent: 'flex-start',
                    }}>
                        <h1 className={styles.pageTitle}>Upcoming Matches</h1>
                        {loading ? (
                            <div className={styles.loading}>Loading your matches...</div>
                        ) : joinedSlots.length === 0 ? (
                            <div className={styles.noMatches}>
                                <img src="/firstpage/logo.png" alt="No matches" />
                                <p>You haven't joined any matches yet.</p>
                                <Link to="/bookfutsal" className={styles.findMatchesBtn}>
                                    Find Matches
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.matchesGrid}>
                                {joinedSlots.map((slot) => {
                                    const timeStatus = getSlotTimeStatusAndSync(slot, slot.date);
                                    let statusLabel = '';
                                    let statusClass = '';

                                    let userTeam = null;
                                    if (authUser && slot.teamA && slot.teamA.some(u => (u._id || u) === authUser._id)) userTeam = 'A';
                                    if (authUser && slot.teamB && slot.teamB.some(u => (u._id || u) === authUser._id)) userTeam = 'B';

                                    if (timeStatus === 'ended') {
                                        statusLabel = 'Ended';
                                        statusClass = styles.statusEnded;
                                    } else if (timeStatus === 'playing') {
                                        statusLabel = 'Playing';
                                        statusClass = styles.statusPlaying;
                                    } else if (timeStatus === 'soon') {
                                        statusLabel = 'Starting Soon';
                                        statusClass = styles.statusSoon;
                                    } else {
                                        statusLabel = slot.status || 'Upcoming';
                                        statusClass = styles[`status${(slot.status || 'Upcoming').charAt(0).toUpperCase() + (slot.status || 'Upcoming').slice(1)}`] || '';
                                    }

                                    return (
                                        <div key={slot._id} className={styles.matchCard}>
                                            <div className={styles.matchHeader}>
                                                <div className={styles.venueInfo}>
                                                    <img src={slot.futsal?.futsalPhoto || "/FUTSALHOME/logo.png"} alt="futsal-logo" />
                                                    <h3>{slot.futsal?.name || 'Unknown Futsal'}</h3>
                                                </div>
                                                <span className={`${styles.status} ${statusClass}`}>{statusLabel}</span>
                                            </div>
                                            <div className={styles.matchDetails}>
                                                <div className={styles.detailItem}>
                                                    <Clock size={18} />
                                                    <span>{slot.time || 'Time not set'}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <Users size={18} />
                                                    <span>{slot.currentPlayers || 0}/{slot.maxPlayers || 10} Players</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span style={{ color: '#000' }}>रु{slot.price || 0} per player</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <MapPin size={18} />
                                                    <span>{slot.futsal?.location || 'Location not set'}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span style={{fontWeight:600, color:userTeam==='A'?'#2563eb':userTeam==='B'?'#b91c1c':'#888'}}>
                                                        {userTeam ? `Your Team: Team ${userTeam}` : 'No Team Assigned'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.matchActions}>
                                                <button
                                                    className={styles.viewDetailsBtn}
                                                    onClick={() => handleViewFutsal(slot.futsal?._id)}
                                                    disabled={!slot.futsal?._id}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={() => handleCancelBooking(slot._id)}
                                                    disabled={timeStatus === 'playing' || timeStatus === 'ended'}
                                                >
                                                    Cancel Booking
                                                </button>
                                                <button
                                                    className={styles.viewDetailsBtn}
                                                    style={{ background: '#2563eb', color: '#fff', marginLeft: 8 }}
                                                    onClick={() => handleOpenPing(slot)}
                                                    disabled={timeStatus === 'ended'}
                                                >
                                                    Ping
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Ping Modal */}
            <Modal
                isOpen={pingModal.open}
                onRequestClose={handleClosePing}
                contentLabel="Ping Players"
                className={styles.modal}
                overlayClassName={styles.modalOverlay}
            >
                <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Send a Ping Message</h2>
                <textarea
                    value={pingMessage}
                    onChange={e => setPingMessage(e.target.value)}
                    rows={4}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #bbb', padding: 10, fontSize: 16, marginBottom: 18 }}
                    placeholder="Write your message to notify others about the futsal match..."
                    disabled={pingLoading}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button onClick={handleClosePing} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }} disabled={pingLoading}>Cancel</button>
                    <button onClick={handleSendPing} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }} disabled={pingLoading}>{pingLoading ? 'Sending...' : 'Send'}</button>
                </div>
            </Modal>
        </div>
    )
}

export default PUpcomingMatchesPage