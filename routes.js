const {Router} = require('express');
const bodyParser = require('body-parser');
const controller = require('./controller.js');
const { addForm} = require('./validation.js');
const {checkErrors} = require('./middleware.js');

const router = new Router();



router.post(
    '/addMenu',
    bodyParser.json(),    
    addForm,
    checkErrors,
    controller.addMenu
);


router.get(
    '/getMenu',
    controller.getMenu
);

module.exports = (app) => {
    app.use('/api', router);       
};
