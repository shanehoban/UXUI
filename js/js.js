

var API_URL = 'http://127.0.0.1:1337/';
var ORDER = [];

var MENU;
var ITEM;

var findMenuItem = function(title){
	for(var i = 0; i < MENU.length; i++){
		var category = MENU[i];
		var categoryTitle = category.Title;
		var items = category.Items;
		for(var x = 0; x < items.length; x++){
			var item = items[x];
			if(item.Title === title){
				return item;
			}
		}
	}
};

var clearOrder = function(){
	ORDER = [];
	ITEM = null;
	$('.order-panel').fadeOut('fast');
}

var displayOrder = function(){
	var orderHTML = '';
	var orderTotal = 0;
	console.log(ORDER);

	if(ORDER && ORDER.length > 0){
		$('.order-buttons').fadeIn('fast');
	} else {
		$('.order-buttons').hide();
	}

	for(var i=0; i < ORDER.length; i++){
		var item = ORDER[i];
		orderTotal += item.Price;
		orderHTML += '<div class="order-details-list">';
		orderHTML += '<div class="order-detail-title">';
		orderHTML += item.Title;
		orderHTML += ' <span class="order-price">&pound;' + (item.Price).toFixed(2) + '</span>';
		orderHTML += '</div>';
		orderHTML += '</div>';
	}

	orderHTML += '<div class="order-total">Total: <span class="order-price">&pound;' + (orderTotal).toFixed(2) + '</span></div>';

	$('.order-details').html(orderHTML);
	$('.order-details').scrollTop($('.order-details')[0].scrollHeight);
};

var displayMenuItem = function(item){
$('.order-panel').fadeIn('fast').css('display', 'inline');
$('.item-title').html(item.Title);
$('.item-desc').html(item.Description);
$('.item-price').html('&pound;' + (item.Price).toFixed(2));

	//TO:DO variations
	$('.item-variations').html();

	displayOrder();
};

var setupMenuListeners = function(){
	$('.menu-item-title').on('click', function(){
		$('.menu-item-title').removeClass('active');
		$(this).addClass('active');

		// Global
		ITEM = findMenuItem($(this).attr('data-title'));
		displayMenuItem(ITEM);
	});

};


var displayResterauntDetails = function(rest){
	clearOrder();
	var cuisines = '';
	for(var i = 0; i < rest.Cuisines.length; i++){
		cuisines += rest.Cuisines + ((i+1 === rest.Cuisines.length) ? '' : ', ');
	}
	$('.rest-name').html(rest.Name)
	$('.rest-dsc').html(rest.Description)
	$('.rest-quiz').html(cuisines)
	$('.rest-address').html(rest.Address)
	$('.rest-postcode').html(rest.Postcode)
};


var populateMenu = function(menu){
	MENU = menu;
	var menuHTML = '';
	for(var i = 0; i < menu.length; i++){
		var category = menu[i];
		var categoryTitle = category.Title;
		var items = category.Items;

		menuHTML += '<div class="menu-category">';
		menuHTML += '<div class="category-title">';
		menuHTML += categoryTitle;
		menuHTML += '</div>';

		menuHTML += '<div class="menu-item-list">';
		for(var x = 0; x < items.length; x++){
			var item = items[x];
			menuHTML += '<div class="menu-item">';
			menuHTML += '<div class="menu-item-title" title="' + item.Description + '" data-title="' + item.Title + '">';
			menuHTML += item.Title;
			menuHTML += '</div>';
			menuHTML += '</div>';
		}
		menuHTML += '</div>';

		menuHTML += '</div>'; // closes category
	}

	$('.rest-menu').html(menuHTML);
	setupMenuListeners();
}


var populateLocations = function(locations){
	console.log('Locations', locations);
	var locationHTML = '';
	locationHTML += '<div class="locations">';
	for(var i = 0; i < locations.length; i++){
		locationHTML += '<div class="location">';
		locationHTML += locations[i];
		locationHTML += '</div>';
	}
	locationHTML += '</div>'; // closes locations
	$('.location-menu').html(locationHTML);
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
				data = JSON.parse(data);
				populateLocations(data.locations);
			},
			error: function(err){
				console.log(err);
			}
		});
	}
};

$(document).ready(function(){
	$('.menu-btn').on('click', function(){
		$('button').removeClass('active');
		$(this).addClass('active');
		var menu = $(this).attr('data-menu');

		if(self.fetch){
			fetch(API_URL + 'menus/' +  menu).then(function(data){
				return data.json();
			}).then(function(data){
				console.log("Fetched: ", data);
				displayResterauntDetails(data.RestaurantDescription);
				populateMenu(data.RestaurantMenuCategories);
			});
		} else {
			// ajax fallback
			$.ajax({
				url: API_URL + 'menus/' +  menu,
				method: 'GET',
				success: function(data){
					data = JSON.parse(data);
					console.log(data);
					displayResterauntDetails(data.RestaurantDescription);
					populateMenu(data.RestaurantMenuCategories);
				},
				error: function(err){
					console.log(err);
				}
			});
		}
	});

	$(document).ready(function(){
		$('.menu-btn').on('click', function(){
			$('button').removeClass('active');
			$(this).addClass('active');
			var menu = $(this).attr('data-menu');

			if(self.fetch){
				fetch(API_URL + 'menus/' +  menu).then(function(data){
					return data.json();
				}).then(function(data){
					console.log("Fetched: ", data);
					displayResterauntDetails(data.RestaurantDescription);
					populateMenu(data.RestaurantMenuCategories);
				});
			} else {
			// ajax fallback
				$.ajax({
					url: API_URL + 'menus/' +  menu,
					method: 'GET',
					success: function(data){
						data = JSON.parse(data);
						console.log(data);
						displayResterauntDetails(data.RestaurantDescription);
						populateMenu(data.RestaurantMenuCategories);
					},
					error: function(err){
						console.log(err);
					}
				});
			}
		});

		$('.add-to-order').on('click', function(){
			ORDER.push(ITEM);
			displayOrder();
		});

		$('.clear-order').on('click', function(){
			if(confirm("Are you sure you want to clear your order?")){
				clearOrder();
			}
		});

		// click first button
		$('button').first().click();

		getResterauntList();
	});
});
