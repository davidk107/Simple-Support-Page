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
		// Clear any data
		localStorage.clear();
		sessionStorage.clear();
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


