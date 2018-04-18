
/////////////////////////////////////////////////////////////////////////
// Picker Scene
/////////////////////////////////////////////////////////////////////////

function Picker(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Picker";
    scene.add(subscene);

    this.entities = new THREE.Group();
    var self = this;
    var built_entities;
    let countrySelected = MC_CONTEXT.country_id;
    let countryLoaded = false;

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
            sceneManager.camera.rotation.y += 0.0005;
        }
        
        for(i = 0; i < this.entities.children.length; i++) {
            
            let current_planet = this.entities.children[i].children[0]; 
            let current_label = this.entities.children[i].children[1];

            current_planet.rotation.x += 0.01;
            current_planet.rotation.y += 0.01;

            current_label.lookAt( sceneManager.camera.position );
        }
    }


    /////////////////////////////////////////////////////////////////////////
    this.init = function() {
        subscene.visible = true;

        if(MC_CONTEXT.country_id == countrySelected && countryLoaded == true) {
            subscene.visible = true;
        } else {
            subscene.visible = true;

            var self = this;

            var promise = new Promise( function( resolve, reject ) {
                self.loadEntities(MC_CONTEXT.country_id);
            }).then( function() { 
                if( DEBUG ) {
                    console.log( 'Successfully Loaded Entities');
                }
            });

            countryLoaded = true;
            if( DEBUG ) {
                console.log( `Loading Entities from ${MC_CONTEXT.country_id}...` );
            }
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
                this.fadeEntity( entities[key].children[0] );
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////
    function returnToCameraOrigin() {

        var t = new TWEEN.Tween( sceneManager.camera.position ).to( {
                                 x: 0,
                                 y: 0,
                                 z: 0
                    }, 2500 )
                    .easing( TWEEN.Easing.Quartic.InOut)
                        .onUpdate(function(){
                            sceneManager.camera.lookAt( new THREE.Vector3(0, 0, 0) );
                        })
                        .onComplete(function(){
                            // no-op
                        });
        
        MC_CONTEXT.queueTween( t );
    }

    let materials = {};
    ['word', 'media', 'label', 'organization', 'person', 'location'].forEach( function( type ) {
        materials[type] = new THREE.MeshPhongMaterial( {
                             color: MC_CONTEXT.entityColor( type ),
                             side: THREE.DoubleSide,
                             flatShading: true
        } );
    });

    /////////////////////////////////////////////////////////////////////////
	this.loadEntities = function( country_id ) {

        if( DEBUG ) {
            console.log(`Loading Entities for ${country_id}...`)
        }

        var promise = $.getJSON( `/country_entities/${country_id}` );
        promise.done( processEntities );

        countrySelected = country_id;
        // Ensure scene is visible
        subscene.visible = true;

        // Remove previous set of entities from scene
        var all_entities = subscene.children[0];
        subscene.remove(all_entities);

        // Instantiate Entity Objects and Add to Entities Array
        built_entities = new THREE.Group();
        built_entities.name = 'entities';
        this.entities = built_entities;
        subscene.add(built_entities);
	}


    function processEntities( country_data ) { 

        if( DEBUG ) {
            console.log( `Retrieved ${country_data.length} Entities...` );
        }

        const geometry = new THREE.IcosahedronBufferGeometry(5, 0);
        let emptyGroup = new THREE.Group();

        country_data.forEach( function( item ) {

            // This Group Holds The Entity Geometry and Label
            var entityGroup = emptyGroup.clone();
            var entity = new THREE.Mesh( geometry, materials[item.type] );

            // Add entity label or term as Object3D name for convenience
            if( item.type == 'media' ) {
                // Media name
                entity.name = item.name;

            } else if( item.type == 'word' ) {
                // Word as Name
                entity.name = item.term;

            } else {
                // All Other Entities
                entity.name = item.label;
            }

            if( DEBUG ) {
                console.log( `Adding ${entity.name} to scene...` );
            }
            
            // Add all entity metadata fields to mesh userData
            entity.userData = $.extend( entity.userData, item );

            // Randomize Initial Location //
            entity.position.x = THREE.Math.randFloatSpread( 300 );
            entity.position.y = THREE.Math.randFloatSpread( 100 );
            entity.position.z = THREE.Math.randFloatSpread( 300 );

            // Prepare for fade-out when removing; opacity stays at 1
            // entity.material.transparent = true;

            // Build Entity Group //
            entityGroup.add(entity);

            // FIXME: Need to detect CJK strings here and sub Noto CJK font 
            //  for geometry generation
            // addText( '义勇军进行曲', entity.position, entityGroup );

            var p = new Promise( ( resolve, reject ) => {

                const shortenedName = nGramTrim( entity.name, 3 );
                addText( shortenedName, entity.position, entityGroup );
                resolve( entityGroup );
            });

            p.then( function( entityGroup ) { 

                built_entities.add( entityGroup );
                if( DEBUG ) {
                    console.log( `Added ${entityGroup.children[0].name}.` );
                }

            }).catch( function( e ) { 
                if( DEBUG ) {
                    console.log( 'Error Adding Text' ); 
                }
            });

            return p;
        });
    }

    /////////////////////////////////////////////////////////////////////////
    function nGramTrim( s, n = 3 ) {

        return s.split( /\s+/ ).slice( 0, n ).join( " " );
    }


    /////////////////////////////////////////////////////////////////////////
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

}
