var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;

var menuAPI = (function(){ 

	var selected;
	var MENU;
	var ITEM;
	var labelCount = 0;

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

					menuHTML += '<div class="menu-item-price">';
						menuHTML += '&euro;' + (item.Price).toFixed(2);
					menuHTML += '</div>';

					menuHTML += '<div class="menu-item-description">';
						menuHTML += item.Description;
					menuHTML += '</div>';

					menuHTML = addSubMenu(menuHTML);

				menuHTML += '</div>'; // end .menu-item
			}
			menuHTML += '</div>';

			menuHTML += '</div>'; // closes category
		}

		$('.menu-list').html(menuHTML);
		setupMenuListeners();
	}

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

	var hideSubmenus = function(){
		// Hide all sub menus
		$('.item-sub-menu').slideUp('fast');
	};

	var addSubMenu = function(HTML){
		HTML += '<div class="item-sub-menu">';
			HTML += '<img class="sub-item-img" src="img/dish.png">';

			HTML += '<div class="sub-item-meta">';
				HTML += '<form class="sub-item-form">';
				  HTML += '<input id="label' + (++labelCount) + '"" type="radio" checked name="side-dish" value="steamed-rice"> <label for="label' + labelCount + '">Steamed Rice<br>';
				  HTML += '<input id="label' + (++labelCount) + '"" type="radio" name="side-dish" value="brown-rice"> <label for="label' + labelCount + '">Brown Rice</label><br>';
				  HTML += '<input id="label' + (++labelCount) + '"" type="radio" name="side-dish" value="coconut-rice"> <label for="label' + labelCount + '">Coconut Rice</label><br>';
				  HTML += '<input id="label' + (++labelCount) + '"" type="radio" name="side-dish" value="rice-noodles"> <label for="label' + labelCount + '">Rice Noodles</label><br>';
				  HTML += '<input id="label' + (++labelCount) + '"" type="radio" name="side-dish" value="egg-noodles"> <label for="label' + labelCount + '">Egg Noodles</label><br>';
				HTML += '</form>';
			HTML += '</div>';

			HTML += '<div class="sub-item-quantity">';

				HTML += '<i class="fa fa-minus qty-btn"></i>';
				HTML += '<input class="item-order-quantity" value="1" type="number" min="1">';
				HTML += '<i class="fa fa-plus qty-btn"></i>';

			HTML += '</div>';

				HTML += '<button class="add-to-cart-btn">Add to Cart</button>';
				HTML += '<span class="hide-sub-menu-btn">close</span>';

		HTML += '</div>';

		return HTML;
	};

	var setupMenuListeners = function(){
		$('.menu-item').on('click', openSubMenu);
		$('.qty-btn').on('click', updateQuantity);
	};

	var openSubMenu = function(e){
		// Assign Global ITEM
		selected = $(this);
		if(selected.hasClass('shown'))
			return;
		var menuItems = $('.menu-item');
		closeSubMenus(menuItems);
		selected.addClass('shown');
		var item = selected.find('.menu-item-title');
		ITEM = findMenuItem($(item).attr('data-title'));
		selected.find('.item-sub-menu').slideDown('fast');
		$('.shown .hide-sub-menu-btn').on('click', function(e){
			closeSubMenus(menuItems);
			e.stopPropagation();
		});
	}

	var updateQuantity = function(e){
		var plusClicked = $(this).hasClass('fa-plus');
		var qtyInput = $(this).parent().find('.item-order-quantity');
		var qty = parseInt($(qtyInput).val(), 10) + (plusClicked ? 1 : -1);
		$(qtyInput).val((qty <= 1 && !plusClicked) ? 1 : qty);
	}

	var closeSubMenus = function(element){
		hideSubmenus();
		element.removeClass('shown');
	}

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

	var clearMenu = function(){
		$('.menu-list').html('');
	}
	return {
		clearMenu: clearMenu,
		getMenu: getMenu
	};
})();

