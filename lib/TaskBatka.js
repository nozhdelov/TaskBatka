
const EventEmitter = require('events');
const WorkerInterface = require('./WorkerInterface.js');
const OS = require('os');

class TaskBatka extends EventEmitter {
    
    
    
    constructor(options){
        super();
        options = options || {};
        this.concurrency = options.concurrency || OS.cpus().length - 1;
        this.workers = [];
        this.taskResolvers = {};
        this.tasksQue = [];
        this.registeredTasks = {};
        
        this.taskCounter = 0;
        this.sheduleTimer = null;
        this.autoQuit = false;
        this.taskMessageHandlers = {};
    }
    
    
    start(){
        console.log('TaskBatka is spawning ', this.concurrency, ' workers ');
        
        for(let i = 0; i < this.concurrency; i++){
           this.workers[i] = new WorkerInterface();
           this.workers[i].on('exit',  console.log);
           this.workers[i].on('close',  console.log);
           this.workers[i].on('error',  console.log);
           this.workers[i].on('task.message',  message => this.emit(message.type, message.data));
           
       }
       
       
       this.sheduleTimer = setTimeout(() => this.sheduleTasks(), 0);
    }
    
    
    quit(){
        clearTimeout(this.sheduleTimer);
        this.workers.forEach( worker => worker.kill());
    }
    
    
    quitWhenEmpty(){
        this.autoQuit = true;
    }
    
    
    registerTask(name, filePath, persistent){
        persistent = persistent || false;
        this.registeredTasks[name] = {path : filePath, persistent : persistent};
    }
    
    
    execute(task, data, method, workerIndex){
        if(!this.registeredTasks[task]){
            throw new Error('task not registered', task);
        }
        const id = this.taskCounter++;
        const taskInfo = {
            task : task, 
            data : data,
            id : id,
            method : method
        };
        if(workerIndex !== undefined){
            this.workers[workerIndex].tasksQue.push(taskInfo);
        } else {
            this.tasksQue.push(taskInfo);
        }
        
        return new Promise((resolve, reject) => {
            this.taskResolvers[id] = {
                resolve : resolve,
                reject : reject
            };
        });
    }


    
    addTask(task, data, method){
        return this.execute(task, data, method);
    }
    
    
    sheduleTasks(){
       this.sheduleTimer = setTimeout(() => this.sheduleTasks());

       let tasksInWorkerQues = 0;
       let allWorkersAreFree = true;
       for(let i = 0; i < this.workers.length; i++){
            tasksInWorkerQues += this.workers[i].tasksQue.length;
            allWorkersAreFree = allWorkersAreFree && this.workers[i].isFree();
       }

        if(this.tasksQue.length === 0 && tasksInWorkerQues === 0) {
            if(this.autoQuit && allWorkersAreFree){
                this.quit();
            }
            return;
        }
        for(let i = 0; i < this.workers.length; i++){
            if(!this.workers[i].isFree()){
                continue
            }

            let task;
            task = this.workers[i].tasksQue.shift();

            if(!task){
                task = this.tasksQue.shift();
            }
            
            if(!task){
                continue;
            }
            
            const resolve = this.taskResolvers[task.id].resolve;
            const reject = this.taskResolvers[task.id].reject;
            const path = this.registeredTasks[task.task].path;
            const persistent = this.registeredTasks[task.task].persistent;
            const method = task.method;
            this.workers[i].loadTask(path, task.id, task.data, resolve, reject, persistent, method);
            delete this.taskResolvers[task.id];
            
        }
       
    }

    executeOnAll(task, data, method){
        const promises = [];
        for(let i = 0; i < this.workers.length; i++){
            promises.push(this.execute(task, data, method, i));
        }
        return Promise.all(promises);
    }

    addToWorker(workerIndex, task, data, method){
        return this.execute(task, data, method, workerIndex);
    }
    
    
    
}


module.exports = TaskBatka;


