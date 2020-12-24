const md5 = require('md5')
const Profile = require('../schema/model').Profile
const User = require('../schema/model').User

const redis = require('redis').createClient(process.env.REDIS_URL)

function isLoggedIn(req, res, next) {
    if (!req.cookies) {
       return res.sendStatus(401);
    }

    let sid = req.cookies[cookieKey];

    if (!sid) {
        return res.sendStatus(401);
    }
    
    let username = null
    redis.hget('sessions', sid, function(err,value){
        username = value
        if (username) {
            req.username = username;
            next();
        }
        else {
            return res.sendStatus(401)
        }
    })
}

function login(req, res) {
    (async() => {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            return res.sendStatus(400);
        }
        const user = await User.findOne({username: username});
        let hash = md5(user.salt + password);

        if (hash === user.hash) {
            let sid = md5(secret+new Date().getTime()) 
            redis.hmset('sessions',sid, username)
            res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true });
            let msg = {username: username, result: 'success'};
            res.send(msg);
        }
        else {
            res.sendStatus(401);
        }
    })()
}

function register(req, res) {
    
    (async () => {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        let dob = new Date(req.body.dob).getTime();
        let zipcode = req.body.zipcode;

        if (!username || !password || !email || !dob ||!zipcode) {
            return res.sendStatus(400);
        }
        const users = await User.find({username: username});
        if(users.length!==0){
            return res.sendStatus(409);
        }
        let salt = username + new Date().getTime();
        let hash = md5(salt + password) 
        await new User({
            username,
            salt, 
            hash, 
            created:Date.now()
        }).save()
        await new Profile({
            username,
            headline: "default headline",
            following: [],
            email,
            dob,
            zipcode,
            avatar: "https://res.cloudinary.com/hoqjyxfwt/image/upload/v1604614310/aaa.png"
        }).save()
        let msg = {username: username, result: 'success'};
        res.send(msg);
    })();
}

function logout(req,res){

    let sid = req.cookies[cookieKey];
    if (!sid) {
        return res.sendStatus(401);
    }
    res.cookie(cookieKey, sid, { maxAge: 0, httpOnly: true });
    redis.hdel('sessions',sid)
    res.send('OK')
}

module.exports = (app) => {
    app.post('/login', login)
    app.post('/register', register)
    app.put('/logout',logout)
    app.use(isLoggedIn)
}