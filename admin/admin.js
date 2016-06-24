var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;
var orderKeys = [];
var continuePolling = true;
var orderCounter = 1;
var ORDERS = [];

///////////////////////////////////////////////////////

	var getAllOrders = function(){
		var url = API_URL + 'orders/';
		$.ajax({
			url: url,
			method: 'GET',
			success: function(data){
				data = JSON.parse(data);
				if(data.length > 0){
					displayOrders(data);
				} else {
					$('.loading-spinner').html('no orders found');
				}
			}
		})
	};

	var formatOrderTime = function(time){
		var date = new Date(time);
		var hours = (date.getHours().toString().length === 1) ? '0' + date.getHours() : date.getHours();
		var mins = (date.getMinutes().toString().length === 1) ? '0' + date.getMinutes() : date.getMinutes();
		return hours + ':' + mins;
	}

	var wrapOrderElement = function(order, html){
		
		html += '<div class="order-title-row">';
		html += '#' + orderCounter;
		html += '</div>';

		orderCounter++;

		for(var i = 0; i < orderKeys.length; i++){
			var orderKey = orderKeys[i];
			var value = order[orderKey];
				if(orderKey === 'time' || orderKey === 'orderedAt'){
					var date =  new Date(+value);
					value = formatOrderTime(date.getTime());
					value += ' ' + date.getDate() + '/' + (+date.getMonth()+1) + '/' + date.getFullYear().toString().slice(2,4);
				}
				value = (orderKey === "orderTotal") ? '&euro;' + (+value).toFixed(2) : value;
				html += '<div class="order-block">';

					html += '<span class="order-row-label ' + orderKey + '-label key-label">';
					html += orderKey;
					html += ': </span>';
					
					html += '<span class="order-row ' + orderKey + '">';
					html += value;
					html += '</span>';

				html += '</div>';
		}
		return html;
	};

	
	var displayOrders = function(orders){
		ORDERS = orders;
		console.log(ORDERS);
		var ordersHTML = '';

		orderKeys = Object.keys(ORDERS[0].orderForm);

		for(var i = 0; i<ORDERS.length; i++){
			var order = ORDERS[i].orderForm;
			var orderItems = ORDERS[i].order;
			ordersHTML += '<div class="table-row order-row" data-order-number="' + i + '">';
				ordersHTML = wrapOrderElement(order, ordersHTML);
			ordersHTML += '</div>';
		}

		$('.orders').html(ordersHTML);
		resetListeners();
	};

	var resetListeners = function(){
		$('[data-order-number]').off('click');
		$('[data-order-number]').on('click', function(){
			var orderNo = $(this).attr('data-order-number');
			var order = ORDERS[orderNo].order;
			var html = '';

			html += '<div class="dialog-order">';
			for(var i=0; i<order.length; i++){
				var ord = order[i];
				html += '<div class="dialog-order-title">';
					html += ord.Title;
					html += '<span class="dialog-order-extra"> w/ ';
					html += ord.extra.name;
					html += '</span>';
					html += '<span class="dialog-order-qty"> x';
					html += ord.qty;
					html += '</span>';
				html += '</div>';
			}
			html += '</div>';
			$('.order-space').html(html);
			$('.order-display-wrapper').fadeIn();
			console.log(order);
		});
	};

	var startPolling = function(){
		orderCounter = 1;
		console.log('Polling...');
		continuePolling = true;
		getAllOrders();
		setTimeout(function(){
			if(continuePolling){
				startPolling();
			}
		}, 3000);
	};

	var stopPolling = function(){
		continuePolling = false;
	};

	$(document).ready(function(){
		startPolling();

		$('.stop-polling').on('click', stopPolling);
		$('.start-polling').on('click', startPolling);
		$('.close-dialog').on('click', function(){
			$('.order-display-wrapper').fadeOut();
		});
		$(document).on('keyup', function(e){
	    	if (e.keyCode == 27) { // escape key maps to keycode `27`
	     		$('.order-display-wrapper').fadeOut();
	     	}
		});
	});