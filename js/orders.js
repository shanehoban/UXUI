
var orderAPI = (function(){

	var ORDER = [];
	var orderCounter = 0;
	var orderTotal = 0;

	// this is an entire extras object {extras, extrasKeys}
	var extras = menuAPI.getExtras();

	var updateOrderTotal = function(){
		orderTotal = 0;
		for(var i=0; i < ORDER.length; i++){
			var item = ORDER[i];
			var itemTotal = 0;
			itemTotal += item.Price;
			itemTotal += extras.extras[item.extra];
			orderTotal += (item.qty || 1) * itemTotal;
		}
	}

	var clearOrder = function(){
		ORDER = [];
	}

	var updateOrderPanel = function(){

		if(ORDER.length <= 0){
			// hide
			$('.order-panel').slideUp('fast');
			$('body').css('padding-bottom', '0');

		} else {
			//show
			$('.order-panel .order-total').html('Total: &euro;' + getOrderTotal());
			$('.order-price').html('&euro;' + getOrderTotal());
			$('.open-order').prop("display","inline");
			$('.open-order').show();
			$('.order-panel').slideDown('fast');
			$('body').css('padding-bottom', '50px');
		}
	}

	var updateOrder = function(e){

		var ITEM = menuAPI.getCurrentItem();
		ITEM.qty = ITEM.qty || 1;
		ITEM.orderCounter = orderCounter; // unique identifier for object in order
		if(e.data.method === 'add'){
			console.log('Adding to order');
			var copy = JSON.parse(JSON.stringify(ITEM));
			addToOrder(copy);
			// ORDER.push(JSON.parse(JSON.stringify(ITEM)));
		} else {
			console.log('Removing from order');
			ORDER.pop();
			orderCounter--;
		}

		updateOrderTotal();
		updateOrderPanel();
	}

	var addToOrder = function(item)
	{
		var index = 0;
		var same = false;
		for(;index<ORDER.length;index++){
			if(ORDER[index].id===item.id&&ORDER[index].extra===item.extra){
				same = true;
				break;
			}
		}
		if(same){
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

	var showReviewModal = function(){
		var orderList = '';
		for(var i=0; i<ORDER.length; i++){
			var item = ORDER[i];
			var price = (item.Price + extras.extras[item.extra])*(+item.qty);
			orderList += '<li class="order-list-item" data-item-id="' + item.orderCounter + '">' + item.Title;
			orderList += '<div class="order-list-extra capitalize">w/ ' + (item.extra.replace(/-/g, ' ')) + '</div>';
			orderList += '<div class="order-list-qty">x' + (item.qty || 1) + '</div>';
			orderList += '<div class="order-list-price">&euro;' + price.toFixed(2) + '</div>';
			orderList += '</li>';
		}

		$('.order-list').html(orderList);
		$('.order-modal').fadeIn('fast');
	}

	var closeModal = function(){
		$('.order-modal').fadeOut('fast');
	}

	// listeners
	$(document).ready(function(){
		$('.review-order-btn').on('click', showReviewModal);
		$('.close-modal').on('click', closeModal);
		$(document).keyup(function(e) {
		     if (e.keyCode == 27) { // escape key maps to keycode `27`
		       closeModal();
		    }
		});
	});

	return {
		updateOrder: updateOrder,
		getOrderTotal: getOrderTotal
	}
})();