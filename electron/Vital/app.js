const
    winOS = process.platform == 'win32',

    electron = require('electron'),
    url = require('url'),
    path = require('path'),

    { app, BrowserWindow, Menu, ipcMain } = electron,

    mainMenuTemplate = [{
        label: 'App',
        submenu: [{
            label: 'Quit',
            accelerator: winOS ? 'Alt+F4' : 'Cmd+Q',
            click() {
                app.quit();
            }
        }],
    }, {
        label: 'Developer',
        submenu: [{
            label: 'Inspect',
            accelerator: winOS ? 'Ctrl+Shift+I' : 'Cmd+Shift+I',
            click(item, focusedWindow) {
                focusedWindow.toggleDevTools();
            },
        }, {
            role: 'reload',
        }],
    }];

let mainWindow;

app.on('ready', initApp);

function initApp() {
    //  create new window
    mainWindow = new BrowserWindow({});
    //  load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));

    //  build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
}