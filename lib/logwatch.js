//icon = https://www.iconfinder.com/icons/205621/assassin_assassination_ax_axe_bill_blood_bloody_butchery_camping_chopping_chopping_wood_cut_cutter_despatch_dispatch_equip_equipment_execute_execution_executioner_halloween_hang_hanger_hangman_hatchet_headsman_homicide_iron_jack_ketch_kill_killer_killing_manslaughter_metal_murder_punish_punisher_red_slaughterer_struggle_tomahawk_tool_tools_torturer_wood_icon#size=256

module.exports = function(dir){
    require('daemon')();
    const fs = require('fs');
    const filewatcher = require('filewatcher');
    const notifier = require('node-notifier');
    const path = require('path');

    const viewer = require('./viewer');

    const watcher = filewatcher();

    var log = require('./daemon').write;

    var filename = '/storage/logs/laravel.log';

    process.on('SIGHUP', () => {
        notifier.notify({
          'title': 'Logwatch stopped',
          'message': 'No more notifications on \n`'+dir+'`',
          'icon': path.join(__dirname, 'icon.png')
        });
        setTimeout(() => {
          console.log('Exiting.');
          process.exit(0);
        }, 100);
    });

    log({
        pid: process.pid,
        dir: dir
    })

    var filePath = dir + filename;

    if( fs.existsSync(filePath) ){
        watcher.add(filePath);

        notifier.notify({
          'title': 'Logwatch started',
          'message': 'Watch notifications on \n`'+dir+'`',
          'icon': path.join(__dirname, 'icon.png'),
        });

        viewer.server();

    } else {

        notifier.notify({
          'title': 'Logwatch failed!',
          'message': 'Could not find `' + filename + '`',
          'icon': path.join(__dirname, 'icon.png'),
        });

        throw "Could not find " + filePath;
    }

    watcher.on('change', function(file, stat) {

        viewer.write(file);

        notifier.notify({
          'title': 'Laravel Log',
          'message': 'Click here to view the log',
          'icon': path.join(__dirname, 'icon.png'),
          'wait': true // Wait with callback, until user action is taken against notification
        });

       if (!stat) {
          notifier.notify({
            'title': 'Laravel Log',
            'message': 'Log was deleted',
            'icon': path.join(__dirname, 'icon.png'),
            'wait': true // Wait with callback, until user action is taken against notification
          });
      }

    });

    notifier.on('click', viewer.open);
}
