const env = require('../config/secret.json')
const twilio = require('twilio')
const client = twilio(env.twilio_api_key, env.twilio_auth_token)

var sendText = function (textOptions) {
    
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

const isValidPhoneNumber = (number) => {
    console.log('is valid phone?')
    return client.lookups.phoneNumbers(number).fetch({type: 'carrier'})
}

exports.sendText = sendText
exports.isValidPhoneNumber = isValidPhoneNumber
