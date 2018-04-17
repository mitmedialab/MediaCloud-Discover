
/////////////////////////////////////////////////////////////////////////
// Sentences Scene
/////////////////////////////////////////////////////////////////////////

function Sentences(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Sentences";
    scene.add(subscene);

    const sentenceCountLimit = 8;

    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {
        // nothing to update in render loop
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


    /////////////////////////////////////////////////////////////////////
    this.exit = function() {

        $( '#sentence-container ul li' ).each(function (i) {
            let $item = $(this);
            $item.delay(75*i).hide( "slide", { direction: "right"  }, 750 );
        });
    }

    function googleFavIconUrl( domain ) {
        return `https://www.google.com/s2/favicons?domain=${domain}`;
    }


    /////////////////////////////////////////////////////////////////////////
    this.loadSentences = function( country_id, entity_id ) {

        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/sentences/${country_id}/${encodeURI( entity_id )}`, function( sentence_data ) {

            // TODO: Selecting subset of data returned here but we should 
            //          be doing this in server.py or in the query itself

            // FIXME: Sometimes we arrive here and get this error. Possible bug within server.py
            // Sentences.js:61 Uncaught TypeError: Cannot read property 'slice' of undefined
            //     at Object.success (Sentences.js:61)
            //     at fire (jquery-3.3.1.js:3268)
            //     at Object.fireWith [as resolveWith] (jquery-3.3.1.js:3398)
            //     at done (jquery-3.3.1.js:9305)
            //     at XMLHttpRequest.<anonymous> (jquery-3.3.1.js:9548)

            const subset = sentence_data['response']['docs'].slice(0, sentenceCountLimit);
            
            $( '#sentence-container ul' ).empty();

            // Load all sentences into list items and hide
            $.each( subset, function( key, val ) {
                $( '#sentence-container ul' ).append(
                    $( `<li id=${key}>` ).html( `“...${val['sentence']}...”` )
                    .append(`<br><span class="sentence-metadata">
                        <img src="${ googleFavIconUrl(val['url']) }"> &nbsp;&nbsp; ${val['medium_name']} - 
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