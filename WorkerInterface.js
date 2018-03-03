const EventEmitter = require('events');
const CP = require('child_process');

class WorkerInterface extends EventEmitter {
    
    constructor(){
        super();
        
        this.initProcess();
        
        this.messageHandlesrs = {
            'status.change' : message => this.status = message.value,
            'error' : message => this.emit(message.value),
            'task.complete' : message => this.completeTask(message.id, message.result),
            'task.error' : message => this.failTask(message.id, message.error)
        };
        
    }
    
    
    initProcess(){
        this.process = CP.fork(__dirname + '/workerExecutable.js');
        
        this.status = 'busy';
        this.runningTasks = {};
        
        this.process.on('exit', (code, signal) => {
            this.restartProcess();
            this.emit('exit', code, signal);
        });
        this.process.on('close', (code, signal) => {
            this.restartProcess();
            this.emit('exit', code, signal);
        });
        this.process.on('error', (code, signal) => {
            this.restartProcess();
            this.emit('exit', code, signal);
        });
        
        this.process.on('message', (message) => {
            if(this.messageHandlesrs[message.type]){
                this.messageHandlesrs[message.type](message);
            }
        });
    }
    
    
    restartProcess(){
        this.process.removeAllListeners();
        this.process.disconnect();
        this.process.kill();
        this.initProcess();
    }
    
    isFree(){
        return this.status === 'free' && Object.keys(this.runningTasks).length === 0;
    }
    
    
    loadTask(path, taskId, params, resolve, reject){
        this.runningTasks[taskId] = {
            resolve : resolve,
            reject : reject
        };
        this.process.send({type : 'loadTask', id : taskId, path : path, params : params});
    }
    
    completeTask(taskId, result){
        if(!this.runningTasks[taskId]){
            return;
        }
        this.runningTasks[taskId].resolve(result);
        delete this.runningTasks[taskId]; 
    }
    
    failTask(taskId, error){
        if(!this.runningTasks[taskId]){
            return;
        }
        this.runningTasks[taskId].reject(error);
        delete this.runningTasks[taskId]; 
    }
   
    kill() {
        this.removeAllListeners();
        this.process.removeAllListeners();
        this.process.disconnect();
        this.process.kill();
    }
    
    
}



module.exports = WorkerInterface;