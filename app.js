var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var queries = require('./queries');
var connections = require('./connection');
var updateCustomer = require('./updateCustomer');
var sendEmails = require('./sendEmails');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


var dir = './Logs'
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

function isFileEmpty(fileName, ignoreWhitespace=true) {
  return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, data) => {
          if( err ) {
              resolve(err);
              return;
          }

          resolve((!ignoreWhitespace && data.length == 0) || (ignoreWhitespace && !!String(data).match(/^\s*$/)))
      });
  })
}



setInterval(function() {
  var today = new Date();
  console.log(today.getHours(), today.getMinutes(), Number(today.getDate()));
  if(today.getHours() == 0 && today.getMinutes() == 30 && Number(today.getDate()) == 1){
    connections.connectToSAP()
  .then(result=>{
    console.log(result);
    return updateCustomerCredit()
  })
  .then(result=>{
    console.log(result)
  })
  .catch(err=>{
    console.log(err);
  })
  }
  else{
    console.log("not in time yet");
  }
},60000);


function getCreditLimit(){
  return new Promise(resolve=>{
    resolve(connections.connecttoHana(queries.getCreditLimit))
  })
};

app.get('/updateCreditLimit', async function(req, res, next) {
  connections.connectToSAP()
  .then(result=>{
    return updateCustomerCredit()
  })
  .then(result=>{
    res.send(result)
  })
  .catch(err=>{
    res.send(err)
  })
})

function updateCustomerCredit(){
  return new Promise(async function(resolve){
    var today = new Date();
    var file = `Logs/CreditLimitLogs-${connections.formatDate(today)}.txt`;
    if (!fs.existsSync(file)){
      fs.writeFile(file, '\r\n', (err) => {});
    };
    const customers = await getCreditLimit();
    if(customers.length){
      for (let index = 0; index < customers.length; index++) {
        var customer = customers[index];
        var data = {
          "clientId":customer.CardCode,
          "creditLimit": Math.round(customer.CreditLimit)
        };
        var result = await updateCustomer.UpdateCustomer(data)
        if(!result.status){
          fs.appendFile(file, "\n"+ new Date() +"-"+ `Customer: ` + customer.CardCode +"\r\n"+ JSON.stringify(result.error) +'\r\n \r\n', (err) => {});
        }

        if(index == customers.length - 1){
          var FileEmptyCheck = await isFileEmpty(file)
          console.log("FileEmptyCheck", FileEmptyCheck);
          if(FileEmptyCheck){
            var emailAttach = ''
          }
          else{
            var emailAttach = file
          }
          await sendEmails.sendEmail(emailAttach)
          resolve(
              {"status":true, "response":"The update cycle is done, you may check the log for any failers in the log folder"}
            )
        }
      }
    }
    else{
      resolve({"status":true, "response":"no customers found"})
    }
  })
};



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

module.exports = app;
