
const EventEmitter = require('events');

class Task extends EventEmitter{
    
    constructor(id){
        super();
        this.id = id;
        this.maxExecutionTime = 0;
        this.maxExecutionTimeout = null;
    }
    
    init(){}
    
    setId(id){
        this.id = id;
    }
    
    getId(){
        return this.id;
    }

    getMaxExecutionTime(){
        return this.maxExecutionTime;
    }
    
    setMaxExecutionTime(time){
        this.maxExecutionTime = time;
    }

    complete(result){
        if(this.maxExecutionTimeout){
            clearTimeout(this.maxExecutionTimeout);
        }
        this.emit('complete', {id : this.id, result : result});
    }
    
    error(error){
        if(this.maxExecutionTimeout){
            clearTimeout(this.maxExecutionTimeout);
        }
        if(error instanceof Error){
            error = error.message;
        }
        this.emit('error', {id : this.id, error : error });
    }

    sendMessage(type, data){
        data = data || {};
        this.emit('message', {type : type, data : data});
    }

    timeout(){
        if(this.maxExecutionTimeout){
            clearTimeout(this.maxExecutionTimeout);
        }
        this.emit('timeout', {id : this.id});   
    }
    
    run(){
        throw new Error('Task is missing run method');
    }
    
    execute(method, params){
        let result;
        if(this.maxExecutionTimeout){
            clearTimeout(this.maxExecutionTimeout);
        }
        if(this.maxExecutionTime){
            this.maxExecutionTimeout = setTimeout(() => this.timeout(), this.maxExecutionTime);
        }
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