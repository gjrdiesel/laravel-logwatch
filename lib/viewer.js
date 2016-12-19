const BASE_FILE=process.env['HOME']+'/.logwatch_logs';
let logs = [];

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

module.exports = {
    server(){
        var express = require('express')
        var app = express()

        app.use(express.static(path.join(__dirname, 'public')))

        app.get('/logs', function (req, res) {
          res.send(JSON.stringify(logs))
        })

        app.get('/clear',function(req,res){
            res.send('success');
            logs = [];
        });

        app.listen(7055, function () {})
    },
    write(file){
        var content = fs.readFileSync(file,{encoding:'utf-8'});

        logs.push({ content });

        fs.truncateSync(file);
    },
    open(file){
        const exec = require('child_process').exec;
        exec('open http://localhost:7055')
    },
    logs
}
