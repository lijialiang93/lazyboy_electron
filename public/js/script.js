(function ($) {
    const { dialog } = require('electron').remote;
    const os = require('os');
    var browseBtn = $('#browse');
    var videoPath = $('#path');
    var streamBtn = $('#stream');
    var stopBtn = $('#stop');
    new ClipboardJS('#clipboard');

    //get ip address
    var ip = require('ip');
    let url = 'http://' + ip.address() + ':3000'

    $('#url').prop('href', url);
    $('#url').text(url);

    //set clipboard content
    $('#clipboard').prop('data-clipboard-text', url);

    //get file path
    const dialogOptions = {
        filters: [
            { name: "movie", extensions: ["mp4"] }
        ]
    };

    browseBtn.click(function () {
        dialog.showOpenDialog(dialogOptions, function (fileNames) {
            if (fileNames === undefined) {
                console.log("No file selected");
            } else {
                videoPath.val(fileNames[0]);
            }
        });
    });

    //make ajax call
    streamBtn.click(function () {
        event.preventDefault();
        if (videoPath.val()) {
            axios.post('http://localhost:3000/stream', {
                path: videoPath.val(),
                ip : ip.address()
            }).then(function (response) {
                if (response.status === 200) {
                    browseBtn.prop('class', 'btn d-none');
                    streamBtn.prop('class', 'btn d-none');
                    stopBtn.prop('class', 'btn btn-danger col-2');
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    });

    //stop stream
    stopBtn.click(function () {
        event.preventDefault();
        axios.post('http://localhost:3000/stream', {
            path: undefined
        }).then(function (response) {
            if (response.status === 200) {
                browseBtn.prop('class', 'btn btn btn-dark');
                streamBtn.prop('class', 'btn btn-primary col-2');
                stopBtn.prop('class', 'btn btn-danger d-none');
            }
        }).catch(function (error) {
            console.log(error);
        });
    });


})(jQuery);

