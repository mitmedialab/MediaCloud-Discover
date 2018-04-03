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
	this.explorerLink = function() {
		const ud = this.userData;
		const url = `https://explorer.mediacloud.org/#/queries/search?q=[{%22label%22:%22${ud.label}%22,%22q%22:%22${ud.label}%22,%22color%22:%22%231f77b4%22,%22startDate%22:%222018-01-02%22,%22endDate%22:%222018-04-02%22,%22sources%22:[],%22collections%22:[${this.country_id}]}]`;
		return url;
	}
}