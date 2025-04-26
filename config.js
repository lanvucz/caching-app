const { log } = require('winston');

require('dotenv').config();



module.exports = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL,
  externalApiUrl: process.env.EXTERNAL_API_URL,
  defaultStorage: process.env.DEFAULT_STORAGE || 'file', // 'file' or 'redis'
  logLevel: process.env.LOG_LEVEL || 'info',
  logPretty: process.env.LOG_PRETTY || 'false',
  cacheTTL: process.env.CACHE_TTL || 120, // seconds
};


