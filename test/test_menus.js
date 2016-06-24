describe('Menu', function(){
	var menu = [  
      	{  
         	"Id":199,
         	"Title":"Starters",
         	"Items":[  
            	{  
               		"Id":958,
               		"Title":"101 Siam Harbourside Mixed Starters",
               		"Description":"A selection of authentic Thai starters, served with a variety of sauces.\n(minimum order is for two people)",
               		"Price":13.95,
               		"HasVariation":false,
               		"HasExtras":false,
               		"Variations":[  
                  		{  
                     		"Id":2590,
                     		"Title":"101 Siam Harbourside Mixed Starters",
                     		"Price":13.95,
                     		"HasExtras":false
                  		}
               		]
            	},
            	{  
               		"Id":959,
               		"Title":"102 Goong nam peung ",
               		"Description":"King prawn deep fried in Chef’s special coconut batter, coated with honey and sesame seeds.",
               		"Price":5.95,
               		"HasVariation":false,
               		"HasExtras":false,
               		"Variations":[  
                  		{  
                     		"Id":1356,
                     		"Title":"102 Goong nam peung ",
                     		"Price":5.95,
                     		"HasExtras":false
                  		}
               		]
            	},
    		]
    	}
    ];
    
	beforeEach(function(){
		spyOn($.fn,"show");
		spyOn($.fn,"hide");
		spyOn($.fn,"html");
		$.fn.html.calls.reset();
		$.fn.show.calls.reset();
		$.fn.hide.calls.reset();
	});

	it('should populate menu with items', function(){
		menuAPI.populateMenu(menu);
		expect($.fn.html.calls.mostRecent().args[0].indexOf("menu-item-list")>=0).toBeTruthy();
	});
});


