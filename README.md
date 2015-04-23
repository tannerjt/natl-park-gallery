## National Parks Map and Image Gallery

This application and the accompanying tutorial are a tribute to National Park Week (Apr 18-26).  A working knowledge of [QGIS](http://www.qgis.org/en/site/), [Leaflet](http://leafletjs.com/), [Turf.js](http://turfjs.org/), [jQuery](https://jquery.com/), [Bootstrap](http://getbootstrap.com/), [Lightbox](http://lokeshdhakar.com/projects/lightbox2/), and [Flickr API](https://www.flickr.com/services/api/) are required to build out this application using this tutorial.

###### Data Acquisition and Conversion/Getting Required Modules

To get started, the first step is to download the [national parks boundaries dataset](https://catalog.data.gov/dataset/national-park-boundariesf0a4c) and save to your working directory. Load the shapefile into QGIS to view and, in this case, simplify geometries due to the file size.  To accomplish that in QGIS, select Vector -> Geometry Tools -> Simplify Geometries.

Next, using command line and in our working directory, convert the shapefile to GeoJSON using [GDAL](http://www.gdal.org/).  In this case we entered:

	ogr2ogr -f GeoJSON <output geojson> <input shapefile>
	
To create the application, we will define our dependencies in our *package.json* file:

	"dependencies" : {
   	"turf" : "*",
   	"leaflet" : "*",
   	"bootstrap" : "*",
   	"jquery" : "*"
  	}

Then, using command line, use npm to add the appropriate packages locally.

	npm install
	
You will see your packages in a new directory called *node_modules* inside your project folder.
	
In your *.gitignore* file, add node_modules, and they will be left out when pushing to your [GitHub](https://github.com/) repo.

###### Building the Application

Below is an outline of the steps taken to build out this application, along with some code and image samples.  Dig further into the source code for more information.

- add a Leaflet basemap

		var map,           // main appliation map
    		basemap;       // leaflet basemap layer
    		
    	// Application Configuraton Object
		var app_config = {
		basemap : "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
		basemapAttribution : "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
		};
		
		// create map and add tiled basemap
		map = L.map('map').setView([40.12, -98.57], 4);
		basemap = L.tileLayer(app_config.basemap, {
		attribution: app_config.basemapAttribution
		});
		basemap.addTo(map);
    
- filter features to exclude geometries that aren't parks (rivers, monuments, etc.)
- setup GeoJSON layer style

		var np_boundaries, // raw geojson
    	np_geo;        // leaflet geojson layer
    	
		// filter geojson to only parks
		np_boundaries.features = $.map(np_boundaries.features, function (val, i){
			if(val.properties['UNIT_TYPE'] == 'National Park') {
				return val;
			}
		});
		
		function style(feature) {
			return {
				weight : 1,
				color : 'green',
				fillColor : 'green'
			}
		}

- setup Flickr configuration

		// Flickr Configuration
		var flickr_config = {
		maxNumImages : 4, // max number of images to request for each park
		url : "https://api.flickr.com/services/rest",
		key : <your flickr-provided key>
		};

- add GeoJSON to map along with initial Flickr images

		/* GEOJSON LAYER */
		np_geo = L.geoJson(np_boundaries, {
			style : style,
			onEachFeature : function (f, l) {
				var pn =  f.properties['UNIT_NAME'] + " National Park";
				l.bindPopup(
					"<h3>" + pn + "</h3>" +
					"<a href='http://en.wikipedia.org/wiki/" + pn.split(" ").join("_") + 
			"' target='_blank'>Learn more about this National Park</a>", {
					autoPan : false
				});

			}
		});
		np_geo.addTo(map);
		getImages(); // make inital call once


![National Park Gallery Image 1](/images/tutorial/natl-park-gallery-1.png)

- add events for extent change

		// setup map events 
		map.on('moveend', function (e) {
			getImages();
		});

- acquire bounding boxes and park name tags in preparation for Flickr API calls (uses Turf.js)

		var queue = []; // placeholder if need for queue and digest management
		var cached = {}; // cache park images to limit api calls
		var current_gallery = {}; // images and details in current extent
		var current_req_length = 0;
		var queue_length = 0;
		
		function callFlickr(f, parkName) {
			var bbox = turf.extent(f.geometry).join(",");
			var tags = parkName.split(" ");
			tags.push("park");
			tags.push("national");
			tags = tags.join(",");
			$.ajax({
				url : flickr_config.url,
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
						buildHtml(parkName)
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
					buildHtml(parkName);
				}
			});
		}

- get current extent and clear current gallery
- calculate the # of matches for image queue and make Flickr API calls

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
							buildHtml(l.feature.properties['UNIT_NAME']);
						}
					} else {
						callFlickr(l.feature, l.feature.properties['UNIT_NAME']);
					}
				}
			});
		}
		
- add events for mouseover, mouseout, and click (uses Lightbox)
- build html for image carousel

		function highlightStyle() {
			return {
				weight : 4,
				color : 'red',
				fillColor : 'red'
			}
		}
		
		function highlightPark(park) {
			var park = park;
			$.each(np_geo.getLayers(), function (idx, layer) {
				if (layer.feature.properties['UNIT_NAME'] == park) {
					layer.setStyle(highlightStyle());
					layer.openPopup();
				} else {
					layer.setStyle(style());
				}
			})
		}

		// build html for image carousel
		function buildHtml() {
			var gallery_items;
			var gallery_container = $("<div />", {
				id : 'owl-slider',
				class : 'own-carousel'
			});
			var list = [];
			$.each(current_gallery, function (park, photos) {
				list.push("<a class='park-item' href='' target='_blank'>" + park + "</a>");
				$.each(photos, function (idx, photo) {
					var div = $("<div />", {
						class : 'thumbnail'
					});

					div.on('mouseover', function (e) {
						highlightPark(park);
					});
					div.on('mouseout', function (e) {
						$.each(np_geo.getLayers(), function (i, l) {
							l.setStyle(style());
						});
					});

					var title = $("<span />", {
						html : "<h2><span class='glyphicon glyphicon-globe inverse'></span>  " + park + " National Park</h2>",
						class : 'parkname-title'
					});

					var fullPhoto = photo.replace("n.jpg", "b.jpg");
		
					var link = $("<a />", {
						"data-lightbox" : "image-" + idx,
						"data-title" : park + " (courtesy of Flickr)",
						href : fullPhoto
					});

					var img = $("<img />", {
						src : photo
					});

					link.append(img);
					div.append(link);
					div.append(title);
					gallery_container.append(div);
				});
			});

			list = list.join(' | ');
			$("#parkslist").html(list);
			$(".park-item").on('click', function (e) {
				e.preventDefault();
				highlightPark(e.target.text);
			})
			$("#slider").empty();
			$("#slider").append(gallery_container);
			$("#owl-slider").owlCarousel({
				margin : 10,
				autoWidth : true,
				stagePadding : 50
			});
		}

![National Park Gallery Image 2](/images/tutorial/natl-park-gallery-2.png)

- add style with Bootstrap and dynamic sizing


![National Park Gallery Image 4](/images/tutorial/natl-park-gallery-4.png)

- add sidebar content and style

[View Application](http://tannerjt.github.io/natl-park-gallery/)

[View Source](https://github.com/tannerjt/natl-park-gallery)

What it looks like:

![National Park Gallery Image 5](/images/tutorial/natl-park-gallery-5.png)

	

	

	

