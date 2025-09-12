import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Medal, 
  Badge, 
  Target, 
  Zap, 
  Flame, 
  Rocket, 
  Diamond, 
  Gem, 
  Shield, 
  Sword, 
  Bow, 
  Wand, 
  Key, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Download, 
  Upload, 
  Code, 
  Database, 
  Network, 
  Globe, 
  Compass, 
  Navigation, 
  Map, 
  Camera, 
  Mic, 
  MicOff, 
  Headphones, 
  HeadphonesOff, 
  Speaker, 
  SpeakerOff, 
  Radio, 
  Tv, 
  Laptop, 
  Desktop, 
  Server, 
  Cloud, 
  CloudOff, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  CloudFog, 
  Wind, 
  Thermometer, 
  Droplet, 
  Flame as FlameIcon, 
  Snowflake, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Umbrella, 
  Key as KeyIcon, 
  Fingerprint, 
  QrCode, 
  Barcode, 
  CreditCard, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Yen, 
  Bitcoin, 
  TrendingDown, 
  BarChart, 
  PieChart, 
  LineChart, 
  AreaChart, 
  Scatter, 
  Radar, 
  Gauge,
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize,
  Minimize,
  Layers,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sun as SunIcon,
  Moon as MoonIcon,
  Monitor,
  Palette,
  Brush,
  Eraser,
  Scissors,
  Copy,
  Paste,
  Cut,
  Undo,
  Redo,
  Save,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
  Trash2,
  Edit,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  HelpCircle,
  Info,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../common/EnhancedToast'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'usage' | 'social' | 'skill' | 'special' | 'milestone'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: {
    type: string
    target: number
    current: number
  }[]
  unlocked: boolean
  unlockedAt?: Date
  progress: number
}

interface UserStats {
  level: number
  experience: number
  experienceToNext: number
  totalPoints: number
  achievements: number
  streak: number
  longestStreak: number
  rank: number
  percentile: number
}

interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  level: number
  points: number
  achievements: number
  rank: number
  isCurrentUser: boolean
}

