// Enable SelectPicker
$('.selectpicker').selectpicker();

// On document ready
$(document).ready(main);


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
	window.viewReportDataLoader = new ViewReportDataLoader(issueNo);
	viewReportDataLoader.retrieveData();
}

function getIssueNo()
{
	name = "issueNo".replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " ")).trim();
}

// Main Function
function main()
{
	// Show the body
	$("#loadingContainer").removeClass("hidden");

	// Create new check to see if data loaded
	window.checkDataLoaded = setInterval(checkIfDataLoaded);

	// When assignee is changed
	$("#topViewReportForm .selectpicker").change(selectpickerChanged);

	// Save Button pressed
	$("#saveButton").click(saveButtonPressed);

	// Add Comment Button
	$("#addCommentButton").click(addCommentPressed);

	// Whenever inputCommentMessage changes
	$("#inputCommentMessage").on("keyup",selectpickerChanged);

}

function addCommentPressed()
{
	// Hide the button, show the textarea
	$("#addCommentButton").addClass("hidden");
	$("#inputCommentMessage").removeClass("hidden");
	$("#inputCommentMessage").focus();
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

function linkCommentWithIssue(issue)
{
	// Get the comment details
	var commentUsername = Parse.User.current().get("username");
	var commentMessage = $("#inputCommentMessage").val();

	// Create new comment
	var CommentClass = Parse.Object.extend("Comment");
	var newComment = new CommentClass();
	newComment.set("fromUsername", commentUsername);
	newComment.set("message",commentMessage);
	newComment.set("forReport", issue);

	// Save the new Comment
	newComment.save().then(function(newComment)
	{
		// Get created date
		var timestamp = newComment.createdAt.toLocaleDateString();

		// Display the comment on the commentsSpan
		$("#commentsSpan").append('<div class = "panel panel-info"><div class = "panel-heading clearfix"><p class = "panel-title pull-left">' + commentUsername + '</p><p class = "panel-title pull-right">' + timestamp + '</p></div><div class = "panel-body">' + commentMessage + '</div></div>');
		$("#inputCommentMessage").val("");

		// Add to issue's comment relation
		issue.relation("comments").add(newComment);
		issue.set("hasComments",true);
		saveIssue(issue);
	}, 
	// Error handler
	function(error)
	{
		// Show danger alert
		$("#dangerAlert").removeClass("hidden");
	});
}

function saveIssue(issue, assignee, status)
{
	issue.save().then(function(issue)
	{
		// Reset defaults
		defaultAssignee = assignee;
		defaultStatus = status;
		selectpickerChanged();

		// Update Last Updated
		$("#lastUpdatedPanelTitle").text("Last Updated: " + issue.updatedAt.toLocaleDateString() + " " + issue.updatedAt.toLocaleTimeString());

		// Show success alert
		$("#successAlert").removeClass("hidden");

		// Scroll Top
		$('html, body').animate({ scrollTop: 0 }, 0);

		// Hide comment area
		$("#addCommentButton").removeClass("hidden");
		$("#inputCommentMessage").addClass("hidden");
	},
	// Error Handler
	function(error)
	{
		// Show danger alert
		$("#dangerAlert").removeClass("hidden");
	});
}

function selectpickerChanged()
{
	// If assignee changed, enable save button
	if($("#inputAssignee").val() != defaultAssignee || $("#inputStatus").val() != defaultStatus || $("#inputCommentMessage").val() != "")
	{
		$("#saveButton").removeClass("disabled");
	}
	else
	{
		$("#saveButton").addClass("disabled");
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

// Load Comments
function loadComments()
{
	// Show the span, alter the button position
	$("#commentsSpan").removeClass("hidden");

	// Loop through the comments
	for (var i = 0; i < window.commentsArray.length; ++i)
	{
		// Get the comment
		var comment = window.commentsArray[i];

		// Get the from username
		var fromUsername = comment.fromUsername;

		// Get message
		var message = comment.message;

		// Get date
		var date = comment.createdDate;

		// Create a timestamp for display
		var timestamp = date.toLocaleDateString();

		// Add to view
		$("#commentsSpan").append('<div class = "panel panel-info"><div class = "panel-heading clearfix"><p class = "panel-title pull-left">' + fromUsername + '</p><p class = "panel-title pull-right">' + timestamp + '</p></div><div class = "panel-body">' + message + '</div></div>');
	}
}

// Load screenshots
function loadScreenshots()
{
	$("#sceenshotDisplayForm").removeClass("hidden");
	// Loop through the screenshots
	for (var i = 0; i < window.imageLinksArray.length; ++i)
	{
		// Get the URL
		var url = window.imageLinksArray[i];

		// Add to screenshotDisplayList
		$("#screenshotDisplayList").append('<a href="'+url+'" class="list-group-item list-group-item-info screenshotListItem" target="_blank" id="'+i+'">Screenshot '+ (i+1) + '</a>')
	}
}

// Load data into tables
function loadDataIntoTables()
{
	// Get the issue
	var issue = viewReportDataLoader.getIssue();

	// Show the issue no
	$("#issueNumberPanelTitle").text("Issue #: " + issue.get("issueNumber"));

	// Show Last Updated
	$("#lastUpdatedPanelTitle").text("Last Updated: " + issue.updatedAt.toLocaleDateString());

	// Show the assignee
	window.defaultAssignee = issue.get("assignee");
	$("#inputAssignee").selectpicker("val",defaultAssignee);

	// Show the status
	window.defaultStatus = issue.get("status");
	$("#inputStatus").selectpicker("val",defaultStatus);

	// Show the title
	$("#inputTitle").val(issue.get("title"));

	// Show the build number
	$("#inputBuildNumber").val(issue.get("buildNumber"));

	// Show the description
	$("#inputDescription").val(issue.get("description"));

	// Show the steps
	$("#inputSteps").val(issue.get("stepsToReproduce"));

	// Show the frequency
	$("#inputFrequency").val(issue.get("frequency"));
}