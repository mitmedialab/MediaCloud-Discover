
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
    var loader = new THREE.FontLoader();


    // CLICK TRIGGERS //

    $("#explore_button").click(function(e){
        e.preventDefault();
        alert(`Here, we will explore ${MC_CONTEXT.currentEntity}`);
    });

    $("#countries").change(function(e) {
        e.stopPropagation();
        e.preventDefault();
        alert("Country Chosen");
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
                // TODO: Eventually set each entity to have its own
                //       rotation speed, stored in userData, so it
                //       is consistent but different for each.

                // make text face camera here
                // console.log(this.entities.children[i].children[1]);
                // this.entities.children[i].children[1].quaternion.copy(sceneManager.camera.quaternion);
                // console.log(this.entities.children[i].children[0].userData);

                current_label.lookAt( sceneManager.camera.position );
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	
        this.entities = new THREE.Group();
    	this.loadEntities(data_list['media']);
    }


    /////////////////////////////////////////////////////////////////////////
	// Instantiate Entity Objects and Add to Entities Array
	//
	this.loadEntities = function(data) {

        var built_entities = new THREE.Group();

        $.getJSON( "/country_entities/9319462", function( country_data ) {

            console.log(country_data);

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
                entity.userData.name = country_data[i].label;
                entity.userData.type = country_data[i].type;
                entity.userData.tags_id = country_data[i].tags_id;
                entity.userData.tag = country_data[i].tag;
                entity.userData.count = country_data[i].count;
                entity.userData.tag_sets_id = country_data[i].tag_sets_id;

                console.log(`Adding ${country_data[i].label}...`);
                // entity.userData.id =             
                
                // FIXME: Only for Media Sources? 
                //        Or do we want to URL to Dashboard pages?
                // entity.userData.url = data[i].url;

                // Randomize Initial Location //
                entity.position.x = THREE.Math.randFloatSpread( 200 );
                entity.position.y = THREE.Math.randFloatSpread( 200 );
                entity.position.z = THREE.Math.randFloatSpread( 200 );

                // Build Entity Group //
                entityGroup.add(entity);
                addText(country_data[i].name, entity.position, entityGroup);
                built_entities.add(entityGroup);
                
                // console.log(`Added ${entity.userData.name}`);
    	    }
        });

        // Add All Entities To Picker //
        this.entities = built_entities;
	    subscene.add(built_entities);
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
                        left: 200,
                        right: 200,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        });
    }


    /////////////////////////////////////////////////////////////////////////
    function addText(t, pos, group) {

        var mesh;

        loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json', 
            function ( font ) {
            var textGeo = new THREE.TextGeometry( t, {
                font: font,
                size: 2, // font size
                height: 0, // how much extrusion (how thick / deep are the letters)
                curveSegments: 12,
                // curveSegments: 5,
                // bevelThickness: 1,
                // bevelSize: 1,
                // bevelEnabled: true
            });
        
            textGeo.computeBoundingBox();

            var textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );  // specular: 0xffffff
            mesh = new THREE.Mesh( textGeo, textMaterial );
            mesh.position.x = pos.x + 10;
            mesh.position.y = pos.y;
            mesh.position.z = pos.z;

            mesh.visible = false;
            // mesh.castShadow = true;
            // mesh.receiveShadow = true;
            
            // text_array.push(mesh);
            // scene.add( mesh );
            // console.log(mesh);
            group.add(mesh);
            
        });
    }

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