// ****************************************************************************
// Data Access Object for CRUD operations against the database.
//
// ****************************************************************************


// Imports.
var mongoose = require("mongoose");

// Define database schemas for all entities.
var schemas = {
  list : mongoose.Schema({
    name:"string", date:"string",
	description:"string"
  }),
  deal : mongoose.Schema({
    name:"string", 
	price:"number", storeName:"string",
	location:"string", expirationDate:"date",
	description:"string",category:"string"
  }),
  
/*  following removed from deal schema temporarily
	upCount:"number", downCount:"number",
	user:"string", dateAdded:"date"
  }),
*/  
  
  user : mongoose.Schema({
    name:"string", password:"string",
	loginAttempts:"number", list: []
  })
};


// Define database models for all entities.
var models = {
  list : mongoose.model("list", schemas.list),
  deal : mongoose.model("deal", schemas.deal),
  user : mongoose.model("user", schemas.user),
}


// Connect to database.
mongoose.connect("localhost", "MyEZShopper");


/**
 * POST: (C)reate.
 *
 * @param opType  The type of operation (appointment, contact, note or task).
 * @param dataObj The data object built during the core server processing.
 */
function POST(opType, dataObj) {

  console.log(dataObj.id + ": DAO.POST() - CREATE : " + opType);
  
  var obj = new models[opType](dataObj.data);
  
  if (opType == "user"){
	
	var newUser = {};
	newUser["name"] = dataObj.data["name"];
	  
	//see if the username already exists
	models[opType].findOne(newUser, function(err, user){
		if (err){
			console.log("ERROR: " + err);
			completeResponse(dataObj, 500, "text", "");
		}else if (!user && dataObj.data["type"]=="register"){
			//new registration
			 console.log(dataObj.id + ": obj: " + JSON.stringify(obj));
				obj.save(function (inError, inObj) {
				if (inError) {
				throw "Error: " + JSON.stringify(inError);
				} else {
				  console.log(dataObj.id + ": Success: " + inObj._id);
				  completeResponse(dataObj, 200, "text", "" + inObj._id);
				}
			});
		}else if (user){
			  console.log("userName exists!");
			  
			  newUser["password"] = dataObj.data["password"];
			  
			  //check if password matches
			  if (newUser.password == user.password && dataObj.data["type"]=="login"){
				  console.log("PASSWORD and NAME MATCH!!");
				  //todo reset number of login attempts
				  completeResponse(dataObj, 200, "text", "" + user._id);
			  }else{
				console.log("PASSWORD and NAME DO NOT MATCH!!");
				//Password reset will be here
				
				
				completeResponse(dataObj, 403, "text", ""); 
			  }
			  

		}else{
			console.log("LOGIN ATTEMPT w/ invalid credentials");
			completeResponse(dataObj, 404, "text", "");
		}		
	});
	  
  }
  else{
    console.log(dataObj.id + ": obj: " + JSON.stringify(obj));
    obj.save(function (inError, inObj) {
    if (inError) {
      throw "Error: " + JSON.stringify(inError);
    } else {
      console.log(dataObj.id + ": Success: " + inObj._id);
      completeResponse(dataObj, 200, "text", "" + inObj._id);
    }
  });
  }

} // End POST().


/**
 * GET: (R)ead.
 *
 * @param opType  The type of operation (list, appointment, or user).
 * @param dataObj The data object built during the core server processing.
 */
function GET(opType, dataObj) {

  console.log(dataObj.id + ": DAO.GET() READ : " + opType);
  

	models[opType].findById(dataObj.ident,
      function (inError, inObj) {
        if (inError) {
          throw "Error: " + JSON.stringify(inError);
        } else {
          if (inObj == null) {
            console.log(dataObj.id + ": Object not found");
            completeResponse(dataObj, 404, "json", "");
          } else {
            console.log(dataObj.id + ": Success: " + JSON.stringify(inObj));
            completeResponse(dataObj, 200, "json", JSON.stringify(inObj));
          }
        }
      }
    );

} // End GET().


/**
 * Called from GET when no ID is passed.  Returns all items.
 *
 * @param dataObj The data object built during the core server processing.
 */
