const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle React routing, return all requests to React app (except for static assets)
app.get('*', (req, res) => {
  // Don't serve HTML for static assets
  if (req.path.startsWith('/assets/') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.svg') || req.path.endsWith('.ico')) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 AI Prompts Generator running on http://127.0.0.1:${PORT}`);
  console.log(`📱 React App: http://127.0.0.1:${PORT}`);
  console.log(`✨ Live reload enabled for development`);
});
