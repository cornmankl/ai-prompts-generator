import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  Flag, 
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Plus,
  TrendingUp,
  Star,
  Award,
  Trophy,
  Crown,
  Zap,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  ExternalLink,
  Lock,
  Unlock,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Check,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Home,
  User,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Palette,
  Brush,
  Eraser,
  Scissors,
  Save,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
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
  Flame,
  Snowflake,
  Sunrise,
  Sunset,
  Umbrella,
  Key,
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
  Gauge
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../common/EnhancedToast'

interface CommunityPost {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    role: 'user' | 'moderator' | 'admin'
    verified: boolean
  }
  content: string
  images?: string[]
  prompt?: {
    id: string
    title: string
    content: string
  }
  category: 'discussion' | 'showcase' | 'question' | 'tutorial' | 'announcement'
  tags: string[]
  likes: number
  dislikes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
  isPinned: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

interface CommunityUser {
  id: string
  name: string
  avatar: string
  role: 'user' | 'moderator' | 'admin'
  verified: boolean
  followers: number
  following: number
  posts: number
  reputation: number
  badges: string[]
  joinedAt: Date
}

const CommunityHub: React.FC = () => {
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'trending' | 'following'>('posts')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const categories = [
    { id: 'all', name: 'All', icon: Grid },
    { id: 'discussion', name: 'Discussion', icon: MessageSquare },
    { id: 'showcase', name: 'Showcase', icon: Star },
    { id: 'question', name: 'Question', icon: HelpCircle },
    { id: 'tutorial', name: 'Tutorial', icon: BookOpen },
    { id: 'announcement', name: 'Announcement', icon: Megaphone }
  ]

  useEffect(() => {
    loadPosts()
    loadUsers()
  }, [activeTab, searchQuery, filterCategory, sortBy])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock posts data
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          author: {
            id: 'user1',
            name: 'AI Expert',
            avatar: '/avatars/user1.jpg',
            role: 'moderator',
            verified: true
          },
          content: 'Just discovered an amazing new way to use chain-of-thought prompting with GLM-4.5! The results are incredible. Here\'s my approach...',
          prompt: {
            id: 'prompt1',
            title: 'Advanced Chain-of-Thought Prompt',
            content: 'Let\'s think step by step about this problem...'
          },
          category: 'tutorial',
          tags: ['chain-of-thought', 'glm-4.5', 'advanced', 'tutorial'],
          likes: 42,
          dislikes: 2,
          comments: 15,
          shares: 8,
          views: 156,
          isLiked: false,
          isBookmarked: true,
          isPinned: false,
          isFeatured: true,
          createdAt: new Date('2024-01-15T10:30:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z')
        },
        {
          id: '2',
          author: {
            id: 'user2',
            name: 'Prompt Master',
            avatar: '/avatars/user2.jpg',
            role: 'user',
            verified: false
          },
          content: 'Showcasing my latest prompt for creative writing. It generates amazing stories with just a few keywords!',
          images: ['/images/story1.jpg', '/images/story2.jpg'],
          category: 'showcase',
          tags: ['creative-writing', 'storytelling', 'showcase'],
          likes: 28,
          dislikes: 1,
          comments: 7,
          shares: 12,
          views: 89,
          isLiked: true,
          isBookmarked: false,
          isPinned: false,
          isFeatured: false,
          createdAt: new Date('2024-01-14T15:45:00Z'),
          updatedAt: new Date('2024-01-14T15:45:00Z')
        },
        {
          id: '3',
          author: {
            id: 'user3',
            name: 'New User',
            avatar: '/avatars/user3.jpg',
            role: 'user',
            verified: false
          },
          content: 'I\'m new to AI prompting. Can someone help me understand the difference between few-shot learning and chain-of-thought?',
          category: 'question',
          tags: ['beginner', 'help', 'few-shot', 'chain-of-thought'],
          likes: 15,
          dislikes: 0,
          comments: 23,
          shares: 3,
          views: 67,
          isLiked: false,
          isBookmarked: false,
          isPinned: false,
          isFeatured: false,
          createdAt: new Date('2024-01-13T09:20:00Z'),
          updatedAt: new Date('2024-01-13T09:20:00Z')
        }
      ]
      
      setPosts(mockPosts)
    } catch (err) {
      error('Failed to load posts', 'Please try again later')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Mock users data
      const mockUsers: CommunityUser[] = [
        {
          id: 'user1',
          name: 'AI Expert',
          avatar: '/avatars/user1.jpg',
          role: 'moderator',
          verified: true,
          followers: 1250,
          following: 89,
          posts: 156,
          reputation: 5420,
          badges: ['expert', 'moderator', 'contributor'],
          joinedAt: new Date('2023-06-15')
        },
        {
          id: 'user2',
          name: 'Prompt Master',
          avatar: '/avatars/user2.jpg',
          role: 'user',
          verified: false,
          followers: 890,
          following: 234,
          posts: 89,
          reputation: 3200,
          badges: ['creator', 'innovator'],
          joinedAt: new Date('2023-08-20')
        }
      ]
      
      setUsers(mockUsers)
    } catch (err) {
      error('Failed to load users', 'Please try again later')
    }
  }

  const handleLike = async (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
    
    const post = posts.find(p => p.id === postId)
    if (post) {
      success('Post Liked', post.isLiked ? 'Post unliked' : 'Post liked')
    }
  }

  const handleBookmark = async (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ))
    
    const post = posts.find(p => p.id === postId)
    if (post) {
      success('Post Bookmarked', post.isBookmarked ? 'Post removed from bookmarks' : 'Post bookmarked')
    }
  }

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      ))
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: post.content.substring(0, 100),
            text: post.content,
            url: window.location.href
          })
          success('Post Shared', 'Post shared successfully')
        } catch (err) {
          // User cancelled sharing
        }
      } else {
        navigator.clipboard.writeText(window.location.href)
        success('Post Shared', 'Link copied to clipboard')
      }
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'trending':
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Community Hub</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect, share, and learn with the AI Prompts community
              </p>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'posts', name: 'Posts', icon: MessageSquare },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'trending', name: 'Trending', icon: TrendingUp },
            { id: 'following', name: 'Following', icon: Heart }
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

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, users, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }`}>
            {sortedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{post.author.name}</span>
                        {post.author.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.author.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          post.author.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {post.author.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {post.isPinned && (
                      <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded">
                        <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    )}
                    {post.isFeatured && (
                      <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                        <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 dark:text-gray-100 mb-4">{post.content}</p>
                  
                  {post.prompt && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">{post.prompt.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {post.prompt.content.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                  
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2 rounded-lg ${
                        post.isBookmarked 
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityHub
