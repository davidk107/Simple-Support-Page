// Set username at nav bar
$("#usernameDisplay").text(Parse.User.current().get("username"));

// Initialize the datatables
initalizeAllDataTables();

// Load Data
fetchData();

function fetchData()
{
	// Global Variable to determine if data is fully loaded or not
	window.dataIsLoaded = false;

	// Global Variable for Admin Data Loader
	window.adminDataLoader = new AdminDataLoader();

	// Check sessionStorage if need to retrieve data
	if (shouldRetreiveNewData())
	{
		// Start data retrieval
		adminDataLoader.retrieveData();
	}
	// Else data is already loaded, set appropriate flag
	else
	{
		dataIsLoaded = true;
	}
}

// Use this function to check if data has been loaded, this is done by checking sessionStorage
function shouldRetreiveNewData()
{
	// In this case, checks if there are entries for allOpenIssues, allClosedIssues, and allFeedbackReports
	return (sessionStorage.getItem("allOpenIssues") == null || sessionStorage.getItem("allClosedIssues") == null  || sessionStorage.getItem("allFeedbackReports") == null)
}

// On document ready
$(document).ready(main);

// Main Function
function main()
{
	// Show the body
	$("body").removeClass("hidden");

	// Create an interval to check canLoadAdminPage every 50 ms
	window.checkDataLoaded = setInterval(checkIfDataLoaded,50);

	// When the logout button is clicked
	$("#logoutButton").click(logoutClicked);

	// Overview button clicked
	$("#overviewSidebarButton").click(overviewClicked);

	// My Issues Button clicked
	$("#myAssignedIssuesSidebarButton").click(myAssignedIssuesClicked);

	// Archived Issues Button Clicked
	$("#archivedIssuesSidebarButton").click(archivedIssuesClicked);

	// Refresh Button Clicked
	$("#refreshDataButton").click(refreshData);

	// Refresh Button onHover
	$("#refreshDataButton").hover(refreshHovered);

	// openIssues tbody clicked
	$("#openIssuesTable tbody").on("click","tr","openIssues",processTableClick);

	// myOpenIssues tbody clicked
	$("#myOpenIssuesTable tbody").on("click","tr","myOpenIssues",processTableClick);

	// myClosedIssues tbody clicked
	$("#myClosedIssuesTable tbody").on("click","tr","myClosedIssues",processTableClick);

	// closedIssues tbody clicked
	$("#closedIssuesTable tbody").on("click","tr","closedIssues",processTableClick);

	// openFeedbackTable tbody clicked
	$("#openFeedbackTable tbody").on("click","tr","openFeedbackTable",processTableClick);

	// closedFeedbackTable tbody clicked
	$("#closedFeedbackTable tbody").on("click","tr","closedFeedbackTable",processTableClick);

}

// Tbody Clicked
function processTableClick(tableType)
{
	var dataTable = null;
	var type;
	// Select correct table
	if (tableType.data == "openIssues")
	{
		dataTable = $("#openIssuesTable").DataTable();
		type = "issue";
	} 
	else if (tableType.data == "myOpenIssues")
	{
		dataTable = $("#myOpenIssuesTable").DataTable();
		type = "issue";
	}
	else if (tableType.data == "myClosedIssues")
	{
		dataTable = $("#myClosedIssuesTable").DataTable();
		type = "issue";
	}
	else if (tableType.data == "closedIssues")
	{
		dataTable = $("#closedIssuesTable").DataTable();
		type = "issue";
	}
	// Disabled clicking for feedbacks
	// else if (tableType.data == "openFeedbackTable")
	// {
	// 	dataTable = $("#openFeedbackTable").DataTable();
	// 	type = "feedback";
	// }
	// else if (tableType.data == "closedFeedbackTable")
	// {
	// 	dataTable = $("#closedFeedbackTable").DataTable();
	// 	type = "feedback";
	// }

	// Open a new window with either view report or view feedback
	try
	{
		var issueNo = dataTable.row(this).data()[0];
		openNewWindowWithIssueNo(type, issueNo);
	}	
	catch(err)
	{
		console.log(err);
		return;
	}
}

// Open new window with issueNo
function openNewWindowWithIssueNo(type, issueNo)
{
	// Get the URL
	var newWindowURL;
	if (type == "issue")
	{
		newWindowURL = "viewReport.html?issueNo=" + issueNo;
	}
	else if (type == "feedback")
	{
		newWindowURL = "viewFeedback.html?feedbackNo=" + issueNo;
	}

	// Open new window
	window.open(newWindowURL);
}

