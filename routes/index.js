import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// GET /status endpoint
router.get('/status', AppController.getStatus);

// GET /stats endpoint
router.get('/stats', AppController.getStats);

// POST /users endpoint
router.post('/users', UsersController.postNew);

// GET /status endpoint
router.get('/connect', AuthController.getConnect);

// GET /status endpoint
router.get('/disconnect', AuthController.getDisconnect);

// GET /status endpoint
router.get('/users/me', UsersController.getMe);

// POST /files endpoint
router.post('/files', FilesController.postUpload);

export default router;
