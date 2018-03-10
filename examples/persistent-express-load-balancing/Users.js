const Task = require('../../index.js').Task;
const redis = require('redis');

class Users extends Task {

    init() {
        this.redisClient = redis.createClient();
    }

    getUserInfo(params) {
        const key = 'users::' + params.userId;
        this.redisClient.hgetall(key, (err, result) => {
            if (err) {
                this.error(err);
            } else {
                this.complete(result);
            }
        });
    }

    setUserInfo(params) {
        const key = 'users::' + params.userId;
        const userData = params.userData;
        this.redisClient.hmset(key, userData, (err, result) => {
            if (err) {
                this.error(err);
            } else {
                this.complete(result);
            }
        });
    }

}


module.exports = Users;