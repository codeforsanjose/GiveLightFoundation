const DefaultHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
}

const lookupPhoneNumber = (number) => {
    number = '+' + number
    const uploadData = {
        'phone': number
    }
    return new Promise((resolve, reject) => {
        makeRequest(uploadData, 'POST', '/api/sms/validate').then(response => {
            console.log('yes valid number', response)
            if (response.status === 201) {
                return resolve(response)
            }
            else {
                return reject('Invalid phone number')
            }
            
        }).catch(error => {
            return reject('Invalid phone number')
        })  
    })
}

const makeRequest = (uploadData = {}, method, path, headers = DefaultHeaders) => {
    if (method === 'GET') {
        return fetch(path, {
            method: method,
            headers: headers,
            credentials: 'include'
        })
    }
    else {
        return fetch(path, {
            method: method,
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(uploadData),
        })
    }
}

const loginUser = (userCreds) => {
    return makeRequest(userCreds, 'POST', '/api/login').then(response => {
        return response.json()
    }).catch(error => {
        return error
    })
}


const logoutUser = (userCreds) => {
    return makeRequest(userCreds, 'POST', '/api/logout').then(response => {
        return response.json()
    }).catch(error => {
        return error
    })
}

const registerUser = (newUser) => {
    const uploadData = {
        ...newUser
    }
    let data = cleanupData(uploadData)
    makeRequest(data, 'POST', '/api/user').then(response => {
        if (response.status == 422) {
            window.alert('Email ID already exist. Try Login')
            return response
        }
        else {
            window.alert('Successfully signed up')
            window.location.href = '/login'
            return response
        }
    }).catch(error => {
        window.alert('Error signing up')
        return error
    })
}

const getUser = (id) => {
    return new Promise((resolve, reject) => {
        return makeRequest(undefined, 'GET', `/api/user/${id}`).then(response => {
            return resolve(response.json())
        }).catch(error => {
            window.alert('Error retrieving user')
            console.log(error)
            return reject(error)
        })
    })
}
const getAllUsers = (id) => {
    return new Promise((resolve, reject) => {
        return makeRequest(undefined, 'GET', '/api/admin/users').then(response => {
            return resolve(response.json())
        }).catch(error => {
            window.alert('Error retrieving user')
            console.log(error)
            return reject(error)
        })
    })
}

const makeAdmin = (volunteerEmail) => {
    return new Promise((resolve, reject) => {
        return makeRequest(volunteerEmail, 'POST', '/api/admin/user/makeAdmin').then(response => {
            return resolve(response.json())
        }).catch(error => {
            window.alert('Error makeing  user admin', error)
            console.log(error)
            return reject(error)
        })
    })

}
const emailVolunteers = (volunteers, subject, message) => {
    return new Promise((resolve, reject) => {

        const data = {
            to: volunteers,
            subject: subject,
            contents: message,
            volunteers: volunteers,
            type: 'email',
            message: message
        }
        return makeRequest(data, 'POST', '/api/admin/groupNotification').then(response => {
            return resolve(response.json())
        }).catch(error => {
            console.log(error)
            return reject(error)
        })
    })
}
const smsVolunteers = (volunteers, text) => {
    return new Promise((resolve, reject) => {

        const data = {
            to_phone: volunteers,
            text: text,
            volunteers: volunteers,
            type: 'sms',
            message: text 
        }
        return makeRequest(data, 'POST', '/api/admin/groupNotification').then(response => {
            return resolve(response.json())
        }).catch(error => {
            console.log(error)
            return reject(error)
        })
    })
}
const searchVolunteers = (searchQuery) => {
    return new Promise((resolve, reject) => {
        return makeRequest(searchQuery, 'POST', '/api/users/search').then(response => {
            if (response.status === 403) {
                return reject('User logged out please log back in')    
            }
            return resolve(response.json())
        }).catch(error => {
            console.log('users search error', error)
            return reject(error)
        })
    })

}

const exportUserData = () => {
    const headers = {
        'Content-Type': 'application/vnd.openxmlformats',
        'Content-Disposition': 'attachment; filename=UserData.xlsx'
    }
    return makeRequest({}, 'GET', '/api/admin/user/exportData', headers)
}

const cleanupData = (uploadData) => {
    delete uploadData.checkboxInterests
    delete uploadData.retypePassphrase
    delete uploadData.skillsInput
    return { ...uploadData }
}

const updateUser = (newUser) => {
    const uploadData = {
        ...newUser
    }
    let data = cleanupData(uploadData)
    return makeRequest(data, 'PUT', '/api/user').then(response => {
        return response.json()
    }).catch(error => {
        console.log(error)
        return console.log(error)
    })
}

export {
    loginUser,
    logoutUser,
    registerUser,
    getUser,
    updateUser,
    exportUserData,
    makeAdmin,
    getAllUsers,
    searchVolunteers,
    emailVolunteers,
    smsVolunteers,
    lookupPhoneNumber,
}
