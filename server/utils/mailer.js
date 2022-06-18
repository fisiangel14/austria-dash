
var _und = require("underscore");
var nodemailer = require('nodemailer');
var db = require("./db");

var mailer = {
  sendMail: function (opcoId, mailTo, mailDate, mailLevel, mailSource, mailSubject, mailBody, mailLink){

    console.log('Email request params: ', opcoId, mailTo, mailDate, mailLevel, mailSource, mailSubject, mailBody, mailLink);
    
      //SMTP config A1
      var smtpConfigA1 = {
          host: 'smtp-relay.austria.local',
          port: 25
      };

      /* jshint ignore:start */
      var htmlTemplate = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html>
          <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>A1G RA Dashboard</title>
          <style type="text/css">
            #outlook a{padding:0;} 
            body{width:100% !important;} .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} 
            body{-webkit-text-size-adjust:none;} 
            body{margin:0; padding:0;}
            img{border:0; height:auto; line-height:100%; outline:none; text-decoration:none;}
            table td{border-collapse:collapse;}
            #backgroundTable{height:100% !important; margin:0; padding:0; width:100% !important;}

            body, #backgroundTable{
               background-color:#FAFAFA;
            }

            #templateContainer{
               border: 1px solid #DDDDDD;
            }
            h1, .h1{
               color:#202020;
              display:block;
               font-family:Arial;
               font-size:34px;
               font-weight:bold;
               line-height:100%;
              margin-top:0;
              margin-right:0;
              margin-bottom:10px;
              margin-left:0;
               text-align:left;
            }
            h2, .h2{
               color:#202020;
              display:block;
               font-family:Arial;
               font-size:30px;
               font-weight:bold;
               line-height:100%;
              margin-top:0;
              margin-right:0;
              margin-bottom:10px;
              margin-left:0;
               text-align:left;
            }
            h3, .h3{
               color:#202020;
              display:block;
               font-family:Arial;
               font-size:26px;
               font-weight:bold;
               line-height:100%;
              margin-top:0;
              margin-right:0;
              margin-bottom:10px;
              margin-left:0;
               text-align:left;
            }
            h4, .h4{
               color:#202020;
              display:block;
               font-family:Arial;
               font-size:22px;
               font-weight:bold;
               line-height:100%;
              margin-top:0;
              margin-right:0;
              margin-bottom:10px;
              margin-left:0;
               text-align:left;
            }
            #templatePreheader{
               background-color:#FAFAFA;
            }
            .preheaderContent div{
               color:#505050;
               font-family:Arial;
               font-size:10px;
               line-height:100%;
               text-align:left;
            }
            .preheaderContent div a:link, .preheaderContent div a:visited, .preheaderContent div a .yshortcuts {
               color:#336699;
               font-weight:normal;
               text-decoration:underline;
            }
            #templateHeader{
               background-color:#FFFFFF;
               border-bottom:0;
            }
            .headerContent{
               color:#202020;
               font-family:Arial;
               font-size:34px;
               font-weight:bold;
               line-height:100%;
               padding:0;
               text-align:center;
               vertical-align:middle;
            }
            .headerContent a:link, .headerContent a:visited,  .headerContent a .yshortcuts {
               color:#336699;
               font-weight:normal;
               text-decoration:underline;
            }
            #headerImage{
              height:auto;
              max-width:600px !important;
            }
            #templateContainer, .bodyContent{
               background-color:#FFFFFF;
            }
            .bodyContent div{
               color:#505050;
               font-family:Arial;
               font-size:14px;
               line-height:150%;
               text-align:left;
            }
            .bodyContent div a:link, .bodyContent div a:visited,  .bodyContent div a .yshortcuts {
               color:#336699;
               font-weight:normal;
               text-decoration:underline;
            }
            .bodyContent img{
              display:inline;
              height:auto;
            }
           
          </style>
        </head>
          <body style="margin-top: 35px;background-color:#f5f5f5;">
            <center>
                <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="backgroundTable">
                    <tr>
                    	<td>
      	              	<br />
                    	</td>
                    </tr>
                    <tr>
                          <td align="center" valign="middle">
                              <table border="0" cellpadding="0" cellspacing="0" width="90%" id="templateContainer">
                                  <tr>
                                      <td>
                                        <!-- // Begin Template Body \\ -->
                                        <div class="modal-content bodyContent" style="position:relative; background-color:#fff; background-clip:padding-box;border:2px solid rgba(0, 0, 0, .2); border-radius: 6px;outline: none;-webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, .5);box-shadow: 0 5px 15px rgba(0, 0, 0, .5);">
                                          
                                          <div style="padding: 10px 20px 5px;text-align:left;">
                                            <span style="margin-bottom: 10px; font-size: 16px; font-weight: 800; line-height: 1.4;">
                                              <span style="font-size: 70%;color: #999;">
                                              	{{MAIL_DATE}}
                                              </span> 
                                              <br/>
                                              {{MAIL_TYPE}}
                                              <span>{{MAIL_SUBJECT}}</span>
                                            </span>
                                          </div>

                                          <div class="modal-body" style="position: relative;padding: 10px 20px 10px">
                                            <div style="color: #555;">
                                            	{{MAIL_BODY}}
                                            </div>
                                          </div>

                                          <div class="modal-footer" style="text-align:left;padding: 10px 20px 5px;margin-top:5px;">
                                            <span style="text-align:left;"><a href="{{MAIL_LINK}}">Details</a></span>
                                          </div>

                                        </div>
                                        <!-- // End Template Body \\ -->
                                      </td>
                                  </tr>

                              </table>
                              <br />
                          </td>
                    </tr>
                    <tr>
                      <td>
                        <br />
                      </td>
                    </tr>                    
                    <tr>
                          <td align="center" valign="middle">
                              <table border="0" cellpadding="0" cellspacing="0" width="90%" id="templateContainer">              
                                <tr>
                                  <td style="background-color:#fff;">
                                    <div style="font-size:70%;padding: 10px 20px 10px;text-align:right;">
                                      <a href="http://vlreaap001.at.inside:9000/user-messages">[Alerts & Messages]</a>
                                    </div>                              
                                  </td>
                                </tr>        
                              </table>
                          </td>
                    </tr>
                    <tr>
                      <td>
                        <br />
                      </td>
                    </tr>                      
                </table>
              </center>
          </body>
      </html>`;
      /* jshint ignore:end */
		
		var htmlTemplate = htmlTemplate.replace('{{MAIL_DATE}}', mailDate);

		if (mailLevel.toUpperCase() === 'ERROR') {htmlTemplate = htmlTemplate.replace('{{MAIL_TYPE}}', '<div style="color: #E74C3C;"><b>ERROR</b></div>'); }
		else if (mailLevel.toUpperCase() === 'WARNING') {htmlTemplate = htmlTemplate.replace('{{MAIL_TYPE}}', '<div style="color: #E7A23C;"><b>WARNING</b></div>'); }
		else {htmlTemplate = htmlTemplate.replace('{{MAIL_TYPE}}', '<div style="color: #428BCA;"><b>INFO</b></div>'); }

		htmlTemplate = htmlTemplate.replace('{{MAIL_SUBJECT}}', mailSubject);
		htmlTemplate = htmlTemplate.replace('{{MAIL_BODY}}', mailBody);
		htmlTemplate = htmlTemplate.replace('{{MAIL_LINK}}', mailLink);

		// Mail options
		var mailOptions = {};
		mailOptions.from = 'A1G RA Dashboard <Group.Revenue.Assurance@a1.group>';
    mailOptions.cc = [];
    mailOptions.html = htmlTemplate;
    mailOptions.text = mailDate + "\n" + "----------------------" + "\n" + mailSubject + "\n" + "======================" + "\n" + mailBody + "\n" + "======================" + "\n" + mailLink;

    var mailResult = function(error, info){
        if(error){
           console.log(error);
        }
        else {
          //callback({result: true});
          console.log('Message sent: ' + info.response);
        }
    };

    if (opcoId) {
      // Create an array of all users for provided opcoId having opted for this mailLevel
      db.query("select MESSAGE_EMAIL EMAIL from AMX_USER where OPCO_ID = ? and MESSAGE_CONFIG like ?",
        [opcoId, '%'+ mailSource + 'Send' + mailLevel + '":"Y"%'], 
        function(error, row) {
          if (_und.size(row) > 0) {
            mailTo = mailTo.concat(_und.pluck(row, 'EMAIL'));
            // mailOptions.html = mailOptions.html.replace('{{MAIL_TO}}', mailTo);
            mailOptions.subject = '[A1G RA Dashboard][' + opcoId + ']: ' + mailLevel.toUpperCase() + ' - ' + mailSubject;
            mailOptions.to = _und.uniq(mailTo);
            console.log(mailOptions.to);
            
            // send mail with defined transport object 
            nodemailer.createTransport(smtpConfigA1).sendMail(mailOptions, mailResult);
          }
          else {
            console.log('No recipient subscribed to this Email type found');
          }
        }); 
    }
    else {
        // mailOptions.html = mailOptions.html.replace('{{MAIL_TO}}', mailTo);
        mailOptions.subject = '[A1G RA Dashboard]: ' + mailLevel.toUpperCase() + ' - ' + mailSubject;
        mailOptions.to = _und.uniq(mailTo);
        console.log(mailOptions.to);
      
        // send mail with defined transport object 
        nodemailer.createTransport(smtpConfigA1).sendMail(mailOptions, mailResult);
    }


	}
};

module.exports = mailer; 