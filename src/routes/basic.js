const express = require('express');
const path = require('path');

const route = express.Router();

route.get('/api', function(req, res){ res.send("Here is api."); });

module.exports = route;