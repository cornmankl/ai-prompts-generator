# AI Prompts Generator 🚀

The **MOST ADVANCED** AI prompt engineering platform with comprehensive AI orchestration, FREE AI models, plugin system, and cutting-edge 2025 features. Built with the latest technologies and designed for maximum productivity and collaboration.

## 🌟 **LIVE DEMO**
**🔗 [https://system-prompts-and-models-of-ai-tools-2gdrmjcoq.vercel.app](https://system-prompts-and-models-of-ai-tools-2gdrmjcoq.vercel.app)**

## ✨ **COMPREHENSIVE FEATURES**

### 🧠 **AI Orchestration Framework** (FREE MODELS!)
- **🆓 FREE AI Models**: GLM-4.5, QWEN 2.5 (72B, 32B, 14B), DeepSeek Coder, Moonshot v1, Baichuan2 Turbo, InternLM2 Chat
- **🔗 Chain-of-Thought Reasoning**: Advanced reasoning capabilities
- **🎯 Few-Shot Learning**: Context-aware learning from examples
- **🤖 Multi-Model Consensus**: Compare and combine responses from multiple models
- **⚡ Smart Model Selection**: Automatic best model selection based on task type
- **🔄 Model Switching**: Seamless switching between different AI models
- **📊 Performance Analytics**: Track model performance and usage statistics

### 🔌 **Plugin System & External Integrations**
- **📝 Notion Integration**: Sync prompts and data with Notion
- **🐙 GitHub Integration**: Version control and collaboration
- **💬 Slack Integration**: Team communication and notifications
- **🎨 Figma Integration**: Design workflow integration
- **📈 Google Analytics**: Advanced analytics and tracking
- **🔧 Custom Plugins**: Create and manage custom integrations
- **⚙️ Plugin Marketplace**: Discover and install community plugins

### 🎨 **Advanced UI/UX Features**
- **📊 Enhanced Dashboard**: Real-time analytics, widgets, and quick actions
- **🎯 Interactive Prompt Builder**: Drag & drop visual prompt creation
- **🔍 Global Search**: Real-time search with filters and suggestions
- **💾 Auto-save**: Debounced auto-save with conflict resolution
- **↩️ Undo/Redo**: Full history management with keyboard shortcuts
- **📝 Markdown Editor**: Rich text editing with live preview
- **📱 Mobile Optimization**: Touch gestures and responsive design
- **🌙 Enhanced Theme System**: Dark/Light mode with smooth transitions
- **🔔 Enhanced Toast Notifications**: Multiple types with action buttons

### 💼 **Business Features**
- **💳 Subscription Management**: Multiple pricing tiers and payment integration
- **👥 Community Hub**: Forums, discussions, and user profiles
- **🏆 Gamification System**: Achievements, badges, leaderboards, and progress tracking
- **📊 Advanced Analytics**: Detailed insights and reporting
- **🔒 Enterprise Security**: SSO, RBAC, and audit logs

### 🤝 **Real-time Collaboration**
- **👥 Live Editing**: Collaborative prompt editing with real-time cursors
- **📝 Version Control**: Complete version history with branching and merging
- **💬 Comments & Reviews**: Inline commenting and review system
- **👤 User Management**: Role-based access control (Owner, Editor, Viewer)
- **🔔 Real-time Notifications**: Instant updates and alerts

### 📚 **Comprehensive Prompt Library**
- **📖 1000+ Pre-built Prompts**: Curated collection from top AI tools
- **🏷️ Smart Categorization**: AI-powered categorization and tagging
- **🔍 Advanced Search**: Semantic search with filters and sorting
- **⭐ Community Features**: Share, rate, and discover prompts
- **📊 Usage Analytics**: Track prompt performance and popularity

### ⚡ **Performance & PWA**
- **📱 Progressive Web App**: Offline capabilities and app-like experience
- **🔄 Service Worker**: Caching and background sync
- **⚡ Code Splitting**: Lazy loading for optimal performance
- **📊 Real-time Metrics**: Performance monitoring and optimization
- **💾 Smart Caching**: Intelligent caching strategies

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Frontend Stack**
- **⚛️ React 18** with TypeScript
- **⚡ Vite** for fast development and building
- **🎨 Tailwind CSS** for styling
- **🎭 Framer Motion** for animations
- **🔄 React Query** for data fetching
- **🧭 React Router** for navigation
- **📱 PWA** capabilities

### **Backend Stack**
- **🟢 Node.js** with Express.js
- **📘 TypeScript** for type safety
- **🍃 MongoDB** with Mongoose
- **🔐 JWT** for authentication
- **🔒 bcryptjs** for password hashing
- **🌐 Socket.IO** for real-time features
- **🛡️ Security Middleware**: Helmet, CORS, Rate Limiting, XSS Protection

### **AI Integration**
- **🆓 FREE AI Models**: GLM-4.5, QWEN 2.5, DeepSeek Coder, Moonshot v1, Baichuan2 Turbo, InternLM2 Chat
- **🤖 AI Orchestration**: Smart model selection and management
- **🧠 Advanced Features**: Chain-of-Thought, Few-Shot Learning
- **📊 Performance Tracking**: Model usage and performance analytics

## 🚀 **QUICK START**

### **Prerequisites**
- Node.js 18+
- MongoDB 6+
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/cornmankl/ai-prompts-generator.git
   cd ai-prompts-generator
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Or install individually
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure environment variables**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-prompts-generator
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=1h
   
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

5. **Start the development servers**
   ```bash
   # Start both client and server
   npm run dev
   
   # Or start individually
   npm run client:dev    # Frontend on http://localhost:5173
   npm run server:dev    # Backend on http://localhost:5000
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 📁 **PROJECT STRUCTURE**

```
ai-prompts-generator/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ai/                 # AI-specific components
│   │   │   ├── analytics/          # Analytics components
│   │   │   ├── business/           # Business features
│   │   │   ├── builder/            # Interactive builder
│   │   │   ├── collaboration/      # Collaboration components
│   │   │   ├── community/          # Community features
│   │   │   ├── common/             # Common components
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   ├── gamification/       # Gamification system
│   │   │   ├── layout/             # Layout components
│   │   │   ├── performance/        # Performance components
│   │   │   └── ui/                 # Basic UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   │   ├── aiOrchestration.ts  # AI orchestration service
│   │   │   └── pluginSystem.ts     # Plugin system service
│   │   ├── types/                  # TypeScript type definitions
│   │   └── utils/                  # Utility functions
│   ├── public/                     # Static assets
│   │   ├── manifest.json           # PWA manifest
│   │   └── sw.js                   # Service worker
│   └── package.json
├── server/                         # Node.js backend
│   ├── src/
│   │   ├── models/                 # Database models
│   │   │   ├── User.ts            # User model
│   │   │   └── Prompt.ts          # Prompt model
│   │   ├── routes/                 # API route handlers
│   │   ├── middleware/             # Express middleware
│   │   ├── services/               # Business logic
│   │   └── server.ts              # Server entry point
│   └── package.json
├── docs/                           # Documentation
├── scripts/                        # Build and deployment scripts
├── vercel.json                     # Vercel deployment config
└── README.md
```

## 🔧 **AVAILABLE SCRIPTS**

### **Root Level**
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run start` - Start production servers
- `npm run install-all` - Install all dependencies
- `npm run client:build` - Build client for production
- `npm run client:dev` - Start client development server
- `npm run server:dev` - Start server development server

### **Client**
- `npm run client:dev` - Start React development server
- `npm run client:build` - Build React app for production
- `npm run client:preview` - Preview production build
- `npm run client:lint` - Lint client code

### **Server**
- `npm run server:dev` - Start Node.js development server
- `npm run server:build` - Build server for production
- `npm run server:start` - Start production server
- `npm run server:lint` - Lint server code

## 🎯 **KEY FEATURES DEEP DIVE**

### **AI Orchestration Framework**
- **🆓 FREE AI Models**: Access to multiple free AI models without API costs
- **🧠 Chain-of-Thought**: Advanced reasoning capabilities for complex tasks
- **🎯 Few-Shot Learning**: Learn from examples for better performance
- **🤖 Multi-Model Consensus**: Combine insights from multiple models
- **⚡ Smart Selection**: Automatic model selection based on task requirements
- **📊 Performance Tracking**: Monitor model performance and usage

### **Plugin System**
- **🔌 External Integrations**: Connect with popular tools and platforms
- **⚙️ Custom Plugins**: Create and manage custom integrations
- **🛒 Plugin Marketplace**: Discover and install community plugins
- **🔧 Plugin Management**: Easy installation, configuration, and updates

### **Advanced UI Features**
- **📊 Enhanced Dashboard**: Real-time analytics and customizable widgets
- **🎯 Interactive Builder**: Visual drag-and-drop prompt creation
- **🔍 Global Search**: Powerful search with filters and suggestions
- **💾 Auto-save**: Never lose your work with intelligent auto-saving
- **↩️ Undo/Redo**: Complete history management with keyboard shortcuts

### **Business Features**
- **💳 Subscription Management**: Flexible pricing and payment options
- **👥 Community Hub**: Social features and user engagement
- **🏆 Gamification**: Achievements, badges, and leaderboards
- **📊 Advanced Analytics**: Comprehensive insights and reporting

## 🔌 **API DOCUMENTATION**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### **Prompts**
- `GET /api/prompts` - Get all prompts
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/optimize` - Optimize prompt

### **AI Services**
- `POST /api/ai/generate` - Generate AI content
- `POST /api/ai/optimize` - Optimize prompt
- `POST /api/ai/analyze-context` - Analyze context
- `GET /api/ai/models` - Get available AI models
- `POST /api/ai/chain-of-thought` - Chain-of-thought reasoning
- `POST /api/ai/few-shot` - Few-shot learning

### **Plugins**
- `GET /api/plugins` - List available plugins
- `POST /api/plugins/install` - Install plugin
- `DELETE /api/plugins/:id` - Uninstall plugin
- `POST /api/plugins/:id/execute` - Execute plugin action

### **Collaboration**
- `GET /api/collaboration/sessions` - Get collaboration sessions
- `POST /api/collaboration/sessions` - Create collaboration session
- `PUT /api/collaboration/sessions/:id` - Update session
- `POST /api/collaboration/sessions/:id/invite` - Invite collaborator

## 🧪 **TESTING**

### **Running Tests**
```bash
# Run all tests
npm test

# Run client tests
npm run client:test

# Run server tests
npm run server:test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 **DEPLOYMENT**

### **Vercel Deployment** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Production Build**
```bash
# Build for production
npm run build

# Start production servers
npm start
```

### **Environment Variables**
Ensure all production environment variables are set:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Secure JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `NODE_ENV=production`
- `CLIENT_URL` - Frontend URL

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **ACKNOWLEDGMENTS**

- **🆓 FREE AI Models**: GLM-4.5, QWEN, DeepSeek, Moonshot, Baichuan2, InternLM2
- **⚛️ React Team** for the amazing framework
- **🎨 Tailwind CSS** for the utility-first CSS framework
- **🎭 Framer Motion** for smooth animations
- **🍃 MongoDB** for the database
- **🌐 Vercel** for hosting and deployment
- **👥 Open Source Community** for amazing tools and libraries

## 📞 **SUPPORT**

- **🌐 Live Demo**: [https://system-prompts-and-models-of-ai-tools-2gdrmjcoq.vercel.app](https://system-prompts-and-models-of-ai-tools-2gdrmjcoq.vercel.app)
- **📚 Documentation**: [docs/](docs/)
- **🐛 Issues**: [GitHub Issues](https://github.com/cornmankl/ai-prompts-generator/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/cornmankl/ai-prompts-generator/discussions)
- **📧 Email**: cornman.kl@gmail.com

---

## 🎉 **FEATURES SUMMARY**

✅ **AI Orchestration Framework** with FREE AI models  
✅ **Plugin System** for external integrations  
✅ **Advanced UI/UX** with interactive components  
✅ **Business Features** (Subscription, Community, Gamification)  
✅ **Real-time Collaboration** with live editing  
✅ **PWA Support** with offline capabilities  
✅ **Mobile Optimization** with touch gestures  
✅ **Performance Optimization** with code splitting  
✅ **Security Features** with JWT and bcrypt  
✅ **Analytics Dashboard** with real-time metrics  

**🚀 Built with ❤️ for the AI community - The most advanced AI prompts generator in 2025!**