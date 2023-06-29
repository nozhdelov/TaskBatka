
const WT = require('worker_threads');

class WorkerThread {
    
    constructor(){
        
        this.parentPort = WT.parentPort;
        
        this.taskDefinitions = {};
        this.taskHandlers = {};
        
        
    }
    
    
    start(){
        
        this.parentPort.on('exit', () => console.log('exitting'));
        this.parentPort.on('disconnect', () => this.process.exit());
        
        this.parentPort.on('message', (message) => {
            
            switch(message.type){
                case 'loadTask' :
                    this.loadTask(message.path, message.id, message.params, message.persistent, message.method);
                break;
            }
        });

	    process.on('uncaughtException', (err) => {
        	this.parentPort.postMessage({type : 'status.error', error : err.message});
        });

        
        
        this.parentPort.postMessage({type : 'status.change', value : 'free'});
    }
    
    
    async loadTask(path, id, params, persistent, method){
        this.parentPort.postMessage({type : 'status.change', value : 'busy'});
        if(!this.taskDefinitions[path]){
            this.taskDefinitions[path] = (await import(path)).default;
        }
        if(typeof this.taskDefinitions[path] !== 'function'){
            this.parentPort.postMessage({type : 'status.change', value : 'free'});
            this.parentPort.postMessage({type : 'task.error', id : id, error : 'invalid task handler ' + path});
            return;
        }
        
        let task;
        if(persistent && this.taskHandlers[path]){
            task = this.taskHandlers[path];
            task.setId(id);
        } else {
            task = new this.taskDefinitions[path](id);
            task.on('complete', (data) => {
                this.parentPort.postMessage({type : 'status.change', value : 'free'});
                this.parentPort.postMessage({type : 'task.complete', id : data.id, result : data.result});
            });
            task.on('error', (data) => {
                this.parentPort.postMessage({type : 'status.change', value : 'free'});
                this.parentPort.postMessage({type : 'task.error', id : data.id, error : data.error});
            });
            task.on('timeout', (data) => {
                this.process.send({type : 'status.change', value : 'free'});
                this.process.send({type : 'task.timeout', id : data.id});
            });
            task.on('message', (data) => {
                this.parentPort.postMessage({type : 'task.message', messageType : data.type, messageData : data.data});
            });
            task.init();
            this.taskHandlers[path] = task;
        }
        
        
        task.execute(method, params);
        
    }
    
}


module.exports = WorkerThread;
