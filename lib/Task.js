
const EventEmitter = require('events');

class Task extends EventEmitter{
    
    constructor(id){
        super();
        this.id = id;
    }
    
    init(){}
    
    setId(id){
        this.id = id;
    }
    
    getId(){
        return this.id;
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
    
    execute(method, params){
        let result;
        try{
            if(method){
                if(typeof this[method] !== 'function'){
                    throw new Error(method + ' is not a function');
                }
                result = this[method](params);
            } else {
                result = this.run(params);
            }
            if(result && result.then && result.catch){
                result.then(res => this.complete(res)).catch(err => this.error(err));
            }
        } catch(error) {
            this.error(error.message);
        }
    }
    
    
}


module.exports = Task;