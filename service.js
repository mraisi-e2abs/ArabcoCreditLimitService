var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'ArabcoCreditLimitService',
  description: 'ArabcoCreditLimitService',
  script: 'C:\\ArabcoCreditLimitService\\bin\\www',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=8096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
