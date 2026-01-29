const express = require('express');
const app = express();
const PORT = 5500;

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: 'connected' });
});

app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
});
