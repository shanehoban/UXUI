describe('Locations', function(){

	beforeEach(function(){
		spyOn($.fn,"show");
		spyOn($.fn,"hide");
		spyOn($.fn,"html");
		$.fn.html.calls.reset();
		$.fn.show.calls.reset();
		$.fn.hide.calls.reset();
	});

	it('should generate location menu from locations array', function(){
		var locations = [{location: "Test One", menu: ""},{location: "Test Two", menu: ""}];
		locationAPI.populateLocations(locations);
		expect($.fn.html).toHaveBeenCalled();
	});

	it('should call jquery selector show methods after setting the location', function(){
		locationAPI.setLocation();
		expect($.fn.hide.calls.count()).toEqual(5);
		expect($.fn.show.calls.count()).toEqual(2);
	});

	it('should call jquery selector hide methods after change location', function(){
		locationAPI.changeLocation();
		expect($.fn.show.calls.count()).toEqual(3);
		expect($.fn.hide.calls.count()).toEqual(13);
	});
});