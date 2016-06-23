describe('Order', function(){
	var item = {
		Title: "Example Item",
		Price: 10.5,
		qty: 1,
		Id: 123,
		extra: {
			name: "sauce",
			price: 0.5
		}

	};
	beforeEach(function(){
		ORDER = [];
	});

	it('Should add item to order', function(){
		updateOrder(item);
		expect(getOrderTotal()).toEqual('11.00');
		expect(ORDER[0].Title).toEqual('Example Item');
	});

	it('Should add multiple item prices to make total', function(){
		updateOrder(item);
		updateOrder(item);
		updateOrder(item);
		expect(getOrderTotal()).toEqual('33.00');
	});
});
