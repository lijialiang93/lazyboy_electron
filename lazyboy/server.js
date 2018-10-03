const express = require('express');
const app = express();
const fs = require('fs');
const os = require('os');
const path = require('path');
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
let ip = undefined;
const port = 9527;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts' }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    if (ip) {
        let videos = [];
        for (let i = 0; i < videoPaths.length; i++) {
            let videoPath = videoPaths[i];
            let encodedPath = encodeURI(videoPath);
            let baseURL = `http://${ip}:${port}/video?path=`
            let video = {
                url: baseURL + encodedPath,
                title: videoPath,
            }

            videos.push(video);
        }

        res.render('player', {
            videos: videos,
        });
    }
    else {
        res.render('error', { errorMsg: 'No File Selected' });
    }
})

app.post('/stream', function (req, res) {
    videoPaths = req.body.paths;
    ip = req.body.ip;
    res.sendStatus(200);
})

app.get('/video', function (req, res) {
    if (videoPaths !== undefined) {
        try {
            const path = decodeURI(req.query.path);
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

app.listen(port, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${port}`);
});