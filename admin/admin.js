var API_URL =  API_URL || 'http://127.0.0.1:1337/' ;
var orderKeys = [];
var continuePolling = true;

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
		for(var i = 0; i < orderKeys.length; i++){
			var orderKey = orderKeys[i];
			var value = order[orderKey];
				if(orderKey === 'time' || orderKey === 'orderedAt'){
					var date =  new Date(+value);
					value = formatOrderTime(date.getTime());
					value += ' ' + date.getDate() + '/' + (+date.getMonth()+1) + '/' + date.getFullYear().toString().slice(2,4);
				}
				
				html += '<div class="table-col order-col ' + orderKey + '">';
				html += value;
				html += '</div>';
		}
		return html;
	};

	var addTitleRow = function(html){
		html += '<div class="table-row title-row">';
			for(var i = 0; i < orderKeys.length; i++){
				var orderKey = orderKeys[i];
				html += '<div class="table-col title-col ' + orderKey + '">';
				html += orderKey;	
				html += '</div>';
			}
		html += '</div>';
		return html;
	};
	
	var displayOrders = function(orders){
		console.log(orders);
		var ordersHTML = '';

		orderKeys = Object.keys(orders[0]);

		ordersHTML = addTitleRow(ordersHTML);

		for(var i = 0; i<orders.length; i++){
			var order = orders[i];
			ordersHTML += '<div class="table-row order-row">';
				ordersHTML = wrapOrderElement(order, ordersHTML);
			ordersHTML += '</div>';
		}

		$('.orders').html(ordersHTML);
	};

	var startPolling = function(){
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
	});