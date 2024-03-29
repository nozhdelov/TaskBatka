const EventEmitter = require('events');
const CP = require('child_process');

class WorkerInterface extends EventEmitter {
    
    constructor(){
        super();
        
        this.initProcess();
        this.tasksQue = [];
        this.lastPingTime = 0;
        
        this.messageHandlesrs = {
            'status.change' : message => this.status = message.value,
	        'status.error' : message => this.restartProcess(message.error),
            'error' : message => this.emit(message.value),
            'task.complete' : message => this.completeTask(message.id, message.result),
            'task.error' : message => this.failTask(message.id, message.error),
            'task.message' : message => this.sendMessage(message.id, {type : message.messageType, data : message.messageData}),
            'task.timeout' : message => this.timeoutTask(message.id),
            'pong' : message => this.pong(),
        };
        
    }
    
    
    initProcess(){
        this.process = CP.fork(__dirname + '/../Executable/childProcess.js', process.argv.slice(2), {silent : true});
        
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
        });
        
        this.process.on('message', (message) => {
            if(this.messageHandlesrs[message.type]){
                this.messageHandlesrs[message.type](message);
            }
        });

        this.process.stdout.on('data', (data) => {
          console.log(`Worker stdout: ${data}`);
        });

        this.process.stderr.on('data', (data) => {
          console.error(`Worker stderr: ${data}`);
        });
    }
    
    
    restartProcess(reason){
	   Object.keys(this.runningTasks).forEach(taskId => this.failTask(taskId, reason));
        this.process.removeAllListeners();
	if(this.process.connected){
		this.process.disconnect();
	}
        this.process.kill();
        this.initProcess();
    }
    
    isFree(){
        return this.status === 'free' && Object.keys(this.runningTasks).length === 0;
    }
    
    
    loadTask(path, taskId, params, resolve, reject, persistent, method){
        this.runningTasks[taskId] = {
            resolve : resolve,
            reject : reject
        };
        this.process.send({
            type : 'loadTask', 
            id : taskId, 
            path : path, 
            params : params, 
            persistent : persistent,
            method : method
        });
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

    timeoutTask(taskId){
        if(!this.runningTasks[taskId]){
            return;
        }
        this.runningTasks[taskId].reject(new Error('Timeout'));
        delete this.runningTasks[taskId]; 
    }

    sendMessage(taskId, message){
        this.emit('task.message', message);
    }
   
    kill() {
        //this.removeAllListeners();
        this.process.removeAllListeners();
    	if(this.process.connected){
    		this.process.disconnect();
    	}
        
        this.process.kill();
    }


    ping(){
        this.lastPingTime = Date.now();
        this.process.send({
            type : 'ping'
        });
    }
    
    
}



module.exports = WorkerInterface;
