//Parse initialize
Parse.initialize("VDsb6f3XOgG9w2G0Tbqd9iubJxKFTxveHCd8nwtP", "UDjT4ktfGjewHqoic96nLaEZW4uc321rruQJK1J6");

// Class used for loading bug reports into the browser and storing it into sessionStorage
function ViewFeedbackDataLoader(issueNo)
{
	// Save the userObjectID
	this.issueNo = issueNo;

	// Create the report object
	this.parseObjectIssue;
}

ViewFeedbackDataLoader.prototype.retrieveData = function() 
{
	// Get this
	var currentObject = this;

	// Create Bug Report Class
	var FeedbackObject = Parse.Object.extend("Feedback");

	// Create Query
	var getFeedbackQuery = new Parse.Query(FeedbackObject);
	getFeedbackQuery.equalTo("feedbackNumber",parseInt(this.issueNo));

	// Execute Query
	getFeedbackQuery.first().then(function(result)
	{
		// Save the results
		currentObject.parseObjectIssue = result;

		// data is loaded
		dataIsLoaded = true;
	},
	// Error handler
	function(error)
	{
		return;
	});
};

ViewFeedbackDataLoader.prototype.getIssue = function() 
{
	return this.parseObjectIssue;
};