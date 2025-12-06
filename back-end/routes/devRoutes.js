// routes/devRoutes.js
import { Router } from 'express';

export function devRouter() {
    const router = Router();

    router.get('/health', (_req, res) => {
        res.json({
            success: true,
            message: 'API is running (DEV mode: localStorage)',
            timestamp: new Date().toISOString(),
            mongodb: 'not connected'
        });
    });

    //
    router.get('/auth/me', (_req, res) => res.status(401).json({ error: 'Not authenticated (DEV)' }));
    router.post('/auth/login', (_req, res) => res.json({ message: 'DEV login (localStorage)' }));
    router.post('/auth/logout', (_req, res) => res.json({ message: 'Logged out (DEV)' }));
    router.post('/auth/signup', (_req, res) => res.json({ message: 'Signup simulated (DEV)' }));

    router.get('/memories', (_req, res) => res.json([]));
    router.get('/users', (_req, res) => res.json([]));
    router.get('/notifications', (_req, res) => res.json([]));

    return router;
}
