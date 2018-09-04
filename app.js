var createError = require('http-errors');
const express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var config = require('./config/dev')

const app = express();
const session = require('express-session');

// required for passport
app.use(session({
  secret: 'nishant', // session secret
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./config/passport')(passport);
app.use(flash()); // use connect-flash for flash messages stored in session

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,  __dirname + '/kycDump')
  },
  filename: function (req, file, cb) {
    console.log("files",file,req.body)
    cb(null, file.originalname)
  }
});

app.use(multer({
  storage: storage
}).any());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Creating all app routes
app.use('/user', require('./icoDashboardCreator/userAuthRoutes'));
require('./routes')(app);
require('./userlogin/routes')(app);
require('./contractCreator/routes')(app);
require('./contractDeployer/routes')(app,express);
require('./packageCart/routes')(app);
require('./icoDashboardCreator/routes')(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var db = require('./database/models/index');
db.sequelize.sync({force:false}).then(()=> {
  console.log("Sync done");
})

module.exports = app;
