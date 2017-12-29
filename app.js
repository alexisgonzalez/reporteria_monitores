var cluster = require('cluster');

if(cluster.isMaster){
  var coreCount = require('os').cpus().length;
  for (var i = 0; i < coreCount; i++) {
      cluster.fork();
  }

  cluster.on('online',function(worker){
    console.log("Worked "+worker.process.pid+" esta listo");
  });

  cluster.on('exit',function(worker,code,signal){
    console.log("Worker "+worker.process.pid+" se desconecto code: "+code+" , señal: "+signal);
    console.log("Empezando otro worker");
    cluster.fork();
  });
}
else{
  var express = require('express');
  var http = require('http');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  //var users = require('./routes/users');

  var app = express();
  app.use(cookieParser());

  app.get('/',function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log("cookies ",req.cookies);
    if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined"){
        console.log("NIVEL ",req.cookies.nivel);
        res.sendFile(__dirname+'/public/index.html'); 
    }else{
        console.log("NADA login");
        //res.sendFile(__dirname+'/public/index.html');          
        res.sendFile(__dirname+'/public/index-login.html');          
    }
  })
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.set('port', process.env.PORT || 3000);
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));



  require('./routes')(app);
  require('./routes/vibox')(app);
  require('./routes/domo')(app);
  require('./routes/liquidacion')(app);
  require('./routes/mantenedores')(app);
  require('./routes/monitor')(app);
  require('./routes/supervisor')(app);
  require('./routes/postulacion')(app);
  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  app.get('*', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log("adsadasadsdasads");
    if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined"){
        console.log("NIVEL ",req.cookies.nivel);
        res.sendFile(__dirname+'/public/index.html'); 
    }else{
        console.log("NADA login");
        res.sendFile(__dirname+'/public/index-login.html');          
    }
  });

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}
