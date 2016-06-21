
var orderAPI = (function(){

	var ORDER = [];
	var orderCounter = 0;

	// this is an entire extras object {extras, extrasKeys}
	var extras = menuAPI.getExtras();

	var getOrderTotal = function(){
		console.log(ORDER);
		var orderTotal = 0;
		for(var i=0; i < ORDER.length; i++){
			var item = ORDER[i];
			var itemTotal = 0;
			itemTotal += item.Price;
			itemTotal += extras.extras[item.extra];
			orderTotal += (item.qty || 1) * itemTotal;
		}
		return orderTotal.toFixed(2);
	}

	var clearOrder = function(){
		ORDER = [];
	}

	var updateOrder = function(e){

		var ITEM = menuAPI.getCurrentItem();
			ITEM.qty = ITEM.qty || 1;
			ITEM.orderCounter = orderCounter; // unique identifier for object in order

		if(e.data.method === 'add'){
			console.log('Adding to order');
			ORDER.push(JSON.parse(JSON.stringify(ITEM)));
			orderCounter++;
		} else {
			console.log('Removing from order');
			ORDER.pop();
			orderCounter--;
		}
	}

	var getOrder = function(){
		return ORDER;
	}

	return {
		updateOrder: updateOrder,
		getOrderTotal: getOrderTotal
	}
})();