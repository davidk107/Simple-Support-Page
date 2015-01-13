//Parse initialize
Parse.initialize("3LfQqo1TAShUQ01SxhW4YkGp2ZuQGwtQZbtnaqhv", "UW3xdJypgbRXFqU2tisIYghtAAWB7uNOg33jGTKk");

// On document ready
$(document).ready(main);

// Main Function
function main()
{
	// If login button is clicked
	$("#loginButton").click(login);

	// If reset password button on modal is clicked
	$("#resetPasswordBtn").click(resetPassword);

	// Pass reset modal try again button pressed
	// Revert to first modal body
	$("#passResetTryAgainBtn").click(function()
	{
		$("#resetPageInvalid").addClass("hidden");
		$("#resetPageMain").removeClass("hidden");
		$("#resetPasswordBtn").removeClass("hidden");
	});

	// // Key press on inputEmail
	// $("#autoCompInput").bind("keypress", {}, keypressInBox);

	// When enter is pressed on inputEmail
	$('#inputEmail').keypress(function (e) 
	{
		if (e.which == 13) 
		{
			$("#inputEmail").blur();
			resetPassword();
			return false;   
		}
	});

	// Reset password link
	$("#resetPasswordLink").click(function()
	{
		$("#resetPageInvalid").addClass("hidden");
		$("#resetPageValid").addClass("hidden");
		$("#resetPageMain").removeClass("hidden");
		$("#resetPasswordBtn").removeClass("hidden");
		$("#inputEmail").val('');
		$("#resetPassForm").removeClass("has-error");
		$("#inputEmail").focus();
	});
}

// Reset password function
function resetPassword()
{
	// Get value from email input
	var emailInput = $("#inputEmail").val().trim();

	// If no email was provided, then alert user
	if (emailInput == "")
	{
		$("#resetPassForm").addClass("has-error");
		$("#inputEmail").focus();
	}
	// Else pass email to parse to handle it
	else
	{
		$("#inputEmail").val('');
		$("#resetPassForm").removeClass("has-error");
		$("#resetPageMain").addClass("hidden");
		$("#resetPageLoading").removeClass("hidden");
		$("#resetPasswordBtn").addClass("hidden");

		// Calls parse password reset function
		Parse.User.requestPasswordReset(emailInput).then(function()
		{
			$("#resetPageLoading").addClass("hidden");
			$("#resetPageValid").removeClass("hidden");
		},
		// Error - no user found with email
		function(error)
		{
			$("#resetPageLoading").addClass("hidden");
			$("#resetPageInvalid").removeClass("hidden");
		});
	}
}

// Login Function
function login()
{
	// Hide the invalid login alert
	$("#invalidLoginAlert").addClass("hidden");

	// Get the user name
	var username = $("#inputUsername").val().trim();

	// Get the password
	var password = $("#inputPassword").val();

	// Attempt to login
	Parse.User.logIn(username, password).then(function(user)
	{
		// Redirect the user to the admin page
		window.location.replace("admin.html");
	}, 

	// Error
	function(error)
	{
		$("#invalidLoginAlert").removeClass("hidden");
	});

	// Don't let the button auto refresh the page
	return false;
}

