
/////////////////////////////////////////////////////////////////////////
// Word Over Time Scene
/////////////////////////////////////////////////////////////////////////

function WordOverTime(scene) {


    /////////////////////////////////////////////////////////////////////
    this.loadWordCharts = function( word ) {

        $.getJSON( `/word_over_time/${word}`, function( freq_data ) {
            
            var values = $.map(freq_data, function(value, key) { return value });
            values = values.slice(0, values.length-3);
            const mesh = createLineChart( values, -100, 0xffa700 );
            
            scene.add(mesh)
        });
    }


    /////////////////////////////////////////////////////////////////////
    function createLineChart(frequency_data, z_offset, color) {

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
            console.log(v);
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
        mesh.position.y = -100;
        mesh.position.x = -400;
        mesh.position.z = z_offset;
        mesh.receiveShadow = true;

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
    	subscene.name = "WordOverTime";
    	scene.add(subscene);
    }
    this.init();

}