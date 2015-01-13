// Class used for loading bug reports into the browser and storing it into sessionStorage
function AdminDataLoader()
{
	// Save the userObjectID
	this.userObjectID = Parse.User.current().id;

	// Save the username
	this.username = Parse.User.current().get("username");

	// List of all the bug reports
	this.bugReports = [];
}

AdminDataLoader.prototype.refreshData = function() 
{
	// Clear sessionStorage
	sessionStorage.clear();

	// Retreive data
	this.retrieveData();
};

// Retreives all bug reports from parse
AdminDataLoader.prototype.retrieveData = function() 
{
	// Get this
	var currentObject = this;

	// Create Bug Report Class
	var BugReport = Parse.Object.extend("BugReport");

	// Create Query
	var getAllBugReportsQuery = new Parse.Query(BugReport);

	// Get only issueNumber, title, frequency, hasAttachment, and assignee
	getAllBugReportsQuery.select("issueNumber","title","frequency","hasAttachments","assignee","status");

	// Execute Query
	getAllBugReportsQuery.find().then(function(results)
	{
		// Save the results
		currentObject.bugReports = results;

		// Data is received, parse and store it
		currentObject.parseAndStoreBugReportData();

		// Query for feedback
		var FeedbackReport = Parse.Object.extend("Feedback");
		feedbackQuery = new Parse.Query(FeedbackReport);
		feedbackQuery.select("feedbackNumber", "feedbackText");
		return feedbackQuery.find();

	}).then(function(feedbacks)
	{
		// Save the results
		currentObject.feedbackReports = feedbacks;

		currentObject.parseAndStoreFeedbackReportData();

		// Data Loaded
		currentObject.dataLoaded();
	});
};

AdminDataLoader.prototype.parseAndStoreFeedbackReportData = function()
{
	// Arrays to store all feedback reports
	var allFeedbackReports = [];

	// Loop through feedbacks and parse them into the array
	for (var i = 0; i < this.feedbackReports.length; ++i)
	{
		// Create Feedback object
		var feedbackReport = new FeedbackReportJSObject(this.feedbackReports[i]);
		allFeedbackReports.push(feedbackReport);
	}

	this.storeDataIntoSessionStorage([allFeedbackReports],["allFeedbackReports"]);
}

// Parse the data and store it into sessionStorage
AdminDataLoader.prototype.parseAndStoreBugReportData = function() 
{
	// Arrays to store and separate all the data in the form of BugReport Javascript Class Objects
	var allOpenIssues = [];
	var allClosedIssues = [];

	// Arrays to store array indexes to allOpen and allClosed Issues
	var myOpenIssues = [];
	var myClosedIssues = [];

	// Loop through bugReports and put them into their respective arrays
	for (var i = 0; i < this.bugReports.length; ++i)
	{
		// Create a BugReport object from given index
		var bugReport = new BugReportJSObject(this.bugReports[i]);
		// Check if open or closed
		if (bugReport.status == "Open")
		{
			allOpenIssues.push(bugReport);

			// Check if assigned to current user
			if (bugReport.assignee == this.username)
			{
				myOpenIssues.push(allOpenIssues.length - 1);
			}
		}
		else
		{
			allClosedIssues.push(bugReport);

			// Check if assigned to current user
			if (bugReport.assignee == this.username)
			{
				myClosedIssues.push(allClosedIssues.length - 1);
			}
		}
	}

	// Store arrays into sessionStorage
	this.storeDataIntoSessionStorage([allOpenIssues, allClosedIssues, myOpenIssues, myClosedIssues], ["allOpenIssues", "allClosedIssues", "myOpenIssues", "myClosedIssues"]);
};

AdminDataLoader.prototype.storeDataIntoSessionStorage = function(dataList, nameList)
{
	for (var i = 0; i < dataList.length; ++i)
	{
		sessionStorage.setItem(nameList[i], JSON.stringify(dataList[i]));
	}
}

AdminDataLoader.prototype.dataLoaded = function()
{
	// Set dataIsLoaded to true
	dataIsLoaded = true;
};

// ------------------ BugReport Javascript Class ------------------ //
function BugReportJSObject(parseBugReportObject)
{
	// Get the object ID
	this.objectID = parseBugReportObject.id;

	// Get the Issue #
	this.issueNo = parseBugReportObject.get("issueNumber");

	// Get the title
	this.title = parseBugReportObject.get("title");

	// Get the Frequency
	this.frequency = parseBugReportObject.get("frequency");

	// Get the status
	this.status = parseBugReportObject.get("status");

	// Get the assignee
	this.assignee = parseBugReportObject.get("assignee");

	// Get if has attachments
	this.hasAttachments = parseBugReportObject.get("hasAttachments") ? "Yes":"No";
}

// ------------------ FeedbackReport Javascript Class ------------------ //
function FeedbackReportJSObject(parseFeedbackReportObject)
{
	// Get the object id
	this.objectID = parseFeedbackReportObject.id;

	// Get the Feedback #
	this.feedbackNo = parseFeedbackReportObject.get("feedbackNumber");

	// Get text
	this.feedbackText = parseFeedbackReportObject.get("feedbackText");
}

