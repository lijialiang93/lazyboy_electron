(function ($) {
    const { dialog } = require('electron').remote;
    const port = 9527;
    let browseBtn = $('#browse');
    let streamBtn = $('#stream');
    let stopBtn = $('#stop');
    let pathList = $('#pathList');
    let files = [];
    new ClipboardJS('#clipboard');

    //get ip address
    let ip = require('ip');
    let url = 'http://' + ip.address() + `:${port}`;

    $('#url').prop('href', url);
    $('#url').text(url);

    //set clipboard content
    $('#clipboard').prop('data-clipboard-text', url);

    //get file path
    const dialogOptions = {
        filters: [
            { name: "movie", extensions: ["mp4"] },
        ],
        properties: ['openFile', 'multiSelections']
    };

    browseBtn.click(function () {
        dialog.showOpenDialog(dialogOptions, function (fileNames) {
            try {
                if (fileNames === undefined) {
                    console.log("No file selected");
                } else {
                    files = fileNames;
                    pathList.find('li').remove();
                    for (let i = 0; i < files.length; i++) {
                        let color = i % 2 == 0 ? 'light' : 'dark';
                        pathList.append($(`<li class='list-group-item-${color}'>`).text(files[i]));
                    }
                }
            } catch (error) {
                console.error(error);
            }

        });
    });

    //make ajax call
    streamBtn.click(function () {
        event.preventDefault();
        if (files.length!==0) {
            console.log(files);
            axios.post(`http://localhost:${port}/stream`, {
                paths: files,
                ip: ip.address()
            }).then(function (response) {
                if (response.status === 200) {
                    browseBtn.prop('disabled',true);
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
        axios.post(`http://localhost:${port}/stream`, {
            path: undefined
        }).then(function (response) {
            if (response.status === 200) {
                browseBtn.prop('disabled',false);
                streamBtn.prop('class', 'btn btn-primary col-2');
                stopBtn.prop('class', 'btn btn-danger d-none');
            }
        }).catch(function (error) {
            console.log(error);
        });
    });
})(jQuery);

