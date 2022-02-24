var http = require('http');
var connections = require('./connection');
var cookies = connections.cookies;
var server = connections.server;


var UpdateCustomer= function(data){
    try{
    console.log(data);
    
      var today = new Date();
      var addBPPayLoad = {
        "CardCode" : data.clientId,
        "CreditLimit" : data.creditLimit,
        "PayableLimit" : data.creditLimit
         };
              
      return new Promise(function(resolve, reject) {
      console.log("addBPPayLoad", addBPPayLoad );
    
        var options = {
          hostname: server,
          port: 50001,
          path: `/b1s/v1/BusinessPartners('${data.clientId}')`,
          method: 'patch',
          withCredentials: true,
          headers: {
               'Content-Type': 'application/json',
               'Cookie':  `${cookies[cookies.length-1]}'`
             }
        };
        if (cookies.length - 1) {
        options.headers["Cookie"] = cookies[cookies.length-1].join( "; " );
      }
    
      var req = http.request(options, (res) => {
        let body ='';
        console.log('STATUS: ' + res.statusCode);
        var status = res.statusCode;
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (data) => {
          body += data;
        });
    
        res.on('end', () => {
          if(status != 204){
            console.log('error: ', JSON.parse(body).error);
            var response = {
              "status":false,
              "error": JSON.parse(body).error.message.value
            }
            resolve(response);
          }
          else{
          var response = {
            "status":true,
            "error":null
          }
            resolve(response);
          }
        });
      });
    
      req.on('error', (e) => {
        console.log("error", e);
        reject(e);
      });
    
      // req.write(JSON.stringify(addBPPayLoad));
      req.end();
    });
    

    }
    catch(e) {
      console.log(e);
    }
    }


    module.exports = {UpdateCustomer}    