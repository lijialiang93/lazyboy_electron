const { app, BrowserWindow, Menu } = require('electron');
const server = require('./lazyboy/server'); //your express app

app.on("window-all-closed", function () {
  app.quit();
});

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})
if (shouldQuit) {
  app.quit()
}

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 480,
    autoHideMenuBar: false,
    useContentSize: true,
    resizable: false,

  });

  mainWindow.loadFile('index.html');
  mainWindow.focus();
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
});
