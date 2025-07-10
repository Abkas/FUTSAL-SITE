import Message from '../models/message.model.js';

// Get all messages between two users
export const getMessages = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.body;
  const { text } = req.body;
  try {
    const message = await Message.create({ sender: userId, recipient: friendId, text });
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}; 