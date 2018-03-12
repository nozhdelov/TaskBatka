
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('MyTask1', fs.realpathSync('./MyTask1.js'));
tb.registerTask('MyTask2', fs.realpathSync('./MyTask2.js'));

let promises = [];
for(let i = 0; i < 100; i++){
    let promise = tb.execute('MyTask1', {myNumber : i});
    promises.push(promise);
}

Promise.all(promises).then(console.log).catch(console.log);


let promises2 = [];
for(let i = 100; i > 0; i--){
    let promise = tb.execute('MyTask2', {myNumber : i});
    promises2.push(promise);
}

Promise.all(promises2).then(console.log).catch(console.log);

tb.quitWhenEmpty();
