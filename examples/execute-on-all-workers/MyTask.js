const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {



        setTimeout(() => {
            
            console.log('Task Complete!!!');
            this.complete({});
        }, 1000);
    }

}


module.exports = MyTask;