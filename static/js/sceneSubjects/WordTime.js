
/////////////////////////////////////////////////////////////////////////
// Word Over Time Scene
/////////////////////////////////////////////////////////////////////////

function WordTime(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "WordTime";
    scene.add(subscene);

    const opts = {
        'exitDelay': 2000,
        'distanceBehindCamera': 200,
        'zOffset': -250
    };

    let mesh = null;
    let grid = null;
    let group = new THREE.Group();

    /////////////////////////////////////////////////////////////////////
    this.enter = function() {

        // INITIAL 3D IMPLEMENTATION:

        // if(MC_CONTEXT.userData.type == 'word') {
        //     this.loadWordCharts( MC_CONTEXT.userData.label );
        // } else {
        //     this.loadWordCharts( MC_CONTEXT.userData.tags_id );
        // }

        $( '#chart' ).show();
        drawChart();
    }


    this.exit = function() {
        
        // INITIAL 3D IMPLEMENTATION:

        // Slide behind camera out of view
        // var t = new TWEEN.Tween( group.position ).to( {
        //                      y: -200,
        //                      z: opts.distanceBehindCamera
        //         }, opts.exitDelay )
        //         .easing( TWEEN.Easing.Quartic.InOut)
        //             .onUpdate(function(){
        //                 // sceneManager.camera.lookAt( group.position );
        //             })
        //             .onComplete(function(){
        //                 scene.remove( group );
        //             });
        // t.start();

        $( '#chart' ).hide();
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


    /////////////////////////////////////////////////////////////////////
    this.loadWordCharts = function( entity ) {

        scene.remove( group );
        group = new THREE.Group();
        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/word_over_time/${MC_CONTEXT.country_id}/${entity}`, function( freq_data ) {
            
            let values = $.map( freq_data, function(value, key) { return value } );
            values = values.slice( 0, values.length-3 );
            mesh = createLineChart( values, MC_CONTEXT.entityColor() );
            mesh.position.z = -3;

            grid = new THREE.GridHelper( 1000, 20, 0xffffff, 0xffffff );
            grid.position.x += 200;
            group.add( grid );
            group.add( mesh );

            group.position.y = -200;
            group.position.x = -100;
            group.position.z = opts.distanceBehindCamera;

            group.rotation.x = 0.35;
            // group.rotation.y += 0.5;

            group.scale.set( 0.5, 0.5, 0.5 );

            group.visible = false;
            
            thinking.off();
            scene.add( group );

            // Slide from behind camera into view
            var t = new TWEEN.Tween( group.position ).to( 
                    {
                        y: -100, z: opts.zOffset }, 2000 )
                        
                        .easing( TWEEN.Easing.Quartic.InOut)
                        
                        .onStart(function() {
                            group.visible = true;
                    }
            );

            MC_CONTEXT.queueTween( t );
        });
    }


    /////////////////////////////////////////////////////////////////////
    function createLineChart(frequency_data, color) {

        let points = [];
        let x = 0, y = 0, x_offset = 20;
        const extrudeSettings2 = { amount: 100, bevelEnabled: false };

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

    }


    /////////////////////////////////////////////////////////////////////////
    function drawChart() {

        var ctx = document.getElementById("chart");
        console.log(ctx);
        ctx.height = 125;

        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/word_over_time/${MC_CONTEXT.country_id}/${MC_CONTEXT.userData.tags_id}`, function( freq_data ) {

            console.log( freq_data );
            let values = $.map( freq_data, function(value, key) { return value } );
            values = values.slice( 0, values.length-3 );

            let labels = $.map( freq_data, function(value, key) { return $.datepicker.formatDate('dd M yy', new Date(key)) } );
            labels = labels.slice( 0, values.length-3 );

            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Mentions in the Last 30 Days',
                        data: values,
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

            thinking.off();
        });
    }

}