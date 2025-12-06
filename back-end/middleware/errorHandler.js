export function errorHandler(err, _req, res, _next) {
    console.error('❌ Error:', err);
    const status = err.status || 500;
    const msg = err.message || 'Server error';
    res.status(status).json({ error: msg });
}
