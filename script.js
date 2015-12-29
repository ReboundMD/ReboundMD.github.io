/*******************************************
* get all desktop and laptop devices and fill
* the workstations element with those values
*******************************************/
function loadDevices(){
	var card = new SW.Card();
	var inventory = card.services('inventory');
	
	var tempWorkstations = [];

	// get all desktops in inventory
	inventory.request('devices', {device_type:"Desktop"
					}).then(function(data){
						// put all desktops in an array	
						for (var i = 0; i < data.devices.length; i++){
							tempWorkstations.push("<option value='" + data.devices[i].name + "'>")
						}
						
						// get all laptops in inventory
						inventory.request('devices', {device_type:"Laptop"
										}).then(function(data){
											// put all laptops in an array
											for (var i = 0; i < data.devices.length; i++){
												tempWorkstations.push("<option value='" +  data.devices[i].name + "'>")
											}
											
											// sort the dataset
											var tempWorkstations2 = tempWorkstations.sort();
											
											// clear out the placeholder
											$('#workstations').empty();
											
											// fill the html list
											for (i = 0; i < tempWorkstations2.length; i++){
												$('#workstations').append(tempWorkstations2[i]);
											}
											
										});
					});
}

/*******************************************************
* Find the asset related to the ticket and then submit the ticket
*******************************************************/
function findAsset() {
	var assetName = document.forms['ticketDetails']['relatedTo'].value;
	var asset = {};
	var ticketSummary = document.forms['ticketDetails']['description'].value;
	var ticketDetails = document.forms['ticketDetails']['extras'].value;

	console.clear();
	
	var card = new SW.Card();
	var inventory = card.services('inventory');
	
	inventory.request('devices', {
	search: {
		query: {
		terms: [assetName]
		},
		fields: {
		names: ['name'],
		operator: 'and'
		}
	}
	}).then(function(data) {
		// if the requested object isn't a device, look for software
		if (data.devices.length == 0)
		{
			inventory.request('software',{name:assetName}).then(function(){
																			console.log("searched for software");
																			console.log("Looking at:" + JSON.stringify(data.devices[1]));
																			var assetID = data.software[0].id;
																			//console.log("'Asset' is now " + data.software[0].id);
																			if(assetID > "0")
																			{
																				card.services('helpdesk').request('ticket:create',{'summary':ticketSummary,'description':ticketDetails,'inventory_items':[{'id':assetID,'type':'software'}]}).then(function(data){
																							console.log("Ticket created!")
																							// clear the form after ticket creation
																							document.forms['ticketDetails']['contact'].value = '';
																							document.forms['ticketDetails']['description'].value = '';
																							document.forms['ticketDetails']['relatedTo'].value = '';
																							document.forms['ticketDetails']['extras'].value = '';
																							
																						});
																			}
																			else
																			{
																				card.services('helpdesk').request('ticket:create',{'summary':ticketSummary,'description':ticketDetails}).then(function(data){
																							console.log("Ticket created!")
																							// clear the form after ticket creation
																							document.forms['ticketDetails']['contact'].value = '';
																							document.forms['ticketDetails']['description'].value = '';
																							document.forms['ticketDetails']['relatedTo'].value = '';
																							document.forms['ticketDetails']['extras'].value = '';
																							
																						});
																			}
																			
																		})
		}
		else
		{
			var assetID = data.devices[0].id;
			var assetType = data.devices[0].type;
			card.services('helpdesk').request('ticket:create',{'summary':ticketSummary,'description':ticketDetails,'inventory_items':[{'id':assetID,'type':assetType}]}).then(function(data){
				console.log("Ticket created!")
				// clear the form after ticket creation
				document.forms['ticketDetails']['contact'].value = '';
				document.forms['ticketDetails']['description'].value = '';
				document.forms['ticketDetails']['relatedTo'].value = '';
				document.forms['ticketDetails']['extras'].value = '';
				
			});
		}
		
	},
	// error logging
	function(error){console.log("device lookup errored")});
};
