
var orderAPI = (function(){

	var ORDER = [];
	var orderCounter = 0;
	var orderTotal = 0;

	// order form defaults
	var orderForm = {
		payWith: 'cc',
		coupon: '',
		orderFor: 'collection',
		collectAt: ''
	};
	

	var updateOrderTotal = function(){
		orderTotal = 0;
		for(var i=0; i < ORDER.length; i++){
			var item = ORDER[i];
			var itemTotal = 0;
			itemTotal += item.Price;
			itemTotal += item.extra.price;
			orderTotal += (item.qty || 1) * itemTotal;
		}
	}

	var findItemByCounterId = function(id){
		for(var i = 0; i < ORDER.length; i++){
			var item = ORDER[i];
			if(item.orderCounter.toString() === id.toString()){
				return {
					item: item,
					index: i
					};
			}
		}
	};

	var clearOrder = function(){
		ORDER = [];
	}

	var updateOrderPanel = function(){

		if(ORDER.length <= 0){
			// hide
			$('.order-panel').slideUp('fast');
			$('body').css('padding-bottom', '0');
			$('.order-price').hide();
			$('.open-order').hide();
			$('.order-price').html('');
		} else {
			//show
			$('.order-panel .order-total').html('Total: &euro;' + getOrderTotal());
			$('.order-price').html('&euro;' + getOrderTotal()).show();
			$('.open-order').prop("display","inline");
			$('.order-price').show();
			$('.open-order').show();
			$('.order-panel').slideDown('fast');
			$('body').css('padding-bottom', '50px');
		}
	}

	var updateOrder = function(e){

		var ITEM = e.data.item;
		if(ITEM.qty==0){
			console.log("Invalid order quantity");
			return;
		}
		ITEM.qty = ITEM.qty || 1;
		ITEM.orderCounter = orderCounter; // unique identifier for object in order
		if(ITEM.qty>0){
			console.log('Adding to order');
			addToOrder(JSON.parse(JSON.stringify(ITEM)));
			// ORDER.push(JSON.parse(JSON.stringify(ITEM)));
		} else {
			console.log('Removing from order');
			removeFromOrder(ITEM);
		}
		updateOrderTotal();
		updateOrderPanel();
	}

	var getOrderIndex = function(item){
		var index = 0;
		for(;index<ORDER.length;index++){
			if(ORDER[index].Id===item.Id&&ORDER[index].extra.name===item.extra.name){
				return index;
			}
		}
		return -1;
	}

	var removeFromOrder = function(item){
		var index = getOrderIndex(item);
		if(index>=0){
			if(ORDER[index].qty<=Math.abs(item.qty)){
				console.log("remove");
				ORDER.splice(index,index+1);
				orderCounter--;
			}
			else {
				console.log("decrement");
				ORDER[index].qty += item.qty;
			}
		}
	}

	var addToOrder = function(item){
		var index = getOrderIndex(item);
		if(index>=0){
			console.log("Already there");
			ORDER[index].qty += item.qty;
			ORDER[index].price = ORDER[index].qty * ORDER[index].Price;
		}
		else{
			console.log("Add");
			ORDER.push(item);
			orderCounter++;
		}
	}

	var getOrder = function(){
		console.log("Order", ORDER);
		return ORDER;
	}

	var getOrderTotal = function(){
		return orderTotal.toFixed(2);
	}

	var showSubListMenu = function(e){
		var me = $(this);

		if($(this).hasClass('shown')){
			return false
		}

		$('.order-list-item').removeClass('shown').find('.fa').removeClass('fa-chevron-down').addClass('fa-pencil');
		$(this).addClass('shown');
		$('.order-list-sub-menu').hide(1);
		$(this).find('.order-list-sub-menu').stop().slideDown('fast', function(){
			me.find('.fa').toggleClass('fa-pencil');
			me.find('.fa').toggleClass('fa-chevron-down');
		});
		
	}

	$(document).on("updateOrder", function(e, eventData){
		updateOrder(eventData);
	});


	var addSubListMenu = function(HTML, counterId){
		HTML += '<div class="order-list-sub-menu">';
			HTML += '<button class="order-list-sub-btn list-sub-btn" data-method="minus" data-item-id="' + counterId + '">-</button>';
			HTML += '<button class="order-list-sub-btn list-sub-btn" data-method="add" data-item-id="' + counterId + '">+</button>';
			HTML += '<button class="order-list-sub-btn list-sub-btn" data-method="delete" data-item-id="' + counterId + '"><i class="fa fa-trash"></i></button>';
		HTML += '</div>';
		return HTML;
	}

	var showReviewModal = function(){

		if(ORDER.length<=0){
			$('.order-modal').hide();
			return false;
		}

		var orderListHTML = '';
		for(var i=0; i<ORDER.length; i++){
			var item = ORDER[i];
			var price = (item.Price + item.extra.price)*(+item.qty);
			orderListHTML += '<li class="order-list-item" data-item-id="' + item.orderCounter + '">';
			orderListHTML += '<div class="order-list-icon"><i class="fa fa-pencil edit-item" data-item-id="' + item.orderCounter + '"></i></div>';
			orderListHTML += '<div class="order-list-title">'  + item.Title + '</div>';
			orderListHTML += '<div class="order-list-extra capitalize">w/ ' + (item.extra.name.replace(/-/g, ' ')) + ' </div>';
			orderListHTML += '<div class="order-list-qty"> x' + (item.qty || 1) + '</div>';
			orderListHTML += '<div class="order-list-price">&euro;' + price.toFixed(2) + '</div>';
			orderListHTML = addSubListMenu(orderListHTML, item.orderCounter);
			orderListHTML += '</li>';
		}
		
		var totalHTML = 'Total: <span class="pull-right modal-total-price">&euro;' + getOrderTotal() + '</span>';

		$('.order-total-modal').html(totalHTML);
		$('.order-list').html(orderListHTML);
		$('.order-modal').fadeIn('fast');

		populateOrderTimes();

		// Sub list listeners
		$('.order-list-item').on('click', showSubListMenu);
		$('.list-sub-btn').on('click', editOrder);
	}

	var getDefaultOrderTime = function(){
		return new Date((new Date().getTime() + (60*30*1000))).getTime();
	}


	var formatOrderTime = function(time){
		var date = new Date(time);
		var hours = (date.getHours().length === 1) ? '0' + date.getHours() : date.getHours();
		var mins = (date.getMinutes().length === 1) ? '0' + date.getMinutes() : date.getMinutes();
		return hours + ':' + mins;
	}


	var populateOrderTimes = function(){
		var defaultTime = getDefaultOrderTime();
		var closingTime = new Date();
			closingTime.setHours(22);
			closingTime.setMinutes(0);
		closingTime = closingTime.getTime();

		var oderTimesHTML = '';
		while(defaultTime < closingTime){
			oderTimesHTML += '<option value="' + defaultTime + '">' + formatOrderTime(defaultTime) + '</option>';
			defaultTime += (60*15*1000);
		}

		$('.order-collect-at').html(oderTimesHTML);
	}
	

	var editOrder = function(){
		var counterId = $(this).attr('data-item-id');
		var method = $(this).attr('data-method');
		
				// returns item: item, and index of item in ORDER for deletion
		var item = findItemByCounterId(counterId);
		
		var index = item.index;
			item = item.item;

		console.log(method, counterId);
		console.log(item);

		if(method === "delete"){
			if(confirm('Are you sure you want to delete this item?')){
				ORDER.remove(index);
			} else {
				return false;
			}
		} else if(method === "add"){
			// add quantity
			item.qty++;
		} else if(method === "minus"){
			// decrement quantity
			if(item.qty-1 <= 0){
				ORDER.remove(index);
			} else {
				item.qty--;
			}
		}

		console.log(ORDER);

		// then update the UI with the new totals
		updateOrderTotal();
		updateOrderPanel();
		showReviewModal();
		// and again show the sub-dropdown menu
		$('.order-list-item[data-item-id="'+counterId+'"]').click();
	}


	var closeModal = function(){
		$('.order-modal').fadeOut('fast');
	}

	// listeners
	$(document).ready(function(){
		$('.review-order-btn, .open-order').on('click', showReviewModal);
		$('.close-modal').on('click', closeModal);
		$('.add-coupon-btn').on('click', function(){
			$('.coupon-code').fadeIn('fast').focus();
		});
		$(document).keyup(function(e) {
		     if (e.keyCode == 27) { // escape key maps to keycode `27`
		       closeModal();
		    }
		});
	});
})();