import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = express.Router();

// GET /status endpoint
router.get('/status', AppController.getStatus);

// GET /stats endpoint
router.get('/stats', AppController.getStats);

// GET /status endpoint
router.get('/connect', AuthController.getConnect);

// GET /status endpoint
router.get('/disconnect', AuthController.getDisconnect);

// GET /status endpoint
router.get('/users/me', UserController.getMe);

// POST /users endpoint
router.post('/users', UsersController.postNew);

export default router;
