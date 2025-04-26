const fs = require('fs').promises;
const path = require('path');
const {logger} = require('../logger');

let dirExist = false;

async function ensureDirectoryExists(filePath) {
  if (!dirExist) {
    try {
      const dir = path.dirname(filePath);
      await fs.access(dir);
      dirExist = true;
    } catch {
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        dirExist = true;
        logger.info(`[fileStorage] Created cache directory: ${path.dirname(filePath)}`);
      } catch (err) {
        logger.error('[fileStorage] Could not create cache directory:', err);
        throw new Error('[fileStorage] Could not create cache directory');
      }
    }
  }
}

function getFilePath(key) {
  return path.join(__dirname, '..','cached_files', `${key}.json`);
}

async function readData(key) {
  const filePath = getFilePath(key);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const {expiresAt, data} = JSON.parse(raw || '{"expiresAt":0,"data":null}'); // default to empty object if file is empty
    if (data && (expiresAt === 0 || expiresAt > Date.now())){
        return data;
    } else {
        logger.warn(`[fileStorage] Cache expired for key "${key}"`);
        return null; // Cache expired or no data
    }
  } catch (err) {
    logger.error(`[fileStorage] Read error for key "${key}":`, err);
    return null;
  }
}


async function writeData(key, data, ttl=null) {
  const filePath = getFilePath(key);
  const cacheData = {
    expiresAt: ttl ? ( Date.now() + ttl * 1000) : 0, // 0 means no expiration. miliseconds
    data,
  }
  try {
    await ensureDirectoryExists(filePath); // Ensure directory exists
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2), 'utf8');
  } catch (err) {
    logger.error(`[fileStorage] Write error for key "${key}":`, err);
    throw err
  }
}

module.exports = {
  get: readData,
  set: writeData,  
};
