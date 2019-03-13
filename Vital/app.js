const
    winOS = process.platform == 'win32',

    electron = require('electron'),
    url = require('url'),
    path = require('path'),

    { google } = require('googleapis'),
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

ipcMain.on('auth', authenticateUser);

function authenticateUser() {
    const
        oAuth2Client = new google.auth.OAuth2(
            //  client_id
            '683436795712-978hrb9j72flkp6edsdu7nnor6p4i8dd.apps.googleusercontent.com',
            //  client_secret
            'kZ3LNUcRyPi6aHKDlpNY0eu1',
            //  redirect_uris
            'urn:ietf:wg:oauth:2.0:oob:auto'
        ),
        authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive']
        }),
        authWindow = new BrowserWindow({
            parent: mainWindow,
            modal: true,
            center: true,
            width: 450,
        });

    authWindow.loadURL(authUrl);

    authWindow.on('page-title-updated', event => {
        const code = event.sender.history.pop().match(/approvalCode=([^\s]+)/);

        if (!code) return;
        
        authWindow.close();

        oAuth2Client.getToken(decodeURIComponent(code[1]), (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            listFiles(oAuth2Client);
        });
    });
}

function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            files.map((file) => {
                mainWindow.webContents.send('file', `${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}
