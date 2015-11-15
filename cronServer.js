var cron = require('cron');
var mongoose = require('mongoose');
var moment = require('moment');

var schema = new mongoose.Schema({
    name:"string", 
	price:"number", storeName:"string",
	location:"string", expirationDate:"date",
	description:"string",category:"string"
  });

var deal = mongoose.model('Deal', schema);

// Connect to database.
mongoose.connect("localhost", "MyEZShopper");

//database deletes entries from current date every 3 minutes
var cronJob = cron.job('0 */3 * * * *', function(){

	var currDate = new Date();
	console.log("Month: " + (currDate.getMonth()+1));
	console.log("Day: " + currDate.getDate());
	console.log("Year: " + currDate.getFullYear());
	
	var testing = moment(currDate.getTime()).utcOffset(-300).format('YYYY-MM-DD');
	console.log("TESTING: " + testing);
	currDate = new Date(testing);
	var expDate = Date.parse((currDate.getMonth() + 1) + "-" + currDate.getDate() + "-" + currDate.getFullYear());
	console.log(expDate);
	
	deal.remove({expirationDate:expDate}, function(err){
		if (err){ return handleError(err);console.log("ERROR");}
	});
	
    console.info('cron job completed');
}); 

cronJob.start();