const
    electron = require('electron'),
    { ipcRenderer } = electron,
    
    info = document.querySelector('#info');

window.addEventListener('load', initMainWindow);

function initMainWindow() {
    const btnAuth = document.querySelector('#btnAuth');

    btnAuth.addEventListener('click', () => {
        event.preventDefault();
        ipcRenderer.send('auth');
    });
}

ipcRenderer.on('file', (event, message) => {
    const item = document.createElement('li');

    item.textContent = message;
    info.appendChild(item);
});