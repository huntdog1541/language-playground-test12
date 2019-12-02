var child_process = require('child_process');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var shell = require('shelljs');
var fs = require('fs');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.post('/api/code', (req, res) => {
    const code = req.body.code;
    const language = req.body.language;
    console.log("Language: " + language);
    console.log("Code: " + code);
    let response = null;
    response = JSON.stringify("Sent information");
    var output = runProcess(code);
    console.log("Output: " + output);
    res.end(response);
})

// function runProcess() {
//     var output = null;
//     exec('/usr/bin/java --version', function(error, stdout, stderr) {
//         if(stdout !== null)
//         {
//             console.log('stdout: ' + stdout);
//         }
//         if(stderr !== null)
//         {
//             console.log('stderr: ' + stderr);
//         }
//         if(error !== null)
//         {
//             console.log('exec error: ' + error);
//         }
//         output = { out: stdout, err: stderr, errr: error };
//     });
//     return output;
// };

/* function runProcess() {
    var output = { stdout: null, stderr: null, status: null, error: null };
    var child = child_process.spawnSync("/usr/bin/java", ["--version"], {encoding: 'utf-8'});
    console.log("Process finished.");
    if(child.error) {
        output.error = child.error;
    }
    output.stdout = child.stdout;
    output.stderr = child.stderr;
    output.status = child.status;
    return output;
} */

function runProcess(code) {
    
    fs.writeFile('test.js', code.replace(/^"|"$/g, ''), (error) => {
        if(error)
        {
            console.log('Error: ' + error);
            throw error;
        }        
    });
    //shell.exec('node --version');
    /* shell.exec('node test.js', (code, output) => {
        out = output;
    }); */
    /*out = shell.exec('node test.js', function(code, stdout, stderr) {
        //out = stdout.toString();
        console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        return stdout.slice(0);
    });*/
    var out = shell.exec('node test.js', { async: false } ).output;
    console.log("Out from shell: " + JSON.stringify(out));
    return out;
}

module.exports = app;
