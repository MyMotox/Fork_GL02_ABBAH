var POI = function(nm, lt, lg, r){
	this.name = nm;
	this.lat = lt;
	this.lng = lg;
	this.ratings = [].concat(r);
}
	
POI.prototype.averageRatings = function(){
	var total = this.ratings.reduce((acc, elt) => acc + parseInt(elt), 0);
	return total / this.ratings.length;

};
	
POI.prototype.addRating = function(rating){
	this.ratings.push(rating);
};


module.exports = POI;