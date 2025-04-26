
const packageJson = require('./package.json');
const storage = require('./db/storage');
const { fetchExternalData, fetchExternalDataWithCache } = require('./externalData');
const { setResponseHeaders } = require('./middleware.js');
const { STORAGE_KEY } = require('./const.js');
 const { APIError, messages } = require('./error/index.js');
const {logger} = require('./logger');


const addMenu = async (req, res) => {
    const data = req.validatedBody;
    await storage.set(STORAGE_KEY.DATA_A, data);
    res.status(201).json({ status: 'stored', key: STORAGE_KEY.DATA_A });
    
}

const getMenu = async (req, res) => {
    const menu = await storage.get(STORAGE_KEY.DATA_A);
    if (!menu) {
      throw new APIError(messages.menu_not_found, 404);
    }
    
    const dataB = await fetchExternalDataWithCache();
    if (!dataB) {
      throw new APIError(messages.external_data_not_found, 503);
    }

    const dataC = { ...menu, ...dataB }; // merge
    

    const headersOk = setResponseHeaders(res, dataC, {
      req,
      cacheControl: 'public, max-age=60',
      customHeaders: {
        'X-Source': 'merged-from-body-and-external'
      }
    });

    if (!headersOk) return; // ETag matched, 304 sent

    res.status(200).json(dataC);
}

module.exports = {
    addMenu,
    getMenu
};
