const express = require('express');
const cors = require('cors');
const {errorHandler} = require('./middleware.js');
// const { getRequestLogger} = require('./logger');
const {logger, getRequestLogger} = require('./logger');

const app = express();
require('dotenv').config();


const port = process.env.PORT || 3000;

const setupRoutes  = require('./routes.js');

app.use(express.json());


app.use(cors({
    origin: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'pragma', 'cache-control']
}));
app.use(express.urlencoded({extended: true}));



app.use(getRequestLogger()); // <-- log every incoming request

setupRoutes(app);

// Add the error handler middleware after all routes
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
