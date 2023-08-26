import fetch from 'node-fetch';
import HttpProxyAgent from 'https-proxy-agent';
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';

const app = express();

const forms = multer({limits: { fieldSize: 10*1024*1024 }});
app.use(forms.array());
app.use(bodyParser.json({limit : '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const proxyAgent = new HttpProxyAgent.HttpsProxyAgent('http://127.0.0.1:1081');

app.all(`/*`, async (req, res) => {
    const url = `https://api.telegram.org${req.url}`;
    const options = {
        method: req.method,
        headers: {'content-type': 'application/json;'},
        agent: proxyAgent
    };
    if( req.method.toLocaleLowerCase() === 'post' && req.body ) options.body = JSON.stringify(req.body);

    const response = await fetch(url, options);
    const data = await response.json();
    res.json(data);

})

app.use(function(err, req, res, next) {
    console.error(err)
    res.status(500).send('Internal Serverless Error')
})

app.listen(9000, () => {
    console.log(`Server start on http://localhost:9000`);
})