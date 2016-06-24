
var orderAPI = (function(){

	var ORDER = [];
	var COUPON_LENGTH = 8;
	var orderCounter = 0;

	// order form defaults - to send to server
	var orderForm = {
		paymentMethod: 'cc',
		coupon: '',
		orderFor: 'collection',
		time: '',
		name: '',
		mobile: '',
		ccno: '',
		exp: '',
		csv: '',
		address1: '',
		address2: '',
		orderTotal: 0
	};

	/*
		8, 46: backspace, delete
		37-40: left, up, right, down arrow keys
	*/
	var allowedKeyCodes = [8, 46, 37, 38, 39, 40];

	// For dynamically extending the modal pages, push/pop as needed
	var modalPages = [1, 2];

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

	var resetInputs = function(){
		$('.order-form-block').find('input[type="text"],input[type="number"]').val('');
	}

	var clearOrder = function(){
		ORDER = [];
		var orderKeys = Object.keys(orderForm);
		for(var i = 0; i<orderKeys.length; i++){
			var k = orderKeys[i];
			orderForm[k] = '';
		}
		orderForm.paymentMethod = 'cc';
		orderForm.orderFor = 'collection';
		orderForm.orderTotal = 0;
		resetInputs();
		refreshUI();
	}

	var updateOrderPanel = function(){

		if(ORDER.length <= 0){
			$('.please-select-item').show();
			$('.desktop-place-order-block, .desktop-form').hide();
			hideOrderPanel();
		} else {
			$('.please-select-item').hide();
			$('.desktop-place-order-block, .desktop-form').show();
			showOrderPanel();
		}
	}

	var hideOrderPanel = function(){
		// hide
		$('.order-panel').slideUp('fast');
		$('body').css('padding-bottom', '0');
		$('.order-price').hide();
		$('.open-order').hide();
		$('.order-price').html('');
	}

	var showOrderPanel = function(){
		//show
		$('.order-panel .order-total').html('Total: &euro;' + getOrderTotal());
		$('.order-price').html('&euro;' + getOrderTotal());
		$('.open-order').prop("display","inline");
		$('.order-price').show();
		$('.open-order').show();
		$('.order-panel').slideDown('fast');
		$('body').css('padding-bottom', '50px');
	}

	var updateOrder = function(item){
		var ITEM = item;
		if(ITEM.qty==0){
			console.log("Invalid order quantity");
			return;
		}
		ITEM.qty = ITEM.qty || 1;
		ITEM.orderCounter = orderCounter; // unique identifier for object in order
		if(ITEM.qty>0){
			addToOrder(JSON.parse(JSON.stringify(ITEM)));
		} else {
			console.log('Removing from order');
			removeFromOrder(ITEM);
		}
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
				ORDER.remove(index);
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
		var orderTotal = 0;
		for(var i=0; i < ORDER.length; i++){
			var item = ORDER[i];
			var itemTotal = 0;
			itemTotal += item.Price;
			itemTotal += item.extra.price;
			orderTotal += (item.qty || 1) * itemTotal;
		}
		if(orderForm.coupon && orderForm.coupon !== ''){
			orderTotal = orderTotal*(1-(orderForm.coupon/100));
		}
		orderForm.orderTotal = orderTotal;
		return orderTotal.toFixed(2);
	}

	var showSubListMenu = function(e){
		
		if($(this).hasClass('shown')){
			return false
		}

		$('.order-list-item').removeClass('shown').find('.fa').removeClass('fa-chevron-down').addClass('fa-pencil');
		$(this).addClass('shown');
		$('.order-list-sub-menu').hide(1);
		$(this).find('.order-list-sub-menu').css({'display': 'flex'});
		
		$(this).find('.fa').toggleClass('fa-pencil');
		$(this).find('.fa').toggleClass('fa-chevron-down');
	}

	$(document).on("updateOrder", function(e, eventData){
		updateOrder(eventData);
		updateDesktopUI();
	});

	$(document).on("changeLocation", function(e){
		clearOrder();
		hideOrderPanel();
	});


	var addSubListMenu = function(HTML, item){
		HTML += '<div class="order-list-sub-menu">';
		HTML += '<button class="order-list-sub-btn list-sub-btn list-sub-btn-update" data-method="minus" data-item-id="' + item.orderCounter + '">-</button>';
		HTML += '<span class="order-list-sub-qty">' + item.qty + '</span>';
		HTML += '<button class="order-list-sub-btn list-sub-btn list-sub-btn-update" data-method="add" data-item-id="' + item.orderCounter + '">+</button>';
		HTML += '<button class="order-list-sub-btn list-sub-btn list-sub-btn-delete" data-method="delete" data-item-id="' + item.orderCounter + '"><i class="fa fa-trash"></i></button>';
		HTML += '</div>';
		return HTML;
	}

	var checkOrderLength = function(){
		if(ORDER.length<=0){
			$('.order-modal').hide();
			$('.desktop-order-total').hide();
			return false;
		} else {
			return true;
		}
	}

	var showReviewModal = function(){
		setOrderHTML();
		if(!checkOrderLength()){
			return false;
		}
		populateOrderTimes();
		$('.order-modal').fadeIn('fast');
	}

	var setOrderHTML = function(){
		var orderListHTML = generateOrderListHTML();
		var totalHTML = 'Total: <span class="pull-right modal-total-price"><span class="coupon-applied"></span> &euro;' + getOrderTotal() + '</span>';
		$('.order-total-modal').html(totalHTML);
		$('.order-list').html(orderListHTML);
		
		if(orderForm.coupon && orderForm.coupon !== ''){
			$('.coupon-applied').html('Coupon Applied (' + orderForm.coupon + '%)');
		} else {
			$('.coupon-applied').html('');
		}

		$('.order-list-item').on('click', showSubListMenu);
		$('.list-sub-btn-update').on('click', changeOrderFromModal);
		$('.list-sub-btn-delete').on('click', deleteOrderFromModal);
		$('.desktop-order-total').show();
		checkOrderLength();
	}

	var generateOrderListHTML = function(){
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
			orderListHTML = addSubListMenu(orderListHTML, item);
			orderListHTML += '</li>';
		}
		return orderListHTML;
	}

	var updateDesktopUI = function(){
		setOrderHTML();
	}

	var initModalNavigation = function(){
		var currentPage = $(this).attr('data-modal-page');
		var direction = $(this).attr('data-direction');

		if(direction === 'next' && currentPage < modalPages.length){
			$('.modal-page-' + currentPage).hide();
			$('.modal-page-' + (+currentPage+1)).show();
			$('.modal-nav-back').show();
			if((+currentPage+1) === modalPages[modalPages.length-1]){
				$('.modal-nav-next').hide();
				$('.modal-nav-complete').show();
			}
			$('[data-modal-page]').attr('data-modal-page', (+currentPage+1));
		} else if(direction === "back" && (+currentPage-1) >= modalPages[0]){
			$('.modal-nav-complete').hide();
			$('.modal-page-' + currentPage).hide();
			$('.modal-page-' + (+currentPage-1)).show();
			if((+currentPage-1) === modalPages[0]){
				$('.modal-nav-next').show();
				$('.modal-nav-back').hide();
			}
			if((+currentPage-1) < modalPages.length){
				$('.modal-nav-next').show();
			}
			$('[data-modal-page]').attr('data-modal-page', (+currentPage-1));
		}
	}

	var updateDeliveryMethod = function(){
		var method = $(this).val();
		if(method === 'collection'){
			$('.address-block').hide();
			if(modalPages.length === 3){
				modalPages.pop();
				$('.modal-nav-complete').show();
				$('.modal-nav-next').hide();
			}
		} else {
			$('.address-block').show();
			if(modalPages.length < 3){
				modalPages.push(3);
				$('.modal-nav-complete').hide();
				$('.modal-nav-next').show();
			}
			
		}
		$('.order-for-value').html(method);
		orderForm.orderFor = method;
	}

	var updateDeliveryTime = function(){
		var timestamp = $(this).val();
		orderForm.time = new Date(+timestamp).getTime();
	}

	var validateFormInput = function(){
		var identifier = $(this).attr('data-order-form');
		orderForm[identifier] = $(this).val();
	}

	var updatePaymentMethod = function(){
		orderForm.paymentMethod = $(this).val();
		if($(this).val() === "cc"){
			$('.credit-card-block').show();
		} else {
			$('.credit-card-block').hide();
		}
		console.log(orderForm);
	}


	// Returns the start default collection/delivery timestamp (in ms)
	var getDefaultOrderTime = function(){
		var now = new Date();
		var defaultTime = new Date(now.setMinutes(30));
			now = new Date();
		var thirtyMins = 30*60*1000;
		if((defaultTime.getTime()-now.getTime()) < thirtyMins){
			defaultTime.setMinutes(0);
			defaultTime.setHours(defaultTime.getHours() + 1);
		}
		return defaultTime.getTime();
	}


	var formatOrderTime = function(time){
		var date = new Date(time);
		var hours = (date.getHours().toString().length === 1) ? '0' + date.getHours() : date.getHours();
		var mins = (date.getMinutes().toString().length === 1) ? '0' + date.getMinutes() : date.getMinutes();
		return hours + ':' + mins;
	}


	var populateOrderTimes = function(){
		var defaultTime = getDefaultOrderTime();
		var closingTime = new Date();
			closingTime.setHours(22);
			closingTime.setMinutes(0);
		closingTime = closingTime.getTime();

		orderForm.time = new Date(+defaultTime).getTime();

		var oderTimesHTML = '';
		while(defaultTime < closingTime){
			oderTimesHTML += '<option value="' + defaultTime + '">' + formatOrderTime(defaultTime) + '</option>';
			defaultTime += (60*15*1000);
		}

		$('.order-collect-at').html(oderTimesHTML);
	}


	var changeOrderFromModal = function(e){
		var counterId = $(this).attr('data-item-id');
		var method = $(this).attr('data-method');
		var item = JSON.parse(JSON.stringify(findItemByCounterId(counterId).item));
		item.qty = method == "add" ? 1 : -1;
		updateOrder(item);
		updateOrderDisplay(counterId);
	}

	var refreshUI = function(){
		updateOrderPanel();
		showReviewModal();
	}

	var updateOrderDisplay = function(counterId) {
		// then update the UI with the new totals
		refreshUI();
		// and again show the sub-dropdown menu
		$('.order-list-item[data-item-id="'+counterId+'"]')
			.find('.order-list-sub-menu')
			.css({'display': 'flex'})
			.parent()
			.find('.fa')
				.toggleClass('fa-pencil')
				.toggleClass('fa-chevron-down');
	}

	var deleteOrderFromModal = function(){
		var counterId = $(this).attr('data-item-id');
		var index = findItemByCounterId(counterId).index;
		if(confirm('Are you sure you want to delete this item?')){
			ORDER.remove(index);
		} else {
			return false;
		}
		updateOrderDisplay(counterId);
	}


	var closeModal = function(){
		$('.order-modal').fadeOut('fast');
	}

	var validateExpiryDate = function(e){
		var val = $(this).val();
			val = val.replace(/[^0-9\/]/g, ''); // removes all text values, except slash
			$(this).val(val); // replace regardless of rest of logic (remove letters etc)
		if(allowedKeyCodes.indexOf(e.keyCode) !== -1 || val.length < 2){
			return false;
		} else if(val.length == 2){
			val += '/';
		}

		if(val.indexOf('/') === -1 && val.length >= 2){
			val = val.slice(0,2) + "/" + val.slice(2, val.length);
		}
		// camt be longer than 5 - including the '/'
		val = (val.length >= 5) ? val.slice(0,5) : val;
		$(this).val(val);
	}

	var validateCSV = function(e){
		var val = $(this).val();
			val = val.replace(/[^0-9]/g, ''); // removes all text values
			val = (val.length > 3) ? val.slice(0,3) : val;
		$(this).val(val); // replace regardless of rest of logic (remove letters etc)
	}

	var validateCoupon = function(e){
		var coupon = $(this).val().replace(/[^a-zA-Z0-9]/gi,'');

		if(coupon.length === COUPON_LENGTH){
			var address = API_URL + 'coupon/' + coupon;
			if(self.fetch){
				fetch(address).then(function(data){
					return data.json();
				}).then(function(data){
					orderForm.coupon = data;
					refreshUI();
				});
			} else {
				// ajax fallback
				$.ajax({
					url: address,
					method: 'GET',
					success: function(data){
						orderForm.coupon = JSON.parse(data);
						refreshUI();
					},
					error: function(err){
						console.log(err);
					}
				});
			}
		} else {
			orderForm.coupon = '';
			$('.coupon-applied').html('');
			refreshUI();
		}
	}

	var validateOrder = function(){
		$('input').removeClass('invalid-input');
		var isValid = true;
		
		if(orderForm.paymentMethod !== 'cc' && orderForm.paymentMethod !== 'cash'){
			console.log('error: payment');
			isValid = false;
		}

		if(orderForm.orderFor === 'delivery' && orderForm.address1.length <= 0){
			console.log('error: address');
			isValid = false;
			$('.address-line-1').addClass('invalid-input');
		}

		if(orderForm.name.length <= 0){
			console.log('error: name');
			isValid = false;
			$('.user-name').addClass('invalid-input');
		}
		if(orderForm.mobile.length <= 0){
			console.log('error: mobile');
			isValid = false;
			$('.mobile-number').addClass('invalid-input');
		}

		if(orderForm.paymentMethod === 'cc'){
			// Taken from https://en.wikipedia.org/wiki/Payment_card_number
			if(orderForm.ccno.length < 12 || orderForm.ccno.length > 19){
				console.log('error: ccno');
				isValid = false;
				$('.cc-no').addClass('invalid-input');
			}

			if(orderForm.exp.length !== 5){
				console.log('error: expdate');
				isValid = false;
				$('.exp-input').addClass('invalid-input');
			}
			if(orderForm.csv.length !== 3){
				console.log('error: csv');
				isValid = false;
				$('.csv-input').addClass('invalid-input');
			}
		}


	return isValid;
	}

	var placeOrder = function(){
		var address = API_URL + 'order/';
		var method = 'POST';

		if(validateOrder()){
			var finalOrder = {};
				finalOrder.orderForm = orderForm;
				finalOrder.order = ORDER;
			$.ajax({
				url: address,
				method: method,
				data: JSON.stringify(finalOrder),
				contentType: 'application/json', 
				success: function(data){
					$('.order-placed').fadeIn();
				},
				error: function(err){
					console.log(err);
				}
			});
		}		
	}

	var getAllOrders = function(){

		var address = API_URL + 'orders/';

		$.ajax({
			url: address,
			method: 'GET',
			contentType: 'application/json',
			success: function(data){
				console.log(data);
			},
			error: function(err){
				console.log(err);
			}
		});
	}

	var updateAddress = function(){
		var key = $(this).attr('data-order-form');
		orderForm[key] = $(this).val();
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
		$('.order-placed button').on('click', function(){
			clearOrder();
			$('.order-placed').fadeOut();
		});
		
		$('.place-order-btn').on('click', placeOrder);
		$('input[name="payment-method"],input[name="payment-method-desktop"]').on('change', updatePaymentMethod);
		$('input[name="order-for"],input[name="order-for-desktop"]').on('change', updateDeliveryMethod);
		$('.order-collect-at').on('change', updateDeliveryTime);
		$('.exp-input').on('keyup', validateExpiryDate);
		$('.csv-input').on('keyup', validateCSV);
		$('.coupon-code').on('keyup', validateCoupon);
		$('.address-line-1, .address-line-2').on('keyup', updateAddress);
		$('button[data-modal-page]').on('click', initModalNavigation);
		$('.modal-input-text').on('keyup', validateFormInput);

		populateOrderTimes();
	});

	return {
		getOrderForm: function(){
			console.log(orderForm);
		},
		getAllOrders: getAllOrders,
		orderForm: orderForm,
		order: ORDER,
		orderCounter: orderCounter,
		modalPages: modalPages,
		findItemByCounterId: findItemByCounterId,
		clearOrder: clearOrder,
		updateOrderPanel: updateOrderPanel,
		hideOrderPanel:hideOrderPanel,
		showOrderPanel: showOrderPanel,
		updateOrder: updateOrder,
		getOrderIndex: getOrderIndex,
		addToOrder: addToOrder,
		removeFromOrder: removeFromOrder,
		getOrder: getOrder,
		getOrderTotal: getOrderTotal,
		showSubListMenu: showSubListMenu,
		addSubListMenu: addSubListMenu,
		checkOrderLength: checkOrderLength,
		showReviewModal: showReviewModal,
		setOrderHTML: setOrderHTML,
		generateOrderListHTML: generateOrderListHTML,
		updateDesktopUI: updateDesktopUI,
		initModalNavigation: initModalNavigation,
		updateDeliveryTime: updateDeliveryTime,
		updateDeliveryMethod: updateDeliveryMethod,
		validateFormInput: validateFormInput,
		updatePaymentMethod: updatePaymentMethod,
		getDefaultOrderTime: getDefaultOrderTime,
		formatOrderTime: formatOrderTime,
		populateOrderTimes: populateOrderTimes,
		changeOrderFromModal: changeOrderFromModal,
		updateOrderDisplay: updateOrderDisplay,
		deleteOrderFromModal: deleteOrderFromModal,
		closeModal: closeModal
	}
})();