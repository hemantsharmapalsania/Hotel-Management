const express = require('express');
const session = require('express-session');
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require("cookie-parser");
const compression = require("compression");
const bodyParser = require("body-parser");
const morgan = require('morgan')
const routes = require('./routes/index');
const globalErrorHandler = require('./middlewares/errorHandler');
const corsOptions = require('./config/cors');

const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(helmet())
app.use(morgan('combined'))

app.use('/api', routes);

app.use('*', (req, res) => {
    res.status(400).json({ message: 'You have reached the end of the access.' });
})
app.use(globalErrorHandler);
app.disable("etag");

module.exports = app
