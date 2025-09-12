#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AI Prompts Generator Setup Script');
console.log('=====================================\n');

// Check Node.js version
function checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
        console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
        process.exit(1);
    }

    console.log('✅ Node.js version:', nodeVersion);
}

// Check if required tools are installed
function checkRequiredTools() {
    const tools = ['npm', 'git'];

    for (const tool of tools) {
        try {
            execSync(`${tool} --version`, { stdio: 'pipe' });
            console.log(`✅ ${tool} is installed`);
        } catch (error) {
            console.error(`❌ ${tool} is not installed or not in PATH`);
            process.exit(1);
        }
    }
}

// Create .env file from template
function createEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), 'env.example');

    if (fs.existsSync(envPath)) {
        console.log('✅ .env file already exists');
        return;
    }

    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from template');
        console.log('⚠️  Please edit .env file with your API keys');
    } else {
        // Create basic .env file
        const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/ai-prompts-generator

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI APIs
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=5000
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your-openai-api-key
`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with default values');
        console.log('⚠️  Please edit .env file with your API keys');
    }
}

// Install dependencies
function installDependencies() {
    console.log('\n📦 Installing dependencies...');

    try {
        // Install root dependencies
        console.log('Installing root dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        // Install client dependencies
        console.log('Installing client dependencies...');
        execSync('npm install', {
            stdio: 'inherit',
            cwd: path.join(process.cwd(), 'client')
        });

        // Install server dependencies
        console.log('Installing server dependencies...');
        execSync('npm install', {
            stdio: 'inherit',
            cwd: path.join(process.cwd(), 'server')
        });

        console.log('✅ All dependencies installed successfully');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
}

// Create necessary directories
function createDirectories() {
    const dirs = [
        'client/public',
        'server/uploads',
        'server/logs',
        'docs',
        'scripts'
    ];

    for (const dir of dirs) {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    }
}

// Check if MongoDB is running
function checkMongoDB() {
    try {
        execSync('mongosh --eval "db.runCommand({ping: 1})"', { stdio: 'pipe' });
        console.log('✅ MongoDB is running');
    } catch (error) {
        console.log('⚠️  MongoDB is not running or not accessible');
        console.log('   Please start MongoDB before running the application');
    }
}

// Main setup function
function main() {
    try {
        checkNodeVersion();
        checkRequiredTools();
        createDirectories();
        createEnvFile();
        installDependencies();
        checkMongoDB();

        console.log('\n🎉 Setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Edit .env file with your API keys');
        console.log('2. Start MongoDB if not already running');
        console.log('3. Run "npm run dev" to start the development servers');
        console.log('4. Open http://localhost:3000 in your browser');
        console.log('\nHappy coding! 🚀');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
main();
