# AI Prompts Generator 🚀

The most advanced AI prompt engineering platform with context engineering, real-time collaboration, and comprehensive analytics. Built with cutting-edge 2025 technologies and features.

## ✨ Features

### 🧠 Advanced AI Integration
- **Prompt Optimization**: AI-powered prompt enhancement with multiple optimization strategies
- **Context Engineering**: Sophisticated context layer management for maximum effectiveness
- **Dynamic Generation**: Real-time prompt generation with multiple AI models
- **Quality Validation**: Automated prompt quality scoring and improvement suggestions

### 🤝 Real-time Collaboration
- **Live Editing**: Collaborative prompt editing with real-time cursors
- **Version Control**: Complete version history with branching and merging
- **Comments & Reviews**: Inline commenting and review system
- **User Management**: Role-based access control (Owner, Editor, Viewer)

### 📊 Comprehensive Analytics
- **Usage Tracking**: Detailed metrics on prompt performance and user engagement
- **Performance Monitoring**: Real-time analytics on generation times and success rates
- **Trend Analysis**: Historical data visualization and trend identification
- **Custom Dashboards**: Personalized analytics views

### 📚 Prompt Library
- **1000+ Pre-built Prompts**: Curated collection from top AI tools and platforms
- **Smart Categorization**: AI-powered categorization and tagging
- **Advanced Search**: Semantic search with filters and sorting
- **Community Features**: Share, rate, and discover prompts

### 🎨 Modern UI/UX
- **Neural Design**: Futuristic UI with glassmorphism and neural-inspired elements
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Optimized for all devices
- **Accessibility**: WCAG 2.1 compliant interface

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Router** for navigation

### Backend Stack
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** for data storage
- **JWT** for authentication
- **WebSocket** for real-time features

### AI Integration
- **OpenAI GPT-4** for prompt optimization
- **Claude 3** for context analysis
- **Gemini Pro** for content generation
- **Custom AI models** for specialized tasks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-prompts-generator.git
   cd ai-prompts-generator
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
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
   
   # AI APIs
   OPENAI_API_KEY=your-openai-api-key
   CLAUDE_API_KEY=your-claude-api-key
   GEMINI_API_KEY=your-gemini-api-key
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   npm run server:dev
   
   # Start frontend development server (in new terminal)
   npm run client:dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 📁 Project Structure

```
ai-prompts-generator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ai/        # AI-specific components
│   │   │   ├── analytics/ # Analytics components
│   │   │   ├── collaboration/ # Collaboration components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # Basic UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API route handlers
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   └── index.js          # Server entry point
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run start` - Start production servers
- `npm run test` - Run all tests
- `npm run lint` - Lint all code

### Client
- `npm run client:dev` - Start React development server
- `npm run client:build` - Build React app for production
- `npm run client:preview` - Preview production build
- `npm run client:lint` - Lint client code

### Server
- `npm run server:dev` - Start Node.js development server
- `npm run server:build` - Build server for production
- `npm run server:start` - Start production server
- `npm run server:lint` - Lint server code

## 🎯 Key Features Deep Dive

### AI Prompt Optimization
- **Multiple Strategies**: Clarity, Conciseness, Creativity, Accuracy
- **Model-Specific**: Optimized for different AI models (GPT-4, Claude, Gemini)
- **Context-Aware**: Considers context and domain-specific requirements
- **Quality Scoring**: Automated quality assessment and improvement suggestions

### Context Engineering
- **Layer Management**: Multiple context layers with different weights
- **Domain Analysis**: Automatic domain-specific context suggestions
- **Relevance Scoring**: Real-time context relevance assessment
- **Smart Suggestions**: AI-powered context improvement recommendations

### Real-time Collaboration
- **Live Cursors**: See collaborators' cursors in real-time
- **Version Control**: Complete history with branching and merging
- **Comments System**: Inline commenting and review workflow
- **User Roles**: Granular permission system

### Analytics Dashboard
- **Usage Metrics**: Track prompt performance and user engagement
- **Trend Analysis**: Historical data visualization
- **Performance Monitoring**: Real-time system performance metrics
- **Custom Reports**: Generate and export custom analytics reports

## 🔌 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Prompts
- `GET /api/prompts` - Get all prompts
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/optimize` - Optimize prompt

### AI Services
- `POST /api/ai/generate` - Generate AI content
- `POST /api/ai/optimize` - Optimize prompt
- `POST /api/ai/analyze-context` - Analyze context
- `GET /api/ai/models` - Get available AI models

### Collaboration
- `GET /api/collaboration/sessions` - Get collaboration sessions
- `POST /api/collaboration/sessions` - Create collaboration session
- `PUT /api/collaboration/sessions/:id` - Update session
- `POST /api/collaboration/sessions/:id/invite` - Invite collaborator

## 🧪 Testing

### Running Tests
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

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service testing
- **E2E Tests**: Full application workflow testing
- **Performance Tests**: Load and stress testing

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production servers
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Secure JWT secret key
- `OPENAI_API_KEY` - OpenAI API key
- `CLAUDE_API_KEY` - Claude API key
- `GEMINI_API_KEY` - Gemini API key
- `NODE_ENV=production`

### Docker Deployment
```bash
# Build Docker image
docker build -t ai-prompts-generator .

# Run container
docker run -p 3000:3000 -p 5000:5000 ai-prompts-generator
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- Google for Gemini models
- The open-source community for amazing tools and libraries

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-prompts-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-prompts-generator/discussions)
- **Email**: support@ai-prompts-generator.com

---

**Built with ❤️ for the AI community**