// Refresh Page
function refreshData()
{
	// Change dataIsLoaded to false
	dataIsLoaded = false;

	// Hide out other contents
	$("#assignedIssuesContent").addClass("hidden");
	$("#archivedIssuesContent").addClass("hidden");
	$("#overviewContent").addClass("hidden");

	// Show loading screen
	$("#loadingContent").removeClass("hidden");

	// Tell dataLoader to refresh
	adminDataLoader.refreshData();

	// Clear the datatables
	$("#openIssuesTable").DataTable().clear();
	$("#myOpenIssuesTable").DataTable().clear();
	$("#myClosedIssuesTable").DataTable().clear();
	$("#closedIssuesTable").DataTable().clear();
	$("#openFeedbackTable").DataTable().clear();
	$("#closedFeedbackTable").DataTable().clear();

	// Create check for dataIsLoaded and refresh the view
	checkDataLoaded = setInterval(checkIfDataLoaded,50);
}

// Refresh Hovered
function refreshHovered()
{
	if ($("#refreshButtonIcon").hasClass("fa-spin"))
	{
		$("#refreshButtonIcon").removeClass("fa-spin");
	}
	else
	{
		$("#refreshButtonIcon").addClass("fa-spin");
	}
}

// Overview Clicked
function overviewClicked()
{
	// If data is not loaded, then return
	if (!dataIsLoaded)
	{
		return;
	}

	// Handle Sidebar active classes
	$("#myAssignedIssuesSidebarButton").removeClass("active");
	$("#archivedIssuesSidebarButton").removeClass("active");
	$("#overviewSidebarButton").addClass("active");

	// Call change page content
	changePageContentTo("overview");
}

// My Assigned Issues Clicked
function myAssignedIssuesClicked()
{
	if (!dataIsLoaded)
	{
		return;
	}

	// Handle Sidebar active classes
	$("#overviewSidebarButton").removeClass("active");
	$("#archivedIssuesSidebarButton").removeClass("active");
	$("#myAssignedIssuesSidebarButton").addClass("active");

	// Call change page content
	changePageContentTo("myIssues");
}

// Archived Issues Clicked
function archivedIssuesClicked()
{
	if (!dataIsLoaded)
	{
		return;
	}

	// Handle Sidebar active classes
	$("#overviewSidebarButton").removeClass("active");
	$("#myAssignedIssuesSidebarButton").removeClass("active");
	$("#archivedIssuesSidebarButton").addClass("active");

	// Call change page content
	changePageContentTo("archivedIssues");
}

// Change page content to
function changePageContentTo(content)
{
	// If need to change to overview
	if (content == "overview")
	{
		// Hide out other contents
		$("#assignedIssuesContent").addClass("hidden");
		$("#archivedIssuesContent").addClass("hidden");

		// Show correct content
		$("#overviewContent").removeClass("hidden");
	}
	// Change to my issues
	else if (content == "myIssues")
	{
		// Hide out other contents
		$("#overviewContent").addClass("hidden");
		$("#archivedIssuesContent").addClass("hidden");

		// Show correct content
		$("#assignedIssuesContent").removeClass("hidden");
	}
	// Else if change to archived issues
	else if (content == "archivedIssues")
	{
		// Hide out other contents
		$("#overviewContent").addClass("hidden");
		$("#assignedIssuesContent").addClass("hidden");

		// Show correct content
		$("#archivedIssuesContent").removeClass("hidden");
	}
}

// Initialize all the dataTables on the page
function initalizeAllDataTables()
{
	// Initiazlie openIssuesTable
	$("#openIssuesTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    { "width": "30%" },
		    null,
		    { "width": "20%" },
		    null
		],
		"order":
		[
			[0, "desc"]
		]
	});

	// Initiazlie myOpenIssuesTable
	$("#myOpenIssuesTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    { "width": "55%" },
		    null,
		    { "width": "20%" },
		],
		"order":
		[
			[0, "desc"]
		]
	});

	$("#myClosedIssuesTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    { "width": "55%" },
		    null,
		    { "width": "20%" },
		],
		"order":
		[
			[0, "desc"]
		]
	});

	$("#closedIssuesTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    { "width": "30%" },
		    null,
		    { "width": "5%" },
		    null,
		    null
		],
		"order":
		[
			[0, "desc"]
		]
	});

	$("#openFeedbackTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    null
		],
		"order":
		[
			[0, "desc"]
		]
	});

	$("#closedFeedbackTable").dataTable(
	{
		"autoWidth": false,
		"columns": 
		[
			{ "width": "10%" },
		    null
		],
		"order":
		[
			[0, "desc"]
		]
	});
}

