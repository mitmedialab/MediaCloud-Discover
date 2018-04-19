
/////////////////////////////////////////////////////////////////////////
// Sentences Scene
/////////////////////////////////////////////////////////////////////////

function Sentences(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Sentences";
    scene.add(subscene);

    const sentenceCountLimit = 7;

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
        
        this.loadSentences();
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
    this.loadSentences = function() {

        const thinking = sceneManager.findSceneByName( "Thinking" );
        thinking.on();

        $.getJSON( `/sentences/${MC_CONTEXT.country_id}/${MC_CONTEXT.type()}/${encodeURI( MC_CONTEXT.entityID() )}`, function( sentence_data ) {

            const subset = sentence_data['response']['docs'].slice( 0, sentenceCountLimit );
            
            $( '#sentence-container ul' ).empty();

            // Load all sentences into list items and hide
            $.each( subset, function( key, val ) {
                $( '#sentence-container ul' ).append(
                    $( `<li id=${key}>` ).html( `“...${val['sentence']}...”` )
                    .append(`<br><span class="sentence-metadata" style="color: ${MC_CONTEXT.entityColorHex()};">
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