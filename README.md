## National Parks Map and Image Gallery

This application and the accompanying tutorial are a tribute to National Park Week (Apr 18-26).  We are using [QGIS](http://www.qgis.org/en/site/), 

The first step is to download the [national parks boundaries dataset](https://catalog.data.gov/dataset/national-park-boundariesf0a4c). Load the shapefile into QGIS to view and, in this case, simplify geometries due to the file size.  To accomplish that in QGIS, select Vector -> Geometry Tools -> Simplify Geometries.

Next, using command line and in our working directory, convert the shapefile to GeoJSON.  In this case we entered:

	ogr2ogr -f GeoJSON <output geojson> <input shapefile>
	
To create the application, 
	

	

