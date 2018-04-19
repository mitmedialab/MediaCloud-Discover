
// STATS SETUP //
// For monitoring frame rate and resources (worth keeping) //
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

// DATA SETUP //
var media_list = [];
var data = dataFromServer;
var fsm = null;

// Set DEBUG Flag from URL (e.g. ...?debug=true)
let DEBUG = false;
var url = new URL(window.location.href);
var debug_flag = url.searchParams.get("debug");

if( debug_flag != null && debug_flag.toLowerCase() == 'true') {
    DEBUG = true;
}

// TODO: Could just pass data through to context instead of re-mapping the same named variables.....

// CONTEXT SETUP //
const MC_CONTEXT = new MCContext( {'scene': 'Picker', 'country_id': data['country_id'], 'entity_id': data['entity_id'], 'entity_type': data['entity_type']} );


// SCENE SETUP
const canvas = document.getElementById("canvas");

var manager = new THREE.LoadingManager();


/////////////////////////////////////////////////////////////////////////
manager.onLoad = function() {
    sceneManager = new SceneManager(canvas);
    fsm = createStateMachine();
    bindEventListeners();
    render();
}

let font = null;
const loader = new THREE.FontLoader(manager);
loader.load('/static/fonts/noto-sans.json', function(response) {
  font = response;
});


/////////////////////////////////////////////////////////////////////////
function createStateMachine() {
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

                // Moving from/to the same state doesn't trigger on<TransitionName>
                // Do it manually for when we are resetting the country selected.
                if( lifecycle.to == 'Picker' && lifecycle.from == 'Picker' ) {
                    let to = sceneManager.findSceneByName( lifecycle.to );
                    to.enter();

                    controls.entityOrbitToggle = true;
                    sceneManager.addChooseEvent();

                    if( !MC_CONTEXT.entityFromURL ) {
                        $( '#metadata' ).hide( "slide", { direction: "left"  }, 1000 );
                        history.pushState( {}, 'Media Cloud Discover', '/' );
                    }
                    $( '#forward' ).show();
                }
            },
            onPicker: function( lifecycle ) {

                $( '#md_body' ).load( '/static/html/picker_content.html' );
                $( '#back' ).hide();
                $( '#scene_title' ).hide();
                $( '#forward' ).show();
                
                sceneManager.addChooseEvent();
                controls.entityOrbitToggle = true;
                
                transitionScenes( lifecycle );

                // Hide The Metadata Panel on init or return to Picker
                if( !MC_CONTEXT.entityFromURL ) {
                    $( '#metadata' ).hide( "slide", { direction: "left"  }, 300 );
                    history.pushState( {}, 'Media Cloud Discover', '/' );
                }
            },
            onWordtime: function( lifecycle ) { 
                
                $( '#md_body' ).load( '/static/html/wordtime_content.html' );
                $( '#back' ).show();
                $( '#scene_title' ).text('Word Over Time').show();
                controls.entityOrbitToggle = false;
                sceneManager.removeChooseEvent();

                transitionScenes( lifecycle );

                history.pushState( {}, 'Media Cloud Discover', `/${MC_CONTEXT.country_id}/${MC_CONTEXT.type()}/${MC_CONTEXT.entityID()}` );

            },
            onSentences: function( lifecycle ) { 

                $( '#md_body' ).load( '/static/html/sentences_content.html' );
                $( '#scene_title' ).text('Stories').show();
                transitionScenes( lifecycle );

            },
            onGlobe: function( lifecycle ) { 
                
                $( '#md_body' ).load( '/static/html/globe_content.html' );
                $( '#scene_title' ).text('Geographic Coverage').show();
                $( '#forward' ).show();
                transitionScenes( lifecycle );
                
            },
            onLanding: function( lifecycle ) { 
                
                $( '#md_body' ).empty();
                $( '#forward' ).hide();
                $( '#scene_title' ).hide();
                transitionScenes( lifecycle );
            }
        }
      });

    return fsm;
}


/////////////////////////////////////////////////////////////////////////
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


/////////////////////////////////////////////////////////////////////////
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
    }

    this.hidePicker = function() {
        let x = sceneManager.findSceneByName("Picker");
        x.toggleVisible();
    }

    this.redraw = function () {
        
    };

    this.home = function() {
    }

    // RANDOM CAMERA TWEEN //
    this.adjustCamera = function() {

        var picker = sceneManager.findSceneByName("Picker");
        var t = new TWEEN.Tween( sceneManager.camera.position ).to( {
                                 x: Math.random() * 200 - 100,
                                 y: Math.random() * 200 - 100,
                                 z: Math.random() * 200 - 100

                    }, controls.cameraSpeed )
                    .easing( TWEEN.Easing.Quartic.InOut)
                        .onUpdate(function(){
                            sceneManager.camera.lookAt( new THREE.Vector3(0, 0, 0) );
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


// Adjustment Control Panel for Development (Worth Keeping)
// var gui = new dat.GUI();
// addControls(gui);
// gui.remember(controls);


/////////////////////////////////////////////////////////////////////////
function addControls(gui) {

    // Build DAT.gui Controls & Parameters

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
    gui.add(controls, 'mediaSource', media_list).name('Media Sources');
    gui.add(controls, 'hideView').name("Mute StarField");
    gui.add(controls, 'hidePicker').name("Mute Picker");

    gui.close();
}


/////////////////////////////////////////////////////////////////////////
function bindEventListeners() {
	window.onresize = resizeCanvas;
	resizeCanvas();
}


/////////////////////////////////////////////////////////////////////////
function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height= '100%';
    
    sceneManager.onWindowResize();
}


/////////////////////////////////////////////////////////////////////////
function render() {
	// stats.begin();
    requestAnimationFrame(render);
    TWEEN.update();
    // controls.update();
    sceneManager.update();
    // stats.end();
}