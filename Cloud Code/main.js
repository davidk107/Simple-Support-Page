// BugReport Class
var BugReportClass = Parse.Object.extend("BugReport");

// Feedback Class
var FeedbackClass = Parse.Object.extend("Feedback");

// Before saving a BugReport
Parse.Cloud.beforeSave("BugReport", function(request, response)
{
	
	// Get the new report
	var report = request.object;

	// Assign issue number to newly created Bug Reports
	if (report.existed())
	{
		response.success();
		return;
	}
	// If new report, but with an already assigned issueNumber, then reject it
	else if (report.get("issueNumber"))
	{
		response.error();
		return;
	}
	// Else assign it 
	// Query for the last created report and retrieve its issue number
	var lastCreatedReportQuery = new Parse.Query(BugReportClass);
	lastCreatedReportQuery.descending("createdAt");
	lastCreatedReportQuery.first().then(function(lastCreatedReport)
	{
		// Get the last created report and assign an issue number based on it
		var issueNumber = 1;

		// If report exists, then use that else start from 1
		if (lastCreatedReport != null)
		{
			issueNumber = lastCreatedReport.get("issueNumber") + 1;
		}
			
		// Set the issueNumber
		report.set("issueNumber",issueNumber);

		// Done
		response.success();
	},
	// Error handler
	function(error)
	{
		report.set("issueNumber", -1);
		response.success();
	});
});

// Before saving a Feedback
Parse.Cloud.beforeSave("Feedback", function(request, response)
{
	// Get the new feedback
	var feedback = request.object;

	// Assign issue number to newly created Bug Reports
	if (feedback.existed())
	{
		response.success();
		return;
	}
	// If new report, but with an already assigned issueNumber, then reject it
	else if (feedback.get("feedbackNumber"))
	{
		response.error();
		return;
	}

	// Query for the last created feedback and retrieve its feedback number
	var lastCreatedFeedbackQuery = new Parse.Query(FeedbackClass);
	lastCreatedFeedbackQuery.descending("createdAt");
	lastCreatedFeedbackQuery.first().then(function(lastCreatedFeedback)
	{
		// Get the last created feedback and assign an feedback number based on it
		var feedbackNumber = 1;

		// If feedback exists, then use that else start from 1
		if (lastCreatedFeedback != null)
		{
			feedbackNumber = lastCreatedFeedback.get("feedbackNumber") + 1;
		}
			
		// Set the feedback
		feedback.set("feedbackNumber",feedbackNumber);

		// Done
		response.success();
	},
	// Error handler
	function(error)
	{
		feedback.set("feedbackNumber", -1);
		response.success();
	});
});


