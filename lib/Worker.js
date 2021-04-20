

class Worker {
    
    constructor(){
        this.process = process;
        
        this.taskDefinitions = {};
        this.taskHandlers = {};
        
        
    }
    
    
    start(){
        
        this.process.on('exit', () => console.log('exitting'));
        this.process.on('disconnect', () => this.process.exit());
        
        this.process.on('message', (message) => {
            
            switch(message.type){
                case 'loadTask' :
                    this.loadTask(message.path, message.id, message.params, message.persistent, message.method);
                break;
            }
        });

	this.process.on('uncaughtException', (err) => {
        	this.process.send({type : 'status.error', error : err.message});
        });

        
        
        this.process.send({type : 'status.change', value : 'free'});
    }
    
    
    loadTask(path, id, params, persistent, method){
        this.process.send({type : 'status.change', value : 'busy'});
        if(!this.taskDefinitions[path]){
            this.taskDefinitions[path] = require(path);
        }
        if(typeof this.taskDefinitions[path] !== 'function'){
            this.process.send({type : 'status.change', value : 'free'});
            this.process.send({type : 'task.error', id : id, error : 'invalid task handler ' + path});
            return;
        }
        
        let task;
        if(persistent && this.taskHandlers[path]){
            task = this.taskHandlers[path];
            task.setId(id);
        } else {
            task = new this.taskDefinitions[path](id);
            task.on('complete', (data) => {
                this.process.send({type : 'status.change', value : 'free'});
                this.process.send({type : 'task.complete', id : data.id, result : data.result});
            });
            task.on('error', (data) => {
                this.process.send({type : 'status.change', value : 'free'});
                this.process.send({type : 'task.error', id : data.id, error : data.error});
            });
            task.on('message', (data) => {
                this.process.send({type : 'task.message', messageType : data.type, messageData : data.data});
            });
            task.init();
            this.taskHandlers[path] = task;
        }
        
        
        task.execute(method, params);
        
    }
    
}


module.exports = Worker;
