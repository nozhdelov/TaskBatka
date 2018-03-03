
const EventEmitter = require('events');

class Task extends EventEmitter{
    
    constructor(id){
        super();
        this.id = id;
    }
    
    complete(result){
        this.emit('complete', {id : this.id, result : result});
    }
    
    error(error){
        if(error instanceof Error){
            error = error.message;
        }
        this.emit('error', {id : this.id, error : error });
    }
    
    run(){
        throw new Error('Task is missing run method');
    }
    
    execute(params){
        try{
            this.run(params);
        } catch(error) {
            this.error(error.message);
        }
    }
    
    
}


module.exports = Task;