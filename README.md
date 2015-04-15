## National Parks Map and Image Gallery

This application and the accompanying tutorial are a tribute to National Park Week (Apr 18-26).  [QGIS](http://www.qgis.org/en/site/), [Leaflet](http://leafletjs.com/), [Turf.js](http://turfjs.org/), [jQuery](https://jquery.com/), [Bootstrap](http://getbootstrap.com/), and [Flickr API](https://www.flickr.com/services/api/) are required to build out this application using this tutorial.

To get started, the first step is to download the [national parks boundaries dataset](https://catalog.data.gov/dataset/national-park-boundariesf0a4c) and save to your working directory. Load the shapefile into QGIS to view and, in this case, simplify geometries due to the file size.  To accomplish that in QGIS, select Vector -> Geometry Tools -> Simplify Geometries.

Next, using command line and in our working directory, convert the shapefile to GeoJSON.  In this case we entered:

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
	

	

	

