
var nodemailer = require('nodemailer')

var sendEmail = function (emailAttach){
  console.log("emailAttach", emailAttach);
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 25,
    auth: {
      user: 'sap@arabco.com',
      pass: 'Bronco2m6ft%50',
    },
  });
  transporter.sendMail({
    from: 'sap@arabco.com', // sender address
    to: "mmraisi@e2abs.com", // list of receivers , mlubani@e2abs.com, tmansi@beyondgameshq.com, jihad1968@gmail.com
    subject: "Arabco Credit Limit update Service", // Subject line
    //text: "Please check the error as per below: \n" + emailBody, // plain text body
    html: (emailAttach == '')? "Dears, <br> <br> The update cycle is done. No Errors found <br> <br>" :
                                 'Dears, <br> <br> The update cycle is done. Please check attached the log file for the failed transactions <br> <br>', // html body
    attachments: (emailAttach != '')? [
        {   // file on disk as an attachment
            filename: 'logs.txt',
            path: emailAttach // stream this file
        }
    ] : []
  }).then(info => {
    return info;
  }).catch(console.error);

};


module.exports = {
sendEmail
}