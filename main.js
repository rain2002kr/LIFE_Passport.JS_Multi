// 익스프레스 t 
const express = require('express');
// 미들웨어 
var bodyParser = require('body-parser');
var helmet = require('helmet')
var compression = require('compression');
var session = require('express-session')
var FileStore = require('session-file-store')(session);
// 플래시 메시지
var flash = require('connect-flash');

var fs = require('fs');
const port = 3000
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression()); //압축을 위한 솔루션
app.use(helmet()); //보안을 위한 솔루션 

//fileStore 에 session 저장

var fileStoreOptions = {};
 
app.use(session({
    secret: 'keyboard cat',
    resave: false,            //기본값으로 세팅 ,추후 필요하면 변경 
    saveUninitialized: true,  //기본값으로 세팅 ,추후 필요하면 변경 
    store: new FileStore(fileStoreOptions)
}));

//flash message 사용 
app.use(flash());
var passport = require('./lib/passport')(app);

// 프로젝트 라우터
var topicRouter = require('./routes/router')
var authRouter = require('./routes/auth')(passport)
var indexRouter = require('./routes/index')


//미들웨어 만들어 사용하기 
app.get('*',function(req,res, next){
    fs.readdir('./data', function(err, filelist){
        req.filelist = filelist;
        next();
    });
});
//public 폴더를 정적폴더로 지정 
app.use(express.static('public'));
app.use('/topic', topicRouter);
app.use('/auth', authRouter);
app.use('/', indexRouter);


//ERROR Handlers default
app.use(function(req, res, next) {	
    res.status(404).send('Sorry cant find that!');
});

//SERVER ERROR(서보 오류발생)
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})




app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
