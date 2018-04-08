
/////////////////////////////////////////////////////////////////////////
// Word Over Time Scene
/////////////////////////////////////////////////////////////////////////

function WordTime(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "WordTime";
    scene.add(subscene);

    let mesh = null;
    let grid = null;
    let group = new THREE.Group();

    /////////////////////////////////////////////////////////////////////
    this.enter = function() {

        if(MC_CONTEXT.userData.type == 'word') {
            this.loadWordCharts( MC_CONTEXT.userData.label );
        } else {
            this.loadWordCharts( MC_CONTEXT.userData.tags_id );
        }
    }


    this.exit = function() {

        scene.remove( group );
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


    /////////////////////////////////////////////////////////////////////
    this.loadWordCharts = function( entity ) {

        const z_offset = -250
        scene.remove( group );
        group = new THREE.Group();
        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/word_over_time/${MC_CONTEXT.country_id}/${entity}`, function( freq_data ) {
            
            let values = $.map( freq_data, function(value, key) { return value } );
            values = values.slice( 0, values.length-3 );
            mesh = createLineChart( values, 0xffa700 );

            grid = new THREE.GridHelper( 700, 20, 0xffffff, 0xffffff );
            grid.position.x += 360;
            group.add( grid );
            group.add( mesh );

            group.position.y = -100;
            group.position.x = -100;
            group.position.z = z_offset;

            group.rotation.x += 0.35;
            // group.rotation.y += 0.5;

            group.scale.set( 0.5, 0.5, 0.5 );
            
            thinking.off();
            scene.add( group );
        });
    }


    /////////////////////////////////////////////////////////////////////
    function createLineChart(frequency_data, color) {

        let points = [];
        let x = 0, y = 0, x_offset = 20;
        const extrudeSettings2 = { amount: 4, bevelEnabled: false };

        // Map count values down to 0-100
        let out_min = 0;
        let out_max = 100;
        let in_min = Math.min.apply(null, frequency_data);
        let in_max = Math.max.apply(null, frequency_data);
        frequency_data = frequency_data.map(x => ((x - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min);

        // Pad Data with Zeros
        const values = [0, 0, 0].concat(frequency_data, [0, 0, 0]);

        // Define points along Z axis
        for( var i = 0; i < values.length; i++ ) {
            x = x + x_offset;
            let v = new THREE.Vector3(x, values[i], 1);
            points.push(v);
        }

        // TODO: Explore curve types
        const curve = new THREE.CatmullRomCurve3( points );
        const spline_points = curve.getPoints( 400 );
        const shape = new THREE.Shape( spline_points );

        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings2 );
        const material = new THREE.MeshPhongMaterial( {
                            color: color,
                            emissive: 0x072534,
                            side: THREE.DoubleSide,
                            flatShading: true
                        } );

        const mesh = new THREE.Mesh( geometry, material );
        return mesh;
    }

    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

    	// no-op
        // TODO: Any animation, unless this is triggered by events
    }


	/////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	const subscene = new THREE.Object3D();
    	subscene.name = "WordTime";
    	scene.add(subscene);
    }

}