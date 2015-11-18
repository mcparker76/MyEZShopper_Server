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

mongoose.connect("localhost", "MyEZShopper");

var cronJob = cron.job('* */3 * * * *', function(){
	
	var t = moment();
	console.log(moment().zone(300).format());
	var currDate = new Date(moment().format());

	//var currDate = new Date();
	console.log("CURR DATE: " + currDate.getTime());
	console.log("Month: " + (currDate.getMonth()+1));
	console.log("Day: " + currDate.getDate());
	console.log("Year: " + currDate.getFullYear());

	var expDate = new Date(Date.parse((currDate.getMonth() + 1) + "-" + currDate.getDate() + "-" + currDate.getFullYear()));
	
	console.log("EXP DATE: " + expDate.toLocaleDateString());
	
	deal.find({expirationDate: {$lt:expDate}}).remove().exec();
	/*
	deal.remove({expirationDate:expDate}, function(err){
		if (err){ return handleError(err);console.log("ERROR");}
	});*/
	
    console.info('cron job completed');
}); 

cronJob.start();