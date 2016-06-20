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


var getMenu = function(){
	if(self.fetch){
		fetch(API_URL + 'menus/thaiRestaurantMenu.json').then(function(data){
			return data.json();
		}).then(function(data){
			console.log("Fetched: ", data);
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
				populateMenu(data.RestaurantMenuCategories);
			},
			error: function(err){
				console.log(err);
			}
		});
	}
}


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

var getLocation = function(){
	var url = window.location.href;
    var regex = new RegExp("[?&]loc(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    console.log("Location", decodeURIComponent(results[2].replace(/\+/g, " ")));
}

$(document).ready(function(){
	getLocation();
});