function GET_ALL(opType, dataObj) {

  console.log(dataObj.id + ": DAO.GET_ALL(): " + opType);

  // Set up sorting of results.  This doesn't actually matter since we
  // effectively lose this order once it hits localStorage on the client, but
  // it's good to see how to do this none the less.
  var opts = { sort : { } };
  switch (opType) {
    case "list":
      opts.sort.name = 1;
    break;
    case "deal":
      opts.sort.expirationDate = 1;
    break;
  }
  
  //Check if query value contains multiple words
  var qv = "";
  if (dataObj.queryValue == null){
	  qv = null; 
  }else if (dataObj.queryValue.indexOf('+') != - 1){
	  //Need to tokenize dataObj.queryValue
	  var tokens = dataObj.queryValue.split('+');
	  for (index in tokens){
		  qv += tokens[index] + ' ';
	  }
	  //trim off last space
	  qv = qv.substring(0, qv.length - 1);
  }
  else{
	  qv = dataObj.queryValue;
  }
	  
  //Create an object for the query
  //If dataObj.query and dataObj.querValue are null, then all records retrieved
  //Otherwise, the query will be executed returning desired records.
  var condition = {};
  condition[dataObj.query] = qv;
  
    if (opType == "user"){
	  completeResponse(dataObj, 401, "", "");
    }else{
      models[opType].find(condition, null, opts, function (inError, inObjs) {
        if (inError) {
        throw "Error: " + JSON.stringify(inError);
	    } else {
          console.log(dataObj.id + ": Success: " + JSON.stringify(inObjs));
          completeResponse(dataObj, 200, "json", JSON.stringify(inObjs));
        }
      });		
	}
  } // End GET_ALL().


/**
 * PUT: (U)pdate.
 *
 * @param opType  The type of operation (list, appointment, or user).
 * @param dataObj The data object built during the core server processing.
 */
function PUT(opType, dataObj) {

  console.log(dataObj.id + ": DAO.PUT() UPDATE : " + opType);

  models[opType].findByIdAndUpdate(dataObj.ident, dataObj.data, { },
    function (inError, inObj) {
      if (inError) {
        throw "Error: " + JSON.stringify(inError);
      } else {
        console.log(dataObj.id + ": Success");
        completeResponse(dataObj, 200, "text", "" + inObj._id);
      }
    }
  );

} // End PUT().


/**
 * DELETE: (D)elete.
 *
 * @param opType  The type of operation (list, appointment, or user).
 * @param dataObj The data object built during the core server processing.
 */
function DELETE(opType, dataObj) {

  console.log(dataObj.id + ": DAO.DELETE() DELETE: " + opType);

  models[opType].findByIdAndRemove(dataObj.ident,
    function (inError, inObj) {
      if (inError) {
        throw "Error: " + JSON.stringify(inError);
      } else {
        console.log(dataObj.id + ": Success");
        completeResponse(dataObj, 200, "text", "" + inObj._id);
      }
    }
  );

} // End DELETE().


/**
 * Clears ALL data from the database.
 *
 * @param dataObj The data object built during the core server processing.
 */
function CLEAR_DATA(dataObj) {

  console.log(dataObj.id + ": DAO.CLEAR_DATA()");

  models.appointment.remove({}, function(inError) {
    if (inError) {
      throw "Error: " + JSON.stringify(inError);
    } else {
      models.contact.remove({}, function(inError) {
        if (inError) {
          throw "Error: " + JSON.stringify(inError);
        } else {
          models.note.remove({}, function(inError) {
            if (inError) {
              throw "Error: " + JSON.stringify(inError);
            } else {
              models.task.remove({}, function(inError) {
                if (inError) {
                  throw "Error: " + JSON.stringify(inError);
                } else {
                  console.log(dataObj.id + ": Success");
                  completeResponse(dataObj, 200, "text", "");
                }
              });
            }
          });
        }
      });
    }
  });

} // End CLEAR_DATA().


// Make functions available outside of this module.
exports.POST = POST;
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.GET_ALL = GET_ALL;
exports.CLEAR_DATA = CLEAR_DATA;
