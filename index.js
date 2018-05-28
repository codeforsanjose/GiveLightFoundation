#!/usr/bin/env node

const json2xls = require('json2xls')
const fs = require('fs')
//const nodeExcel = require('exceljs')
const _ = require('lodash')
const path = require('path')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const session = require('express-session')
const errorHandler = require('errorhandler')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')

const app = express()
const db = require('./lib/db')
const auth = require('./lib/auth')


const email = require('./lib/email')
const profile = require('./lib/profile')
const sms = require('./lib/sms')


const port = parseInt(process.env.PORT, 10) || 3000
const publicDir = __dirname + '/app'

app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
auth.init(app)

app.get(['/', '/signup', '/login','/logout', '/profile/:id', '/search'], (req, res) => {
    res.sendFile(path.join(publicDir, '/index.html'))
})


app.post('/api/login', (req, res, next) => {
    // See: https://github.com/jaredhanson/passport-local
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            console.log('error with login:', err, user)
            return res.status(422).json(err)
        }
        req.login(user, () => {
            console.log('login user')
            return res.json(user)
        })
    })(req, res, next)

})

app.post('/api/logout', function(req, res){
    req.logout();
    res.status(200).json({'logout': "success"});
});

app.get('/api/auth/facebook', passport.authenticate('facebook'));

app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(`/profile/${req.user._id}`)
});

app.post('/api/users/search', (req, res) => {
    if (auth.isAdmin(req)) {
        return profile.searchall(req, res);
    } else {
        return res.status(403).json({ error: 'You do not have permission to access this resource...' });
    }
});

app.post('/api/admin/groupNotification', (req, res) => {
    if (auth.isAdmin(req)) {
        var reqBody = _.pick(req.body, [
            'volunteers', 'type', 'message', 'subject'
        ])
        if (reqBody.type === 'email') {
            // change to texting a list to send response of ok or not

            reqBody.volunteers.map( volunteer => {
                const message = reqBody.message
                email.notifyUserWithMessage(req.user, volunteer, reqBody.subject, message)

            })
        }
        else if (reqBody.type === 'sms'){
            // change to texting a list to send response of ok or not
            reqBody.volunteers.map( volunteer => {
                const message = reqBody.message + " Please respond to " + req.user.name + ": " + req.user.phone
                const messageOptions = {
                    to: '+' + volunteer.phone,
                    message: message 
                }
                sms.sendText(messageOptions)
            })

        }
        return res.json({ 'msg':'success!!' })
    } else {
        return res.json({ error: 'You do not have permission to access this resource...' });
    }
});

app.get('/api/users', (req, res) => {
    if (auth.isAdmin(req)) {
        db.getAll('user').then(users => {
            return res.json({ users })
        })
    } else {
        return res.status(403).json({ error: 'You do not have permission to access this resource.' })
    }
})

app.get('/api/user/:id', (req, res) => {
    //TODO Check why we need this. An Admin should be able to view anyone's profile
    // if (req.user) {
    //     var user = req.user
    //     return res.json({ user });
    // }
    if (auth.isAdmin(req) || (req.isAuthenticated() && req.params.id === req.user._id.toString())) {
        db.getById('user', req.params.id).then(user => {
            delete user.passphrase
            req.user = user
            return res.json({ user })
        })
    } else {
        return res.status(403).json({ error: 'You do not have permission to access this resource.' })
    }
})

app.get('/api/admin/users', (req, res) => {
    if (auth.isAdmin(req)) {
        db.getAll('user').then((results) => {
            return res.json(results)
        }).catch((error) => {
            console.log(error)
            return res.status(422).json(error)
        })
    }
    else {
        return res.status(403).json({ error: 'You do not have permission to access this resource.....' })
    }
})

app.post('/api/user', (req, res) => {
    // It is good practice to specifically pick the fields we want to insert here *in the backend*,
    // even if we have already done so on the front end. This is to prevent malicious users
    // from adding unexpected fields by modifying the front end JS in the browser.
    var newUser = _.pick(req.body, [
        'name', 'email', 'country', 'region', 'phone', 'interests', 'passphrase', 'skills'
    ])
    newUser.isAdmin = false
    newUser.approvedBy = ''
    bcrypt.hash(newUser.passphrase, 10, (err, hash) => {
        newUser.passphrase = hash
        db.insertOne('user', newUser).then(result => {
            email.notifyAdmin(newUser)
            email.notifyNewUser(newUser)
            return res.status(202).json(result)
        }).catch(error => {
            console.log(error)
            return res.status(422).json(error)
        })
    })
    
})

app.post('/api/admin/user/makeAdmin', (req, res) => {
    if (auth.isAdmin(req)) {
        db.getByEmail('user', _.pick(req.body, ['email'])).then(volunteer => {
            volunteer.isAdmin = true
            volunteer.approvedBy = req.user._id
            db.updateOneById('user', volunteer).then(result => {
                return res.status(200).json(result)
            }).catch(error => {
                console.log(error)
                return res.status(200).json(error)
            })
        }).catch(error => {
            console.log('error in getByEmail', error)
        })
    }
    else {
        return res.status(403).json({ error: 'You do not have permission to access this resource.....' })
    }
})

app.post('/api/admin/user/unmakeAdmin', (req, res) => {
    if (auth.isAdmin(req)) {
        db.getByEmail('user', _.pick(req.body, ['email'])).then(volunteer => {
            volunteer.isAdmin = false
            volunteer.approvedBy = req.user._id
            db.updateOneById('user', volunteer).then(result => {
                return res.status(200).json(result)
            }).catch(error => {
                console.log(error)
                return res.status(200).json(error)
            })
        }).catch(error => {
            console.log('error in getByEmail', error)
        })
    }
    else {
        return res.status(403).json({ error: 'You do not have permission to access this resource.....' })
    }
})

app.put('/api/user', (req, res) => {
    if (auth.isAdmin(req) || (req.isAuthenticated() && req.body._id === req.user._id.toString())) {
        db.getById('user', req.body._id).then(user => {
            req.body.isAdmin = user.isAdmin //Don't flip the admin switch in update API.
            db.updateOneById('user', req.body).then(result => {
                var userRecord = req.body;
                email.notifyUserProfileUpdate(userRecord);
                delete result.passphrase
                return res.status(200).json(result)
            }).catch(error => {
                console.log(error)
                return res.json(error)
            })
        }).catch(error => {
            console.log(error)
            return res.json(error)
        })
    } else {
        return res.status(403).json({ error: 'Not authenticated' })
    }
})


app.post('/api/users/email', (req, res) => {
    if (auth.isAdmin(req)) {
        console.log('Email API called ', req.body);
        const toPpl = req.body.to
        var users = []
        const subject = req.body.subject
        const message = req.body.contents
        toPpl.map(e => {
            db.getByEmail('user', e).then(user => {
                email.notifyUserWithMessage(req.user, user, subject, message, res)
            })
        });
    } else {
        return res.status(403).json({ error: 'You do not have permission to access this resource...' });
    }
});

app.post('/api/users/sms', (req, res) => {
    if (auth.isAdmin(req)) {
        const toNumbers = req.body.to_phone
        toNumbers.map(phone => {
            const textInfo = {
                to: phone,
                message: req.body.text
            }
            sms.sendText(textInfo, res)
        })
    } else {
        return res.status(403).json({ error: 'You do not have permission to access this resource...' });
    }
});

app.use(express.static(publicDir))
app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}))

console.log('Simple static server showing %s listening at port %s', publicDir, port)
app.listen(port)
