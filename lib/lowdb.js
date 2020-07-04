const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({users:[], topics:[], hashs:''}).write();

module.exports = db; //외부에서 사용 가능하도록 



