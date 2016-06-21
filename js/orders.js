
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
			$('.open-order').hide();
			$('.order-price').html('');

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
			if(ORDER[index].Id===item.Id&&ORDER[index].extra===item.extra){
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

	var addToOrder = function(item)
	{
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

	var showReviewModal = function(){
		var orderList = '';
		for(var i=0; i<ORDER.length; i++){
			var item = ORDER[i];
			var price = (item.Price + extras.extras[item.extra])*(+item.qty);
			orderList += '<li class="order-list-item" data-item-id="' + item.orderCounter + '">';
			orderList += '<div class="order-list-title">'  + item.Title + '</div>';
			orderList += '<div class="order-list-extra capitalize">w/ ' + (item.extra.replace(/-/g, ' ')) + ' </div>';
			orderList += '<div class="order-list-qty"> x' + (item.qty || 1) + '</div>';
			orderList += '<div class="order-list-price">&euro;' + price.toFixed(2) + '</div>';
			orderList += '</li>';
		}
		
		var totalHTML = 'Total: <span class="pull-right modal-total-price">&euro;' + getOrderTotal() + '</span>';

		$('.order-total-modal').html(totalHTML);
		$('.order-list').html(orderList);
		$('.order-modal').fadeIn('fast');
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

	return {
		updateOrder: updateOrder,
		getOrderTotal: getOrderTotal
	}
})();