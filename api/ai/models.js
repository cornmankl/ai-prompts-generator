// AI Models API route
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const models = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Most capable GPT-4 model with vision capabilities',
      maxTokens: 128000,
      costPerToken: 0.00003,
      capabilities: ['text', 'vision', 'function_calling'],
      status: 'available'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      description: 'Faster, cheaper GPT-4 model',
      maxTokens: 128000,
      costPerToken: 0.000015,
      capabilities: ['text', 'function_calling'],
      status: 'available'
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Most intelligent Claude model with excellent reasoning',
      maxTokens: 200000,
      costPerToken: 0.00003,
      capabilities: ['text', 'vision', 'function_calling'],
      status: 'available'
    },
    {
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      description: 'Fast and efficient Claude model',
      maxTokens: 200000,
      costPerToken: 0.0000125,
      capabilities: ['text', 'vision'],
      status: 'available'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Google\'s most capable language model',
      maxTokens: 30720,
      costPerToken: 0.00001,
      capabilities: ['text', 'function_calling'],
      status: 'available'
    }
  ];

  res.status(200).json({
    success: true,
    data: models,
    total: models.length
  });
}
