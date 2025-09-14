// Analytics Overall API route
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = 'month' } = req.query;

    // Mock analytics data
    const analyticsData = {
      totalUsers: 1250,
      activeUsers: 890,
      totalPrompts: 15600,
      totalResponses: 14800,
      totalTokens: 2500000,
      totalCost: 125.50,
      averageResponseTime: 1200,
      popularModels: [
        { model: 'gpt-4o', count: 8500, percentage: 57.4 },
        { model: 'claude-3-5-sonnet', count: 4200, percentage: 26.9 },
        { model: 'gpt-4o-mini', count: 2100, percentage: 13.5 },
        { model: 'claude-3-5-haiku', count: 800, percentage: 5.1 }
      ],
      popularCategories: [
        { category: 'Creative Writing', count: 4200, percentage: 26.9 },
        { category: 'Code Generation', count: 3800, percentage: 24.4 },
        { category: 'Analysis', count: 3200, percentage: 20.5 },
        { category: 'Translation', count: 2100, percentage: 13.5 },
        { category: 'Summarization', count: 1800, percentage: 11.5 },
        { category: 'Other', count: 500, percentage: 3.2 }
      ],
      usageByDay: generateUsageByDay(timeRange),
      userGrowth: generateUserGrowth(timeRange),
      revenue: generateRevenue(timeRange),
      errorRate: 0.02,
      averageSessionDuration: 1800,
      bounceRate: 0.15,
      topFeatures: [
        { feature: 'AI Chat', usage: 95, satisfaction: 4.8 },
        { feature: 'Prompt Templates', usage: 78, satisfaction: 4.6 },
        { feature: 'Model Comparison', usage: 65, satisfaction: 4.7 },
        { feature: 'Analytics Dashboard', usage: 45, satisfaction: 4.5 },
        { feature: 'Collaboration', usage: 32, satisfaction: 4.4 }
      ]
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
      timeRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
}

function generateUsageByDay(timeRange) {
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      prompts: Math.floor(Math.random() * 100) + 50,
      tokens: Math.floor(Math.random() * 10000) + 5000,
      cost: Math.random() * 10 + 2
    });
  }
  
  return data;
}

function generateUserGrowth(timeRange) {
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
  const data = [];
  let totalUsers = 1000;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const newUsers = Math.floor(Math.random() * 10) + 2;
    totalUsers += newUsers;
    
    data.push({
      date: date.toISOString().split('T')[0],
      newUsers,
      totalUsers
    });
  }
  
  return data;
}

function generateRevenue(timeRange) {
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      amount: Math.random() * 50 + 10,
      currency: 'USD'
    });
  }
  
  return data;
}
