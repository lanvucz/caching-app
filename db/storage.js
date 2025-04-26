const fileStorage = require('./fileStorage');
const redisStorage = require('./redisStorage');
const { defaultStorage } = require('../config');
const {logger} = require('../logger');

const db = defaultStorage === 'redis' ? redisStorage : fileStorage;

// const memoryCache = new Map();

// function setMemory(key, value, ttl = null) {
//   const expiresAt = ttl && ttl > 0 ? Date.now() + ttl * 1000 : 0;
//   memoryCache.set(key, { data: value, expiresAt });
// }

// function getMemory(key) {
//   const entry = memoryCache.get(key);
//   if (!entry) return null;
//   if (entry.expiresAt){
//     if(entry.expiresAt===0) {
//       return entry.data; // no expiration
//     } 
//     if (entry.expiresAt < Date.now()) {
//       memoryCache.delete(key); // expired
//       return null;
//     }
//   }

//   return entry.data;
// }


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
