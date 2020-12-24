import express from 'express';
import path from 'path';
import Auth from './app/auth'
const route = express.Router();

route.post('/login', async (req,res) => {
    let param = {
        username: req.body.username,
        password: req.body.password
    }
    if (!param.username || !param.password) {
        return res.sendStatus(401);
    }
    const result = await Auth.login(param);
    if(result.success){
        res.cookie(result.cookieKey, result.sid, result.networkSetting);
        return res.send({
            success: true,
            error: null,
            data: result.username
        });
    }
    else return result;
})


route.post('/register', async (req,res) => {
    let param = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        dob: new Date(req.body,dob).getTime(),
        zipcode: req.body.zipcode
    }
    if (!param.hasOwnProperty(username) || !param.hasOwnProperty(password) || !param.hasOwnProperty(email) || !param.hasOwnProperty(dob) || !param.hasOwnProperty(zipcode)) {
        return res.send({
            success: false,
            error: '400',
        });
    }

    const result = await Auth.register(param);
    
    if(result.success){
        return res.send({
            success: true,
            error: null,
            data: result.username
        });
    }
    else return res.send(result)
})


route.post('/logout', async (req,res) => {
    let sid = req.cookies[cookieKey];
    if (!sid) {
        return res.send({
            success: false,
            error: '401',
        });
    }
    
    const result = await Auth.logout(sid);
    if(result.cookieKey && result.sid && result.networkSetting){
        res.cookie(result.cookieKey, result.sid, result.networkSetting);
        return res.send({
            success:true,
            error:null,
            message: 'OK'
        });
    }
    else return res.send({
        success: false,
        error: '400',
    });
})


module.exports = route;