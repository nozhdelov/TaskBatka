const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {
        let sum = 0;
        for(let i = 0; i< 900000000; i++){
            sum += i;
        }
        this.complete(sum);
        
    }

}


module.exports = MyTask;