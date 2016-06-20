var API_URL = 'http://127.0.0.1:1337/';

$(document).ready(function(){
	getResterauntList();
});


var populateLocations = function(locations){
	console.log('Locations', locations);
	var locationHTML = '';
	for(var i = 0; i < locations.length; i++){
		locationHTML += '<li><a class="block-link" href="menu.html?loc=' + encodeURI(locations[i]) + '">';
		locationHTML += locations[i];
		locationHTML += '<i class="fa fa-chevron-right"></i></a></li>';
	}
	$('.location-list').html(locationHTML);
};

var getResterauntList = function(){
	if(self.fetch){
		fetch(API_URL + 'menus').then(function(data){
			return data.json();
		}).then(function(data){
			console.log(data);
			populateLocations(data.locations);
		});
	} else {
	// ajax fallback
		$.ajax({
			url: API_URL + 'menus',
			method: 'GET',
			success: function(data){
				data = JSON.parse(data);
				populateLocations(data.locations);
			},
			error: function(err){
				console.log(err);
			}
		});
	}
};