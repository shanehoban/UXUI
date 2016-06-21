
var resterauntLocation;

var setLocation = function(locationValue){
	resterauntLocation = locationValue;
	locationAPI.hideLocations();
	$('.location-name').html(resterauntLocation);
	$('.location-name').prop("display","inline");
	$('.change-location').prop("display","inline");
	$('.location-name').show();
	$('.change-location').show();
	//do stuff for menu
	menuAPI.getMenu();
	return false;
}

var changeLocation = function(){
	locationAPI.showLocations();
	$('.location-name').hide();
	$('.change-location').hide();
	$('.open-order').hide();
	//do stuff for menu
	menuAPI.clearMenu();
	return false;
}

