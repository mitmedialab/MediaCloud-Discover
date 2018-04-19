
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

        $( '#chart' ).show();
        drawChart();
    }


    this.exit = function() {

        $( '#chart' ).hide();
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

    	// no-op
    }


	/////////////////////////////////////////////////////////////////////////
    this.init = function() {

        // no-op
    }


    /////////////////////////////////////////////////////////////////////////
    function drawChart() {

        var ctx = document.getElementById("chart");
        ctx.height = 125;

        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/word_over_time/${MC_CONTEXT.country_id}/${MC_CONTEXT.type()}/${MC_CONTEXT.entityID()}`, function( freq_data ) {

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
                                display: true
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