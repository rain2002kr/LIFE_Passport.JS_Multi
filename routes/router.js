var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');
var path = require('path');
const shortid = require('shortid');
const db = require('../lib/lowdb')



//CREATE Method is GET 
router.get('/create', function(request, response){
    var filelist = request.filelist;
    var title = 'WEB - create';
    var list = template.list(filelist)
    var html = template.html(title,list,`
    <form action="/topic/create_process"
        method="POST">
        <p><input type="text" name="title" placeholder="title"></p>

        <p><textarea name="description"></textarea></p>

        <p><input type="submit"></p>

        </form>
    
    `,'',auth.StatusUI(request,response));
    response.send(html);
    
});

//CREATE PROCESS Method is POST 
router.post('/create_process', function (request, response) {
       var post = request.body;
       var title = post.title;
       var description = post.description;
       var id = shortid.generate();

       db.get('topics').push({id:id,title:title,description:description,user_id:request.user.id}).write();
       response.redirect(`/topic/${id}`);

       /* fs.writeFile(`data/${title}`,description,'utf8',function(err){
           response.redirect(`/topic/${title}`);     
       }); */
}); 

//UPDATE get
router.get('/update/:pageId', function(request, response){
            
    //var filteredId = path.parse(request.params.pageId).base; //경로 세탁
    
    //fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var topic = db.get('topics').find({id:request.params.pageId}).value();
    var title = topic.title;
    var description = topic.description;
    var filelist = request.filelist;
    
    var list = template.list(filelist)
    var html = template.html(title,list,
        `
        <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${topic.id}">
        <p>
            <input type="text" name="title" placeholder="title" value="${title}">
        </p>
        <p>
            <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
        `,
        `
        <a href="/topic/create">create</a> 
        <a href="/topic/update/${topic.id}">update</a>
        `
        ,
        auth.StatusUI(request,response)
    );
    response.send(html);
      //  });
    
});

//UPDATE PROCESS Method POST
router.post('/update_process', function(request, response){
    var post = request.body;
    var id = post.id //경로세탁 
    var title = post.title;
    var description = post.description;
    var topic = db.get('topics').find({id:id}).value();

    if(topic.user_id !== request.user.id){
        request.flash('error is not yours');
        response.redirect('/');
        return false;
    }
    db.get('topics').find({id:id}).assign({
        title:title, description:description
    }).write();
    response.redirect(`/topic/${topic.id}`);

        /* fs.rename(`data/${id}`,`data/${title}`, function(error){
            fs.writeFile(`data/${title}`,description, 'utf8',function(err){
                response.redirect(`/topic/${title}`);
            })
        }) */
});

//DELETE Methode is POST
router.post('/delete_process', function (request, response){
    var post = request.body;
    var id = post.id; //경로세탁 
    var topic = db.get('topics').find({id:id}).value();
    if(topic.user_id !== request.user.id){
        response.redirect('/');
        return false;
    }
    db.get('topics').remove({id:id}).write();
    response.redirect('/');
    
    //fs.unlink(`data/${id}`,function(error){
    //    response.redirect('/');
    //});
}); 

function loginCheckUI(mode,topic,descriton,request,response){
    
    if(mode === 'create'){
        if(auth.IsOwner(request,response)){
            return create = `<a href="/topic/create">create</a>`;
        } else {return ''}
    }
    if(mode === 'update'){
        if(auth.IsOwner(request,response)){
            return update = `<a href="/topic/update/${topic.id}">update</a>`;
        } else {return ''}
    }
    if(mode === 'deletes'){
        if(auth.IsOwner(request,response)){
            return deletes = `<form action="/topic/delete_process" method="post">
                                <input type="hidden" name="id" value="${topic.id}">
                                <input type="submit" value="delete">
                            </form>`;
        } else {return ''}
    }
}
//WEB PAGE load 
router.get('/:pageId', function(request, response, next){
    //형식은 'user내가 치는거대로+ Id' ex page를 쳤다면 pageId
    var topic = db.get('topics').find({id:request.params.pageId}).value();
    var user  = db.get('users').find({id:topic.user_id}).value();

    var filelist = request.filelist;  //main에 미들웨어로 넣어놓았음.
    var title = topic.title;
    var descriton = topic.description;
    var writer = user.nickname;

    var create = loginCheckUI('create','','',request,response);    
    var update = loginCheckUI('update',topic,'',request,response);
    var deletes = loginCheckUI('deletes',topic,'',request,response);

    var list = template.list(filelist)
    var html = template.html(title,list,
        `<h2>${title}</h2>${descriton}<br>edit by ${writer}`,
        
        `${create}
            ${update}
            ${deletes}
        `,
        auth.StatusUI(request,response)
        );
    response.send(html);
    
});

module.exports = router;