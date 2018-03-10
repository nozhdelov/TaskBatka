const Task = require('../../index.js').Task;

class MyTask1 extends Task {

    run(params) {

        setTimeout(() => {
            const result = params.myNumber + 1;
            this.complete(result);
        }, Math.floor(Math.random() * 30));
    }

}


module.exports = MyTask1;