

const WorkerInterface = require('./WorkerInterface.js');
const OS = require('os');

class TaskBatka{
    
    
    
    constructor(options){
        options = options || {};
        this.concurrency = options.concurrency || OS.cpus().length - 1;
        this.workers = [];
        this.taskResolvers = {};
        this.tasksQue = [];
        this.registeredTasks = {};
        
        this.taskCounter = 0;
        this.sheduleTimer = null;
        this.autoQuit = false;
    }
    
    
    start(){
        console.log('TaskBatka is spawning ', this.concurrency, ' workers ');
        
        for(let i = 0; i < this.concurrency; i++){
           this.workers[i] = new WorkerInterface();
           this.workers[i].on('exit',  console.log);
           this.workers[i].on('close',  console.log);
           this.workers[i].on('error',  console.log);
           
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
    
    
    execute(task, data, method){
        if(!this.registeredTasks[task]){
            throw new Error('task not registered', task);
        }
        const id = this.taskCounter++;
        this.tasksQue.push({
            task : task, 
            data : data,
            id : id,
            method : method
        });
        
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
        if(this.tasksQue.length === 0){
            if(this.autoQuit && this.workers.map(worker => worker.isFree()).reduce((a, b) => a && b)){
                this.quit();
            }
            return;
        }
        for(let i = 0; i < this.workers.length; i++){
            if(!this.workers[i].isFree()){
                continue
            }
            
            let task = this.tasksQue.shift();
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
    
    
    
}


module.exports = TaskBatka;


