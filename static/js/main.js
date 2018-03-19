
// STATS SETUP //
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

// DATA SETUP //
var media_list = [];
var data_list = dataFromServer;

// CONTEXT SETUP //
const MC_CONTEXT = new MCContext({"scene": "Picker"});
console.log(`Current Scene: ${MC_CONTEXT.currentScene}`);

// SCENE SETUP
const canvas = document.getElementById("canvas");
var sceneManager = new SceneManager(canvas);
var picker = sceneManager.findSceneByName("Picker");

// CONTROLS SETUP //
var controls = new function () {
    
    this.radius = 2000;
    this.randomSpin = false;
    this.entityOrbitToggle = true;
    this.entitySpinToggle = true;
    this.starfieldOrbitToggle = true;
    this.displayLabels = function() {
        let x = sceneManager.findSceneByName("Picker");
        for(i = 0; i < x.entities.children.length; i++) {
            let label = x.entities.children[i].children[1];
            label.visible = !label.visible;
        }
    };
    this.cameraSpeed = 3100;
    this.mediaSource = 'default';
    this.hideView = function() {
        let x = sceneManager.findSceneByName("TweenTest");
        x.toggleVisible();
        // TODO: Ok, now that we know we can mute scenes, we probably should make our own SceneSubject class we
        //       inheret functions from in the prototype that does all this necessary stuff so we'll just get it for free.
    }

    this.hidePicker = function() {
        let x = sceneManager.findSceneByName("Picker");
        x.toggleVisible();
    }

    // this.color0 = "#ffae23"; // CSS string
    // this.color1 = [ 0, 128, 255 ]; // RGB array
    // this.color2 = [ 0, 128, 255, 0.3 ]; // RGB with alpha
    this.color3 = { h: 350, s: 0.9, v: 0.3 }; // Hue, saturation, value

    this.redraw = function () {
        
    };

    this.home = function() {
        // View.home();
    }

    // RANDOM CAMERA TWEEN //
    this.adjustCamera = function() {

        var t = new TWEEN.Tween( sceneManager.camera.position ).to( {
                                 x: Math.random() * 200 - 100,
                                 y: Math.random() * 200 - 100,
                                 z: Math.random() * 200 - 100
                                 // position: picker.entities.children[0].position

                    }, controls.cameraSpeed )
                    .easing( TWEEN.Easing.Quartic.InOut)
                        .onUpdate(function(){
                            sceneManager.camera.lookAt( new THREE.Vector3(0, 0, 0) );
                            // sceneManager.camera.lookAt(picker.entities.children[0].position);
                        })
                        .onComplete(function(){
                            // no-op
                        });
        t.start();
    };
};

var gui = new dat.GUI();
addControls(gui);
gui.remember(controls);

////////////////////////////////////////////////////////////////////////////////////////
bindEventListeners();
render();
////////////////////////////////////////////////////////////////////////////////////////

function loadStartupData() {
    //
    // Parse names out of the Top Media query
    //
    
    for(var i = 0; i < data_list.length; i++) {
        media_list[i] = data_list[i]["name"];
    }
}

function addControls(gui) {
    //
    // Build DAT.gui Controls & Parameters
    //

    // Individual Environment Parameter Controls
	gui.add(controls, 'radius', 0, 5000).onChange(controls.redraw);
	gui.add(controls, 'randomSpin').name('Random Star Spin');
	
    var f1 = gui.addFolder('PICKER');
    f1.add(controls, 'entityOrbitToggle').name('Entity Orbit');
    f1.add(controls, 'entitySpinToggle').name('Entity Spin');
    f1.add(controls, 'starfieldOrbitToggle').name('Starfield Orbit');
    f1.add(controls, 'displayLabels').name('Show Labels');
	
    // Camera Tween Parameters
    var f2 = gui.addFolder('CAMERA MOTION');
    f2.add(controls, 'cameraSpeed').name('Camera Speed');
	f2.add(controls, 'adjustCamera').name('Tween Camera Random');
    f2.open();
    
    // Data Dropdown
    // console.log(media_list);
    // var f2 = gui.addFolder('Media');
    gui.add(controls, 'mediaSource', media_list).name('Media Sources');
    gui.add(controls, 'hideView').name("Mute TweenTest");
    gui.add(controls, 'hidePicker').name("Mute Picker");
}

function bindEventListeners() {
	window.onresize = resizeCanvas;
	resizeCanvas();
}

function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height= '100%';
	
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
    
    sceneManager.onWindowResize();
}

function render() {
	// stats.begin();
    
    requestAnimationFrame(render);
    TWEEN.update();
    // controls.update();
    sceneManager.update();

    // stats.end();
}