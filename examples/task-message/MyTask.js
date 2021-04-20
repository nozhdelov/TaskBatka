const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {

        setInterval(() => {
            const result = params.myNumber++;
            this.sendMessage('my-event', result);
        }, 1000);

        setTimeout(() => {
            
            console.log('Task Complete!!!');
            this.complete({});
        }, 1000);
    }

}


module.exports = MyTask;