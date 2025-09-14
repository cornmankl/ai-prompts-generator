import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Layout Components
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import ErrorBoundary from './components/common/ErrorBoundary'

// Page Components (Lazy loaded for better performance)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PromptGenerator = lazy(() => import('./pages/PromptGenerator'))
const PromptLibrary = lazy(() => import('./pages/PromptLibrary'))
const ContextEngineer = lazy(() => import('./pages/ContextEngineer'))
const Collaboration = lazy(() => import('./pages/Collaboration'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

// Advanced Components (Lazy loaded)
const AdvancedDashboard = lazy(() => import('./components/dashboard/AdvancedDashboard'))
const InteractivePromptBuilder = lazy(() => import('./components/builder/InteractivePromptBuilder'))
const AdvancedAIFeatures = lazy(() => import('./components/ai/AdvancedAIFeatures'))
const PerformanceOptimizer = lazy(() => import('./components/performance/PerformanceOptimizer'))

// Business Components (Lazy loaded)
const SubscriptionManager = lazy(() => import('./components/business/SubscriptionManager'))
const CommunityHub = lazy(() => import('./components/community/CommunityHub'))
const AchievementSystem = lazy(() => import('./components/gamification/AchievementSystem'))

// Hooks
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

const App: React.FC = () => {
  const location = useLocation()
  const { user, loading } = useAuth()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading AI Prompts Generator...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-primary-50 to-accent-50 text-gray-900'
        }`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />

            <main className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full"
                >
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">Loading component...</p>
                      </div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/advanced-dashboard" element={<AdvancedDashboard />} />
                      <Route path="/generator" element={<PromptGenerator />} />
                      <Route path="/interactive-builder" element={<InteractivePromptBuilder />} />
                      <Route path="/library" element={<PromptLibrary />} />
                      <Route path="/context" element={<ContextEngineer />} />
                      <Route path="/ai-features" element={<AdvancedAIFeatures />} />
                      <Route path="/collaboration" element={<Collaboration />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/performance" element={<PerformanceOptimizer />} />
                      <Route path="/subscription" element={<SubscriptionManager />} />
                      <Route path="/community" element={<CommunityHub />} />
                      <Route path="/achievements" element={<AchievementSystem />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App