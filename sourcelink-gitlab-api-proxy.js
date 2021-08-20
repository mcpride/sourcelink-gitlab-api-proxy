const express = require('express');
const http = require('http');
const https = require('https');

// --- environment variables ---
let gitlab_url = process.env.GITLAB_URL  || 'https://gitlab.com';
let port = process.env.GITLAB_PROXY_PORT || 6219;
let gitlab_private_token = process.env.GITLAB_PRIVATE_TOKEN;
// -----------------------------

let app = express();
port = parseInt(port);
var url = new URL(gitlab_url);
const client = url.protocol.includes("https") ? https : http;
app.use(express.urlencoded({ extended: true }));
let encoder = (req, res, next, param, name) => {
    param = encodeURIComponent(param.replace(/\/-$/, ''));
    param = param.split('%252F').join('%2F');
    req.params[name] = param;
    next();
};
app.param('proj', (req, res, next, param) => { 
    encoder(req, res, next, param, 'proj') 
});
app.param('commit', (req, res, next, param) => { 
    encoder(req, res, next, param, 'commit') 
});
app.param('file', (req, res, next, param) => { 
    encoder(req, res, next, param, 'file') 
});
let requestRaw = (gitlab_req_url, res) => {
    let gitlab_req = client.get(gitlab_req_url, { rejectUnauthorized: false }, (gitlab_res) => {
        if (gitlab_res.statusCode == 404) {
            res.sendStatus(gitlab_res.statusCode);
            return;
        }
        let data = '';
        gitlab_res.on('data', (chunk) => {
            data += chunk;
        });
        gitlab_res.on('close', () => {
            res.setHeader('content-type', 'text/plain');
            res.send(data); 
        });
    });
    gitlab_req.on('error', (gitlab_err) => {
        res.send(`Encountered an error trying to make a request: ${gitlab_err.message}`); 
    });
};
app.get('/:proj([^?#]*)/raw/:commit/:file([^?#]*)', function(req, res) {
    let gitlab_req_url = `${gitlab_url}/api/v4/projects/${req.params.proj}/repository/files/${req.params.file}/raw?ref=${req.params.commit}&private_token=${gitlab_private_token}`;
    console.log(`Requesting: ${gitlab_url}/api/v4/projects/${req.params.proj}/repository/files/${req.params.file}/raw?ref=${req.params.commit}&private_token=********************`);
    requestRaw(gitlab_req_url, res)
});
app.get('*', function(req, res, next) {
    res.sendStatus(404);
});
console.log(`Redirecting local port ${port} to: ${gitlab_url}`);
app.listen(port);