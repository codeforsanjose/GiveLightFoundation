
const db = require('./db')

var searchall = function (req, res) {
    searchQuery = prepareSearchQuery(req.body)
    db.findAll('user', searchQuery).then(users => {
        stats = {};
        users.forEach(function (user) {
            user.interests.forEach(function (interest) {
                stats[interest] = (stats[interest] || 0) + 1;
            });
        });
        return res.json({ "result": users, "stats": stats, "timestamp": Date.now()});
    }).catch( error => {
        return res.status(500).json({ "error": error });
    });
};

const prepareSearchQuery = (searchQuery) => {
    var query = { $and: [] };
    var validQuery = false;
    if (searchQuery.searchText) {
        var searchTextQuery = { $or: [] };
        searchTextQuery['$or'].push({ "name": { '$regex': searchQuery.searchText, $options: 'i' } });
        searchTextQuery['$or'].push({ "phone": { '$regex': searchQuery.searchText, $options: 'i' } });
        searchTextQuery['$or'].push({ "email": { '$regex': searchQuery.searchText, $options: 'i' } });
        query['$and'].push(searchTextQuery);
        validQuery = true;
    }
    if (searchQuery.country) {
        query['$and'].push({ "country": { '$eq': searchQuery.country} });
        validQuery = true;
    }
    if (searchQuery.region) {
        query['$and'].push({ "region": { '$eq': searchQuery.region} });
        validQuery = true;
    }
    if (searchQuery.interests && searchQuery.interests.length > 0) {
        var interestsQuery = { $and: [] };
        interestsQuery['$and'].push({ "interests": { '$in': searchQuery.interests } });
        query['$and'].push(interestsQuery);
        validQuery = true;
    }
   
    if (searchQuery.skills && searchQuery.skills.length > 0) {
        var skillsQuery = { $and: [] };
        const regArr = searchQuery.skills.map(skill => {
            return new RegExp(skill)
        })
        skillsQuery['$and'].push({ "skills": { '$in': regArr } });
        query['$and'].push(skillsQuery);
        validQuery = true;
    }
    return validQuery ? query : null
}

exports.searchall = searchall;
