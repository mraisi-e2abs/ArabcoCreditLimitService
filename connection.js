var https = require('https');
var http = require('http');
var cookies = [];
var server = '10.0.0.101';

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month, day].join('');
};




var connecttoHana = function (query) {
  console.log(query);
    var hdb    = require('hdb');
    return new Promise(function(resolve, reject) {
        var client = hdb.createClient({
            host     : '10.0.0.101',
            port     : 30013,
            intanceNumber : '00',
            user     : 'SYSEVO',
            password : 'Evo12345',
            databaseName : "NDB"
        });
        client.on('error', function (err) {
            console.error('Network connection error', err);
            reject(err);
        });
        console.log(client.readyState); 
        client.connect(function (err) {
            if (err) {
                 console.error('Connect error', err);
                 reject(err);
            }
           client.exec(query, function (err, rows) {
            client.end();
            if (err) {
                console.error('Execute error:', err);
                reject(err);
            }
            resolve(rows);
            });
        });
    });
  };




  /////////////////////////////////////////////SAP Connection //////////////////////////////////

  var connectToSAP = function () {
    var sapConnection = {
      "CompanyDB": "ARABCO_PROD",
      "Password": "1234",
      "UserName": "B1i"
      };
    
    return new Promise(function(resolve, reject) {
      var options = {
      hostname: server,
      port: 50000,
      path: '/b1s/v1/Login' ,
      xhrFields: { withCredentials: true },
      method: 'POST',
      headers: {
           'Content-Type': 'application/json'
      }
    };
    
    //bypass SSL certificate
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    var req = https.request(options, (res) => {
      let body='';
    
      // display returned cookies in header
      var setcookie = res.headers["set-cookie"];
      console.log('setcookie', setcookie);
      var cookieArray = [];
      if ( setcookie ) {
        setcookie.forEach(
          function ( cookiestr ) {
            console.log( "COOKIE:" + cookiestr );
            cookieArray.push(cookiestr);
          }
        );
        cookies.push(cookieArray);
      }
      console.log('cookieArray', cookieArray);
      res.on('data', (data) => {
        body += data;
      });
    
      res.on('end', () => {
         if (res.statusCode === 200) {
           connected = true;
         }
    
        process.stdout.write(body);
        body = JSON.parse(body);
        if (!body.error) {
        //  database.push(serverData.CompanyDB);
          resolve(body);
          console.log('After Successfully Login');
        } else {
          console.log("body", body);
          reject(body);
        }
        
      });
    });
    
    req.on('error', (e) => {
      console.error(e);
      reject(e);
    });
    
    req.write(JSON.stringify(sapConnection));
    req.end();
    });
    
    };


module.exports = {connecttoHana, connectToSAP, cookies, server, formatDate};