const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {
        const result = params.myNumber + 1;
        this.complete(result);
       
    }

}


module.exports = MyTask;