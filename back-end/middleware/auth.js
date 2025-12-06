import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = bearer || req.cookies?.token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, username, role, ... }
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
