const axios = require('axios');
const storage = require('./db/storage');
const { externalApiUrl, cacheTTL } = require('./config');
const { APIError, messages } = require('./error');
const {logger} = require('./logger.js');

const { STORAGE_KEY } = require('./const.js');
const CACHE_KEY = STORAGE_KEY.DATA_B; // Key for the cached data
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function fetchExternalData(retryCount = 0) {
  try {
    const response = await axios.get(externalApiUrl);
    logger.debug('[External API] Fetched fresh data from API');
    return response.data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      logger.warn(`[External API] Attempt ${retryCount + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchExternalData(retryCount + 1);
    }
    
    logger.error('[External API] Max retries reached:', error.message);
    // throw new APIError(messages.external_data_not_found, 503);
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

  let freshData;
  // try {
    freshData = await fetchExternalData();
    await storage.set(CACHE_KEY, freshData, cacheTTL);
    return freshData;
  // } catch (err) {
  //   logger.warn('[External API] Failed to fetch,:', err.message);
  //   // throw new APIError(messages.external_data_not_found, 503);
  // }
  
}

module.exports = {
  fetchExternalData,
  fetchExternalDataWithCache
};
