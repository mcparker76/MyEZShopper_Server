var cron = require('cron');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name:"string", 
	price:"number", storeName:"string",
	location:"string", expirationDate:"date",
	description:"string",category:"string"
  });

var deal = mongoose.model('Deal', schema);

// Connect to database.
mongoose.connect("localhost", "MyEZShopper");
//database deletes entries from current date every 1 minute
var cronJob = cron.job('0 * * * * *', function(){

	var currDate = new Date();
	console.log("Month: " + (currDate.getMonth()+1));
	console.log("Day: " + currDate.getDate());
	console.log("Year: " + currDate.getFullYear());
    console.log("TZ Offset: " + currDate.getTimezoneOffset());
	var expDate = Date.parse((currDate.getMonth() + 1) + "-" + currDate.getDate() + "-" + currDate.getFullYear() + " 00:00");
	console.log(expDate);
	
	deal.remove({expirationDate:expDate}, function(err){
		if (err){ return handleError(err);console.log("ERROR");}
		else console.log("HERE");
	});
	
    console.info('cron job completed');
}); 

cronJob.start();