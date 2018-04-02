
/////////////////////////////////////////////////////////////////////////
// Picker Scene
/////////////////////////////////////////////////////////////////////////

// TODO: 
//
//  Add Country Outlines: https://github.com/djaiss/mapsicon
//  Integrated Text in WebGL: https://webglfundamentals.org/webgl/lessons/webgl-text-html.html


function Picker(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Picker";
    scene.add(subscene);

    this.entities = new THREE.Group();


    // CLICK TRIGGERS //

    var self = this;

    // Trigger Scene Shift From Picker to Next Scene //
    $( "#explore_button" ).click(function( e ){
        e.preventDefault();

        self.fadeAllEntities();
        let sentenceScene = sceneManager.findSceneByName( "Sentences" );

        // If user hasn't selected an entity yet, don't switch scenes //
        if( MC_CONTEXT.userData === undefined ) {
            
            alert('Please choose an entity...');
            return;

        } else {

            if(entity.userData.type == 'word') {
                sentenceScene.loadSentences( MC_CONTEXT.country_id, MC_CONTEXT.userData.tags_id );
            } else {
                sentenceScene.loadSentences( MC_CONTEXT.country_id, MC_CONTEXT.userData.label );
            }

        }

        // if entity is a term, call with the text of the term
        // else, if the entity is an entity_id, call with the entity_id 
        // as the second 
    });

    // Load Entities for New Selected Country //
    $("#countries").change(function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        var item=$(this);
        MC_CONTEXT.country_id = item.val();
        self.loadEntities(MC_CONTEXT.country_id);
    });

    drawChart();

    /////////////////////////////////////////////////////////////////////////
    this.toggleVisible = function() {
        subscene.visible = !subscene.visible;
        // TODO: Hide Chart & Context Contents Here As Well
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

        if(controls.entityOrbitToggle) {
            this.entities.rotation.y += 0.001;
        }
        
        if(controls.entitySpinToggle) {
            for(i = 0; i < this.entities.children.length; i++) {
                
                let current_planet = this.entities.children[i].children[0];
                let current_label = this.entities.children[i].children[1];

                current_planet.rotation.x += 0.01;
                current_planet.rotation.y += 0.01;

                // Make text face camera:
                // this.entities.children[i].children[1].quaternion.copy(sceneManager.camera.quaternion);

                // TODO: Figure out why the last label doesn't seem to exist every time. 
                //       Maybe something on initialization.
                // current_label.lookAt( sceneManager.camera.position );
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	
        // this.entities = new THREE.Group();
        // this.entities.name = 'entities';
    	this.loadEntities(MC_CONTEXT.country_id);
    }


    /////////////////////////////////////////////////////////////////////////
    this.fadeEntity = function( entity ) {
        
        var t = new TWEEN.Tween( entity.material ).to( { opacity: 0.0 }, 2000 )
            .easing( TWEEN.Easing.Linear.None)
            .onComplete( function() { 
                scene.remove(entity);
                let selectedObject = scene.getObjectByName(entity.name);
                scene.remove( selectedObject );
            });
        t.start();
    }


    /////////////////////////////////////////////////////////////////////////
    this.fadeAllEntities = function() {

        if( subscene.children[0] !== undefined ) {
            var entities = subscene.children[0].children;
            for( key in entities ) {
                // console.log( entities[key] );
                this.fadeEntity( entities[key].children[0] );
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////
	// Instantiate Entity Objects and Add to Entities Array
	//
	this.loadEntities = function( country_id ) {

        console.log(`Loading Entities from ${country_id}.`)

        var built_entities = new THREE.Group();
        built_entities.name = 'entities';

        var all_entities = subscene.children[0];

        // If scene already has entities loaded 
        //  (i.e. after the initial load) 
        //  fade all and remove
        
/*
        if(all_entities !== undefined) {
            
            for (var i = 0; i < all_entities.children.length; i++) {
                
                // Each entity is a group containing geometry and a label
                // This will fade the geometry.
                // TODO: Either visible: false or fade labels as well
                let e = all_entities.children[i].children[0];

                var t = new TWEEN.Tween( e.material ).to( { opacity: 0 }, 1000 )
                            .easing( TWEEN.Easing.Linear.None)
                            .onComplete(function(){ 
                                all_entities.remove(all_entities.children[i]);
                            });
                t.start();


                // console.log(all_entities.children[i]);
                // all_entities.remove(all_entities.children[i]);
            }
        }
*/

        $.getJSON( `/country_entities/${country_id}`, function( country_data ) {

            // Create Entities For Each Collection Data Element //
    	    for(var i = 0; i < country_data.length; i++) {

                // This Group Holds The Entity Geometry and Label //
                var entityGroup = new THREE.Group();

                // Create Entity Geometry //
                var geometry = new THREE.IcosahedronBufferGeometry(5, 0);
                var material = new THREE.MeshPhongMaterial( {
                         color: getRandomColor(),
                         emissive: 0x072534,
                         side: THREE.DoubleSide,
                         flatShading: true
                } );
                var entity = new THREE.Mesh(geometry, material);
                
                //////////////////////////////////////////////////
                //           Data to Entity Mappings            //
                //////////////////////////////////////////////////

                // Add all entity metadata to Mesh userData
                entity.userData.append( country_data[i] );

                entity.userData.name = country_data[i].label;
                entity.name = country_data[i].label;

                // entity.userData.type = country_data[i].type;
                // entity.userData.tags_id = country_data[i].tags_id;
                // entity.userData.tag = country_data[i].tag;
                // entity.userData.count = country_data[i].count;
                // entity.userData.tag_sets_id = country_data[i].tag_sets_id;

                // FIXME: Only for Media Sources? 
                //        Or do we want to URL to Dashboard pages?
                // entity.userData.url = data[i].url;

                // Randomize Initial Location //
                entity.position.x = THREE.Math.randFloatSpread( 200 );
                entity.position.y = THREE.Math.randFloatSpread( 200 );
                entity.position.z = THREE.Math.randFloatSpread( 200 );

                // Prepare for fade-out when removing; opacity stays at 1
                entity.material.transparent = true;

                // Build Entity Group //
                entityGroup.add(entity);
                
                // FIXME: This takes an enormous amount of time, 
                //          even loading the font separately.
                //          Can we do this asynchronously?
                //          Maybe using Promises:
                //          https://stackoverflow.com/questions/41753818/three-js-add-textures-with-promises
                addText( country_data[i].label, entity.position, entityGroup );
                
                built_entities.add( entityGroup );
    	    }
        });

        // FIXME: There is a huge delay here and no transition fade.
        //          Can we use Promises to wait until the fade of 
        //          all the entities is done, and then add the new?
        //          This has an example of animation in Promises:
        //          https://marmelab.com/blog/2017/06/15/animate-you-world-with-threejs-and-tweenjs.html
        // this.fadeAllEntities();

        subscene.remove(all_entities);
        this.entities = built_entities;
        subscene.add(built_entities);

        $( '#sentence-container ul li' ).each(function (i) {
            let $item = $(this);
            $item.delay(75*i).hide( "slide", { direction: "right"  }, 1000 );
        });
	}

    function addText( t, pos, group ) {

        var textGeo = new THREE.TextGeometry( t, {
            font: font,
            size: 2,
            height: 0,
            curveSegments: 12,
        });
        textGeo.computeBoundingBox();
        // textGeo.computeVertexNormals();
        // textGeo.center();

        txtMesh = new THREE.Mesh( textGeo, textMaterial );
        txtMesh.position.x = pos.x + 10;
        txtMesh.position.y = pos.y;
        txtMesh.position.z = pos.z;
        txtMesh.visible = false;
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;

        group.add( txtMesh );
    }


    /////////////////////////////////////////////////////////////////////////
    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }


    /////////////////////////////////////////////////////////////////////////
    function drawChart() {

        // 1. Specify values
        // 2. Specify x-interval
        // 3. Specify zero origin on screen
        // 4. Iterate through values
        //      4a. Add vertex based on x-origin, x-interval, and y-origin
        // 

        // var origin = new THREE.Vector3( -100, 0, 0 )

        // var material = new THREE.LineBasicMaterial( {
        //     color: 0xffffff,
        //     linewidth: 1,
        //     linecap: 'round', //ignored by WebGLRenderer
        //     linejoin:  'round' //ignored by WebGLRenderer
        // } );

        // var shape = new THREE.Shape();
        // heartShape.moveTo(...);


        var ctx = document.getElementById("chart");
        ctx.height = 125;

        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["1/15", "1/30", "2/15", "2/30", "3/15", "3/30"],
                datasets: [{
                    label: 'Mentions in the Last Two Weeks',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 255, 255,1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            display: false
                        }
                    }]
                },
                maintainAspectRatio: false,
                axes: {
                    display: false
                },
                gridLines: {
                    display: false
                },
                legend: {
                    display: true
                },
                responsive: true,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        });
    }


    // TODO: Holy Shit this is inefficient. Solution here:
    //  https://stackoverflow.com/questions/42829635/how-to-load-a-font-only-once-ts-three-js?rq=1



    this.init();
}


    /**

    OK, what do we need here. 

    0. A data pull from Media Cloud that loads (from a cache possibly) the various data we want to use as starting points
    1. An array / particle system to track all of the Media Sources & Entities 
    2. Perlin noise appropriate to having them float a bit randomly (if necessary) maybe just orbit like the stars
    3. An update method that does the appropriate animation/rotation
    4. Interaction handling methods for mouse-overs, click events
        mesh.raycast ( raycaster, intersects );
    5. Maybe an object external to this Scene that holds Entity data and interactions, and the ContextMenu
    6. Any additional menu and interaction elements 

    **/

    // this.loadEntities = function() {
        // 1. Get Data
        // 2. Iterate
        //      a. Create an Entity object
        //      b. Init with data
        //      c. Randomly locate in 3D space
        //      d. Set visible properties to indicate type, etc.
        //      e. Add to scene
    // }
    
    // this.update = function(time) {
        // 1. Iterate through Entities array
        // 2. Update locations based on speed or simple rotation or location calculated in Entities 
    // }