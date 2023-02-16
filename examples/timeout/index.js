
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('MyTask', fs.realpathSync('./MyTask.js'));

for(let i = 0; i < 100; i++){
	tb.executeOnAll('MyTask', {wait : 10000}).then(console.log).catch(err => console.log('Failed', err));	
}

tb.execute('MyTask', {wait : 1000}).then(console.log).catch(console.log);	