// Check if data is loaded and can show overview content
function checkIfDataLoaded()
{
	if (dataIsLoaded)
	{
		// Load data into tables
		loadDataIntoTables();

		// Stop the check
		clearInterval(checkDataLoaded);
	}
}

// Read data from sessionStorage and load into tables
function loadDataIntoTables()
{
	// Get the arrays
	window.allOpenIssues = JSON.parse(sessionStorage.getItem("allOpenIssues"));
	window.allClosedIssues = JSON.parse(sessionStorage.getItem("allClosedIssues"));
	window.myOpenIssues = JSON.parse(sessionStorage.getItem("myOpenIssues"));
	window.myClosedIssues = JSON.parse(sessionStorage.getItem("myClosedIssues"));
	window.openFeedbackReports = JSON.parse(sessionStorage.getItem("openFeedbackReports"));
	window.closedFeedbackReports = JSON.parse(sessionStorage.getItem("closedFeedbackReports"));

	// Loop through allOpenIssues and add to openIssuesTable 
	var openIssuesTable = $("#openIssuesTable").DataTable();
	for (var i = 0; i < allOpenIssues.length; ++i)
	{
		// Get the issue
		var issue = allOpenIssues[i];
		openIssuesTable.row.add([issue.issueNo, issue.title, issue.frequency, issue.hasAttachments, issue.assignee,i]);
	}

	// Loop thorugh allClosedIssues
	var closedIssuesTable = $("#closedIssuesTable").DataTable();
	for (var i = 0; i < allClosedIssues.length; ++i)
	{
		// Get the issue
		var issue = allClosedIssues[i];
		closedIssuesTable.row.add([issue.issueNo, issue.title, issue.frequency, issue.hasAttachments, issue.assignee, issue.status]);
	}

	// Loop through myOpenIssues
	var myOpenIssuesTable = $("#myOpenIssuesTable").DataTable();
	for (var i = 0; i < myOpenIssues.length; ++i)
	{
		// Get the index
		var openIssueIndex = myOpenIssues[i];

		// Get the actual issue
		var issue = allOpenIssues[openIssueIndex];
		myOpenIssuesTable.row.add([issue.issueNo, issue.title, issue.frequency, issue.hasAttachments]);
	}

	// Loop through myClosedIssues
	var myClosedIssuesTable = $("#myClosedIssuesTable").DataTable();
	for (var i = 0; i < myClosedIssues.length; ++i)
	{
		// Get the index
		var closedIssueIndex = myClosedIssues[i];

		// Get the actual issue
		var issue = allClosedIssues[closedIssueIndex];
		myClosedIssuesTable.row.add([issue.issueNo, issue.title, issue.frequency, issue.hasAttachments]);
	}

	// Loop through openFeedbackReports
	var openFeedbackTable = $("#openFeedbackTable").DataTable();
	for (var i = 0; i < openFeedbackReports.length; ++i)
	{
		// Get the feedback
		var feedbackReport = openFeedbackReports[i];
		openFeedbackTable.row.add([feedbackReport.feedbackNo, feedbackReport.feedbackText]);
	}

	// Loop through closedFeedbackReports
	var closedFeedbackTable = $("#closedFeedbackTable").DataTable();
	for (var i = 0; i < closedFeedbackReports.length; ++i)
	{
		// Get the feedback
		var feedbackReport = closedFeedbackReports[i];
		closedFeedbackTable.row.add([feedbackReport.feedbackNo, feedbackReport.feedbackText]);
	}

	// Draw the tables
	openIssuesTable.draw();
	closedIssuesTable.draw();
	myOpenIssuesTable.draw();
	myClosedIssuesTable.draw();
	openFeedbackTable.draw();
	closedFeedbackTable.draw();

	// Set badge
	$("#myAssignedBadge").text(myOpenIssues.length);
	// Tables done loading, hide the loading screen
	$("#loadingContent").addClass("hidden");

	// Show the overview screen
	$("#overviewContent").removeClass("hidden");
	overviewClicked();
}