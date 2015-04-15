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

// api key = 5ca26e8c98a49ec95a0fa4dfaa7623d8
function getImages() {
	// get current extent
	var mapBounds = map.getBounds();
	var centroid;
	$.each(np_geo.getLayers(), function (i, l) {
		// get centroid of layer
		centroid = turf.centroid(l.feature);
		var latlng = L.latLng([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]);
		if(mapBounds.contains(latlng)) {
			// call flickr on these bboxes of this feature layer
			// and maybe tags
			console.log(l.feature.properties['UNIT_NAME']);
		}
	})
}




