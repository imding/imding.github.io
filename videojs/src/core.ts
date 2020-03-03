window.onload = init;

function init() {
    const root = document.querySelector('#root');
    const iframe = document.createElement('iframe');

    iframe.srcdoc = `<!DOCTYPE html>
    <html>
    
        <head>
            <script src='https://aframe.io/releases/1.0.0/aframe.min.js'></script>
        </head>
    
        <body>
    
            <a-scene background='color: khaki'>
                <a-assets>
                    <img id='ball-10' src='https://raw.githubusercontent.com/educationbsd/educationbsd/master/img/pool-ball-10.jpg' crossorigin='anonymous'>
                    <img id='ball-11' src='https://raw.githubusercontent.com/educationbsd/educationbsd/master/img/pool-ball-11.jpg' crossorigin='anonymous'>
                    <img id='ball-13' src='https://raw.githubusercontent.com/educationbsd/educationbsd/master/img/pool-ball-13.jpg' crossorigin='anonymous'>
                </a-assets>
    
                <a-sphere color='tomato' src='#ball-10' roughness='0.3' position='-1.5 1.5 -2' radius='0.5'></a-sphere>
                <a-sphere color='royalblue' metalness='0.5' position='0 1.5 -2' radius='0.5'></a-sphere>
                <a-sphere color='darkkhaki' roughness='0.3' metalness='0.8' position='1.5 1.5 -2' radius='0.5'></a-sphere>
            </a-scene>
    
        </body>
    
    </html>`;

    root.append(iframe);
    
}