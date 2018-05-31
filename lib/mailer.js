'use strict';

const Mailgun = require('mailgun-js')
const nodemailer = require('nodemailer')
const env = require('../config/secret.json')
const mime_type = require('./mime_type')

var sendEmail = function (mailOptions) {
	return new Promise((resolve, reject) => {
		try {
			if (mailOptions.content_type == mime_type.HTML_MIME_TYPE) {
				mailOptions.text = mailOptions.html.replace(/<[^>]+>/g, '')
			}
			else {
				mailOptions.html = null
			}

			var mailgun = new Mailgun({ apiKey: env.mailGunAPIKey, domain: env.mailGunDomain })

			var from_who = "newUser@givelight.org" //org email tied to the mail gun account domain
			var data = {
				//Specify email data
				from: from_who,
				//The email to contact
				to: mailOptions.to,
				//Subject and text data  
				subject: mailOptions.subject,
				html: mailOptions.text
			}

			//Invokes the method to send emails given the above data with the helper library
			mailgun.messages().send(data, function (err, body) {
				//If there is an error, render the error page
				if (err) {
					reject(err);
					console.log("Error sending email: ", err);
				}
				else {
					resolve({ 'success': true })
				}
			})
		} catch (err) {
			return reject(err);
		}
	})
}

module.exports = {
	sendEmail
};
