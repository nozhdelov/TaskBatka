const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {

        setTimeout(() => {
            const result = params.myNumber + 1;
            console.log('Task Complete!!!');
            this.complete(result);
        }, 1000);
    }

}


module.exports = MyTask;