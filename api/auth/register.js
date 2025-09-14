// Auth Register API route
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Basic validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Mock registration - in production, save to database
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: 'user-' + Date.now(),
          email,
          name,
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
      },
      message: 'Account created successfully! Welcome to AI Prompts Generator.'
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
