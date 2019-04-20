var createError = require('http-errors');
const express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var config = require('./config/dev');
var engine = require('ejs-mate')
// var helmet = require('helmet');
var validator = require('express-validator');
var cors = require('cors')
var fs = require('fs')
var winston = require('./config/winston');
var busboy = require('connect-busboy');
 

const app = express();
const session = require('express-session');
require("./packageCart/paymentListener");

// required for passport
app.use(session({
  secret: 'nishant', // session secret
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));
app.use(busboy());

// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     // defaultSrc: ["'self'"],
//     // scriptSrc: ["'self'", 'code.jquery.com','localhost', 'cdnjs.cloudflare.com'],
//     styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
//     imgSrc: ["'self'", 'data:'],
//     fontSrc:['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'],
//     connectSrc: ["'none'"],
//     objectSrc: ["'none'"],
//     mediaSrc: ["'none'"],
//     frameSrc: ["'none'"]
//   },

//   reportOnly: false,
//   setAllHeaders: false,
//   disableAndroid: false
// }));
app.use(cors())
app.use(validator());
app.use(function (req, res, next) {
  for (var item in req.body) {
    req.sanitize(item).escape();
  }
  next();
});
//for static files
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'icoDashboardCreator')));
// app.use('/contractInteraction/project', express.static(__dirname + '/icoDashboardCreator/dist'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./config/passport')(passport);
app.use(flash()); // use connect-flash for flash messages stored in session

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/kycDump')
  },
  filename: function (req, file, cb) {
    console.log("files", file, req.body)
    cb(null, file.originalname)
  }
});

app.use(multer({
  storage: storage
}).any());

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('combined', { stream: winston.stream }))
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

//Creating all app routes
app.use('/v1/:projectName/user', require('./icoDashboardCreator/userAuthRoutes'));
require('./routes')(app);
require('./userlogin/routes')(app);
require('./contractCreator/routes')(app);
require('./createdContracts/routes')(app,express);
require('./contractDeployer/routes')(app, express);
require('./packageCart/routes')(app);
require('./icoDashboardCreator/routes')(app, express);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var db = require('./database/models/index');
db.sequelize.sync({ force: false }).then(() => {
  console.log("Sync done");
});
// require('./coinPayments/impl');
module.exports = app;
