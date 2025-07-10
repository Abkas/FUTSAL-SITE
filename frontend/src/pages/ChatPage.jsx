import React, { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import { axiosInstance } from '../lib/axios';
import styles from './css/ChatPage.module.css';
import FutsalNavbar from '../components/FutsalNavbar';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileChatView, setIsMobileChatView] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/friendships/list');
        const friendsData = response.data.message || [];
        setFriends(Array.isArray(friendsData) ? friendsData : []);
        setSelectedFriend(Array.isArray(friendsData) && friendsData.length > 0 ? friendsData[0] : null);
      } catch (err) {
        setError('Failed to load friends');
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    if (isMobile) setIsMobileChatView(true);
  };

  const handleBackToFriends = () => {
    setIsMobileChatView(false);
  };

  return (
    <div>
      <FutsalNavbar />
      <div className={styles.chatContainer}>
        {/* Friends List (show only on desktop or if not in chat view on mobile) */}
        {(!isMobile || !isMobileChatView) && (
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Messages</h2>
            </div>
            <div className={styles.friendsList}>
              {loading && (
                <div className={styles.loadingState}>Loading friends...</div>
              )}
              {error && (
                <div className={styles.errorState}>{error}</div>
              )}
              {!loading && !error && friends.length === 0 && (
                <div className={styles.noFriendsState}>
                  <div className={styles.noFriendsIcon}>👥</div>
                  <p className={styles.noFriendsText}>No friends yet</p>
                  <p className={styles.noFriendsSubtext}>Add some friends to start chatting!</p>
                </div>
              )}
              {!loading && !error && friends.map(friend => (
                <div
                  key={friend._id}
                  onClick={() => handleFriendSelect(friend)}
                  className={`${styles.friendItem} ${selectedFriend && selectedFriend._id === friend._id ? styles.active : ''}`}
                >
                  <img
                    src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=0366d6&color=fff`}
                    alt={friend.username}
                    className={styles.friendAvatar}
                    onError={e => {
                      e.target.src = `https://ui-avatars.com/api/?name=${friend.username}&background=0366d6&color=fff`;
                    }}
                  />
                  <div className={styles.friendInfo}>
                    <p className={styles.friendName}>{friend.username}</p>
                    <p className={styles.friendStatus}>Online</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Chat Window (show only if friend selected and (not mobile or in chat view on mobile)) */}
        {selectedFriend && (!isMobile || isMobileChatView) && (
          <div className={styles.chatWindow}>
            <ChatBox
              friend={selectedFriend}
              onBack={isMobile ? handleBackToFriends : undefined}
              isMobileView={isMobile}
            />
          </div>
        )}
        {/* Empty state for desktop if no friend selected */}
        {!selectedFriend && !isMobile && (
          <div className={styles.chatWindow}>
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💬</div>
              <p className={styles.emptyStateText}>Select a friend to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 