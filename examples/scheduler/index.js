
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('MyTask', fs.realpathSync('./MyTask.js'));


for(let i =0; i < 100; i++){
	let start = Date.now();
	tb.execute('MyTask', {myNumber : 1}).then(res => {
		console.log('task ', i , Date.now() - start);
	}).catch(console.log);
}
