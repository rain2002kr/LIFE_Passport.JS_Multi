var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');
const db = require('../lib/lowdb')

//WEB PAGE Content load 
router.get('/', function (request, response) {
    //패스포트를 이용해서 로그인에 성공하면, requset.user 로 값이 들어옵니다. 
    console.log('root page: ', request.user);
    var fmsg = request.flash();
     console.log('flash',fmsg);
     var feedback =''
     if(fmsg.success){
        feedback = fmsg.success[0]
     }
     console.log('feedback',feedback);


    var filelist = request.filelist;
    var title = 'Welcome3';
    var descriton = 'Hello, Node.js';
    var create = ``
    if(auth.IsOwner(request,response)){
        create = `<a href="/topic/create">create</a>`
    }

    var list = template.list(filelist)
    var html = template.html(title,list,
        `
        <div style="color:blue">${feedback}</div>
        <h2>${title}</h2>
        <p>${descriton}</p>
        <img src="/images/coding.jpg" style="width:1000px; height:500px; display:block; margin-top:10px;">
        `
        ,
        `${create}`
        ,
        auth.StatusUI(request,response)
        );
    response.send(html);
    
});



module.exports = router;
