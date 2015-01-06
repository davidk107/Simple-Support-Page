//Parse initialize
Parse.initialize("3LfQqo1TAShUQ01SxhW4YkGp2ZuQGwtQZbtnaqhv", "UW3xdJypgbRXFqU2tisIYghtAAWB7uNOg33jGTKk");

// Call main function when document is loaded
$(document).ready(main);

// Main Function
function main()
{
	// When the submit button is pressed
	$("#submitButton").click(submitSuggestion);

	// When tab is pressed on steps to reproduce
	$("#suggestionsInputGroup").on("keydown",function (e)
	{
		if (e.which == 9)
		{
			$("#inputSuggestion").blur();
			$("#submitButton").focus();
			return false;
		}
	});

	// When tab is pressed on submit
	$("#submitButton").on("keydown",function (e)
	{
		if (e.which == 9)
		{
			$("#submitButton").blur();
			$("#inputSuggestion").focus();
			return false;
		}
	});
}

// Submit feedback
function submitSuggestion()
{
	// Change button to loading state
	$("#submitButton").button("loading");

	// Remove any has-error values from fields
	$("#suggestionsInputGroup").removeClass("has-error");
	
	// Remove any alerts
	$("#successAlert").addClass("hidden");
	$("#dangerAlert").addClass("hidden");

	// Get the Suggestions input value
	var suggestionsValue = $("#inputSuggestion").val().trim();

	// ----- Content Verification ----- //

	// Check Suggestions is not empty
	if (suggestionsValue == "")
	{
		$("#suggestionsInputGroup").addClass("has-error");
		$("#inputSuggestion").focus();
		showAlert(false,"You can not submit an empty suggestion!");
		return;
	}

	// ----- Inputs are valid, create report and save it to Parse ----- //
	// Get Feedback Class
	var FeedbackClass = Parse.Object.extend("Feedback");

	// Create new BugReport
	var feedbackReport = new FeedbackClass();
	feedbackReport.set("feedbackText", suggestionsValue);

	// Query for the last created report and retrieve its issue number
	var lastCreatedFeedbackQuery = new Parse.Query(FeedbackClass);
	lastCreatedFeedbackQuery.descending("createdAt");
	lastCreatedFeedbackQuery.first().then(function(lastCreatedFeedback)
	{
		// Get the last created report and assign an issue number based on it
		var feedbackNumber = 1;

		// If report exists, then use that else start from 1
		if (lastCreatedFeedback != null)
		{
			feedbackNumber = lastCreatedFeedback.get("feedbackNumber") + 1;
		}
			
		// Set the issueNumber
		feedbackReport.set("feedbackNumber",feedbackNumber);

		// Save the bugReport
		return feedbackReport.save();

	}).then(function()
	{
		// Reset the fields
		resetFields();

		// Show the success alert
		showAlert(true,"Your suggestion has been successfully submitted! Thanks!");
	},
	// Error Handler
	function(error)
	{
		showAlert(false,"An error occured. Please try again.");

		// Change back button to normal state
		$("#submitButton").button("reset");
	
	});
}


// Used to display the alert
function showAlert(success,message)
{
	//If success, then display success message
	if (success)
	{
		$("#successAlertText").text(message);
		$("#successAlert").removeClass("hidden");

		// Make the success alert fade away after set time
		window.setTimeout(function() 
		{
			$("#successAlert").fadeTo(500, 0).slideUp(150, function()
			{
				$(this).addClass("hidden");
				$(this).fadeTo(1,255);
			});
		}, 3000);
	}
	else
	{
		$("#dangerAlertText").text(message);
		$("#dangerAlert").removeClass("hidden");
	}
	
	// Change back button to normal state 
	$("#submitButton").button("reset");
}


// Used to reset the fields when a report has succcessfully been sent
function resetFields()
{
	// Reset suggestions input
	$("#inputSuggestion").val("");

	// Change back button to normal state
	$("#submitButton").button("reset");
}
