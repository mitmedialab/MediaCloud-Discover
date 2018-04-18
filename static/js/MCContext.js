function MCContext(data) {

	// The name of the selected entity we are exploring
	this.currentEntity;

	if( data['country_id'] !== undefined && data['entity_id'] !== undefined ) {

		console.log( 'Loading entity data...' );
		// $.getJSON( `/getEntityData/${data['entity_id']}`, function( entity ) {

		// 	var name = entity.object.name;
	 //        var type = entity.object.userData.type;

	 //        this.currentEntity = name;
	 //        this.tag_sets_id = intersects[0].object.userData.tag_sets_id;
	 //        this.userData = intersects[0].object.userData;
	        
	 //        $( "#md_header" ).html( `<h2 class="entity">${name}</h2><br><div class="type" style="background-color: ${MC_CONTEXT.entityColorHex()}">${type}</div><br><hr>` );
	 //    });
	}

	// Defaulting Picker Entity Exploration to U.S. Collection
	if(data['country_id'] === undefined) {
		this.country_id = 9139487;
	} else {
		this.country_id = data['country_id'];
	}
	

	// Not sure we need these if we're grabbing the whole userData object (below)
	this.tag_sets_id;
	this.tags_id;
	
	// For convenience, just loading the whole set of properties from the entity here
	this.userData;

	// For easy access to the camera
	this.camera;

	// Keeping track of what scene we are currently in
	this.currentScene = data.scene;


	/////////////////////////////////////////////////////////////////////
	// TODO: Fill out links to Dashboard or Other
	this.explorerLink = function() {
		let ud = this.userData;
		let url = `https://explorer.mediacloud.org/#/queries/search?q=[{%22label%22:%22${this.currentEntity}%22,%22q%22:%22${this.currentEntity}%22,%22color%22:%22%231f77b4%22,%22startDate%22:%222018-01-02%22,%22endDate%22:%222018-04-02%22,%22sources%22:[],%22collections%22:[${this.country_id}]}]`;
		return url;
	}

	/////////////////////////////////////////////////////////////////////
	const colors = {
        'label': 0x1BBD01,
        'organization': 0x17219E,
        'media': 0xB20170,
        'person': 0x64B1EF,
        'location': 0xE47D02,
        'word': 0x6C0898
    };

    let self = this;

	/////////////////////////////////////////////////////////////////////
	this.entityColor = function(type) {

        if(type === undefined) {
        	return colors[self.userData.type];
        } else {
        	return colors[type];
        }
	}


	/////////////////////////////////////////////////////////////////////
	this.entityColorHex = function() {
    	
    	return '#' + new THREE.Color(colors[self.userData.type]).getHexString();
	}


	/////////////////////////////////////////////////////////////////////
	let tweenChain;

	this.queueTween = function( t ) {
		
		if( tweenChain == undefined ) {
			
			tweenChain = t;
			tweenChain.start();

		} else {

			if( tweenChain.isPlaying() ) {
				
				tweenChain.chain( t );
				console.log( 'Tween Chained' );{}
			
			} else {

				tweenChain = t;
				tweenChain.start();
			}
		}
	}

}