function range(min, max, int = false) {
    const r = Math.random() * (max - min) + min;
    return int ? Math.round(r) : r;
}

function absRange(min, max) {
    const r = Math.random() * (max - min) + min;
    return Math.random() > 0.5 ? r : -r;
}

var camera, scene, renderer;
var geometry, material, mesh;

var numCats = 10;
var removedCats = 0;

var cats = [];
var catVectors = [];
var tolerance = 45;

var centiSeconds = 0, seconds = 0, minutes = 0;

var t;

window.onload = () => {
    
    blocker.style.width = window.innerWidth + 'px';
    blocker.style.height = window.innerHeight + 'px';
    blocker.style.left = '0px';
    blocker.style.top = '0px';
    
    init();
    animate();
    
    startButton.textContent = 'Start Game';
    startButton.style.left = window.innerWidth/2 - startButton.offsetWidth/2 + 'px';
    startButton.style.top = window.innerHeight/2 - startButton.offsetHeight/2 + 'px';
    
    timerDiv.textContent = '00:00:00';
    timerDiv.style.left = window.innerWidth/2 - timer.offsetWidth/2 + 'px';
    timerDiv.style.top = '20px';
    
    score.textContent = `0/${numCats}`;
    score.style.left = window.innerWidth/2 - score.offsetWidth/2 + 'px';
    score.style.top = timerDiv.offsetTop + timerDiv.offsetHeight + 10 + 'px';
    
};

startButton.onclick = () => {
    
    document.body.removeChild(blocker);
    
    timer();
    
};

function addTime() {
    
    centiSeconds++;
    
    if (centiSeconds >= 100) {
        seconds++;
        centiSeconds = 0;
        
        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
    } 
    
    timerDiv.textContent = (minutes ? (minutes > 9 ? minutes : '0' + minutes) : '00') + ':' + (seconds ? (seconds > 9 ? seconds : '0' + seconds) : '00') + ':' + (centiSeconds > 9 ? centiSeconds : '0' + centiSeconds);
    
    timer();
}

function timer() {
    t = setTimeout(addTime, 10);
}

function compareVectors(vector) {
    
    return catVectors.every(aVector => {
        
        const dot = vector.dot(aVector);
        
        const angle = 180 * Math.acos(dot / (vector.length() * aVector.length())) / Math.PI;
        
        return angle > Math.round(tolerance);
        
    });
    
}

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    controls = new THREE.DeviceOrientationControls( camera );
    scene = new THREE.Scene();
    
    var sides = [
        {
            url: 'posx.png',
            position: [ -512, 0, 0 ],
            rotation: [ 0, Math.PI / 2, 0 ]
        },
        {
            url: 'negx.png',
            position: [ 512, 0, 0 ],
            rotation: [ 0, -Math.PI / 2, 0 ]
        },
        {
            url: 'posy.png',
            position: [ 0,  512, 0 ],
            rotation: [ Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'negy.png',
            position: [ 0, -512, 0 ],
            rotation: [ - Math.PI / 2, 0, Math.PI ]
        },
        {
            url: 'posz.png',
            position: [ 0, 0,  512 ],
            rotation: [ 0, Math.PI, 0 ]
        },
        {
            url: 'negz.png',
            position: [ 0, 0, -512 ],
            rotation: [ 0, 0, 0 ]
        }
    ];


    var cube = new THREE.Object3D();
    scene.add( cube );
    
    for (let i = 0; i < numCats; i++) {

        // console.log(`cat${i}`);
        
        var cat = document.createElement('img');
        cat.src = 'https://i.imgur.com/QGo5isT.gif';
            
        var catObject = new THREE.CSS3DObject(cat);

        let positionVector;
        
        let x, y, z;
        
        do {
            
            x = absRange(200, 400);
            y = absRange(200, 400);
            z = absRange(200, 400);
            
            positionVector = new THREE.Vector3(x, y, z);
            
            tolerance -= 0.1;
        
        } while (compareVectors(positionVector) === false);
        
        tolerance = 45;
            
        catVectors.push(positionVector);
        
        catObject.scale.set(0.5, 0.5, 0.5);
        catObject.position.set(x, y, z);
            
        catObject.lookAt(0, 0, 0);
            
        scene.add(catObject);
            
        cats.push(catObject);

    }
    
    cats.forEach(cat => {
        
        cat.element.onclick = () => {
               
            scene.remove(cat);
            
            removedCats++;
            
            score.textContent = `${removedCats}/${numCats}`;
            
            if (removedCats === numCats) {
                
                clearTimeout(t);
                
                setTimeout(function() {
                    alert(`You finished the game in ${timerDiv.textContent}`);
                }, 300);
                
            }
             
        };
        
    });
    
    for (let i = 0; i < sides.length; i++) {

        var side = sides[i];

        var element = document.createElement('img');
        element.width = 1026; // 2 pixels extra to close the gap.
        element.src = side.url;

        var object = new THREE.CSS3DObject(element);
        object.position.fromArray(side.position);
        object.rotation.fromArray(side.rotation);
        cube.add(object);
    }
	
	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	
	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );

}