const AchievementSystem: React.FC = () => {
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'progress'>('achievements')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    { id: 'all', name: 'All', icon: Grid },
    { id: 'usage', name: 'Usage', icon: BarChart3 },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'skill', name: 'Skill', icon: Target },
    { id: 'special', name: 'Special', icon: Star },
    { id: 'milestone', name: 'Milestone', icon: Trophy }
  ]

  const rarities = [
    { id: 'all', name: 'All', color: 'gray' },
    { id: 'common', name: 'Common', color: 'gray' },
    { id: 'uncommon', name: 'Uncommon', color: 'green' },
    { id: 'rare', name: 'Rare', color: 'blue' },
    { id: 'epic', name: 'Epic', color: 'purple' },
    { id: 'legendary', name: 'Legendary', color: 'yellow' }
  ]

  useEffect(() => {
    loadAchievements()
    loadUserStats()
    loadLeaderboard()
  }, [])

  const loadAchievements = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: 'first_prompt',
          name: 'First Steps',
          description: 'Generate your first AI prompt',
          icon: Play,
          category: 'milestone',
          rarity: 'common',
          points: 10,
          requirements: [
            { type: 'prompts_generated', target: 1, current: 1 }
          ],
          unlocked: true,
          unlockedAt: new Date('2024-01-01'),
          progress: 100
        },
        {
          id: 'prompt_master',
          name: 'Prompt Master',
          description: 'Generate 100 AI prompts',
          icon: Crown,
          category: 'usage',
          rarity: 'uncommon',
          points: 50,
          requirements: [
            { type: 'prompts_generated', target: 100, current: 45 }
          ],
          unlocked: false,
          progress: 45
        },
        {
          id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Share 10 prompts with the community',
          icon: Share2,
          category: 'social',
          rarity: 'rare',
          points: 100,
          requirements: [
            { type: 'prompts_shared', target: 10, current: 3 }
          ],
          unlocked: false,
          progress: 30
        },
        {
          id: 'ai_expert',
          name: 'AI Expert',
          description: 'Use all available AI models',
          icon: Brain,
          category: 'skill',
          rarity: 'epic',
          points: 200,
          requirements: [
            { type: 'models_used', target: 8, current: 5 }
          ],
          unlocked: false,
          progress: 62.5
        },
        {
          id: 'legendary_creator',
          name: 'Legendary Creator',
          description: 'Create a prompt that gets 1000+ likes',
          icon: Diamond,
          category: 'special',
          rarity: 'legendary',
          points: 500,
          requirements: [
            { type: 'max_likes', target: 1000, current: 42 }
          ],
          unlocked: false,
          progress: 4.2
        }
      ]
      
      setAchievements(mockAchievements)
    } catch (err) {
      error('Failed to load achievements', 'Please try again later')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      // Mock user stats
      const mockStats: UserStats = {
        level: 12,
        experience: 2450,
        experienceToNext: 500,
        totalPoints: 1250,
        achievements: 8,
        streak: 7,
        longestStreak: 15,
        rank: 42,
        percentile: 85
      }
      
      setUserStats(mockStats)
    } catch (err) {
      error('Failed to load user stats', 'Please try again later')
    }
  }

  const loadLeaderboard = async () => {
    try {
      // Mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: 'user1',
          name: 'AI Master',
          avatar: '/avatars/user1.jpg',
          level: 25,
          points: 5420,
          achievements: 45,
          rank: 1,
          isCurrentUser: false
        },
        {
          id: 'user2',
          name: 'Prompt Wizard',
          avatar: '/avatars/user2.jpg',
          level: 22,
          points: 4890,
          achievements: 38,
          rank: 2,
          isCurrentUser: false
        },
        {
          id: 'user3',
          name: 'Code Genius',
          avatar: '/avatars/user3.jpg',
          level: 20,
          points: 4320,
          achievements: 35,
          rank: 3,
          isCurrentUser: false
        },
        {
          id: user?.id || 'current',
          name: user?.name || 'You',
          avatar: user?.avatar || '/avatars/default.jpg',
          level: 12,
          points: 1250,
          achievements: 8,
          rank: 42,
          isCurrentUser: true
        }
      ]
      
      setLeaderboard(mockLeaderboard)
    } catch (err) {
      error('Failed to load leaderboard', 'Please try again later')
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-500',
      uncommon: 'text-green-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    }
    return colors[rarity as keyof typeof colors] || 'text-gray-500'
  }

  const getRarityBgColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 dark:bg-gray-800',
      uncommon: 'bg-green-100 dark:bg-green-900',
      rare: 'bg-blue-100 dark:bg-blue-900',
      epic: 'bg-purple-100 dark:bg-purple-900',
      legendary: 'bg-yellow-100 dark:bg-yellow-900'
    }
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800'
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity
    return matchesCategory && matchesRarity
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Achievement System</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock achievements, level up, and compete with the community
          </p>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Level {userStats.level}</div>
                  <div className="text-sm text-gray-500">Current Level</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${(userStats.experience / (userStats.experience + userStats.experienceToNext)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {userStats.experience} / {userStats.experience + userStats.experienceToNext} XP
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-accent-100 dark:bg-accent-900 rounded-lg">
                  <Star className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                  <Award className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.achievements}</div>
                  <div className="text-sm text-gray-500">Achievements</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                  <Flame className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.streak}</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'achievements', name: 'Achievements', icon: Trophy },
            { id: 'leaderboard', name: 'Leaderboard', icon: Users },
            { id: 'progress', name: 'Progress', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {rarities.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${
                      achievement.unlocked 
                        ? 'border-green-500 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className={`inline-flex p-4 rounded-full mb-3 ${
                        achievement.unlocked 
                          ? getRarityBgColor(achievement.rarity)
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <achievement.icon className={`w-8 h-8 ${
                          achievement.unlocked 
                            ? getRarityColor(achievement.rarity)
                            : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {achievement.description}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          achievement.unlocked 
                            ? getRarityBgColor(achievement.rarity)
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {achievement.rarity}
                        </span>
                        <span className="text-sm font-medium">{achievement.points} pts</span>
                      </div>
                    </div>

                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Progress</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {achievement.progress}% complete
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-gray-500 text-center">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold">Global Leaderboard</h2>
                  <p className="text-gray-600 dark:text-gray-400">Top performers this month</p>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`p-6 flex items-center justify-between ${
                        entry.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 font-bold">
                          {entry.rank}
                        </div>
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Level {entry.level} • {entry.achievements} achievements
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">{entry.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold mb-4">Achievement Progress</h3>
                  <div className="space-y-4">
                    {achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <achievement.icon className={`w-5 h-5 ${
                          achievement.unlocked 
                            ? getRarityColor(achievement.rarity)
                            : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{achievement.name}</div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-primary-500 h-1 rounded-full"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {achievement.progress}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'Unlocked achievement', name: 'First Steps', time: '2 hours ago' },
                      { action: 'Level up!', name: 'Level 12', time: '1 day ago' },
                      { action: 'Earned points', name: '+50 points', time: '2 days ago' },
                      { action: 'Unlocked achievement', name: 'Prompt Master', time: '3 days ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.action}</div>
                          <div className="text-xs text-gray-500">{activity.name}</div>
                        </div>
                        <div className="text-xs text-gray-400">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AchievementSystem
