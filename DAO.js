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
    productName:"string", dateAdded:"date",
	price:"number", storeName:"string",
	location:"string", expirationDate:"string",
	description:"string",category:"string",
	upCount:"number", downCount:"number",
	user:"string"
  }),
  user : mongoose.Schema({
    name:"string", password:"string"
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
  console.log(dataObj.id + ": obj: " + JSON.stringify(obj));
  obj.save(function (inError, inObj) {
    if (inError) {
      throw "Error: " + JSON.stringify(inError);
    } else {
      console.log(dataObj.id + ": Success: " + inObj._id);
      completeResponse(dataObj, 200, "text", "" + inObj._id);
    }
  });

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
    case "user": case "list":
      opts.sort.name = 1;
    break;
    case "deal":
      opts.sort.productName = 1;
    break;
  }
	
  // Create conditions object to enable querying	
  var conditions = {
	query:null,
	queryValue:null
  }
  conditions.query = dataObj.query;
  conditions.queryValue =dataObj.queryValue;
  
	  
  models[opType].find(conditions, null, opts, function (inError, inObjs) {
    if (inError) {
      throw "Error: " + JSON.stringify(inError);
    } else {
      console.log(dataObj.id + ": Success: " + JSON.stringify(inObjs));
      completeResponse(dataObj, 200, "json", JSON.stringify(inObjs));
    }
  });

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
