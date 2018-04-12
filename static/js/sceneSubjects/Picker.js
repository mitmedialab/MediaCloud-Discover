
/////////////////////////////////////////////////////////////////////////
// Picker Scene
/////////////////////////////////////////////////////////////////////////

function Picker(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Picker";
    scene.add(subscene);

    this.entities = new THREE.Group();
    var self = this;
    let currentSelected = MC_CONTEXT.country_id;

    // CLICK TRIGGERS //

    /////////////////////////////////////////////////////////////////////////
    this.enter = function() {
        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.off();
        self.init();
    }


    /////////////////////////////////////////////////////////////////////////
    this.exit = function() {

        // Tween back to original camera position for 3D location dependent
        // visualization elements
        returnToCameraOrigin();
        this.toggleVisible();
    }


    /////////////////////////////////////////////////////////////////////////
    this.toggleVisible = function() {
        subscene.visible = !subscene.visible;
        // TODO: Hide Chart & Context Contents Here As Well
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

        if(controls.entityOrbitToggle) {
            // this.entities.rotation.y += 0.001;
        }
        
        if(controls.entitySpinToggle) {
            for(i = 0; i < this.entities.children.length; i++) {
                
                let current_planet = this.entities.children[i].children[0];
                let current_label = this.entities.children[i].children[1];

                current_planet.rotation.x += 0.01;
                current_planet.rotation.y += 0.01;

                current_label.lookAt( sceneManager.camera.position );
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////
    this.init = function() {
        subscene.visible = true;
    	this.loadEntities(MC_CONTEXT.country_id);
        if( DEBUG ) {
            console.log( `Loading Entities from ${MC_CONTEXT.country_id}...` );
        }
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


    function returnToCameraOrigin() {

        var t = new TWEEN.Tween( sceneManager.camera.position ).to( {
                                 x: 0,
                                 y: 0,
                                 z: 100
                    }, 3000 )
                    .easing( TWEEN.Easing.Quartic.InOut)
                        .onUpdate(function(){
                            sceneManager.camera.lookAt( new THREE.Vector3(0, 0, 0) );
                        })
                        .onComplete(function(){
                            // no-op
                        });
        t.start();
    }


    /////////////////////////////////////////////////////////////////////////
    function entityColor(type) {

        const colors = {
            'label': 0x1BBD01,
            'organization': 0x17219E,
            'media': 0xB20170,
            'person': 0x020170,
            'location': 0xE47D02,
            'word': 0x6C0898
        };

        return colors[type];
    }


    /////////////////////////////////////////////////////////////////////////
	this.loadEntities = function( country_id ) {

        // Ensure scene is visible
        subscene.visible = true;

        // Instantiate Entity Objects and Add to Entities Array
        var built_entities = new THREE.Group();
        built_entities.name = 'entities';
        var all_entities = subscene.children[0];

        $.getJSON( `/country_entities/${country_id}`, function( country_data ) {

            var geometry = new THREE.IcosahedronBufferGeometry(5, 0);

            // Create Entities For Each Collection Data Element
    	    for(var i = 0; i < country_data.length; i++) {

                // This Group Holds The Entity Geometry and Label
                var entityGroup = new THREE.Group();

                // Create Entity Geometry
                var material = new THREE.MeshPhongMaterial( {
                         color: entityColor(country_data[i].type),
                         emissive: 0x072534,
                         side: THREE.DoubleSide,
                         flatShading: true
                } );
                var entity = new THREE.Mesh(geometry, material);

                // Add entity label or term as Object3D name for convenience
                if( country_data[i].type == 'media' ) {
                    // Media name
                    entity.name = country_data[i].name;
                } else if( country_data[i].type == 'word' ) {
                    // Word as Name
                    entity.name = country_data[i].term;
                } else {
                    // All Other Entities
                    entity.name = country_data[i].label;
                }
                
                // Add all entity metadata fields to mesh userData
                entity.userData = $.extend( entity.userData, country_data[i] );

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
                addText( entity.name, entity.position, entityGroup );
                
                // FIXME:

                // Need to detect CJK strings here and sub Noto CJK font 
                //  for geometry generation
                // addText( '义勇军进行曲', entity.position, entityGroup );

                
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
	}

    function addText( t, pos, group ) {

        var textGeo = new THREE.TextGeometry( t, {
            font: font,
            size: 1.5,
            height: 0,
            curveSegments: 12,
        });
        textGeo.computeBoundingBox();
        // textGeo.computeVertexNormals();
        // textGeo.center();
        let textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
        txtMesh = new THREE.Mesh( textGeo, textMaterial );
        txtMesh.position.x = pos.x + 10;
        txtMesh.position.y = pos.y;
        txtMesh.position.z = pos.z;
        // txtMesh.visible = false;
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
}
