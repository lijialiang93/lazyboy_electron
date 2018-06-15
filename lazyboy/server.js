const express = require('express');
const app = express();
const fs = require('fs');
const os = require('os');
const path = require('path');
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
let videoPath = undefined;
let ip = undefined;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts' }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    if (ip) {
        let url = 'http://' + ip + ':3000/video';
        res.render('player', { url: url });
    }
    else {
        res.render('error', { errorMsg: 'No File Selected' });
    }
})

app.post('/stream', function (req, res) {
    videoPath = req.body.path;
    ip = req.body.ip;
    res.sendStatus(200);
})

app.get('/video', function (req, res) {
    if (videoPath !== undefined) {
        try {
            const path = videoPath;
            const stat = fs.statSync(path)
            const fileSize = stat.size
            const range = req.headers.range

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

                const chunksize = (end - start) + 1
                const file = fs.createReadStream(path, { start, end })
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4'
                }

                res.writeHead(206, head)
                file.pipe(res)
            }
            else {
                res.redirect('/');
            }
        } catch (error) {
            res.json({ ERROR: 'File Not Found' })
            return;
        }

    } else {
        res.render('error', { errorMsg: 'No File Selected' });
    }
})

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});