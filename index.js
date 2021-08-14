const { exec } = require('child_process');
const express = require('express');

const app = express();

const getTemp = () => {
    return new Promise(resolve => {
        exec("sensors", (error, stdout, stderr) => {
            if (error) console.log(error);
            if (stderr) console.log(stderr);

            stdout = stdout.split('\n')[2];
            stdout = stdout.substring(15);

            resolve(`CPU \n ${stdout}`);
        });
    });
}

const getUsage = () => {
    return new Promise(resolve => {
        exec(`grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}'`, (error, stdout, stderr) => {
            resolve(stdout);
        });
    });
}

const getRam = () => {
    return new Promise((resolve,reject) => {

        exec("cat /proc/meminfo", (error, stdout, stderr) => {
            if (error) console.log(error);
            if (stderr) console.log(stderr);

            let total = stdout.split('\n')[0];
            let free = stdout.split('\n')[2];

            total = parseInt(total.split(' ').filter(i => i != '')[1]);
            free = parseInt(free.split(' ').filter(i => i != '')[1]);

            let used = total - free;

            total = ((total / 1000)/1000).toFixed(2) + 'GB';
            used = ((used / 1000)/1000).toFixed(2) + 'GB';

            resolve(`RAM \n ${used}/${total}`);
        });
    });
}

const getNet = () => {
    return new Promise(resolve => {
        exec('ifstat -p', (error, stdout, stderr) => {
            let line = stdout.split('\n')[9];
            line = line.split(' ').filter(i => i != '');

            let up = line[7];
            let down = line[5];

            up = parseInt(up.substring(0, up.length - 1))/1000;
            down = parseInt(down.substring(0, down.length - 1))/1000;

            resolve(`up ${up}Mb \n/ down ${down}Mb`);
        });
    });
}

app.get('/temp', async(req, res) => {
    res.send(`${await getTemp()}\n${await getUsage()}`);
});

// app.get('/usage', async(req, res) => {
//     res.send(await getUsage());
// });

app.get('/ram', async(req, res) => {
    res.send(await getRam());
});

app.get('/net', async(req ,res) => {
    res.send(await getNet());
});

app.listen(3000);