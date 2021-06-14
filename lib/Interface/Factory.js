
const WorkerInterfaceChildProcess = require('./ChildProcess.js');
const WorkerInterfaceThread = require('./WorkerThread.js');


module.exports = {
	create : function(type)	{
		if(type === 'WorkerThread'){
            return new WorkerInterfaceThread();
        } else if(type === 'ChildProcess'){
            return new WorkerInterfaceChildProcess();
        } else {
        	throw new Error('Invalid worker type');
        }
	}
};