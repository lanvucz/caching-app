const { createClient } = require('redis');
const { redisUrl } = require('../config');
const {logger} = require('../logger');

const client = createClient({ url: redisUrl });
let connected = false;

async function ensureConnected() {
  if (!connected) {
    try {
      await client.connect();
      connected = true;
      logger.info('[Redis] Connected');
    } catch (err) {
      throw new Error('[Redis] Could not connect to Redis');
    }
  }
}



client.on('error', (err) => {
  logger.error('[Redis] Error:', err);
});

client.on('reconnecting', () => {
  logger.info('[Redis] is reconnecting...'); 
});

client.on('ready', async () => {
  logger.info('[Redis] is ready again!');
});


module.exports = {
  get: async (key) => {
    await ensureConnected();
    const value = await client.get(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  set: async (key, value, ttl = null) => {
    await ensureConnected();
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    // await client.set(key, val);
    if (ttl) {
      await client.set(key, val, 'EX', ttl);
    } else {
      await client.set(key, val);
    }
  },
  
};
