const fileStorage = require('./fileStorage');
const redisStorage = require('./redisStorage');
const { defaultStorage } = require('../config');
const {logger} = require('../logger');

const db = defaultStorage === 'redis' ? redisStorage : fileStorage;

async function get(key) {
  
  try {
    return await db.get(key);        
  } catch (err) {
    logger.warn(`[Storage] GET failed: ${err.message}`);
  }


}

async function set(key, value, ttl = null) {
   
  try {
    await db.set(key, value, ttl);
  } catch (err) {
    logger.warn(`[Storage] SET failed: ${err.message}`);
  }
  
}

module.exports = {
  get,
  set,
};
