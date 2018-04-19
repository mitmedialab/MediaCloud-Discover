function MCContext(data) {

	// The name of the selected entity we are exploring
	this.currentEntity;

	// Not sure we need these if we're grabbing the whole userData object (below)
	this.tag_sets_id;
	this.tags_id;
	
	// For convenience, just loading the whole set of properties from the entity here
	this.userData;

	// For easy access to the camera
	this.camera;

	// Keeping track of what scene we are currently in
	this.currentScene = data.scene;

	this.entityFromURL = false;

	const self = this;

	/////////////////////////////////////////////////////////////////////
	this.entityID = function() {

		if( self.userData.type == 'media' ) {

            return self.userData.media_id;

        } else if( self.userData.type == 'word' ) {

        	return self.userData.term;

        } else {

        	return self.userData.tags_id;
        }
	}


	/////////////////////////////////////////////////////////////////////
	this.type = function() {
		
		return self.userData.type;
	}


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

	/////////////////////////////////////////////////////////////////////
	
	// Load Entity from URL parameters
	if( data['country_id'] !== undefined && data['entity_id'] !== undefined && data['entity_type'] !== undefined ) {

		if( DEBUG ) {
			console.log( 'Loading Entity Data from URL...' );
			console.log( data );
		}

		this.entityFromURL = true;
		self.country_id = data['country_id'];
		let type = data['entity_type'];

	 	// Is it Media?
		if( data['entity_type'] == 'media' ) {
		 	$.getJSON(`/media/${data['entity_id']}`, function( entity_data ) {
		 		
		 		if( DEBUG ) {
		 			console.log( 'Loading Media from URL...' );
		 			console.log( data );
		 		}

		 		let name = entity_data.name;

		 		self.currentEntity = name;
	            self.userData = entity_data;
	            self.userData.type = 'media';

	            $( "#md_header" ).html( `<h2 class="entity">${name}</h2><br><div class="type" style="background-color: ${self.entityColorHex()}">${type}</div><br><hr>` );
		 	});
		}
		// Is it a Word?
		else if( data['entity_type'] == 'word' ) {

		 		let name = data['entity_id'];

		 		self.currentEntity = name;
	            self.userData = {'term': name };
	            self.userData.type = 'word';

	            $( "#md_header" ).html( `<h2 class="entity">${name}</h2><br><div class="type" style="background-color: ${self.entityColorHex()}">${type}</div><br><hr>` );
		 }
		 // Is it an Entity?
		 else {

			$.getJSON(`/entity/${data['entity_id']}`, function( entity_data ) {
		 		
		 		if( DEBUG ) {
		 			console.log( 'Loading Entity from URL...' );
		 			console.log( data );
		 		}

		 		let name = entity_data.label;

		 		self.currentEntity = name;
	            self.userData = entity_data;
	            self.userData.type = data['entity_type'];

	            $( "#md_header" ).html( `<h2 class="entity">${name}</h2><br><div class="type" style="background-color: ${self.entityColorHex()}">${type}</div><br><hr>` );
		 	});
		 }

		$( '#metadata' ).show( "slide", { direction: "left"  }, 500 );
	}

	// Defaulting Picker Entity Exploration to U.S. Collection
	if(data['country_id'] === undefined) {
		this.country_id = 9139487;
	} else {
		this.country_id = data['country_id'];
	}

}