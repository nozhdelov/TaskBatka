

class Worker {
    
    constructor(){
        this.process = process;
        
        this.taskHandlers = {};
        
        
    }
    
    
    start(){
        
        this.process.on('exit', () => console.log('exitting'));
        
        this.process.on('message', (message) => {
            
            switch(message.type){
                case 'loadTask' :
                    this.loadTask(message.path, message.id, message.params);
                break;
            }
        });
        
        
        this.process.send({type : 'status.change', value : 'free'});
    }
    
    
    loadTask(path, id, params){
        this.process.send({type : 'status.change', value : 'busy'});
        if(!this.taskHandlers[path]){
            this.taskHandlers[path] = require(path);
        }
        if(typeof this.taskHandlers[path] !== 'function'){
            this.process.send({type : 'error', value : 'invalid task handler ' + path});
        }
        const task = new this.taskHandlers[path](id);
        
        task.on('complete', (data) => {
            this.process.send({type : 'status.change', value : 'free'});
            this.process.send({type : 'task.complete', id : data.id, result : data.result});
        });
        task.on('error', (data) => {
            this.process.send({type : 'status.change', value : 'free'});
            this.process.send({type : 'task.error', id : data.id, error : data.error});
        });
        task.execute(params);
        
    }
    
}


module.exports = Worker;