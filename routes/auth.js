var express = require('express');
var router = express.Router();
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var fs = require('fs');
var template = require('../lib/template.js');
var path = require('path');
//var bc = require('../lib/bcrypt');
const shortid = require('shortid');
const db = require('../lib/lowdb')
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports= function(passport){
//LOGIN 
router.get('/login', function(request, response){
     //플래시 메시지 request.flash 로 들어옵니다. 
     
     var fmsg = request.flash();
     console.log('flash',fmsg);
     var feedback =''
     if(fmsg.error){
        feedback = fmsg.error[0]
     }
     
    var filelist = request.filelist;
    var title = 'WEB - login';
    var list = template.list(filelist)
    var html = template.html(title,list,`
    <div style="color:red">${feedback}<div>
    <form action="/auth/login_process"
        method="POST">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="password" placeholder="password"></p>

        <p><input type="submit" vlaue="login"></p>

        </form>
    
    `,'');
    response.send(html);
});

//LOGOUT 
router.get('/logout', function(request, response){
    //패스포트 로그아웃 
    request.logout();
    //세션 현재상태 저장후, 콜백 오면 리다이렉션 
    request.session.save(function(err){
        response.redirect('/');
    })
});

//LOGIN PROCESS with Passport Method is POST 
router.post('/login_process',
passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: 'logined!'
}));

//REGISTER 
router.get('/register', function(request, response){
    //플래시 메시지 request.flash 로 들어옵니다. 
    var fmsg = request.flash();
    console.log('flash',fmsg);
    var feedback =''
    if(fmsg.error){
       feedback = fmsg.error[0]
    }
    
   var filelist = request.filelist;
   var title = 'WEB - register';
   var list = template.list(filelist)
   var html = template.html(title,list,`
   <div style="color:red">${feedback}<div>
   <form action="/auth/register_process"
       method="POST">
       <p><input type="text" name="email" placeholder="email"></p>
       <p><input type="password" name="password" placeholder="password"></p>
       <p><input type="password" name="password2" placeholder="password2"></p>
       <p><input type="text" name="nickname" placeholder="nickname"></p>
       <p><input type="submit" vlaue="register"></p>

       </form>
   
   `,'');
   response.send(html);
});

//REGISTER PROCESS Method is POST 
router.post('/register_process', function (request, response) {
    var post = request.body;
    var email = post.email;
    var password = post.password;
    var password2 = post.password2;
    var nickname = post.nickname;
     
    if(email === "") {
        request.flash('error',  'email 정보를 입력하세요!');
        console.log('2');
        response.redirect('/auth/register');    
    } else if(password === "" | password2 === "") {
        request.flash('error',  'password 를 입력하세요')
        console.log('3');
        response.redirect('/auth/register');    
    } else if(nickname === "") {
        request.flash('error',  'nickname 을 입력하세요!')
        console.log('4');
        response.redirect('/auth/register');    
    } else if(password !== password2){
        request.flash('error',  'password must be same!!');
        console.log('1');
        response.redirect('/auth/register');    
    }   
     else {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            console.log('9999');    
            //db.update('hashs',hash).write();
            const user  = {
                id : shortid.generate(),
                email:email,
                password:hash,
                nickname:nickname
            }
            db.get('users').push(user).write();    
            console.log('5');
            request.login(user, function(err){
                console.log('login suecess')
                response.redirect('/');
            })
        }); 
        
    }
    
}); 

    return router;

}


//module.exports = router;