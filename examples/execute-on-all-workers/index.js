
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('MyTask', fs.realpathSync('./MyTask.js'), true);

tb.executeOnAll('MyTask', {myNumber : 1}).then(console.log).catch(console.log);

