const md5 = require('md5')
const Profile = require('../schema/model').Profile
const User = require('../schema/model').User
const redis = require('redis').createClient(process.env.REDIS_URL)

const CookieTimeLimit = 3600 * 1000;
const networkSetting = {
    maxAge: CookieTimeLimit,
    httpOnly: true
}
class Auth {
    constructor(){

    }
    async login(param) {
        const user = await User.findOne({username: param.username});
        let hash = md5(user.salt + password);

        if (hash === user.hash) {
            let sid = md5(secret + new Date().getTime()) 
            redis.hmset('sessions',sid, username)
            return {
                success: true,
                cookieKey: cookieKey,
                sid: sid,
                networkSetting: networkSetting,
                username: param.username
            }
        }
        else return {
            success: false,
            error: 'user hash not exists'
        };
    }

    // async isLoggedIn(req, res, next) {
    //     if (!req.cookies) {
    //        return res.sendStatus(401);
    //     }
    
    //     let sid = req.cookies[cookieKey];
    
    //     if (!sid) {
    //         return res.sendStatus(401);
    //     }
        
    //     let username = null
    //     redis.hget('sessions', sid, function(err,value){
    //         username = value
    //         if (username) {
    //             req.username = username;
    //             next();
    //         }
    //         else {
    //             return res.sendStatus(401)
    //         }
    //     })
    // }
    


    async register(param) {

        const users = await User.find({username: param.username});
        if(users.length !== 0 ){
            return {
                success: false,
                error: 'The user already exists',
            }
        }
        let salt = param.username + new Date().getTime();
        let hash = md5(salt + param.password) 

        try{
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
                email: param.email,
                dob: param.dob,
                zipcode: param.zipcode,
                avatar: "https://res.cloudinary.com/hoqjyxfwt/image/upload/v1604614310/aaa.png"
            }).save()
        } catch(error){
            console.log(error);
            return {
                success: false,
                error: error
            }
        }
        return {
            success: false,
            error: null
        }
    }


    logout(sid){
        try {
            redis.hdel('sessions',sid)
            return {
                cookieKey: cookieKey,
                sid: sid,
                networkSetting: networkSetting
            };
        } catch(err){
            console.log(err)
            return false;
        }
    }
}

module.exports = Auth;