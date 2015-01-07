//Parse initialize
Parse.initialize("3LfQqo1TAShUQ01SxhW4YkGp2ZuQGwtQZbtnaqhv", "UW3xdJypgbRXFqU2tisIYghtAAWB7uNOg33jGTKk");

// Enable SelectPicker
$('#dropdownFrequency').selectpicker();

// Call main function when document is loaded
$(document).ready(main);

//Array of files to be included in current report
var filesMap = {};

// Counter for list-group-item Id assignments
var idCounter = 0;

// Counter for how many files are currently pending for upload
var fileCounter = 0;

// Object used to store image attachments
var ImageAttachment = Parse.Object.extend("ImageAttachment");

// Array to store Parse ImageAttachment Objects 
var imageAttachmentArray = [];

// Main Function
function main()
{	
	// When the submit button is pressed
	$("#submitButton").click(submitReport);
	
	// When the browse button is clicked
	$("#browseButton").click(browseButtonClicked);

	// When enter is pressed on titleInput
	$('#inputTitle').keypress(function (e) 
	{
		if (e.which == 13) 
		{
			$("#inputTitle").blur();
			submitReport();
			return false;   
		}
	});

	// When tab is pressed on steps to reproduce
	$("#stepsInputGroup").on("keydown",function (e)
	{
		if (e.which == 9)
		{
			$("#inputSteps").blur();
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
			$("#inputTitle").focus();
			return false;
		}
	});
}

// Remove Item is entered
function removeItemEnter()
{
	var itemId = this.id;
	var itemBtn = $("#btn-" + itemId);
	itemBtn.removeClass("hidden");
}

// Remove Item is exited
function removeItemLeave()
{
	var itemId = this.id;
	var itemBtn = $("#btn-" + itemId);
	itemBtn.addClass("hidden");
}

// When a remove item btn is pressed
function removeItemBtnPressed()
{
	//Get the ID
	var itemId = this.id.slice(4);

	
	//Remove the file
	delete filesMap[itemId];
	--fileCounter;

	//Remove the HTML Elements
	$("#" + itemId).remove();

	checkFileDisplayDivVisiblity();
}

// Browse Button Clicked
function browseButtonClicked()
{
	// Trigger the fileInput to show the file selection popup
	$("#fileInput").trigger("click");
}

// FileUploaded Handler
function fileChanged(fileName)
{
	//Get the file 
	var files = document.getElementById("fileInput").files;

	for (var i = 0; i < files.length; ++i)
	{
		var file = files[i];
		var newFileId = "fileDisplayItem-" + idCounter++;
		filesMap[newFileId] = file;
		addNewListGroupItem(file.name, newFileId);
		++fileCounter;
		//Replace the input form
		$("#fileInput").replaceWith('<input type="file" id = "fileInput" name = "fileInput" accept = "image/*" onchange = "fileChanged()" multiple = "true">');
		checkFileDisplayDivVisiblity();
	}
}

// Check if need to hide or show the fileDisplayDiv
function checkFileDisplayDivVisiblity()
{
	// If no files, then hide the div
	if (fileCounter <= 0)
	{
		$("#fileDisplayDiv").addClass("hidden");
	}
	// else show the div
	else
	{
		$("#fileDisplayDiv").removeClass("hidden");
	}
}

// -- Helper for fileChanged -- //
function addNewListGroupItem(fileName, idOfField)
{
	var listGroupItemHTML = '<li class="list-group-item removeItemGroupItem" id = "' + idOfField + '">' + fileName +  
                    '<button type="button" class="btn badge hidden removeItemBtn" id = "btn-' + idOfField + '">' + 
                    '<span class = "glyphicon glyphicon-remove"></span>' + 
                  	'</li>';

	$("#fileDisplayListGroup").append(listGroupItemHTML);
	$("#" + idOfField).on("mouseenter",removeItemEnter);
	$("#" + idOfField).on("mouseleave",removeItemLeave);
	$("#btn-" + idOfField).on("click",removeItemBtnPressed);
}

