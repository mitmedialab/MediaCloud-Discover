
/////////////////////////////////////////////////////////////////////////
// Sentences Scene
/////////////////////////////////////////////////////////////////////////

function Sentences(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Sentences";
    scene.add(subscene);

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
    this.getName = function() {
        return subscene.name;
    }

    /////////////////////////////////////////////////////////////////////
    this.enter = function() {

        if(MC_CONTEXT.userData.type == 'word') {
            this.loadSentences( MC_CONTEXT.country_id, MC_CONTEXT.userData.label );
        } else {
            this.loadSentences( MC_CONTEXT.country_id, MC_CONTEXT.userData.tags_id );
        }
    }


    this.exit = function() {

        $( '#sentence-container ul li' ).each(function (i) {
            let $item = $(this);
            $item.delay(75*i).hide( "slide", { direction: "right"  }, 750 );
        });
    }


    /////////////////////////////////////////////////////////////////////////
    this.loadSentences = function( country_id, entity_id ) {

        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/sentences/${country_id}/${encodeURI( entity_id )}`, function( sentence_data ) {

            // TODO: Selecting subset of data returned here but we should 
            //          be doing this in server.py or in the query itself
            let subset = sentence_data['response']['docs'].slice(0, 9);
            
            $( '#sentence-container ul' ).empty();

            // Load all sentences into list items and hide
            $.each( subset, function( key, val ) {
                $( '#sentence-container ul' ).append(
                    $( `<li id=${key}>` ).text( `“${val['sentence']}”` )
                    .append(`<br><span style="font-size: 10px;">
                        ${val['medium_name']} - 
                        <a href="${val['url']}">
                        ${$.datepicker.formatDate('dd M yy', new Date(val['publish_date']))}
                        </a></span>`)
                    .hide()
                );
            });

            // Progressively reveal each item in list
            $( '#sentence-container ul li' ).each(function (i) {
                    let $item = $(this);
                    $item.delay(75*i).show( "slide", { direction: "right"  }, 1000 );
                });
            
            data = null;
            thinking.off();
        });
    }
}