var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;

var menuAPI = (function(){ 

	var selected;
	var MENU;
	var ITEM;
	var labelCount = 0;

	var extras = {
		'steamed-rice': 0,
		'brown-rice': 0,
		'coconut-rice': 0.5,
		'rice-noodles': 1,
		'egg-noodles': 1
		};
	var extrasKeys = Object.keys(extras);

	var populateMenu = function(menu){
		MENU = menu;
		var menuHTML = '';
		for(var i = 0; i < menu.length; i++){
			menuHTML += createMenuCategoryHTML(menu[i]);
		}

		$('.menu-list').html(menuHTML);
		setupMenuListeners();
	}

	var createMenuCategoryHTML = function(category){
		var categoryTitle = category.Title;
		var items = category.Items;
		var categoryHTML = '<div class="menu-category">';
		categoryHTML += createMenuCategoryTitleHTML(categoryTitle);
		categoryHTML += createMenuItemListHTML(items);
		categoryHTML += '</div>'; // closes category
		return categoryHTML;
	}

	var createMenuItemListHTML = function(items){
		var menuItemListHTML = '<div class="menu-item-list">';
		for(var index = 0; index < items.length; index++){
			menuItemListHTML += createMenuItemHTML(items[index]);
		}
		menuItemListHTML += '</div>';
		return menuItemListHTML;
	}

	var createMenuCategoryTitleHTML = function(title){
		var categoryTitleHTML = '<div class="category-title">';
		categoryTitleHTML += title;
		categoryTitleHTML += '</div>';
		return categoryTitleHTML;
	}

	var createMenuItemHTML = function(item){
		var menuitemHTML = '<div class="menu-item">';
		menuitemHTML += createMenuItemTitleHTML(item.Description, item.Title);
		menuitemHTML += createMenuItemDescriptionHTML(item.Description);
		menuitemHTML += createMenuItemPriceHTML(item.Price);
		menuitemHTML += createSubMenuHTML();
		menuitemHTML += '</div>'; // end .menu-item
		return menuitemHTML;
	}

	var createMenuItemTitleHTML = function(description, title){
		var menuitemTitleHTML = '<div class="menu-item-title" title="' + description + '" data-title="' + title + '">';
		menuitemTitleHTML += title;
		menuitemTitleHTML += '</div>';
		return menuitemTitleHTML;
	}

	var createMenuItemPriceHTML = function(price){
		var menuitemPriceHTML = '<div class="menu-item-price">';
		menuitemPriceHTML += '&euro;' + (price).toFixed(2);
		menuitemPriceHTML += '</div>';
		return menuitemPriceHTML;
	}

	var createMenuItemDescriptionHTML = function(description){
		var menuitemDescriptionHTML = '<div class="menu-item-description">';
		menuitemDescriptionHTML += description;
		menuitemDescriptionHTML += '</div>';
		return menuitemDescriptionHTML;
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


	var createSubMenuHTML = function(){

		
		var subMenuHtml = '<div class="item-sub-menu">';
		subMenuHtml += '<img class="sub-item-img" src="img/dish.png">';
		subMenuHtml += createExtrasSelectionDivHTML();
			subMenuHtml += '<div class="display-flex align-center">';
			subMenuHtml += createQuantityDivHTML();
			subMenuHtml += '<button class="add-to-cart-btn">Add to Cart</button>';
			subMenuHtml += '<span class="hide-sub-menu-btn">close</span>';
			subMenuHtml += '</div>'; // end flex
		subMenuHtml += '</div>';
		return subMenuHtml;
	};

	var createExtrasSelectionDivHTML = function(){
		extrasHtml = '<div class="sub-item-meta">';
		extrasHtml += '<form class="sub-item-form">';
		for(var i = 0; i < extrasKeys.length; i++){
			extrasHtml += createExtrasHtml(i);
		}
		extrasHtml += '</form>';
		extrasHtml += '</div>';
		return extrasHtml;
	}

	var createExtrasHtml = function(index){
		var extraHtml = '<input class="extra-radio" id="label' + (++labelCount) + '" type="radio" ' + (index===0 ? 'checked' : '') + ' name="side-dish" value="' + extrasKeys[index] + '">';
		extraHtml += '<label for="label' + labelCount + '">' + extrasKeys[index].replace(/-/g, ' ');
	  	extraHtml +=  '<span class="extras-price">&euro;' + extras[extrasKeys[index]].toFixed(2) + '</span>';
	  	extraHtml += '</label>';
	  	return extraHtml;
	}

	var createQuantityDivHTML = function(){
		var qdHtml = '';
			qdHtml += '<div class="sub-item-quantity">';
			qdHtml += '<i class="fa fa-minus qty-btn decrement-quantity"></i>';
			qdHtml += '<input class="item-order-quantity" value="1" type="number" min="1">';
			qdHtml += '<i class="fa fa-plus qty-btn increment-quantity"></i>';
			qdHtml += '</div>';
		return qdHtml;
	}

	var resetQuantity = function(){
		ITEM.qty = 1;
		$('.item-order-quantity').val(1);
	}

	var setupMenuListeners = function(){
		$('.menu-item').on('click', openSubMenu);
		$('.increment-quantity').on('click', incrementQuantity);
		$('.decrement-quantity').on('click', decrementQuantity);
		$('.extra-radio').on('change', updateExtra);
		$('.add-to-cart-btn').on('click', updateOrder);
		$('.add-to-cart-btn').on('click', resetQuantity);
	};

	var updateOrder = function(){
		$(document).trigger("updateOrder", [ITEM]);
	}

	var updateExtra = function(e){
		setExtraValue($(this).val());
	}

	var setExtraValue = function(key){
		ITEM.extra = {name: key, price: extras[key]};
	}

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
		setExtraValue(extrasKeys[0]); // set first item in extras as default extra

		selected.find('.item-sub-menu').slideDown('fast');
		$('.shown .hide-sub-menu-btn').on('click', function(e){
			closeSubMenus(menuItems);
			e.stopPropagation();
		});
	}

	var incrementQuantity = function(e){
		var qtyInput = $(this).parent().find('.item-order-quantity');
		var qty = parseInt($(qtyInput).val(), 10) + 1;
		$(qtyInput).val(qty);
		ITEM.qty = parseInt(qty);
	}

	var decrementQuantity = function(e){
		var qtyInput = $(this).parent().find('.item-order-quantity');
		var qty = parseInt($(qtyInput).val(), 10) - 1;
		$(qtyInput).val(qty);
		ITEM.qty = parseInt(qty);
	}

	var closeSubMenus = function(element){
		hideSubmenus();
		element.removeClass('shown');
	}

	var getMenu = function(menuName){
		var address = API_URL + 'menus/' + menuName + '.json';
		if(self.fetch){
			fetch(address).then(function(data){
				return data.json();
			}).then(function(data){
				console.log("Fetched: ", data);
				populateMenu(data.RestaurantMenuCategories);
			});
		} else {
			// ajax fallback
			$.ajax({
				url: address,
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

	var getCurrentItem = function(){
		return ITEM;
	}

	$(document).on("menuSelected", function(e, eventData){
		getMenu(eventData);
	});

	$(document).on("changeLocation", function(e){
		clearMenu();
	});

	return {
		populateMenu: populateMenu,
		createMenuItemHTML: createMenuItemHTML,
		createQuantityDivHTML: createQuantityDivHTML,
		createSubMenuHTML: createSubMenuHTML,
		createMenuCategoryHTML: createMenuCategoryHTML,
		createExtrasSelectionDivHTML: createExtrasSelectionDivHTML,
		createMenuItemPriceHTML: createMenuItemPriceHTML,
		createMenuItemTitleHTML: createMenuItemTitleHTML,
		createMenuItemDescriptionHTML: createMenuItemDescriptionHTML,
		createMenuItemListHTML: createMenuItemListHTML,
		createExtrasHtml: createExtrasHtml,
		createMenuCategoryTitleHTML: createMenuCategoryTitleHTML,
		clearMenu: clearMenu,
		getCurrentItem: getCurrentItem,
		getMenu: getMenu,
		closeSubMenus: closeSubMenus,
		decrementQuantity: decrementQuantity,
		incrementQuantity: incrementQuantity,
		openSubMenu: openSubMenu,
		setExtraValue: setExtraValue,
		updateExtra: updateExtra,
		updateOrder: updateOrder,
		resetQuantity: resetQuantity,
		setupMenuListeners: setupMenuListeners,
		hideSubmenus: hideSubmenus,
		findMenuItem: findMenuItem,
		extrasKeys: extrasKeys,
		extras: extras,
		labelCount: labelCount,
		menu: MENU,
		item: ITEM,
		selected: selected
	};
})();

