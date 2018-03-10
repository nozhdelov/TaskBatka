# Task Batka

A simple lightweight tool for parallelizing tasks across multiple processes

### [Api Reference](docs.md)
### [Examples](examples/)

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

&nbsp;

## Persistent Tasks
By default `task batka` creates a new instance of a given task for every task execution, runs it and then destroys that instance. This saves some memory and promotes writing of simpler tasks. 

But what if our tasks have some slow and expensive initialization or we realy need to perserve some state between executions? This is where the Persistent Tasks come in. To make a task persistent just pass `true` as the third argument in the `registerTask` function. When a task is marked as persistent, its instances will be kept around and reused. This means that the `init` method will be called once (per worker process) and the `run` method will be called for every execution.

#### Lets say for example we want to use `task-batka` to load balance an express application

    const express = require('express');
    const app = express();
    const Batka = require('../../index').Batka;
    const fs = require('fs');

    const tb = new Batka();

    tb.start();
    tb.registerTask('Users', fs.realpathSync('./Users.js'), true);

    app.get('/getUserInfo', (req, res) => {
        const params = {userId: 1};
        tb.execute('Users', params, 'getUserInfo').then(result => {
            res.send(JSON.stringify(result));
        });

    });

    app.get('/setUserInfo', (req, res) => {
        const params = {userId: 1, userData: {name: 'Batka', age: 100}};
        tb.execute('Users', params, 'setUserInfo').then(result => {
            res.send(JSON.stringify(result));
        });
    });

    app.listen(3000, () => console.log('Example app listening on port 3000!'));

####and for the task `Users.js`

    const Task = require('../../index.js').Task;
    const redis = require('redis');

    class Users extends Task {
    
        init() {
            this.redisClient = redis.createClient();
        }

        getUserInfo(params) {
            const key = 'users::' + params.userId;
            this.redisClient.hgetall(key, (err, result) => {
                if (err) {
                    this.error(err);
                } else {
                    this.complete(result);
                }
            });
        }
    
        setUserInfo(params) {
            const key = 'users::' + params.userId;
            const userData = params.userData;
            this.redisClient.hmset(key, userData, (err, result) => {
                if (err) {
                    this.error(err);
                } else {
                    this.complete(result);
                }
            });
        }

    }


module.exports = Users;



