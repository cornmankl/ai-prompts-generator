const { MongoClient } = require('mongodb');

async function runMigration() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        console.log('Running migration: 001_initial_schema');

        // Create collections with indexes
        await db.createCollection('users');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('users').createIndex({ 'subscription.plan': 1 });
        await db.collection('users').createIndex({ createdAt: -1 });
        await db.collection('users').createIndex({ lastLogin: -1 });

        await db.createCollection('conversations');
        await db.collection('conversations').createIndex({ userId: 1 });
        await db.collection('conversations').createIndex({ createdAt: -1 });
        await db.collection('conversations').createIndex({ updatedAt: -1 });

        await db.createCollection('prompts');
        await db.collection('prompts').createIndex({ userId: 1 });
        await db.collection('prompts').createIndex({ category: 1 });
        await db.collection('prompts').createIndex({ tags: 1 });
        await db.collection('prompts').createIndex({ isPublic: 1 });
        await db.collection('prompts').createIndex({ createdAt: -1 });

        await db.createCollection('workspaces');
        await db.collection('workspaces').createIndex({ owner: 1 });
        await db.collection('workspaces').createIndex({ 'members.userId': 1 });
        await db.collection('workspaces').createIndex({ createdAt: -1 });

        await db.createCollection('audit_logs');
        await db.collection('audit_logs').createIndex({ userId: 1 });
        await db.collection('audit_logs').createIndex({ action: 1 });
        await db.collection('audit_logs').createIndex({ timestamp: -1 });
        await db.collection('audit_logs').createIndex({ ipAddress: 1 });

        await db.createCollection('compliance_reports');
        await db.collection('compliance_reports').createIndex({ type: 1 });
        await db.collection('compliance_reports').createIndex({ 'period.start': -1 });
        await db.collection('compliance_reports').createIndex({ generatedAt: -1 });

        await db.createCollection('workflow_executions');
        await db.collection('workflow_executions').createIndex({ workflowId: 1 });
        await db.collection('workflow_executions').createIndex({ status: 1 });
        await db.collection('workflow_executions').createIndex({ startedAt: -1 });

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { runMigration };
