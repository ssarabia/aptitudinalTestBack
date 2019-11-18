var express = require('express');
var router = express.Router();
const sql = require('mssql')
const { poolPromise } = require('../db/db')

/* GET home page. */
router.get('/', async (req, res) => {
    res.send('Hello world')
})


module.exports = router;
