const Task = require('../../index.js').Task;

class MyTask extends Task {

    run(params) {
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = params.myNumber + 1;
                resolve(result);
            }, 1000);
        });
    }

};


module.exports = MyTask;