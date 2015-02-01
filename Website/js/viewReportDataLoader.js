// Class used for loading bug reports into the browser and storing it into sessionStorage
function ViewReportDataLoader(issueNo)
{
	// Save the userObjectID
	this.issueNo = issueNo;

	// Create the report object
	this.parseObjectIssue;
}

ViewReportDataLoader.prototype.retrieveData = function() 
{
	// Get this
	var currentObject = this;

	// Create Bug Report Class
	var BugReport = Parse.Object.extend("BugReport");

	// Create Query
	var getBugReportQuery = new Parse.Query(BugReport);
	getBugReportQuery.equalTo("issueNumber",parseInt(this.issueNo));

	// Execute Query
	getBugReportQuery.first().then(function(result)
	{
		// Save the results
		currentObject.parseObjectIssue = result;

		// Sync Counter
		currentObject.syncCounter = 0;

		// If has attachments
		if (result.get("hasAttachments"))
		{	
			currentObject.syncCounter++;
			currentObject.retreieveAttachments();
		}
		if (result.get("hasComments"))
		{
			currentObject.syncCounter++;
			currentObject.retreiveComments();
		}
		else
		{
			// Call dataLoaded
			currentObject.dataLoaded();
		}
	},
	// Error handler
	function(error)
	{
		return;
	});
};

ViewReportDataLoader.prototype.retreiveComments = function() 
{
	// Get this
	var currentObject = this;

	// Get the relation
	var commentRelation = this.parseObjectIssue.relation("comments");

	// Get the query
	var commentRelationQuery = commentRelation.query();

	// Global variable to store comments
	window.commentsArray = [];

	// Load the comments
	commentRelationQuery.find().then(function(results)
	{
		for (var i = 0; i < results.length; ++i)
		{
			var comment = results[i];

			// Create JS object 
			var commentObject = {};
			commentObject["fromUsername"] = comment.get("fromUsername");
			commentObject["message"] = comment.get("message");
			commentObject["createdDate"] = comment.createdAt;

			commentsArray.push(commentObject);

			// Call Data Loaded
			currentObject.syncCounter--;
			currentObject.dataLoaded();
		}
	}, function(error)
	{
		return;
	});
};

ViewReportDataLoader.prototype.retreieveAttachments = function() 
{
	// Get this
	var currentObject = this;

	// Get the relation
	var imagesRelation = this.parseObjectIssue.relation("images");

	// Get the query for the image relation
	var imageRelationQuery = imagesRelation.query();

	// Global Variable to store image links
	window.imageLinksArray = [];

	// Load the images
	imageRelationQuery.find().then(function(results)
	{
		for (var i = 0; i < results.length; ++i)
		{
			var image = results[i];
			imageLinksArray.push(image.get("imageURL"));
		}

		// Call Data Loaded
		currentObject.syncCounter--;
		currentObject.dataLoaded();
	},
	// Error Handler
	function(error)
	{
		return;
	});
};

ViewReportDataLoader.prototype.dataLoaded = function()
{
	// If syncCounter is not 0, then do nothing
	if (this.syncCounter == 0)
	{
		// Set dataIsLoaded to true
		dataIsLoaded = true;
	}
	
};

ViewReportDataLoader.prototype.getIssue = function() 
{
	return this.parseObjectIssue;
};