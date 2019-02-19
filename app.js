global.secretKey = "surveypp";
global.expireTime = 1000*60*30;

const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const webpack = require('webpack');
const debug = require('debug')('surveypp:server');
const helmet = require('helmet');
const path = require('path');
const mongo = require('./cls/mongo.js');
const mssql = require('./cls/mssql.js');
const sess = require('./cls/session.js');
const fs = require('fs');
const requestIp = require('request-ip');
const useragent = require('express-useragent');
const bodyParser = require('body-parser');



const wpDevMW = require('webpack-dev-middleware');
const wpHotMW = require('webpack-hot-middleware');

const app = express();
const DIST_DIR = path.join(__dirname, 'dist');
router = express.Router();


app.use(useragent.express());
app.use(requestIp.mw());
app.use(helmet());  //보안 강화
//개발인 경우 WEBPACK-DEV-SERVER
if(process.env.NODE_ENV === 'development') {
    const webpackConfig = require("./webpack.config.dev.js");
    if(Array.isArray(webpackConfig)) {
        for(let config of webpackConfig) {
            const compiler = webpack(config);
            app.use(wpDevMW(compiler, config.devServer));
            app.use(wpHotMW(compiler, config.devServer));
        }
    }
}

// view engine setup
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'dist', 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(sess.session({
    secret: global.secretKey,
    saveUninitialized: false,
    resave: false,
    ttl: global.expireTime,
    cookie: {httpOnly: false,maxAge: global.expireTime, signed: true},
    store: sess.store
}));

//SWAGGER
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
router.use('/api-docs', swaggerUI.serve, (req, res) => {
    let path = './cls/swaggerDef.js';
    delete require.cache[require.resolve(path)];
    const swaggerDef = require(path);
    const swaggerSpec = swaggerJSDoc(swaggerDef);
    return swaggerUI.setup(swaggerSpec)(req,res);
});

//STATIC
router.use(express.static(DIST_DIR,{dotfiles: 'ignore'}));

/*****************ROUTERS*******************/
//API POST
router.post(/^\/(api)\/(.+)/, async (req, res, next) => {
    let request = req.params[1];
    let output={};
    let dataFilePath = path.join(__dirname, "api",request)+'.js';
    if (process.env.NODE_ENV === "production") dataFilePath = path.resolve('dist', 'api', `${request}.js`);
    if (fs.existsSync(dataFilePath)){
        if (process.env.NODE_ENV === "development") delete require.cache[require.resolve(dataFilePath)];
        output = await require(`./api/${request}.js`)(req, mongo, mssql);
        if (output.redirectUrl) return res.redirect(output.redirectUrl)
        if (output.errMsg) return res.render('error', {message: output.errMsg});
        return res.end(JSON.stringify(output));
    }
    return next();
});

//NEXT
router.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();
    //GET 형태로 예외처리해야하는 것들
    let getApiRoutes = [
        'getSurveyData'
    ];
    //
    //TODO: ROUTING 해줄 파일이 있으면 이곳에 추가
    let routes = [
        {request: '', template: 'index'},
        {request: 'index', template: 'index'},
        {request: 'error', template: 'error'},
        {request: 'router', template: 'router', async: true},
        {request: 'quota', template: 'quota',auth: true},
        {request: 'quotaView', template: 'quotaView'},
        {request: 'login', template: 'login', async: true},
        {request: 'report', template: 'report',auth: true},
        {request: 'fieldWorkView', template: 'fieldWorkView', auth: true, async: true},
    ];

    const requestUrl = req.path.substr(1);
    const renderPage = routes.find(r => r.request === requestUrl);
    if (renderPage) {
        res.locals.query = req.query;
        res.locals.res = res;
        res.locals.redirectUrl = req.originalUrl || req.url;

        let dataFilePath = path.join(__dirname, 'routes',`${requestUrl}.js`);
        let outputData;
        if (fs.existsSync(dataFilePath) && renderPage.async) {
            if (process.env.NODE_ENV === "development") delete require.cache[require.resolve(dataFilePath)];
            outputData = await require(dataFilePath)(req, res, next, mongo);
        }
        if (renderPage.auth && req.session) {
            if (req.query.akey) {
                let authPath = path.join(__dirname, 'api', 'getAuth.js');
                if (process.env.NODE_ENV === "development") delete require.cache[require.resolve(authPath)];
                let result = await require(authPath)(req, mongo, true);
            }
            if(req.session.userID === undefined) {
                return res.render('login', {query: req.query, res: res});
            } else {
                req.session._garbage = Date();
                req.session.touch();
            }
        }
        if (outputData) {
            res.locals.data = outputData;
            if (outputData.redirectUrl) return res.redirect(outputData.redirectUrl);
            if (outputData.errMsg) return res.end(`${outputData.errMsg}`);
        }
        return res.render(renderPage.template,{query: req.query, data: res.locals.data});
        /*
        return res.render(
            renderPage.template,
            {
                query: req.query,
                res: res
            }, //PASS DATA TO TEMPLATE
            function (err , html) {
                if (err) return res.end(err.message);
                return res.send(html);
          });
          */
    }
    let apiUrl = requestUrl.split('/').pop();
    if (!getApiRoutes.includes(apiUrl)) return next();
    let dataFilePath = path.join(__dirname, 'api',`${apiUrl}.js`);
    if (fs.existsSync(dataFilePath)) {
        if (process.env.NODE_ENV === "development") delete require.cache[require.resolve(dataFilePath)];
        return await require(dataFilePath)(req, res, next, mongo);
    }
    return next();
});

/*****************ROUTERS END*******************/



app.use('/', router);

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//module.exports = app;
const http = require('http');
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
console.warn(`survey people start ${port}`);
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);

}



/*
app.get('*', (req, res, next) => {
    let params = req.params[0];
    let file = path.join(__dirname, process.env.NODE_ENV === 'development' ? 'dist' : '', params);
    console.log(file);
    if (fs.existsSync(file)) {
        fs.readFile(file, (err,html) => {
            if (err) res.end(err);
            return res.end(html);
        });
    } else {
        next();
    }
});
*/
