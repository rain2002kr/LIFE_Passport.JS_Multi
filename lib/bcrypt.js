const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = '1111';
const someOtherPlaintextPassword = '1112';
var _hash='t'
const db = require('../lib/lowdb')

module.exports = {
    savePassword : function(password){
        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            console.log('hash: ',hash);
            db.update('hashs',hash).write();
                                
        }); 
        
           
    }, 

    compare : function (password, hash){
        bcrypt.compare(password, hash, function(err, result) {
            console.log('result: ',result);
            if(err){

            }else{
                return result;
            }
            
        });
    }
}

