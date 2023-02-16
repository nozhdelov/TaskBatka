const Task = require('../../index.js').Task;

class MyTask extends Task {

	init(){

        this.setMaxExecutionTime(2000);
    }

    run(params) {
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('completed after ' + params.wait);
            }, +params.wait);
        });
    }

};


module.exports = MyTask;
