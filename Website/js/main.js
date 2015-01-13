//Parse initialize
Parse.initialize("3LfQqo1TAShUQ01SxhW4YkGp2ZuQGwtQZbtnaqhv", "UW3xdJypgbRXFqU2tisIYghtAAWB7uNOg33jGTKk");

checkRedirect();

// Check if need to redirect user, i.e if user is not logged in, then redirect to log in page
function checkRedirect()
{
	// Get the current page
	var currentPage = location.pathname.split('/').slice(-1)[0].trim()

	// Logged in status variable
	var loggedIn = isLoggedIn();

	// If on login.html and is already logged in, then redirect to admin
	if (loggedIn && currentPage == "login.html")
	{
		window.location.replace("admin.html");
	}
	// Else if not logged in and is not on login.html, then redirect to login.html
	else if (!loggedIn && currentPage != "login.html")
	{
		window.location.replace("login.html");
	}
}

// Check if logged in 
// You can customize this to add additonal checks to see if user has administrative privelages, etc
function isLoggedIn()
{
	return Parse.User.current() != null;
}

// When logout is clicked
function logoutClicked()
{
	// Logout
	Parse.User.logOut();
	
	// Clear any items in session storage and local storage
	sessionStorage.clear();
	localStorage.clear()
	window.location.replace("login.html");
}


// Check if user is admin and redirect if not
function adminPageActions()
{
	// Set a global variable to tell when and if to show the page
	// Will be used to make page wait for authentication from parse servers
	window.canLoadAdminPage = false;

	// Global Variable to determine if data is fully loaded or not
	window.dataIsLoaded = false;

	// Global Variable for Admin Data Loader
	window.adminDataLoader = new AdminDataLoader(userObjectID,retrieveValueFromCookies("username"));

	// If not logged in, then redirect to index.html
	if (userObjectID == null)
	{
		window.location.replace("index.html");
	}

	// Else is logged in, check if is admin
	Parse.Cloud.run("isAdmin",{"userObjectID":userObjectID}).then(function(result)
	{
		// If user is not an admin, then redirect
		if (!result)
		{
			window.location.replace("report.html");
		}
		// Else is admin, set canloadAdminPage to true and load the page
		else
		{
			canLoadAdminPage = true;

			// Check sessionStorage if need to retrieve data
			if (sessionStorage.getItem("allOpenIssues") == null || sessionStorage.getItem("allClosedIssues") == null  || sessionStorage.getItem("allFeedbackReports") == null)
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
	});
}

function viewReportPageActions()
{
	// Parse initialize
	Parse.initialize("VDsb6f3XOgG9w2G0Tbqd9iubJxKFTxveHCd8nwtP", "UDjT4ktfGjewHqoic96nLaEZW4uc321rruQJK1J6");

	// Set a global variable to tell when and if to show the page
	// Will be used to make page wait for authentication from parse servers
	window.canLoadViewReportPage = false;

	// Get the objectID
	var userObjectID = retrieveValueFromCookies("userObjectID");

	// Check for paramters
	var issueNo = getIssueNoForViewReportPage();

	// If not logged in, then redirect to index.html
	if (userObjectID == null)
	{
		window.location.replace("index.html");
	}
	// Else check that a parameter was passed in
	else if (issueNo == null || issueNo == "" || isNaN(issueNo))
	{
		window.location.replace("report.html");
	}

	// Global Variable to determine if data is fully loaded or not
	window.dataIsLoaded = false;

	// Global Variable for Admin Data Loader
	window.viewReportDataLoader = new ViewReportDataLoader(issueNo);

	// Else is logged in, check if is admin
	Parse.Cloud.run("isAdmin",{"userObjectID":userObjectID}).then(function(result)
	{
		// If user is not an admin, then redirect
		if (!result)
		{
			window.location.replace("report.html");
		}
		// Else is admin, set canLoadViewReportPage to true and load the page
		else
		{
			canLoadViewReportPage = true;
			viewReportDataLoader.retrieveData();
		}
	});
}

function viewFeedbackPageActions()
{
	// Parse initialize
	Parse.initialize("VDsb6f3XOgG9w2G0Tbqd9iubJxKFTxveHCd8nwtP", "UDjT4ktfGjewHqoic96nLaEZW4uc321rruQJK1J6");

	// Set a global variable to tell when and if to show the page
	// Will be used to make page wait for authentication from parse servers
	window.canLoadFeedbackPage = false;

	// Get the objectID
	var userObjectID = retrieveValueFromCookies("userObjectID");

	// Check for paramters
	var issueNo = getFeedbackNoForViewReportPage();

	// If not logged in, then redirect to index.html
	if (userObjectID == null)
	{
		window.location.replace("index.html");
	}
	// Else check that a parameter was passed in
	else if (issueNo == null || issueNo == "" || isNaN(issueNo))
	{
		window.location.replace("report.html");
	}

	// Global Variable to determine if data is fully loaded or not
	window.dataIsLoaded = false;

	// Global Variable for Admin Data Loader
	window.viewFeedbackDataLoader = new ViewFeedbackDataLoader(issueNo);

	// Else is logged in, check if is admin
	Parse.Cloud.run("isAdmin",{"userObjectID":userObjectID}).then(function(result)
	{
		// If user is not an admin, then redirect
		if (!result)
		{
			window.location.replace("report.html");
		}
		// Else is admin, set canLoadViewReportPage to true and load the page
		else
		{
			canLoadFeedbackPage = true;
			viewFeedbackDataLoader.retrieveData();
		}
	});
}

function getIssueNoForViewReportPage()
{
	name = "issueNo".replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " ")).trim();
}

function getFeedbackNoForViewReportPage()
{
	name = "feedbackNo".replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " ")).trim();
}



