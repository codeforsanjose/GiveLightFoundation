const env = require('../config/secret.json')
const twilio = require('twilio')

var isConfigured = function () {
    return env.twilio_api_key && env.twilio_auth_token
}

var sendText = function (textOptions) {
    var client = twilio(env.twilio_api_key, env.twilio_auth_token)
    client.messages.create({
        from: env.fromPhone,
        to: textOptions.to,
        body: textOptions.message
    }, (error, message) => {
        if (error) {
            console.log(error)
            res.status(403).json({ error: error })
        }
    })
}

exports.sendText = sendText
exports.isConfigured = isConfigured
