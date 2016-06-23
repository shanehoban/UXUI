
var orderAPI = (function(){

	var ORDER = [];
	var orderCounter = 0;

	// order form defaults
	var orderForm = {
		paymentMethod: 'cc',
		coupon: '',
		orderFor: 'collection',
		time: '',
		name: '',
		mobile: '',
		ccno: '',
		csv: '',
		address1: '',
		address2: ''
	};

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

	var clearOrder = function(){
		ORDER = [];
	}

	var updateOrderPanel = function(){

		if(ORDER.length <= 0){
			hideOrderPanel();
		} else {
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
			console.log('Adding to order');
			addToOrder(JSON.parse(JSON.stringify(ITEM)));
			// ORDER.push(JSON.parse(JSON.stringify(ITEM)));
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
		var totalHTML = 'Total: <span class="pull-right modal-total-price">&euro;' + getOrderTotal() + '</span>';
		$('.order-total-modal').html(totalHTML);
		$('.order-list').html(orderListHTML);
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
		orderForm.time = new Date(+timestamp);
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

		orderForm.time = new Date(+defaultTime);

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

	var updateOrderDisplay = function(counterId) {
		// then update the UI with the new totals
		updateOrderPanel();
		showReviewModal();
		// and again show the sub-dropdown menu
		$('.order-list-item[data-item-id="'+counterId+'"]')
			.find('.order-list-sub-menu')
			.css({'display': 'flex'})
			.parent().parent().find('.fa')
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
		$('input[name="payment-method"]').on('change', updatePaymentMethod);
		$('input[name="order-for"]').on('change', updateDeliveryMethod);
		$('.order-collect-at').on('change', updateDeliveryTime);
		$('button[data-modal-page]').on('click', initModalNavigation);
		$('.modal-input-text').on('keyup', validateFormInput);

		populateOrderTimes();
	});

	return {
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