// Submit bug report
function submitReport()
{
	// Change button to loading state
	$("#submitButton").button("loading");

	// Remove any has-error values from fields
	$("#titleInputGroup").removeClass("has-error");
	$("#descriptionInputGroup").removeClass("has-error");
	$("#frequencyInputGroup").removeClass("has-error");
	$("#stepsInputGroup").removeClass("has-error");
	$("#dropdownFrequency").selectpicker("setStyle","btn-danger","remove");
	$("#dropdownFrequency").selectpicker("setStyle","btn-default","add");

	// Remove any alerts
	$("#successAlert").addClass("hidden");
	$("#dangerAlert").addClass("hidden");

	// Get the Title input value
	var titleInputValue = $("#inputTitle").val().trim();

	// Get the Description input value
	var descriptionInputValue = $("#inputDescription").val().trim();

	// Get the steps input value
	var stepsInputValue = $("#inputSteps").val().trim();

	// Get the Freqeuncy value
	var frequencyValue = $("#dropdownFrequency").val().trim();

	// ----- Content Verification ----- //

	// Check Title is not empty
	if (titleInputValue == "")
	{
		$("#titleInputGroup").addClass("has-error");
		$("#inputTitle").focus();
		showAlert(false,"A title needs to be entered!");
		return;
	}

	// Check Description is not empty
	else if (descriptionInputValue == "")
	{
		$("#descriptionInputGroup").addClass("has-error");
		$("#inputDescription").focus();
		showAlert(false,"A description needs to be entered!");
		return;
	}

	// Check Steps is not empty
	else if (stepsInputValue == "")
	{
		$("#stepsInputGroup").addClass("has-error");
		$("#inputSteps").focus();
		showAlert(false,"Steps to reproduce need to be entered!")
		return;
	}

	// Check Frequency is not empty
	else if (frequencyValue == "")
	{
		$("#frequencyInputGroup").addClass("has-error");
		$("#dropdownFrequency").selectpicker("setStyle","btn-danger");
		$("#dropdownFrequency").focus();
		showAlert(false,"The frequency needs to be specified!");
		return;
	}

	// ----- Inputs are valid, create report and save it to Parse ----- //

	// Get BugReportClass
	var BugReportClass = Parse.Object.extend("BugReport");

	// Create new BugReport
	var bugReport = new BugReportClass();
	bugReport.set("title",titleInputValue);
	bugReport.set("description",descriptionInputValue);
	bugReport.set("stepsToReproduce",stepsInputValue);
	bugReport.set("frequency",frequencyValue);
	bugReport.set("status","Open");
	bugReport.set("assignee","");
	bugReport.set("hasComments",false);
	
	// -- Handle any pending images -- //

	// Variables to use for promises
	var imageUploadsPromise = [];
	var imageArray = [];
	var imageAttachmentArray = [];

	// For each pending file
	var fileCounter = 1;
	for (var fileId in filesMap)
	{
		if (filesMap.hasOwnProperty(fileId))
		{
			// Get the file
			var file = filesMap[fileId];

			// Create file name
			var fileName = "Screenshot " + fileCounter++ + ".jpg";

			// Create the Parse File for the image
			var parseImage = new Parse.File(fileName,file);

			// Add to imageArray
			imageArray.push(parseImage);

			// Push to promise
			imageUploadsPromise.push(parseImage.save());
		}
	}

	// Initiate the upload
	Parse.Promise.when(imageUploadsPromise).then(function()
	{
		// Promise array
		var imageAttachmentUploadPromise = [];
		
		for (var i = 0; i < imageArray.length; ++i)
		{
			// Create the parse object
			var imageAttachment = new ImageAttachment();

			// Attach parseImage to parseObject
			imageAttachment.set("image",imageArray[i]);

			// Get the url
			imageAttachment.set("imageURL",imageArray[i].url());

			// Add to the array
			imageAttachmentArray.push(imageAttachment);

			// Add to upload array
			imageAttachmentUploadPromise.push(imageAttachment.save());
		}

		// Return when imageAttachments are finished uploading
		return Parse.Promise.when(imageAttachmentUploadPromise);

	}).then(function()
	{	
		// Set the images to the bugReport
		var imagesRelation = bugReport.relation("images");
		if (imageAttachmentArray.length != 0)
		{
			imagesRelation.add(imageAttachmentArray);
			bugReport.set("hasAttachments",true);
		}
		else
		{
			bugReport.set("hasAttachments",false);
		}

		// Save the bugReport
		return bugReport.save();

	}).then(function()
	{
		// Reset the fields
		resetFields();

		// Show the success alert
		showAlert(true,"Your report has been successfully created!");
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
	// Reset title input
	$("#inputTitle").val("");

	// Reset description
	$("#inputDescription").val("");

	// Reset steps
	$("#inputSteps").val("");

	// Reset frequency
	$("#dropdownFrequency").selectpicker("val","");

	// Empty fileDisplayListGroup
	$("#fileDisplayListGroup").empty();

	// Reset file upload variables;
	filesMap = {}
	fileId = 0;
	fileCounter = 0;

	// Check if need to display file div still
	checkFileDisplayDivVisiblity();

	// Change back button to normal state
	$("#submitButton").button("reset");
}