function MCContext(data) {

	// The name of the selected entity we are exploring
	this.currentEntity;

	// Not sure we need these if we're grabbing the whole userData object (below)
	this.tag_sets_id;
	this.tags_id;
	
	// For convenience, just loading the whole set of properties from the entity here
	this.userData;

	// Defaulting Picker Entity Exploration to U.S. Collection
	this.country_id = 9139487;

	// For easy access to the camera
	this.camera;

	// Keeping track of what scene we are currently in
	this.currentScene = data.scene;

	// TODO: Fill out links to Dashboard or Other
	function dashboardLink() {

		return 'https://https://dashboard.mediacloud.org/ ${this.var} / ${this.var} / ${this.var}'
	}
}