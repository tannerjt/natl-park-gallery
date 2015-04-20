// adjust map height to change in page size
// run after DOM has loaded
$(function () {
	var $map = $("#map");
	var $sidebar = $("#sidebar")
	var height;
	$(window).on('resize', function () {
		adjustMapHeight();
	});

	function adjustMapHeight() {
		height = $(window).height() - 140;
		$map.height(height);
		$sidebar.height(height);
	}
	adjustMapHeight();
});