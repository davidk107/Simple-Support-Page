//Parse initialize
Parse.initialize("VDsb6f3XOgG9w2G0Tbqd9iubJxKFTxveHCd8nwtP", "UDjT4ktfGjewHqoic96nLaEZW4uc321rruQJK1J6");

// Enable SelectPicker
$('.selectpicker').selectpicker();

// Load Data
fetchData();

function fetchData()
{
	// Global Variable to determine if data is fully loaded or not
	window.dataIsLoaded = false;

	// Get Issue No
	var issueNo = getIssueNo();

	// If no issueNo, then go to admin page
	if (!issueNo)
	{
		window.location.replace("admin.html");
		return;
	}

	// Global Variable for Admin Data Loader
	window.viewFeedbackDataLoader = new ViewFeedbackDataLoader(issueNo);
	viewFeedbackDataLoader.retrieveData();
}

function getIssueNo()
{
	name = "feedbackNo".replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " ")).trim();
}

// On document ready
$(document).ready(main);

// Main Function
function main()
{
	// Create an interval to check canLoadAdminPage every 50 ms
	window.checkLoadFeedbackPage = setInterval(checkIfCanLoadPage, 50);

	// When the mail to button is pressed
	$("#mailButton").click(mailButtonPressed);
}


function saveButtonPressed()
{
	// Remove Alerts
	$("#dangerAlert").addClass("hidden");
	$("#successAlert").addClass("hidden");


	// Get the values
	var assignee = $("#inputAssignee").val();
	var status = $("#inputStatus").val();

	// Set them to current issue
	var issue = viewReportDataLoader.getIssue();
	issue.set("assignee",assignee);
	issue.set("status",status);

	// If there is comment
	if ($("#inputCommentMessage").val() != "")
	{
		// Link Comment to Issue
		linkCommentWithIssue(issue);
	}
	else
	{
		saveIssue(issue, assignee, status);
	}
}


function mailButtonPressed()
{
	// Get the email address
	var emailAddress = $("#inputReporterEmail").val();

	// Open window with mailTo:
	window.open("mailto:"+emailAddress);
}

// Check if can show page after authentication
function checkIfCanLoadPage()
{
	// Show the document if canLoadAdminPage is true
	if (canLoadFeedbackPage)
	{
		// Show the body
		$("#loadingContainer").removeClass("hidden");

		// Create new check to see if data loaded
		window.checkDataLoaded = setInterval(checkIfDataLoaded,50);

		// Stop the interval
		clearInterval(checkLoadFeedbackPage);
	}
}

// Check if data is loaded and can show overview content
function checkIfDataLoaded()
{
	if (dataIsLoaded)
	{
		// Load data into tables
		loadDataIntoTables();

		// If has attachments, then load them
		if (window.imageLinksArray != null)
		{
			loadScreenshots();
		}
		// If has comments, then load them
		if (window.commentsArray != null)
		{
			loadComments();
		}

		// Hide loading screen and show the body
		$("#loadingContainer").addClass("hidden");
		$("#viewReportContainer").removeClass("hidden");

		// Stop the check
		clearInterval(checkDataLoaded);
	}
}

// Load data into tables
function loadDataIntoTables()
{
	// Get the issue
	var issue = viewFeedbackDataLoader.getIssue();

	// Show the issue no
	$("#issueNumberPanelTitle").text("Feedback #: " + issue.get("feedbackNumber"));

	// Show Last Updated
	var lastUpdatedDate = issue.updatedAt;
	$("#lastUpdatedPanelTitle").text("Last Updated: " + lastUpdatedDate.toLocaleDateString());

	// Show reporter username
	$("#inputReporterUsername").val(issue.get("username"));

	// Show reporter email
	$("#inputReporterEmail").val(issue.get("userEmail"));

	// Show the content
	$("#contentField").val(issue.get("feedbackText"));
}