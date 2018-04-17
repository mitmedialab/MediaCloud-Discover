function MCContext(data) {

	// The name of the selected entity we are exploring
	this.currentEntity;

	// Not sure we need these if we're grabbing the whole userData object (below)
	this.tag_sets_id;
	this.tags_id;
	
	// For convenience, just loading the whole set of properties from the entity here
	this.userData;

	// Defaulting Picker Entity Exploration to U.S. Collection
	this.country_id = 34412193; // Switched to China during testing;  U.S. 9139487;

	// For easy access to the camera
	this.camera;

	// Keeping track of what scene we are currently in
	this.currentScene = data.scene;

	/////////////////////////////////////////////////////////////////////
	// TODO: Fill out links to Dashboard or Other
	this.explorerLink = function() {
		const ud = this.userData;
		const url = `https://explorer.mediacloud.org/#/queries/search?q=[{%22label%22:%22${ud.label}%22,%22q%22:%22${ud.label}%22,%22color%22:%22%231f77b4%22,%22startDate%22:%222018-01-02%22,%22endDate%22:%222018-04-02%22,%22sources%22:[],%22collections%22:[${this.country_id}]}]`;
		return url;
	}

	/////////////////////////////////////////////////////////////////////
	const colors = {
        'label': 0x1BBD01,
        'organization': 0x17219E,
        'media': 0xB20170,
        'person': 0x020170,
        'location': 0xE47D02,
        'word': 0x6C0898
    };


	/////////////////////////////////////////////////////////////////////
	this.entityColor = function(type = undefined) {
	
        if(type === undefined) {
        	return colors[this.userData.type];
        } else {
        	return colors[type];
        }
	}


	/////////////////////////////////////////////////////////////////////
	this.entityColorHex = function() {
    	
    	return '#' + new THREE.Color(colors[this.userData.type]).getHexString();
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