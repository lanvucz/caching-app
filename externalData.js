const axios = require('axios');
const storage = require('./db/storage');
const { externalApiUrl, cacheTTL } = require('./config');
// const { APIError, messages } = require('./error');
const {logger} = require('./logger.js');

const { STORAGE_KEY } = require('./const.js');
const CACHE_KEY = STORAGE_KEY.DATA_B; // Key for the cached data
const CACHE_KEY_LATEST = `${CACHE_KEY}_${STORAGE_KEY.lastestOfflineAvailable}`; // Key for the latest available data
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

let fetchingExternalDataPromise = null; // Shared promise across requests


async function fetchExternalData(retryCount = 0) {

  try {
    const response = await axios.get(externalApiUrl);
    logger.debug('[External API] Fetched fresh data from API');
    return response.data;    
  } catch (error) {
    logger.error('[External API] Error fetching data:', error.cause);
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY; //* Math.pow(2, retryCount);    
      logger.warn(`[External API] Attempt ${retryCount + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchExternalData(retryCount + 1);
    }
    
    logger.error('[External API] Max retries reached');
  }

  return null; // Return null if all retries fail
}




async function fetchExternalDataWithLock() {
  if (fetchingExternalDataPromise) {
    logger.debug('[Lock] Waiting for existing external API fetch...');
    return fetchingExternalDataPromise; // Wait for the ongoing fetch
  }

  try {
    logger.debug('[Lock] Starting new external API fetch...');
    fetchingExternalDataPromise = fetchExternalData(); // Start new fetch
    const data = await fetchingExternalDataPromise;
    if (data) {
      logger.debug('[Lock] Fetch completed, storing data...');
      await storage.set(CACHE_KEY, data, cacheTTL);
      await storage.set(CACHE_KEY_LATEST, data); // Store the latest available data for offline use
    }
    return data;
  } finally {
    fetchingExternalDataPromise = null; // Always clear the lock
  }
}




async function fetchExternalDataWithCache() {
  // Check if the data is already cached
  const cachedData = await storage.get(CACHE_KEY);
  if (cachedData) {
      logger.debug(`[Cache] HIT for key: ${CACHE_KEY}`);
      return cachedData;
  }
  
  logger.debug(`[Cache] MISS for key: ${CACHE_KEY}`);

  // If not cached, fetch fresh data from the external API
  const data = await fetchExternalDataWithLock();
  if (data) {
    return data;
  }

  // If fetching fails, check if we have the latest available data in the cache
  // and return it if available
  const cachedDataLastestAvailable = await storage.get(CACHE_KEY_LATEST);
  if (cachedDataLastestAvailable) {
    logger.debug(`[Cache] HIT for key: ${CACHE_KEY_LATEST}`);
    return cachedDataLastestAvailable;
  }
  logger.debug(`[Cache] MISS for key: ${CACHE_KEY_LATEST}`);

  return null;
}

module.exports = {
  fetchExternalData,
  fetchExternalDataWithCache
};
