# Task Batka

A simple lightweight tool for parallelizing tasks across multiple processes

###[Api Reference](docs.md)

## Example usage

    const Batka = require('task-batka').Batka;
    const fs = require('fs');

    const tb = new Batka();

    tb.start();
    tb.registerTask('MyTask', fs.realpathSync('./MyTask.js'));

    let promises = [];
    for(let i = 1; i < 100; i++){
    	promises.push(tb.addTask('MyTask', {myNumber : i}));
    }

    Promise.all(promises).then(console.log).catch(console.log);


#### and for the  'MyTask.js' file
    const Task = require('task-batka').Task;

        class MyTask extends Task {
    	   run(params){
        
    	   	   setTimeout(() => {
    	   		  const result = params.myNumber + 1;
    	   		  console.log('Task Complete!!!');
    	   		  this.complete(result);
    	   	   }, 1000);
    	   }	

    }

    module.exports = MyTask;
