const express = require('express');
const path = require('path');

const route = express.Router();

route.get('/api', function(req, res){ 
    return res.send("Here is api.");
});
route.post('/api', function(req,res){
    return res.send({
        success:true,
        error:null,
        data: req.body  
    })
});
module.exports = route;