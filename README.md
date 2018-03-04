# Task Batka

A simple lightweight tool for parallelizing tasks across multiple processes

### [Api Reference](docs.md)

## How does it work
Just spawning a worker process for every task can be very expensive and inefficient (and in some cases impossible). This is why instead, `task-batka` spawns a few workers in advance and then brokers the tasks between them until all the tasks are completed.

So lets say for exampe you have 1000 tasks to run on a 8 core system. By default `task-batka` will create a pool of 7 workers and distribute the execution of the task between them in an efficiant way.

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



## Recomendations about concurrency
* If you have high CPU intensive tasks like for example image processing, then the deafault concurrency settings (number of CPU cores - 1) will probaply work good enough for you. This will utilize all of your CPU resources to finish the tasks as fast as possible.
* If your tasks include mixture of IO waiting and then some CPU work (for example downloading large JSON payloads and then decoding them) it may be a good idea to increase the concurrency settings. In these cases more workers will utilize the CPU better.
* Of corse you may choose to decrease the number of workers so you can do other stuff on the system while the tasks are runnig.

