
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

        // TODO: Parameterize this URL call to use the selected item from the Picker
        //     X     - Where are we going to store the selected entity?
        //     X     - We created a context data structure to hold this, didn't we?
        //     X     - It will be the same data structure that gets used to build the 
        //     X         Dashboard link
        //     X     - Where is it defined?
        //     X     - Check main.js and SceneManager.js
        //     X     - Is it or should it be its own .js object/class?
        //     X     - Create this and add:
        //              - entity (tag) id
        //              - name?

        //     X      - You need the correct data loaded into the scene first. Do that.
        //     X      - Wow, an in-memory cache that randomly clears when yous save files
        //              and takes 7 minutes to rebuild is not cool. Set up 'filesystem' cache.
        //     X      - And then we're going to want to only return a random subset of the data

        //     X      - Then map the appropriate data in Picker.js so you can use it in the UI


        //          - What does the '/sentences/id' call use for an identifier? 
        //              - tags_id_media = tag_sets_id
        //              - Below, the tag_sets_id = the Denmark collection
        //                - Hopefully this works equally well with all of the 
        //                  other entity tags
        //          - So store 'tag_sets_id' in MCContext
        //          - Then access it from below and error if it hasn't been chosen yet
        
        //          - Then we're on our way to a parameterized data view on demand
        //          - Try this first and only trigger this once an entity is chosen 
        //              and the 'Explore' button is pressed

        //          - Then, worry about the scene transition where 
        //              . everything fades, 
        //              . the selected entity is pinned to the camera
        //              . the stars swirl for effect
        //              . the context menu drops to the bottom of the screen

        //          - Maybe group these transition changes so you can reuse them 
        //              or part of them each time the scene changes.
        //

        // TODO: Transition to this scene when Picker "explore" link is clicked
        // TODO: Add/Update Dashboard Link when entity is chosen
        // TODO: Change browser URL when changing scenes
        // TODO: Parameterize the 'mark' call to highlight the entity/name  


        $.getJSON( "/sentences/9319462", function( data ) {
          
            let subset = data['response']['docs'].slice(0, 9);
            var items = [];
          
            $.each( subset, function( key, val ) {
                items.push( `<li id='${key}'>${val['sentence']}</li>` );
            });
         
            $( "<ul/>", 
                {
                    class: "sentence-list",
                    html: items.join( "" )
                }
            ).mark('er').appendTo( "body" );

            data = null;
        });


    }
    
    this.init();
    console.log(`Current Context from Inside Scene Subject: ${MC_CONTEXT.currentScene}`);
}