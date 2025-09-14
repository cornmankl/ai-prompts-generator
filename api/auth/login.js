// Auth Login API route
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Mock authentication - in production, validate against database
    if (email === 'demo@example.com' && password === 'demo123') {
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'demo@example.com',
            name: 'Demo User',
            avatar: null,
            subscription: {
              plan: 'free',
              status: 'active',
              features: ['basic_ai', 'prompt_templates', 'analytics']
            },
            preferences: {
              theme: 'system',
              language: 'en',
              notifications: true
            },
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
