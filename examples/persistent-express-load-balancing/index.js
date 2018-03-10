const express = require('express');
const app = express();
const Batka = require('../../index').Batka;
const fs = require('fs');

const tb = new Batka();

tb.start();
tb.registerTask('Users', fs.realpathSync('./Users.js'), true);

app.get('/getUserInfo', (req, res) => {
    const params = {userId: 1};
    tb.execute('Users', params, 'getUserInfo').then(result => {
        res.send(JSON.stringify(result));
    });

});

app.get('/setUserInfo', (req, res) => {
    const params = {userId: 1, userData: {name: 'Batka', age: 100}};
    tb.execute('Users', params, 'setUserInfo').then(result => {
        res.send(JSON.stringify(result));
    });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));