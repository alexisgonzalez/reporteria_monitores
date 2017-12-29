var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	console.log("asdassadsadasddsadsa");
  	if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && req.cookies.nivel == 1){
        console.log("Operadora");
        res.sendFile(__dirname+'/public/index_op.html');          
    }else if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && req.cookies.nivel == 9){
        console.log("Admin");
        res.sendFile(__dirname+'/public/index.html');          
    }else{
        console.log("NADA login");
      	res.sendFile(__dirname+'/public/login.html');          
  	}
});

module.exports = router;