const { MongoClient } = require('mongodb');

let dbInstance;

async function connectDb() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    dbInstance = client.db(process.env.MONGO_DB);
}

function getDb() {
    if (!dbInstance) throw new Error('DB not connected');
    return dbInstance;
}

module.exports = { connectDb, getDb };
