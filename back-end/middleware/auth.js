import jwt from 'jsonwebtoken';

export function generateToken(userId) {
    return jwt.sign(
        { _id: userId }, 
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
}

export function protect(req, res, next) {
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

/*for admin*/
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Forbidden: You do not have permission'
            });
        }

        next();
    };
}
