import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all messages between current user and friend
router.get('/:friendId', verifyJWT, getMessages);
// Send a message to a friend
router.post('/', verifyJWT, sendMessage);

export default router; 