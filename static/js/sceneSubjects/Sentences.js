
/////////////////////////////////////////////////////////////////////////
// Sentences Scene
/////////////////////////////////////////////////////////////////////////

function Sentences(scene) {

    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

    }


	/////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	var subscene = new THREE.Object3D();
    	subscene.name = "Sentences";
    	scene.add(subscene);
    }


    /////////////////////////////////////////////////////////////////////////
    this.loadSentences = function( country_id, entity_id ) {

        $.getJSON( `/sentences/${country_id}/${encodeURI( entity_id )}`, function( sentence_data ) {

            // TODO: Selecting subset of data returned here but we should 
            //          be doing this in server.py or in the query itself
            let subset = sentence_data['response']['docs'].slice(0, 9);
            
            $.each( subset, function( key, val ) {
                $( '#sentence-container ul' ).append(
                    $( `<li id=${key}>` ).text( val['sentence'] )
                    .hide()
                )
            });

            $( '#sentence-container ul li' ).each(function (i) {
                    let $item = $(this);
                    $item.delay(75*i).show( "slide", { direction: "right"  }, 1000 );
                });
            
            data = null;
        });
    }
    
    this.init();
}