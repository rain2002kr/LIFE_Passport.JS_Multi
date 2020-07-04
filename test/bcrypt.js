const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = '1111';
const someOtherPlaintextPassword = '1112';
var _hash=''
bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    _hash = hash;
    console.log('hash: ',_hash);

    // Load hash from your password DB.
    bcrypt.compare(myPlaintextPassword, _hash, function(err, result) {
        console.log('result1: ',result);
        // result == true
    });
    bcrypt.compare(someOtherPlaintextPassword, _hash, function(err, result) {
        console.log('result2: ',result);
        // result == false
    });

});

