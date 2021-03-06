const mailer = require('./mailer')
const mime_type = require('./mime_type')

const db = require('./db')
const jade = require('jade')

function notifyUserWithMessage(organizer, user, emailSubject, message) {
	const htmlLocals = {
		"user": user,
		"message": message,
		"rsvp_message": "Please respond to, " + organizer.name + ": " + organizer.email
	}
	var html = getEmailHTML('./email_templates/message_user.jade', htmlLocals)
	var mailOptions = {
		to: user.email,
		subject: emailSubject? emailSubject: 'GiveLight Foundation Organizer message for you',
		text: html
	}
	mailerSendEmailWithOptions(mailOptions)
}

function notifyNewUser(user) {
	const htmlLocals = {
		"user": user,
	}
	var html = getEmailHTML('./email_templates/new_user_email.jade', htmlLocals)
	
	var mailOptions = {
		to: user.email,	
		subject: 'GiveLight Foundation Welcomes you',
		text: html
	}

	mailerSendEmailWithOptions(mailOptions)
}

function notifyUserProfileUpdate(user) {
	const htmlLocals = {
		"user": user,
	}
	var html = getEmailHTML('./email_templates/user_profile_update.jade', htmlLocals)
	
	var mailOptions = {
		to: user.email,	
		subject: 'GiveLight Foundation profile update',
		text: html
	}

	mailerSendEmailWithOptions(mailOptions)
}

function notifyAdmin(user) {
	const htmlLocals = {
		"user": user,
	}
	var html = getEmailHTML('./email_templates/admin_new_user.jade', htmlLocals)
	const searchQuery = {
		'isAdmin': true
	}
	db.findAll('user', searchQuery).then(users => {
		users.map(adminUser => {
			var mailOptions = {
				to: adminUser.email,
				subject: 'GiveLight Notification New User',
				text: html
			}
			mailerSendEmailWithOptions(mailOptions)
		})
	})
};

function getEmailHTML(jadeFilePath, locals) {
	const thejade = jade.compileFile(jadeFilePath, {});
	return thejade(locals);
}

function mailerSendEmailWithOptions(mailOptions, res) {
	mailer.sendEmail(mailOptions).then((results) => {
		console.log("mailer send happend: ", results)
		//return res.status(200).json({ "sent": "true" })
	}).catch((error) => {
		console.log("mailer send error: ", error)
		//return res.status(500).json(error)
	})
}

exports.notifyAdmin = notifyAdmin
exports.notifyNewUser = notifyNewUser
exports.notifyUserProfileUpdate = notifyUserProfileUpdate
exports.notifyUserWithMessage = notifyUserWithMessage
