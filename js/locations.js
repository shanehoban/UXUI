var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;

var locationAPI = (function(){
	var populateLocations = function(locations){
		var locationHTML = '';
		for(var i = 0; i < locations.length; i++){
			locationHTML += '<li><a class="block-link" onclick="setLocation(\''+locations[i]+'\')">';
			locationHTML += locations[i];
			locationHTML += '<i class="fa fa-chevron-right"></i></a></li>';
		}
		$('.location-list').html(locationHTML);
	};

	var clearLocations = function(){
		$('.location-list').html('');
	};

	var getResterauntList = function(){
		if(self.fetch){
			fetch(API_URL + 'menus').then(function(data){
				return data.json();
			}).then(function(data){
				populateLocations(data.locations);
			});
		} else {
		// ajax fallback
			$.ajax({
				url: API_URL + 'menus',
				method: 'GET',
				success: function(data){
					populateLocations(data.locations);
				},
				error: function(err){
					console.log(err);
				}
			});
		}
	};

	var hideLocations = function(){
		$('.locations-row').hide();
	}

	var showLocations = function(){
		$('.locations-row').show();
	}

	var activate = function(){
		getResterauntList();
	};

	activate();

	return {
		hideLocations: hideLocations,
		showLocations: showLocations
	}
})();