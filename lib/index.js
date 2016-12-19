module.exports = function(command){
    var daemon = require('./daemon');

    var available = {
        'kill': function(){
            daemon.kill();
        },
        'force': function(){
            daemon.start(true);
        }
    }

    if( command && available[command] ){
        available[command]();
    } else {
        daemon.start();
    }
}
