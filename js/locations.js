var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;

var locationAPI = (function(){
	var populateLocations = function(locations){
		var locationHTML = '';
		for(var i = 0; i < locations.length; i++){
			locationHTML += '<li><a class="block-link location-link" location="'+locations[i].location+'" menu="'+locations[i].menu+'")">';
			locationHTML += locations[i].location;
			locationHTML += '<i class="fa fa-chevron-right"></i></a></li>';
		}
		$('.location-list').html(locationHTML);
		$('.location-link').click(setLocation);
		$('.change-location').click(changeLocation);
	};

	var setLocation = function(){
		hideLocations();
		$('.location-name').html($(this).attr("location"));
		$('.location-name').prop("display","inline");
		$('.change-location').prop("display","inline");
		$('.location-name').show();
		$('.change-location').show();
		$(document).trigger("menuSelected",[$(this).attr("menu")]);
	}

	var changeLocation = function(){
		showLocations();
		$('.location-name').hide();
		$('.change-location').hide();
		$('.order-price').hide();
		$('.open-order').hide();
		$(document).trigger("changeLocation");
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
		$('.location-name').hide();
		$('.change-location').hide();
		$('.order-price').hide();
		$('.open-order').hide();
	}

	var showLocations = function(){
		$('.locations-row').show();
	}

	var activate = function(){
		getResterauntList();
	};

	activate();
})();