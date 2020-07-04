
module.exports = function(app){
    //사용자 id 와 password
/* var authDate = {
    email:'rain2002kr@naver.com',
    password:'111',
    nickname:'rain2002kr'
}
 */
//const bc = require('../lib/bcrypt')
const db = require('../lib/lowdb')
const bcrypt = require('bcrypt');

//패스포트 로컬 전략 
var passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;

//passport session 사용 
app.use(passport.initialize());
app.use(passport.session());


//패스포트 사용 
passport.use(new LocalStrategy(
    //사용자가 필드를 변경시키고 싶으면 아래처럼 추가 합니다. 
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        console.log('LocalStrategy ' + email, password)
        user = db.get('users').find({email:email}).value();
        if(email === user.email){
            console.log('1');
            bcrypt.compare(password, user.password, function(err, result) {
                if(result){
                    console.log('2');
                    return done(null, user); //아이디와 비번이 일치할때, done 함수로 유저데이터를 넣어주면 session에 등록됩니다. 
                }else{
                    console.log('3');
                    return done(null, false, { message: 'Incorrect password.' });      
                }
            });    
        } else {
            console.log('4');
            return done(null, false, { message: 'Incorrect username.' });
        }
    }
  ));

//Passport 로그인이 성공되면, 그곳에서 입력한 데이터가 이곳에 콜백의 유저로 넘어 옵니다. 
passport.serializeUser(function(user, done) {
    console.log('serializeUser :' , user.id);
    done(null, user.id);
  });

//한번 통신하고 나면,웹이 리로드될때마다 이곳이 호출되어서 이곳에서 DB의 유저값을가져와 비교합니다.   
//심플한 테스트를 위해,db 에 있는값이 아닌 위의 값을 넣어줍니다. 
passport.deserializeUser(function(id, done) {
    
    var user = db.get('users').find({id:id}).value();
    console.log('deserializeUser :',id,user);
    done(null, user);
   
});
    return passport;
}

