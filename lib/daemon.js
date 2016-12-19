var fs = require('fs');
var logwatch = require('./logwatch')

var BASE_FILE=process.env['HOME']+'/.logwatch';

module.exports = {
    'kill': function(){
        var options = this.getOptions();

        try {
            process.kill(options.pid, 'SIGHUP');
        } catch (err) {
            console.log('logwatch: no running pid found')
        }
    },
    'start': function(force){
        var options = this.getOptions();

        if( options.pid && !force ){

            var shouldExit = true;

            try {
                process.kill(options.pid, 0);
            } catch(err) {
                console.log("logwatch is already dead, cleaning up old logwatch..")
                console.log("logwatch running...")
                shouldExit = false;
            }

            if( shouldExit ){
                console.log("logwatch already running at `%s` [pid:%s]",options.dir,options.pid)
                console.log("\nforce new logwatch with\n logwatch force")
                console.log("\nshutdown logwatch with\n logwatch kill")

                return;
            }

        }

        logwatch(process.cwd());

    },
    'getOptions': function(){
        var options = {
            'pid': null,
            'dir': process.env['OLDPWD']
        };

        if( fs.existsSync(BASE_FILE) ){
            try {
                var file = fs.readFileSync(BASE_FILE);
                options  = JSON.parse(file);
            } catch (err){

            }
        }

        return options;
    },
    'write': function(options){

        if(!options){
            var options = this.getOptions();
        }

        fs.writeFile(BASE_FILE,JSON.stringify(options),function(err){

            if( err ){
                console.log(err);

                return false
            }

            return true
        });

    }
};
