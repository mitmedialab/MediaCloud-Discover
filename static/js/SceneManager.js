
/////////////////////////////////////////////////////////////////////////
// Scene Manager
// 
// Worries about: 
//  - Constructing the initial scene
//  - Detecting mouse clicks in 3D space (Raycasting)
//  - Configuring the camera
//  - Muting & Soloing Scenes
//  - Main Rendering Loop
//
/////////////////////////////////////////////////////////////////////////

function SceneManager(canvas) {
    
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }

    let clock = new THREE.Clock();
    
    this.scene = buildScene();
    this.renderer = buildRender(screenDimensions);
    this.camera = buildCamera(screenDimensions);
    
    // So that we can pin things to the camera's location in the scene
    //  by adding them as child objects:
    this.scene.add(this.camera);
    
    // Make camera accessible from Scene Subjects via global context
    MC_CONTEXT.camera = this.camera;
    this.sceneSubjects = createSceneSubjects(this.scene);

    // OBJECT SELECTION / RAYCASTING //
    var raycaster, mouse = { x : 0, y : 0 };
    raycaster = new THREE.Raycaster();
    this.renderer.domElement.camera = this.camera;
    this.renderer.domElement.scene = this.scene;
    this.renderer.domElement.addEventListener( 'click', raycast, false );

    $( '#chart' ).hide();


    /////////////////////////////////////////////////////////////////////////
    $( '#logo' ).click( function( e ) {
        fsm.toPicker();
    });


    /////////////////////////////////////////////////////////////////////////
    // Load Entities for New Selected Country //
    $("#countries").change(function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        var item=$(this);
        MC_CONTEXT.country_id = item.val();
        fsm.toPicker();
    });


    /////////////////////////////////////////////////////////////////////////
    $( '#about' ).click( function( e ) {

        console.log( 'About clicked...' );
        $( '#metadata' ).hide( "slide", { direction: "left"  }, 500 );
        $( '#about_pane' ).load( '/static/html/about_content.html' ).show();
    });


    /////////////////////////////////////////////////////////////////////////
    $( '#md_close' ).click( function( e ) {

        e.preventDefault();
        e.stopPropagation();
        $( '#metadata' ).hide( "slide", { direction: "left"  }, 500 );
    });

    
    /////////////////////////////////////////////////////////////////////////
    // Because of the dynamic content load, we need to bind an event to
    // the document, such that it doesn't get wiped out on $.load(...)
    /////////////////////////////////////////////////////////////////////////
    $(document).on('click', "#about_close", function () {
        
        console.log( 'about close clicked' );
        $('#about_pane').hide();
        
        return false;
    });


    /////////////////////////////////////////////////////////////////////////
    $( document ).on( "keypress", function ( e ) {
        
        // 'n' = Random Tween of Camera
        if( e.which == 110 ) {
            controls.adjustCamera();
        }

    });

    
    /////////////////////////////////////////////////////////////////////////
    $( '#forward' ).click( function( e ) {
        e.stopPropagation();
        e.preventDefault();
        fsm.forward();
    });


    /////////////////////////////////////////////////////////////////////////
    $( '#back' ).click( function( e ) {
        e.stopPropagation();
        e.preventDefault();
        fsm.back();
    });


    /////////////////////////////////////////////////////////////////////////
    this.addChooseEvent = function() {
        this.renderer.domElement.addEventListener( 'click', raycast, false );
    }


    /////////////////////////////////////////////////////////////////////////
    this.removeChooseEvent = function() {
        this.renderer.domElement.removeEventListener( 'click', raycast, false )
    }


    /////////////////////////////////////////////////////////////////////////
    function raycast(e) {

        //1. sets the mouse position with a coordinate system where the center
        //   of the screen is the origin
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera( mouse, this.camera );    

        //3. compute intersections
        var intersects = raycaster.intersectObjects( this.scene.children, true );

        if( DEBUG ) {
            console.log( 'Intersecting Objects On Click:')
            console.log(intersects);
        }

        if( intersects.length > 0 && intersects[0].object.name !== undefined && intersects[0].object.name != "" ) {

            var name = intersects[0].object.name;
            var type = intersects[0].object.userData.type;

            MC_CONTEXT.currentEntity = name;
            MC_CONTEXT.userData = intersects[0].object.userData;

            if( DEBUG ) {
                console.log('Selected Entity:');
                console.log(intersects[0].object.userData);
            }
            
            $( "#md_header" ).html( `<h2 class="entity">${name}</h2><br><div class="type" style="background-color: ${MC_CONTEXT.entityColorHex()}">${type}</div><br><hr>` );
            $( '#metadata' ).show( "slide", { direction: "left"  }, 500 );
        
        } else {
            
            $( '#metadata' ).hide( "slide", { direction: "left"  }, 500 );
        }
    }


    ////////////////////////////////////////////////////////////////////
    function createSceneSubjects(scene) {
        const sceneSubjects = [
            new Thinking(scene),
            new GeneralLights(scene),
            new StarField(scene),
            new Picker(scene), 
            new Sentences(scene),
            new WordTime(scene),
            new Globe(scene),
            new Landing(scene)
        ];

        // Initialize all Scene Objects
        for (var i = 0; i < sceneSubjects.length; i++) {
            if(DEBUG) {
                console.log( `Initializing ${sceneSubjects[i].getName()}...`);
            }
            sceneSubjects[i].init();
        }

        return sceneSubjects;
    }
    

    ////////////////////////////////////////////////////////////////////
    // Output All Objects In Scene to Console
    //
    this.logScene = function() {

        this.scene.traverse( function ( object ) { 
            console.log(object);
        } );
    }

    /////////////////////////////////////////////////////////////////////////
    this.findSceneByName = function(name) {

        for(var i = 0; i < this.sceneSubjects.length; i++) {
            if(this.sceneSubjects[i].constructor.name == name) {
                return this.sceneSubjects[i];
            }
        }
        
        return null;
    }


    /////////////////////////////////////////////////////////////////////////
    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#000030");

        return scene;
    }


    /////////////////////////////////////////////////////////////////////////
    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); 
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 1); 

        renderer.gammaInput = true;
        renderer.gammaOutput = true; 

        return renderer;
    }


    /////////////////////////////////////////////////////////////////////////
    function buildCamera({ width, height }) {
        const aspectRatio = width / height;
        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 1000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        // camera.position.setZ(100);

        return camera;
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function() {

        // Call update() on each scene object
        for(let i=0; i < this.sceneSubjects.length; i++) {

            this.sceneSubjects[i].update(clock.getElapsedTime());
        }
        
        this.renderer.render(this.scene, this.camera);
    }


    /////////////////////////////////////////////////////////////////////////
    this.onWindowResize = function() {
        
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;

        const { width, height } = canvas;

        screenDimensions.width = width;
        screenDimensions.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
}
