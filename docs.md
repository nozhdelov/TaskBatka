# API Reference

#### `class Batka`

  * `options` - configuration object passed in the constructor
     * `concurrency` - number of worker processes to be spawned. The default is the number of CPU cores -1
     * `workerType` - type of the worker. Possible values are TaskBatka.WORKER_CHILD_PROCESS and TaskBatka.WORKER_THREAD
  * `registerTask(taskName, pathToTask, persistent)` - registeres a new Task
     * `taskName` - a name for the task to be used later for the task execution
     * `pathToTask` - an absolute path to the task definition file
     * `persistent` - Optional. tells the workers to keep task instances and reuse them. Default is false
   * `addTask(task, data, method)` - executes the task in a worker process. Returns a promise to be fullfiled with the result or the error
      * `task` - the name provided in the task registration
      * `data` - object with params that will be passed to the task's run method while execution
      * `method` - Optional. Which method of the task should handle this execution. The default is the `run` method
   * `addToWorker(workerIndex, task, data, method)` - executes the task in a given worker process. Returns a promise to be fullfiled with the result or the error
      * `workerIndex` - zero based index of the roker
      * `task` - the name provided in the task registration
      * `data` - object with params that will be passed to the task's run method while execution
      * `method` - Optional. Which method of the task should handle this execution. The default is the `run` method
   * `executeOnAll(task, data, method)` - execute a task on all workers and returns a promise to be fullfiled with the result or the error
   * `quit()` - terminate all worker processes allowing the host process to exit
   * `quitWhenEmpty()` - wait for all running tasks to finish and terminats the worker processes
   * `on(eventType, handler)` - registers an event handler 

___


#### `class Task` - all tasks must extend this class

   * `run(params)` - this is where the task code goes. The run method must either return a promise or call the `complete` or `error` method inside
      * `params` - a object with params passed from `Batka.execute`
   * `init` - any code needed for task initialization.
   * `complete(result)` - completes the curent task with the `result` allowing the worker to take other tasks
      * `result` - the result from the task esecution. It will be used to resolve the promise returned from `Batka.addTask`
   * `error(error)` - completes the curent task with the `result` allowing the worker to take other tasks
      * `error` the error message if the task fails. It will be used to reject the promise returned from `Batka.addTask`
   * `sendMessage(type, data)` - sends an event to the main process without completing the current task 


