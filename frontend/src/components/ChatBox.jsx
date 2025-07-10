import React, { useState, useRef, useEffect } from 'react';
import { socket } from '../utils/socket';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import styles from '../pages/css/ChatPage.module.css';

const ChatBox = ({ friend, onBack, isMobileView }) => {
  const { authUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Join socket room and fetch messages when friend changes
  useEffect(() => {
    if (!authUser) return;
    console.log('Connecting to socket for user:', authUser._id);
    if (!socket.connected) {
      socket.connect();
      socket.emit('join', authUser._id);
    }
    // Fetch chat history
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/messages/${friend._id}`);
        console.log('Fetched messages:', res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // Listen for incoming messages
    socket.on('chat:receive', handleReceive);
    
    // Debug socket connection
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    return () => {
      socket.off('chat:receive', handleReceive);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
    // eslint-disable-next-line
  }, [friend, authUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReceive = (msg) => {
    console.log('Received message:', msg);
    // Only add if relevant to this chat
    if (
      (msg.sender === authUser._id && msg.recipient === friend._id) ||
      (msg.sender === friend._id && msg.recipient === authUser._id)
    ) {
      console.log('Adding message to chat');
      setMessages((prev) => [...prev, msg]);
    }
  };

  const sendMessage = () => {
    if (input.trim() && authUser) {
      console.log('Sending message:', {
        sender: authUser._id,
        recipient: friend._id,
        text: input,
      });
      socket.emit('chat:send', {
        sender: authUser._id,
        recipient: friend._id,
        text: input,
      });
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className={styles.chatHeader}>
        {isMobileView && (
          <button 
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to friends"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <img 
          src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=0366d6&color=fff`} 
          alt={friend.username} 
          className={styles.chatHeaderAvatar}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${friend.username}&background=0366d6&color=fff`;
          }}
        />
        <div className={styles.chatHeaderInfo}>
          <p className={styles.chatHeaderName}>{friend.username}</p>
          <p className={styles.chatHeaderStatus}>Online</p>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className={styles.messagesContainer} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div className={styles.loadingState}>Loading messages...</div>
          ) : (
            <div className={styles.messageList}>
              {messages.map((msg, idx) => (
                <div 
                  key={msg._id || idx} 
                  className={`${styles.messageItem} ${msg.sender === authUser._id ? styles.sent : styles.received}`}
                >
                  <div className={`${styles.messageBubble} ${msg.sender === authUser._id ? styles.sent : styles.received}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className={styles.messageInputContainer}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className={styles.messageInput}
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim()}
            className={styles.sendButton}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox; 