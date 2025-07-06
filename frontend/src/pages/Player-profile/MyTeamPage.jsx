import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { axiosInstance } from '../../lib/axios';
import PlayerSidebar from '../../components/PlayerSidebar';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import FutsalNavbar from '../../components/FutsalNavbar';
import styles from '../css/MyTeamPage.module.css';
import sidebarStyles from '../css/OSidebar.module.css';
import toast from 'react-hot-toast';

const SLOT_COUNT = 8;

const MyTeamPage = () => {
  const { authUser } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [friends, setFriends] = useState([]);
  const [inviteModal, setInviteModal] = useState({ open: false, slotIndex: null });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateAvatar, setUpdateAvatar] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Find all pending invites for this user (even if they are in another team)
  const [pendingTeamInvites, setPendingTeamInvites] = useState([]);
  const [showTeamInvitesModal, setShowTeamInvitesModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [showMatchRequestsModal, setShowMatchRequestsModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showAvailableTeams, setShowAvailableTeams] = useState(false);
  const [removeModal, setRemoveModal] = useState({ open: false, slotIndex: null, user: null });
  // Find Match: Show available team challenges and open slots
  const [showFindMatchModal, setShowFindMatchModal] = useState(false);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  // For challenge creation: futsal and slot selection
  const [challengeFutsals, setChallengeFutsals] = useState([]);
  const [selectedFutsal, setSelectedFutsal] = useState(null);
  const [challengeSlots, setChallengeSlots] = useState([]);
  // Add state for selected date in the challenge modal
  const [challengeDate, setChallengeDate] = useState(new Date().toISOString().split('T')[0]);
  // --- Challenge Creation Modal: Step 1 (Futsal Selection) ---
  const [futsalSearch, setFutsalSearch] = useState('');
  const filteredFutsals = challengeFutsals.filter(f =>
    f.name.toLowerCase().includes(futsalSearch.toLowerCase()) ||
    f.location.toLowerCase().includes(futsalSearch.toLowerCase())
  );

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState(null); // { type: 'create'|'join', slotId }

  useEffect(() => {
    fetchTeam();
    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchPendingTeamInvites = async () => {
      try {
        const res = await axiosInstance.get('/myteam/pending-invites');
        setPendingTeamInvites(res.data.invites || []);
      } catch (e) {}
    };
    fetchPendingTeamInvites();
  }, [authUser]);

  // Always fetch open challenges on page load and when team changes
  useEffect(() => {
    fetchAvailableChallenges();
  }, [team]);

  const myInvite = team && team.pendingInvites && team.pendingInvites.find(i => i.user._id === authUser._id && i.status === 'pending');
  // Show team invite actions if user has a pending invite and is not already in a team
  const showInviteActions = team && myInvite && (!team.slots || !team.slots.some(s => s.user && s.user._id === authUser._id));

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/myteam/get-by-user');
      setTeam(res.data.team);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    const res = await axiosInstance.get('/friendships/list');
    setFriends(res.data.message || []);
  };

  const handleInvite = async (friendId, slotIndex) => {
    await axiosInstance.post('/myteam/invite', { teamId: team._id, friendId, slotIndex });
    setInviteModal({ open: false, slotIndex: null });
    fetchTeam();
  };

  const handleAccept = async () => {
    await axiosInstance.post('/myteam/accept-invite', { teamId: team._id });
    fetchTeam();
  };

  const handleDecline = async () => {
    await axiosInstance.post('/myteam/decline-invite', { teamId: team._id });
    fetchTeam();
  };

  const handleRemove = async (slotIndex) => {
    if (!window.confirm('Remove this member from the team?')) return;
    await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex });
    fetchTeam();
  };

  const handleUpdateTeam = async e => {
    e.preventDefault();
    await axiosInstance.post('/myteam/update', {
      teamId: team._id,
      name: updateName,
      location: updateLocation,
      description: updateDescription
    });
    setShowUpdateModal(false);
    fetchTeam();
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('teamId', team._id);
    const res = await axiosInstance.patch('/myteam/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUpdateAvatar(res.data.avatar);
    fetchTeam();
  };

  const handleCancelInvite = async (slotIndex) => {
    if (!window.confirm('Cancel this invite?')) return;
    await axiosInstance.post('/myteam/cancel-invite', { teamId: team._id, slotIndex });
    fetchTeam();
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete your team? This action cannot be undone.')) return;
    await axiosInstance.post('/myteam/delete', { teamId: team._id });
    setTeam(null);
  };

  const fetchJoinRequests = async () => {
    if (!team) return;
    // This assumes pendingInvites are join requests
    setJoinRequests(team.pendingInvites?.filter(i => i.status === 'pending') || []);
  };

  const isOwner = team && team.owner && authUser && team.owner._id === authUser._id;
  const isOrganizer = authUser?.role === 'organizer';

  // Fetch available team challenges (open challenges)
  const fetchAvailableChallenges = async () => {
    const res = await axiosInstance.get('/challenge/open');
    console.log('Fetched open challenges:', res.data);
    // Use .message instead of .data
    const challenges = (res.data.message || []).map(slot => ({
      _id: slot._id,
      slotId: slot._id,
      challengerTeamId: slot.challenge?.challenger?._id || slot.challenge?.challenger,
      challengerTeamName: slot.challenge?.challenger?.name || 'Unknown',
      challengerTeamAvatar: slot.challenge?.challenger?.avatar || '/avatar.jpg',
      futsalName: slot.futsal?.name || 'Unknown',
      date: slot.date,
      time: slot.time
    }));
    setAvailableChallenges(challenges);
  };

  // Fetch available slots for creating a challenge
  const fetchAvailableSlots = async (futsalId) => {
    const res = await axiosInstance.get(`/challenge/eligible-slots/${futsalId}`);
    setAvailableSlots(res.data.message || []);
  };

  // Request a team challenge (with payment step)
  const handleRequestChallenge = async (slotId) => {
    setPendingPaymentAction({ type: 'create', slotId });
    setShowPaymentModal(true);
  };

  // Join a challenge (with payment step)
  const handleAcceptChallenge = async (slotId, opponentTeamId) => {
    setPendingPaymentAction({ type: 'join', slotId, opponentTeamId });
    setShowPaymentModal(true);
  };

  // Payment modal logic
  const handleConfirmPayment = async () => {
    if (!pendingPaymentAction) return;
    setShowPaymentModal(false);
    if (pendingPaymentAction.type === 'create') {
      try {
        await axiosInstance.post(`/challenge/request/${pendingPaymentAction.slotId}`, { challengerTeamId: team._id });
        fetchAvailableChallenges();
        fetchUpcomingMatches(); // Refresh upcoming matches after creating challenge
        toast.success('Challenge created and payment successful!');
      } catch (e) {
        toast.error('Failed to create challenge: ' + (e.response?.data?.message || e.message));
      }
    } else if (pendingPaymentAction.type === 'join') {
      try {
        await axiosInstance.post(`/challenge/join/${pendingPaymentAction.slotId}`, { opponentTeamId: pendingPaymentAction.opponentTeamId });
        fetchAvailableChallenges();
        fetchUpcomingMatches(); // Refresh upcoming matches after joining challenge
        toast.success('Challenge joined and payment successful!');
      } catch (e) {
        toast.error('Failed to join challenge: ' + (e.response?.data?.message || e.message));
      }
    }
    setPendingPaymentAction(null);
  };
  const handleCancelPayment = () => {
    setShowPaymentModal(false);
    setPendingPaymentAction(null);
  };

  // Fetch futsals for challenge creation
  const fetchChallengeFutsals = async () => {
    const res = await axiosInstance.get('/challenge/futsals');
    console.log('Fetched futsals for challenge creation:', res.data.message); // Debug log
    setChallengeFutsals(res.data.message || []);
  };

  // Fetch eligible slots for selected futsal
  const fetchChallengeSlots = async (futsalId, date = challengeDate) => {
    if (!futsalId) return; // Prevent API call if futsalId is undefined/null
    setSelectedFutsal(futsalId);
    const res = await axiosInstance.get(`/challenge/eligible-slots/${futsalId}?date=${date}`);
    console.log('Fetched eligible slots for futsal', futsalId, 'on', date, ':', res.data.message); // Debug log
    setChallengeSlots(res.data.message || []);
  };

  // Filter out own challenges from open challenges
  const filteredChallenges = availableChallenges.filter(
    challenge => team && challenge.challengerTeamId !== team._id
  );

  // Fetch upcoming matches (slots where team is A or B and slot is booked)
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [showUpcomingMatches, setShowUpcomingMatches] = useState(false);

  const fetchUpcomingMatches = async () => {
    const res = await axiosInstance.get('/myteam/get-by-user');
    const teamData = res.data.team;
    if (!teamData) {
      setUpcomingMatches([]);
      return;
    }
    // Log all slots for debugging
    console.log('DEBUG: teamData.slots', teamData.slots);
    // Show all slots with a challenge involving this team, regardless of status
    const matches = (teamData.slots || []).filter(slot => {
      if (!slot.challenge) return false;
      const challengerId = typeof slot.challenge.challenger === 'object' ? slot.challenge.challenger._id : slot.challenge.challenger;
      const opponentId = typeof slot.challenge.opponent === 'object' ? slot.challenge.opponent._id : slot.challenge.opponent;
      // Accept any slot with a challenge involving this team
      return (challengerId === teamData._id || opponentId === teamData._id);
    });
    setUpcomingMatches(matches);
  };

  useEffect(() => {
    fetchUpcomingMatches();
  }, [team]);

  // Debug: log availableChallenges and team
  useEffect(() => {
    console.log('DEBUG: availableChallenges', availableChallenges);
    console.log('DEBUG: team', team);
  }, [availableChallenges, team]);

  return (
    <div className={styles.body} style={{ width: '100vw', margin: 0, padding: 0 }}>
      <FutsalNavbar />
      <div className={styles.container} style={{ width: '100vw', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <div style={{ height: '100vh', minHeight: '100%', position: 'sticky', top: 0, left: 0, zIndex: 100 }}>
          <PlayerSidebar style={{ marginTop: 0, height: '100%', minHeight: '100vh' }} />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <main className={styles.mainContent} style={{ width: '100%', maxWidth: '1200px', padding: '0 20px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 65px)', marginTop: '88px' }}>
            <h1 className={styles.pageTitle}>My Team</h1>
            
            {loading ? <div>Loading...</div> : (
              <>
                {team ? (
                  <>
                    <div className={styles.teamDescCard}>
                      <div className={styles.teamDescLeft}>
                        <img src={team.avatar || '/avatar.jpg'} alt="team" className={styles.teamDescAvatar} />
                      </div>
                      <div className={styles.teamDescRight}>
                        <div className={styles.teamDescName}>{team.name}</div>
                        {team.tag && <span className={styles.teamDescTag}>{team.tag}</span>}
                        <div className={styles.teamDescDesc}>{team.description || 'No description set.'}</div>
                        <div className={styles.teamDescLoc}>{team.location || 'No location set.'}</div>
                      </div>
                      {isOwner && (
                        <button className={styles.updateBtn} style={{position:'absolute',top:24,right:24}} onClick={() => {
                          setUpdateName(team.name);
                          setUpdateAvatar(team.avatar || '');
                          setUpdateLocation(team.location || '');
                          setUpdateDescription(team.description || '');
                          setShowUpdateModal(true);
                        }}>Update</button>
                      )}
                    </div>
                    {/* Join Requests Button above slots (only for owner) */}
                    {isOwner && (
                      <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
                        <button
                          className={styles.joinReqBtn}
                          style={{padding:'6px 16px',fontSize:13,borderRadius:8,background:'#f3f4f6',color:'#2563eb',border:'1.5px solid #2563eb',fontWeight:600,cursor:'pointer',boxShadow:'0 1px 4px #2563eb11'}}
                          onClick={() => {
                            fetchJoinRequests();
                            setShowJoinRequestsModal(true);
                          }}
                        >
                          View Join Requests
                        </button>
                      </div>
                    )}
                    <div className={styles.slotsGrid}>
                      {Array.from({ length: 8 }).map((_, idx) => {
                        const slot = team.slots && team.slots[idx] ? team.slots[idx] : { status: 'empty' };
                        const width = 196, height = 245;
                        return (
                          <div
                            key={idx}
                            className={styles.slotCard + ' ' + slot.status}
                            onClick={() => {
                              if (slot.status === 'empty' && isOwner) setInviteModal({ open: true, slotIndex: idx });
                              if (slot.status === 'filled' && isOwner && slot.user && slot.user._id !== authUser._id) setRemoveModal({ open: true, slotIndex: idx, user: slot.user });
                            }}
                            style={{
                              ...(slot.status === 'empty' && isOwner ? { cursor: 'pointer', opacity: 0.85 } : {}),
                              ...(slot.status === 'filled' && isOwner && slot.user && slot.user._id !== authUser._id ? { cursor: 'pointer' } : {}),
                              width, minWidth: width, maxWidth: width, height, minHeight: height, maxHeight: height,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              position: 'relative',
                            }}
                          >
                            {slot.status === 'filled' && slot.user ? (
                              <>
                                <img src={slot.user.avatar || '/avatar.jpg'} alt="user" className={styles.memberAvatar} style={{width:84,height:84}} />
                                <div className={styles.memberName}>{slot.user.username}</div>
                                {team.owner._id === slot.user._id && <span className={styles.ownerTag}>Owner</span>}
                              </>
                            ) : slot.status === 'pending' ? (
                              <div className={styles.slotPending} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
                                <span>Pending...</span>
                              </div>
                            ) : (
                              <div className={styles.slotEmpty} style={{fontSize:34, color:'#bbb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                                <span style={{fontSize:50, lineHeight:1, fontWeight:300}}>+</span>
                                <span style={{fontSize:14, marginTop:6, color:'#aaa'}}>Invite Player</span>
                              </div>
                            )}
                            {slot.status === 'filled' && slot.user && slot.user._id === authUser._id && !isOwner && (
                              <button
                                className={styles.rejectBtn}
                                style={{fontSize:12,padding:'2px 10px',borderRadius:6,background:'#eee',color:'#b71c1c',border:'none',cursor:'pointer',marginTop:8}}
                                onClick={async e => {
                                  e.stopPropagation();
                                  await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex: idx });
                                  fetchTeam();
                                }}
                              >Leave Team</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:32}}>
                      {isOwner ? (
                        <>
                          <button className={styles.actionBtn} onClick={() => { setShowCreateChallengeModal(true); fetchChallengeFutsals(); }}>Create Challenge</button>
                          <button className={styles.actionBtn} onClick={() => setShowUpcomingMatches(v => !v)}>
                            {showUpcomingMatches ? 'Hide Upcoming Matches' : 'Upcoming Matches'}
                          </button>
                        </>
                      ) : (
                        <button className={styles.actionBtn} onClick={() => setShowUpcomingMatches(v => !v)}>
                          {showUpcomingMatches ? 'Hide Upcoming Matches' : 'Upcoming Matches'}
                        </button>
                      )}
                    </div>

                    {/* Render open challenges in the main content area instead of a modal */}
                    <div style={{margin:'32px 0'}}>
                      <h2 style={{fontWeight:700,marginBottom:12,fontSize:'1.3rem',color:'#2563eb'}}>Open Team Challenges</h2>
                      <div style={{display:'flex',flexDirection:'column',gap:12}}>
                        {filteredChallenges.length === 0 ? (
                          <div style={{color:'#999',fontSize:15}}>No open challenges found. Create one to get started!</div>
                        ) : (
                          filteredChallenges.map(challenge => (
                            <div key={challenge._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderRadius:10,background:'#f9f9f9',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',cursor:'pointer'}}>
                              <div style={{display:'flex',alignItems:'center',gap:14}}>
                                <img src={challenge.challengerTeamAvatar} alt="team" style={{width:40,height:40,borderRadius:8,objectFit:'cover'}} />
                                <div style={{fontWeight:600,fontSize:16}}>{challenge.challengerTeamName}</div>
                                <div style={{color:'#666',fontSize:15,marginLeft:14}}>{challenge.futsalName}</div>
                                <div style={{color:'#666',fontSize:15,marginLeft:14}}>{challenge.date} {challenge.time}</div>
                              </div>
                              <button className={styles.actionBtn} style={{fontSize:15,padding:'8px 22px'}} disabled={loading} onClick={() => handleAcceptChallenge(challenge.slotId, team._id)}>
                                {loading ? 'Joining...' : 'Join & Pay Half'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Upcoming Matches Modal */}
                    {showUpcomingMatches && (
                      <div className={styles.inviteModalOverlay}>
                        <div className={styles.inviteModal} style={{minWidth:340,maxWidth:600}}>
                          <h2 style={{fontWeight:700,marginBottom:12,fontSize:'1.3rem',color:'#16a34a'}}>Upcoming Matches</h2>
                          <button className={styles.closeBtn} onClick={() => setShowUpcomingMatches(false)}>×</button>
                          <button className={styles.actionBtn} style={{marginBottom:12}} onClick={fetchUpcomingMatches}>Refresh</button>
                          <div style={{display:'flex',flexDirection:'column',gap:12}}>
                            {upcomingMatches.length === 0 ? (
                              <div style={{color:'#999',fontSize:15}}>No upcoming matches yet.</div>
                            ) : (
                              upcomingMatches.map(match => (
                                <div key={match._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderRadius:10,background:'#f0fdf4',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',cursor:'pointer'}}>
                                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                                    <div style={{fontWeight:600,fontSize:16}}>Team A: {match.challenge?.challenger?.name || 'TBD'}</div>
                                    <div style={{fontWeight:600,fontSize:16,marginLeft:14}}>Team B: {match.challenge?.opponent?.name || 'TBD'}</div>
                                    <div style={{color:'#666',fontSize:15,marginLeft:14}}>{match.date} {match.time}</div>
                                    <div style={{color:'#666',fontSize:15,marginLeft:14}}>{match.futsal?.name || 'Unknown Futsal'}</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Create Challenge Modal: Step 1 - Futsal Selection */}
                    {showCreateChallengeModal && !selectedFutsal && (
                      <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                          <h2>Select Futsal for Challenge</h2>
                          <input
                            type="text"
                            placeholder="Search futsal..."
                            value={futsalSearch}
                            onChange={e => setFutsalSearch(e.target.value)}
                            style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #ddd' }}
                          />
                          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {filteredFutsals.map(futsal => (
                              <div
                                key={futsal._id}
                                onClick={() => { setSelectedFutsal(futsal._id); fetchChallengeSlots(futsal._id); }}
                                style={{
                                  border: '1.5px solid #eee',
                                  borderRadius: 12,
                                  padding: 16,
                                  minWidth: 220,
                                  cursor: 'pointer',
                                  background: '#fafbfc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12
                                }}
                              >
                                <img src={futsal.futsalPhoto || '/default-futsal.jpg'} alt="icon" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 16 }}>{futsal.name}</div>
                                  <div style={{ color: '#888', fontSize: 13 }}>{futsal.location}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setShowCreateChallengeModal(false)} className={styles.actionBtn} style={{ marginTop: 16 }}>Close</button>
                        </div>
                      </div>
                    )}

                    {/* Create Challenge Modal */}
                    {showCreateChallengeModal && selectedFutsal && (
                      <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                          <h2>Select Slot for Challenge</h2>
                          <div style={{ marginBottom: 16 }}>
                            <label htmlFor="challenge-date" style={{ fontWeight: 600, marginRight: 8 }}>Date:</label>
                            <input
                              id="challenge-date"
                              type="date"
                              value={challengeDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => {
                                setChallengeDate(e.target.value);
                                fetchChallengeSlots(selectedFutsal, e.target.value);
                              }}
                              style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
                            />
                          </div>
                          {challengeSlots.length === 0 ? (
                            <div>No available slots found.</div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                              <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                  <th style={{ padding: 8 }}>Date</th>
                                  <th style={{ padding: 8 }}>Time</th>
                                  <th style={{ padding: 8 }}>Players</th>
                                  <th style={{ padding: 8 }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {challengeSlots.map((slot, idx) => (
                                  <tr key={slot._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 8 }}>{slot.date}</td>
                                    <td style={{ padding: 8 }}>{slot.time}</td>
                                    <td style={{ padding: 8 }}>{slot.players?.length || 0} / {slot.maxPlayers}</td>
                                    <td style={{ padding: 8 }}>
                                      <button
                                        onClick={async () => {
                                          // Call backend to create challenge and trigger payment
                                          await handleRequestChallenge(slot._id);
                                        }}
                                        className={styles.actionBtn}
                                        style={{marginTop:0}}
                                      >Create Challenge</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          <button onClick={() => setShowCreateChallengeModal(false)} className={styles.actionBtn} style={{marginTop:16}}>Close</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.createTeamBox} style={{
                    maxWidth: 400,
                    margin: '48px auto',
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 2px 16px 0 #0001',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 24
                  }}>
                    <div style={{textAlign:'center',marginBottom:8}}>
                      <h2 style={{fontWeight:700,marginBottom:8,fontSize:'1.6rem',color:'#222'}}>Find Your Futsal Team</h2>
                      <div style={{color:'#888',fontSize:'1rem',fontWeight:400}}>Join a team to play, connect, and have fun!</div>
                    </div>
                    <button className={styles.actionBtn} style={{width:'100%',maxWidth:320,justifyContent:'flex-start',gap:12,fontWeight:500,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#f5f7fa',color:'#222',boxShadow:'0 1px 4px #0001'}} onClick={() => setShowAvailableTeams(true)}>
                      <span role="img" aria-label="join" style={{fontSize:'1.3em'}}>🔍</span> Join Available Teams
                    </button>
                    <button className={styles.actionBtn} style={{width:'100%',maxWidth:320,justifyContent:'flex-start',gap:12,fontWeight:500,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#f5f7fa',color:'#222',boxShadow:'0 1px 4px #0001'}} onClick={() => setShowTeamInvitesModal(true)}>
                      <span role="img" aria-label="invites" style={{fontSize:'1.3em'}}>📩</span> See Invitations Received
                    </button>
                    <div style={{width:'100%',maxWidth:320,marginTop:8}}>
                      <div style={{textAlign:'center',color:'#aaa',fontSize:'0.98rem',margin:'18px 0 8px'}}>or</div>
                      <button className={styles.actionBtn} style={{width:'100%',justifyContent:'center',fontWeight:600,fontSize:'1.08rem',padding:'12px 20px',borderRadius:12,background:'#222',color:'#fff',boxShadow:'0 1px 4px #0001',marginBottom:18}} onClick={() => setShowUpdateModal(true)}>
                        <span role="img" aria-label="create" style={{fontSize:'1.3em'}}>➕</span> Create a Team
                      </button>
                      {/* Show create form only if showUpdateModal is true */}
                      {showUpdateModal && (
                        <div style={{marginTop:12}}>
                          <form onSubmit={async e => {
                            e.preventDefault();
                            setLoading(true);
                            await axiosInstance.post('/myteam/create', { name: updateName, description: updateDescription });
                            setLoading(false);
                            setShowUpdateModal(false);
                            setUpdateName('');
                            setUpdateDescription('');
                            fetchTeam();
                          }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input value={updateName} onChange={e => setUpdateName(e.target.value)} placeholder="Team Name" required />
                            <textarea value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} placeholder="Team Description" rows={3} style={{resize:'vertical'}} />
                            <button type="submit" className={styles.acceptBtn}>Create Team</button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {inviteModal.open && (
        <InviteModal
          friends={friends}
          team={team}
          slotIndex={inviteModal.slotIndex}
          onInvite={handleInvite}
          onClose={() => setInviteModal({ open: false, slotIndex: null })}
        />
      )}
      {showUpdateModal && team && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Update Team Info</h3>
            <form onSubmit={handleUpdateTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input value={updateName} onChange={e => setUpdateName(e.target.value)} placeholder="Team Name" required />
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <label htmlFor="avatar-upload" style={{cursor:'pointer'}}>
                  <img
                    src={avatarFile ? URL.createObjectURL(avatarFile) : (updateAvatar || team?.avatar || '/avatar.jpg')}
                    alt="team-avatar"
                    className={styles.teamAvatar}
                    style={{width:70,height:70,objectFit:'cover',borderRadius:'50%',border:'2px solid #e0e0e0'}}
                    onClick={() => document.getElementById('avatar-upload').click()}
                  />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                  setAvatarFile(e.target.files[0]);
                  handleAvatarUpload(e.target.files[0]);
                }} />
              </div>
              <input value={updateLocation} onChange={e => setUpdateLocation(e.target.value)} placeholder="Team Location (e.g. City, Area)" />
              <textarea value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} placeholder="Team Description" rows={3} style={{resize:'vertical'}} />
              <div style={{display:'flex',gap:8}}>
                <button type="submit" className={styles.acceptBtn}>Update</button>
                <button type="button" className={styles.rejectBtn} onClick={()=>setShowUpdateModal(false)}>Cancel</button>
                <button type="button" className={styles.deleteBtn} style={{marginLeft:'auto',background:'#eee',color:'#b71c1c',fontSize:12,padding:'4px 10px',borderRadius:6}} onClick={handleDeleteTeam}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTeamInvitesModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Team Invites Received</h3>
            <button className={styles.closeBtn} onClick={() => setShowTeamInvitesModal(false)}>×</button>
            {pendingTeamInvites.length === 0 ? (
              <div>No team invites received.</div>
            ) : (
              pendingTeamInvites.map(invite => (
                <div key={invite.teamId} className={styles.teamInviteBox}>
                  <div><b>Team:</b> {invite.teamName}</div>
                  <div><b>From:</b> {invite.ownerName}</div>
                  <button className={styles.acceptBtn} onClick={async () => {
                    await axiosInstance.post('/myteam/accept-invite', { teamId: invite.teamId });
                    fetchTeam();
                    setShowTeamInvitesModal(false);
                  }}>Accept</button>
                  <button className={styles.rejectBtn} onClick={async () => {
                    await axiosInstance.post('/myteam/decline-invite', { teamId: invite.teamId });
                    fetchTeam();
                    setShowTeamInvitesModal(false);
                  }}>Decline</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Only show join requests modal for owner */}
      {isOwner && showJoinRequestsModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Join Requests</h3>
            <button className={styles.closeBtn} onClick={() => setShowJoinRequestsModal(false)}>×</button>
            {(!team || !team.joinRequests || team.joinRequests.length === 0) ? (
              <div>No join requests.</div>
            ) : (
              team.joinRequests.filter(j => j.status === 'pending').map((req, i) => (
                <div key={i} className={styles.teamInviteBox} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                  <div>
                    <div><b>User:</b> {req.user?.username || req.user?.email || req.user}</div>
                    <div><b>Status:</b> {req.status}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className={styles.acceptBtn} style={{fontSize:13,padding:'4px 12px'}} onClick={async()=>{
                      await axiosInstance.post('/myteam/accept-join-request', { teamId: team._id, userId: req.user._id || req.user });
                      fetchTeam();
                    }}>Accept</button>
                    <button className={styles.rejectBtn} style={{fontSize:13,padding:'4px 12px'}} onClick={async()=>{
                      await axiosInstance.post('/myteam/decline-join-request', { teamId: team._id, userId: req.user._id || req.user });
                      fetchTeam();
                    }}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showMatchRequestsModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Match Requests</h3>
            <button className={styles.closeBtn} onClick={() => setShowMatchRequestsModal(false)}>×</button>
            <div>No match requests yet.</div>
          </div>
        </div>
      )}
      <AvailableTeamsModal open={showAvailableTeams} onClose={() => setShowAvailableTeams(false)} />
      {removeModal.open && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal}>
            <h3>Remove Player</h3>
            <div style={{display:'flex',alignItems:'center',gap:16,margin:'18px 0'}}>
              <img src={removeModal.user.avatar || '/avatar.jpg'} alt="avatar" style={{width:54,height:54,borderRadius:12}} />
              <div>
                <div style={{fontWeight:600,fontSize:'1.1rem'}}>{removeModal.user.username}</div>
              </div>
            </div>
            <button className={styles.rejectBtn} style={{fontSize:15,padding:'8px 24px'}} onClick={async()=>{
              await axiosInstance.post('/myteam/remove-member', { teamId: team._id, slotIndex: removeModal.slotIndex });
              setRemoveModal({ open: false, slotIndex: null, user: null });
              fetchTeam();
            }}>Remove from Team</button>
            <button className={styles.acceptBtn} style={{marginLeft:12}} onClick={()=>setRemoveModal({ open: false, slotIndex: null, user: null })}>Cancel</button>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.inviteModalOverlay}>
          <div className={styles.inviteModal} style={{minWidth:340,maxWidth:400}}>
            <h3 style={{marginBottom:18}}>Confirm Payment</h3>
            <div style={{marginBottom:18}}>
              You need to pay half the futsal price to {pendingPaymentAction?.type === 'create' ? 'create' : 'join'} this challenge.<br/>
              Proceed with payment?
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button className={styles.rejectBtn} onClick={handleCancelPayment}>Cancel</button>
              <button className={styles.acceptBtn} onClick={handleConfirmPayment}>Pay & Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CreateTeamForm({ onCreated }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await axiosInstance.post('/myteam/create', { name, avatar });
    setLoading(false);
    onCreated();
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Team Name" required />
      <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL (optional)" />
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Team'}</button>
    </form>
  );
}

function InviteModal({ friends, team, slotIndex, onInvite, onClose }) {
  // Only show friends not already in team or pending
  const takenIds = new Set([
    ...team.slots.filter(s => s.user).map(s => s.user._id),
    ...team.pendingInvites.filter(i => i.status === 'pending').map(i => i.user._id)
  ]);
  const availableFriends = friends.filter(f => !takenIds.has(f._id));
  return (
    <div className={styles.inviteModalOverlay}>
      <div className={styles.inviteModal}>
        <h3>Invite a Friend to Slot {slotIndex + 1}</h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div className={styles.friendList}>
          {availableFriends.length === 0 ? (
            <div>No available friends to invite.</div>
          ) : (
            availableFriends.map(friend => (
              <div key={friend._id} className={styles.friendItem}>
                <img src={friend.avatar || '/avatar.jpg'} alt="avatar" />
                <span>{friend.username}</span>
                <button onClick={() => onInvite(friend._id, slotIndex)}>Invite</button>
              </div>
            ))
            )}
        </div>
      </div>
    </div>
  );
}

function AvailableTeamsModal({ open, onClose }) {
  const [teams, setTeams] = useState([]);
  const [joining, setJoining] = useState(null);
  const [requestedTeams, setRequestedTeams] = useState([]); // Track teams already requested
  const { authUser } = useAuthStore();

  // Fetch all teams and join requests
  useEffect(() => {
    if (open) {
      (async () => {
        const res = await axiosInstance.get('/myteam/all');
        setTeams(res.data.teams || []);
        // Fetch join requests for this user
        const reqRes = await axiosInstance.get('/myteam/my-join-requests');
        setRequestedTeams(reqRes.data.teamIds || []);
      })();
    }
  }, [open]);

  // Helper: has user already requested to join this team?
  const hasRequested = (teamId) => requestedTeams.includes(teamId);

  // Cancel join request
  const handleCancelJoinRequest = async (teamId) => {
    await axiosInstance.post('/myteam/cancel-join-request', { teamId });
    setRequestedTeams(prev => prev.filter(id => id !== teamId));
  };

  if (!open) return null;
  return (
    <div className={styles.inviteModalOverlay}>
      <div className={styles.inviteModal} style={{minWidth:340,maxWidth:500}}>
        <h3 style={{marginBottom:18}}>Available Teams</h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {teams.length === 0 ? <div>No teams found.</div> : teams.map(team => (
            <div key={team._id} style={{display:'flex',alignItems:'center',gap:18,padding:'12px 0',borderBottom:'1px solid #eee'}}>
              <img src={team.avatar || '/avatar.jpg'} alt="avatar" style={{width:54,height:54,borderRadius:12,objectFit:'cover',background:'#f3f3f3'}} />
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'1.1rem'}}>{team.name}</div>
                <div style={{color:'#888',fontSize:'0.98rem',fontWeight:400}}>Owner: {team.owner?.username || 'N/A'}</div>
                <div style={{color:'#aaa',fontSize:'0.95rem'}}>Players: {team.slots?.filter(s=>s.status==='filled').length || 1}/8</div>
              </div>
              {hasRequested(team._id) ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <button className={styles.actionBtn} style={{fontSize:'0.98rem',padding:'8px 18px',background:'#e0e7ff',color:'#2563eb',cursor:'not-allowed'}} disabled>
                    Request Sent
                  </button>
                  <button className={styles.rejectBtn} style={{fontSize:'0.95rem',padding:'4px 10px'}} onClick={()=>handleCancelJoinRequest(team._id)}>
                    Cancel Request
                  </button>
                </div>
              ) : (
                <button className={styles.actionBtn} style={{fontSize:'0.98rem',padding:'8px 18px'}} disabled={joining===team._id} onClick={async()=>{
                  setJoining(team._id);
                  await axiosInstance.post('/myteam/request-join', { teamId: team._id });
                  setRequestedTeams(prev => [...prev, team._id]); // Update state so button changes
                  setJoining(null);
                }}>
                  Request to Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTeamPage;
