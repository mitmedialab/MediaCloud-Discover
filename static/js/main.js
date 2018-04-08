
// STATS SETUP //
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

// DATA SETUP //
var media_list = [];
var data_list = dataFromServer;


// Set DEBUG Flag from URL (e.g. ...?debug=true)
let DEBUG = false;
var url = new URL(window.location.href);
var debug_flag = url.searchParams.get("debug");

if( debug_flag != null && debug_flag.toLowerCase() == 'true') {
    DEBUG = true;
}

// CONTEXT SETUP //
const MC_CONTEXT = new MCContext({"scene": "Picker"});

// SCENE SETUP
const canvas = document.getElementById("canvas");
var sceneManager = new SceneManager(canvas);

const fsm = new StateMachine({
    
    init: 'Picker',
    
    transitions: [
      
        { name: 'toPicker',         from: '*',              to: 'Picker'        },
        { name: 'toWordOverTime',   from: '*',              to: 'WordOverTime'  },
        { name: 'toSentences',      from: '*',              to: 'Sentences'     },
        { name: 'toGlobe',          from: '*',              to: 'Globe'         },
        { name: 'toLanding',        from: '*',              to: 'Landing'       },

      // Forward
        { name: 'forward',          from: 'Picker',         to: 'WordTime'      },
        { name: 'forward',          from: 'WordTime',       to: 'Sentences'     },
        { name: 'forward',          from: 'Sentences',      to: 'Globe'         },
        { name: 'forward',          from: 'Globe',          to: 'Landing'       },

    // Back
        { name: 'back',             from: 'Landing',        to: 'Globe'         },
        { name: 'back',             from: 'Globe',          to: 'Sentences'     },
        { name: 'back',             from: 'Sentences',      to: 'WordTime'      },
        { name: 'back',             from: 'WordTime',       to: 'Picker'        }

    ],

    methods: {
        onTransition: function( lifecycle ) {
            if( DEBUG ) {
                console.log( `Scene Transition:\t\t${lifecycle.from} > ${lifecycle.to}` );
            }
        },
        onPicker: function( lifecycle ) {
            transitionScenes( lifecycle );

            // Hide The Metadata Panel on init or return to Picker
            $( '#metadata' ).hide( "slide", { direction: "left"  }, 1000 );
        },
        onWordtime: function( lifecycle ) { 
            transitionScenes( lifecycle );
        },
        onSentences: function( lifecycle ) { 
            transitionScenes( lifecycle );
        },
        onGlobe: function( lifecycle ) { 
            transitionScenes( lifecycle );
        },
        onLanding: function( lifecycle ) { 
            transitionScenes( lifecycle );
        }
    }
  });

function transitionScenes( lifecycle ) {

    // Grab Scenes
    let from = sceneManager.findSceneByName( lifecycle.from );
    let to = sceneManager.findSceneByName( lifecycle.to );
    
    // Transition Between Them
    if( from !== null ) {
        from.exit();
    }

    if( to !== null ) {
        to.enter();
    }
}


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
        let x = sceneManager.findSceneByName("StarField");
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

        var picker = sceneManager.findSceneByName("Picker");
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

    this.fadeAll = function() {

        let picker = sceneManager.findSceneByName( 'Picker' );
        picker.fadeAllEntities();
    }
};


var gui = new dat.GUI();
addControls(gui);
gui.remember(controls);
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
    f1.add(controls, 'entityOrbitToggle').name( 'Entity Orbit' );
    f1.add(controls, 'entitySpinToggle').name( 'Entity Spin' );
    f1.add(controls, 'starfieldOrbitToggle').name( 'Starfield Orbit' );
    f1.add(controls, 'displayLabels').name( 'Show Labels' );
    f1.add(controls, 'fadeAll').name( 'Fade All Entities' );
	
    // Camera Tween Parameters
    var f2 = gui.addFolder('CAMERA MOTION');
    f2.add(controls, 'cameraSpeed').name('Camera Speed');
	f2.add(controls, 'adjustCamera').name('Tween Camera Random');
    f2.open();
    
    // Data Dropdown
    // console.log(media_list);
    // var f2 = gui.addFolder('Media');
    gui.add(controls, 'mediaSource', media_list).name('Media Sources');
    gui.add(controls, 'hideView').name("Mute StarField");
    gui.add(controls, 'hidePicker').name("Mute Picker");

    gui.close();
}

function bindEventListeners() {
	window.onresize = resizeCanvas;
	resizeCanvas();
}

function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height= '100%';
	
	// canvas.width  = canvas.offsetWidth;
	// canvas.height = canvas.offsetHeight;
    
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