
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('MyTask', fs.realpathSync('./MyTask.js'));

tb.execute('MyTask', {myNumber : 1}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 2}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 3}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 4}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 5}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 6}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 7}).then(console.log).catch(console.log);
tb.execute('MyTask', {myNumber : 8}).then(console.log).catch(console.log);