// Author: TannerGeo

var map;

// create map
// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([40.12, -98.57], 5);

// add an OpenStreetMap tile layer
var basemap = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
basemap.addTo(map);

// filter geojson to only parks
np_boundaries.features = $.map(np_boundaries.features, function (val, i) {
	if(val.properties['UNIT_TYPE'] == 'National Park') {
		return val;
	}
});
// add geojson
function style(feature) {
	return {
		weight : 1,
		fillColor : 'green'
	}
}
var np_geo = L.geoJson(np_boundaries, {
	style : style
});
np_geo.addTo(map);
getImages();

// add events for extent change
map.on('moveend', function (e) {
	getImages();
});

function getImages() {
	// loop through features in current extent
	// generate bbox for each feature
	// call flickr API and send bbox and possibly tags
}




