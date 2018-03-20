
/////////////////////////////////////////////////////////////////////////
// Scene Manager
// 
// Worries about: 
//  - Constructing the initial scene
//  - Detecting mouse clicks in 3D space (Raycasting)
//  - Configuring the camera
//  - Post-Processing
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
    const renderer = buildRender(screenDimensions);
    this.camera = buildCamera(screenDimensions);
    
    // So that we can pin things to the camera's location in the scene
    //  by adding them as child objects:
    this.scene.add(this.camera);
    
    // Make camera accessible from Scene Subjects via global context
    MC_CONTEXT.camera = this.camera;
    this.sceneSubjects = createSceneSubjects(this.scene);
    buildPostProcessing();

    // OBJECT SELECTION / RAYCASTING //
    var raycaster, mouse = { x : 0, y : 0 };
    raycaster = new THREE.Raycaster();
    renderer.domElement.camera = this.camera;
    renderer.domElement.scene = this.scene;
    renderer.domElement.addEventListener( 'click', raycast, false );


    /////////////////////////////////////////////////////////////////////////
    function raycast(e) {

        // We'll need to do a conditional for what scene we're on here to determine how these clicks work.

        //1. sets the mouse position with a coordinate system where the center
        //   of the screen is the origin
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera( mouse, this.camera );    

        //3. compute intersections
        var intersects = raycaster.intersectObjects( this.scene.children, true );

        if(intersects.length > 0 && intersects[0].object.userData.name !== undefined) {
            var name = intersects[0].object.userData.name;
            var url = intersects[0].object.userData.url;
            console.log(name);
            $( "#footer > #footer_metadata" ).html( `<h2>${name}</h2><br/><a href="${url}">${url}</a>` );

            MC_CONTEXT.currentEntity = name;
            MC_CONTEXT.tag_sets_id = intersects[0].object.userData.tag_sets_id;
            MC_CONTEXT.userData = intersects[0].object.userData;
            

        } else {
            $( "#footer > #footer_metadata" ).html('<i>Click on an entity to explore...</i>');
        }

        // TODO: Trigger load/display of context menu


        // If we need to deal with a number of objects in the click path in the future:

        // for ( var i = 0; i < intersects.length; i++ ) {
            // console.log( intersects[ i ] ); 
            /*
                An intersection has the following properties :
                    - object : intersected object (THREE.Mesh)
                    - distance : distance from camera to intersection (number)
                    - face : intersected face (THREE.Face3)
                    - faceIndex : intersected face index (number)
                    - point : intersection point (THREE.Vector3)
                    - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        // }

    }


    ////////////////////////////////////////////////////////////////////
    function createSceneSubjects(scene) {
        const sceneSubjects = [
            new GeneralLights(scene),
            new TweenTest(scene),
            new SceneSubject(scene),
            new FontTest(scene),
            // new SVGTest(scene),
            
            new Picker(scene), 
            new Sentences(scene),
            new Word(scene),
            new WordOverTime(scene),
            new People(scene),
            new Globe(scene),
            new Landing(scene)
        ];

        return sceneSubjects;
    }

    ////////////////////////////////////////////////////////////////////
    // Output All Objects In Scene
    //
    this.logScene = function() {

        this.scene.traverse( function ( object ) { 
            console.log(object);
        } );
    }

    /////////////////////////////////////////////////////////////////////////
    // Look Up Scene Subject By Name
    //
    this.findSceneByName = function(name) {

        for(var i = 0; i < this.sceneSubjects.length; i++) {
            if(this.sceneSubjects[i].constructor.name == name) {
                return this.sceneSubjects[i];
            }
        }
        
        return "Not Found";
    }

    /////////////////////////////////////////////////////////////////////////
    // Turn Off Indicated Set Of Scene Subjects
    //
    this.muteSubjects = function(sceneStates) {

        // 1. Go through a boolean scene state array (or eventually maybe pass a set of things to mute or show or solo)
        // 2. Build an array of scenes to show (based on what list? maybe just pass the list of objects?) 
        // 3. Wipe the scene of all objects I guess?
        // 4. this.sceneSubjects = createSceneSubjects(scene);

        // OR

        // Make every scene have a group object that all scene objects are a child of?

        // OR

        // Traverse hierarchy and set visible to false for anything 
        // THREE.SceneUtils.traverseHierarchy( object, function ( object ) { object.visible = false; } );
        
        // all children:
        // myObject3D.traverse( function ( object ) { object.visible = false; } );

        // there is also:
        // - traverseVisible( callback );
        // - traverseAncestors( callback );
    }

    // const controls = new THREE.OrbitControls( this.camera );
    // controls.update();


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
        camera.position.setZ(100);
        // camera.position.setY(75);

        return camera;
    }


    /////////////////////////////////////////////////////////////////////////
    function buildPostProcessing() {

        // POSTPROCESSING

        renderer.autoClear = false;

        var renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };
        renderTarget = new THREE.WebGLRenderTarget( canvas.width, canvas.height, renderTargetParameters );

        var renderModel = new THREE.RenderPass( this.scene, this.camera );
        var effectBloom = new THREE.BloomPass( 0.75 );
        var effectVignette = new THREE.ShaderPass( THREE.VignetteShader );
        effectVignette.renderToScreen = true;

        composer = new THREE.EffectComposer( renderer, renderTarget );
        composer.addPass( renderModel );
        // composer.addPass( effectBloom );
        // composer.addPass( effectVignette );
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function() {
        // controls.update();

        // UPDATE EACH SCENE SUBJECT
        for(let i=0; i < this.sceneSubjects.length; i++) {
        	// TODO: Figure out how to mute scenes
            // if(this.sceneSubjects[i].show)
            this.sceneSubjects[i].update(clock.getElapsedTime());
        }

        // Render and/or Post-Processing

        // renderer.autoClear = false;
        // renderer.shadowMap.enabled = true;
        // camera.lookAt( cameraTarget );
        // renderer.setRenderTarget( null );
        // renderer.clear();
        
        renderer.render(this.scene, this.camera);
        // composer.render();

        // renderer.shadowMap.enabled = false;
    }


    /////////////////////////////////////////////////////////////////////////
    this.onWindowResize = function() {
        const { width, height } = canvas;

        screenDimensions.width = width;
        screenDimensions.height = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    }
}