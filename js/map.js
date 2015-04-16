// Author: TannerGeo

var map,           // main appliation map
    basemap;       // leaflet basemap layer

var np_boundaries, // raw geojson
    np_geo;        // leaflet geojson layer

var queue = []; // placeholder if need for queue and digest management
var cached = {}; // cache park images to limit api calls
var current_gallery = {}; // images and details in current extent
var current_req_length = 0;
var queue_length = 0;

// Application Configuraton Object
var app_config = {
	basemap : "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
	basemapAttribution : "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
};

// Flickr Configuration
var flickr_config = {
	maxNumImages : 5, // max number of images to request for each park
	url : "https://api.flickr.com/services/rest",
	key : "5ca26e8c98a49ec95a0fa4dfaa7623d8"
};

// create map and add tiled basemap
map = L.map('map').setView([40.12, -98.57], 5);
basemap = L.tileLayer(app_config.basemap, {
	attribution: app_config.basemapAttribution
});
basemap.addTo(map);

// setup map events 
map.on('moveend', function (e) {
	getImages();
});

// filter geojson to only parks
np_boundaries.features = $.map(np_boundaries.features, function (val, i) {
	if(val.properties['UNIT_TYPE'] == 'National Park') {
		return val;
	}
});

/* GEOJSON FUNCTIONS */
function style(feature) {
	return {
		weight : 1,
		fillColor : 'green'
	}
}
/********************/

/* GEOJSON LAYER */
np_geo = L.geoJson(np_boundaries, {
	style : style
});
np_geo.addTo(map);
getImages(); // make iniital call once
/****************/

/* APPLICATION FLICKR FUNCTIONS */
function getImages() {
	// get current extent
	var mapBounds = map.getBounds();
	var centroid;
	// clear current gallery
	current_gallery = {};
	current_req_length = 0;
	queue_length = 0;
	// calculate number of matches for queue
	$.each(np_geo.getLayers(), function (i, l) {
		// get centroid of layer
		centroid = turf.centroid(l.feature);
		var latlng = L.latLng([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]);
		if(mapBounds.contains(latlng)) {
			current_req_length += 1;
		}
	});
	// Make flickr calls
	$.each(np_geo.getLayers(), function (i, l) {
		// get centroid of layer
		centroid = turf.centroid(l.feature);
		var latlng = L.latLng([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]);
		if(mapBounds.contains(latlng)) {
			if(l.feature.properties['UNIT_NAME'] in cached) {
				// push existing parks with images
				current_gallery[l.feature.properties['UNIT_NAME']] = cached[l.feature.properties['UNIT_NAME']];
				queue_length += 1;
				if(queue_length == current_req_length) {
					buildHtml();
				}
			} else {
				callFlickr(l.feature, l.feature.properties['UNIT_NAME']);
			}
		}
	});
}

function callFlickr(f, parkName) {
	var bbox = turf.extent(f.geometry).join(",");
	var tags = parkName.split(" ");
	tags.push("park");
	tags.push("national");
	tags = tags.join(",");
	$.ajax({
		url : flickr_config.url,
		//jsonp : "jsonFlickrApi",
		dataType : 'json',
		data : {
			api_key : flickr_config.key,
			tags : tags,
			bbox : bbox,
			format : 'json',
			method : 'flickr.photos.search',
			per_page : flickr_config.maxNumImages,
			nojsoncallback : 1
		}
	}).done(function (resp) {
		queue_length += 1;
		if(resp.stat !== "ok") {
			if(queue_length == current_req_length) {
				buildHtml()
			}
			return;
		}
		var photos = [];
		$.each(resp.photos.photo, function (i, v) {
			photos.push("https://farm" + v.farm + ".staticflickr.com/" + v.server + "/" + v.id + "_" + v.secret + "_n.jpg");
		});
		// add to cache
		cached[parkName] = photos;
		current_gallery[parkName] = photos;
		if(queue_length == current_req_length) {
			buildHtml();
		}
	});
}

// builds html for carousel
function buildHtml() {
// obj to array
//id="owl-example" class="owl-carousel"
// randomize
	var gallery_items;
	var gallery_container = $("<div />", {
		id : 'owl-slider',
		class : 'own-carousel'
	});
	$.each(current_gallery, function (idx, photos) {
		$.each(photos, function (idx, photo) {
			var div = $("<div />", {
				class : 'thumbnail'
			});

			var img = $("<img />", {
				src : photo
			});

			div.append(img);
			gallery_container.append(div);
		});
	});

	$("#slider").empty();
	$("#slider").append(gallery_container);
	$("#owl-slider").owlCarousel();
}
/********************************/




