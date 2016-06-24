describe('Order', function(){
	var item;

	beforeEach(function(){
		orderAPI.clearOrder();
		item = {
			Title: "Example Item",
			Price: 10.5,
			qty: 1,
			Id: 123,
			extra: {
				name: "sauce",
				price: 0.5
			}
		};
	})

	it('Should add item to order', function(){
		orderAPI.updateOrder(item);
		expect(orderAPI.getOrderTotal()).toEqual('11.00');
		expect(orderAPI.getOrder()[0].Title).toEqual('Example Item');
		expect(orderAPI.getOrder().length).toEqual(1);

	});

	it('Should add multiple item prices to make total', function(){
		orderAPI.updateOrder(item);
		orderAPI.updateOrder(item);
		orderAPI.updateOrder(item);
		expect(orderAPI.getOrderTotal()).toEqual('33.00');
	});

	it('Should remove item from order', function(){
		orderAPI.updateOrder(item);
		orderAPI.updateOrder(item);
		orderAPI.updateOrder(item);
		item.qty = -1;
		orderAPI.updateOrder(item);
		expect(orderAPI.getOrderTotal()).toEqual('22.00');
		orderAPI.updateOrder(item);
		orderAPI.updateOrder(item);
		expect(orderAPI.getOrderTotal()).toEqual('0.00');
		expect(orderAPI.getOrder()).toEqual([]);
	});

	it('Shouldnt update the order if the item has 0 quantity', function(){
		item.qty = 0;
		orderAPI.updateOrder(item);
		expect(orderAPI.getOrder()).toEqual([]);
	});

	it('Should update the ui after order addition', function(){
		orderAPI.updateOrder(item);
		orderAPI.refreshUI();
		expect(orderAPI.getOrder()).toEqual([]);
	});
});
