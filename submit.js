// submit.js
/*
	This JavaScript handles the file form submission to the CFML server and displays any results.
	It uses XMLHttpRequest Level 2 and the FormData API.
	
	The XMLHttpRequest() submits the form data and handles both client web browser and server events.
	The FormData API allows the client web browser to create new forms and append data to existing forms.

	Because ColdFusion/Railo's cffile uploadAll function does not handle the form format generated
	by the client web browser submission of the HTML <input type="file" multiple> tag. We use the
	FormData API to create a new form filled in using the data submitted by the client's form
	submission. Most importantly the new form presents the HTML5 file multiple data in a format
	usable by ColdFusion/Railo.

	Most of this JavaScript interaction was learned from the following resources.
	http://www.html5rocks.com/en/tutorials/file/xhr2/
	http://www.matlus.com/html5-file-upload-with-progress/
	http://www.w3schools.com/dom/dom_http.asp
	http://www.w3.org/TR/file-upload/
 */
'use strict';
// Create a XMLHttpRequest Object named 'xhr'.
var xhr = new XMLHttpRequest();
// Global container to hold a tick counter which is used to calculate client upload speeds.
var transferTimer;

// Event, onreadystatechange, Fires when server's response changes after a request.
xhr.onreadystatechange = function(e) {
	debugLog("onreadystatechange: " + readyStateDesc(xhr.readyState));

	// if readyState is 4 (Request finished and response is ready) and the server's response code is 200 (OK)
	// then display the server's response (HTML created by submit.cfm) in the <div id="feedBack"></div> block
	if (this.readyState==4 && this.status==200) {
		document.getElementById("feedBack").style.display='block';
		document.getElementById("feedBack").innerHTML=xhr.responseText;
	}

	// if readyState is 1 (Server connection established)
    // start millisecond tick count to calculate client upload speeds
	if(this.readyState == 1) {
        transferTimer = new Date().getTime();
    }
}

// Event, loadstart, Fired when read starts.
xhr.upload.onloadstart = function(e) {
	debugLog('onloadstart: ' + readyStateDesc(xhr.readyState));

	// display progress bar
	document.getElementById("uploadProgress").style.display='block';
}

// Event, progress, Fired while reading (and decoding) blob (binary object).
// In layman's terms: This fires during a file upload to the server.
xhr.upload.onprogress = function(e) {
	// upload progress calculation
	// calculate using the ProgressEvent loaded and total values
	// example: ( ( 150000 bytes loaded / 600000 bytes total ) * 100 ) = 25% complete
	var percentComplete = ((e.loaded / e.total) * 100).toFixed(0);

	// update progress bar
	progressBar.value = percentComplete;
	progressPercentage.innerHTML = percentComplete.toString();

	// update transfer speed
	document.getElementById("transferSpeed").innerHTML = transferSpeed(e.loaded);

	// if progress is 100% notify client that files are being processed by the server
	if(percentComplete>=100) {
		document.getElementById("feedBack").style.display='block';
		document.getElementById("feedBack").innerHTML='Please wait while the server processes the files.';
	}
}

// Event, abort, Fired when read has been aborted.
xhr.upload.onabort = function(e) {
	debugLog("onabort: Uploads aborted, either by yourself or by the server.");
	debugLog('onabort: ' + readyStateDesc(xhr.readyState));
}

// Event, error, Fired when read has failed.
xhr.upload.onerror = function(e) {
	debugLog("onerror: Upload failed as the file cannot be read, either due to it being locked by another application or a permission problem.");
	debugLog('onerror: ' + readyStateDesc(xhr.readyState));
}

// Event, load, Fired when read has successfully completed.
xhr.upload.onload = function(e) {

	debugLog('onload: ' + readyStateDesc(xhr.readyState));
}

// Event, loadend, Fired when the request has completed (either in success or failure).
xhr.onloadend = function(e) {
	debugLog('onloadend: ' + readyStateDesc(xhr.readyState));

	// if the server's response code is 200 (OK) then upload was successful
	if (xhr.status == 200) {
		debugLog("onloadend: Success upload completed.");
		debugLog(responseHeader('onloadend')); // server response header data
	} else {
		// return any server status error codes and status texts
		debugLog("onloadend: Error, upload failed with error status " + xhr.status + ": " + xhr.statusText);
		
		// case insensitive search for the term 'post size' if xhr.statusText
		if (xhr.statusText.search(/post size/i) >= 0) {
			debugLog("onloadend: The status text contains a 'post size' message. To fix this you may need to configure the 'Maximum size of post data' in the ColdFusion administrator settings. To learn more do a Google search for 'coldfusion post size limit'.");
		}
		
		/* DO NOT USE THIS in a production server as it may return server path information to the client! */
		document.getElementById('feedBack').innerHTML = "Error: The server replied with a status: " + xhr.status + ": " + xhr.statusText + ". To debug turn on your browser's JavaScript console and select the Debug mode form checkbox.";
		document.getElementById('feedBack').style.display = "block";
	}
}

// Run on Abort Click.
function abortUpload() {
	// halt all file transfers
	xhr.abort();
	// notify the client
	document.getElementById('feedBack').style.display = "block";
	document.getElementById('feedBack').innerHTML = "Upload aborted by you.";
}

// Run on Reset Click.
function resetUpload() {
	// reset the progress bar to 0
	progressBar.value = 0;
	progressPercentage.innerHTML = 0;
	// reset the file queue displayed
	document.getElementById('feedBack').style.display = "block";
	document.getElementById('feedBack').innerHTML = "";
}

// Display status messages to the console log if 'debug mode' check-box is checked.
function debugLog(msg) {
	if (msg !== undefined && document.getElementById('debug-mode').checked==true) {
		console.log(msg);
	} 
}

// Describe readyState status codes.
function readyStateDesc(rs) {
	var rsd = ""; // ready state description
	switch (rs) {
		case 0:
			rsd = "Request not initialized."; break;
		case 1:
			rsd = "Server connection established."; break;
		case 2:
			rsd = "Request received."; break;
		case 3:
			rsd = "Processing request."; break;
		case 4:
			rsd = "Request finished and response is ready."; break;
		default:
			rsd = "Unknown."; break;
	}
	return rsd;
}

// Return the server's response header.
function responseHeader(e) {
	var rh = e + ': Server response header; length: ' + xhr.getResponseHeader("Content-Length") + '; Type: ' + xhr.getResponseHeader("Content-Type") + '; Date: ' + xhr.getResponseHeader("Date") + '; Last-Modified: ' + xhr.getResponseHeader("Last-Modified") + '; Server: ' + xhr.getResponseHeader("Date") + ';';
	return rh;
}

// Displays to the client the files they have queued for upload.
function fileSelected() {
	// clear feedback block
	resetUpload();
	// get form files selection
	var fileInput = document.getElementById('upload-tmpFiles');
	// get feedback block
	var feedBack = document.getElementById('feedBack');
	// sum of the total size of files to upload
	var sumFileSize = 0;
	// loop through individual files contained in files selection
	for (var i = 0, file; file = fileInput.files[i]; ++i) {

		// determine and humanize file size of file
		var fileSize = 0;
		if (file.size > 1024 * 1024)
			fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toFixed(1) + 'MB';
		else
			fileSize = (Math.round(file.size * 100 / 1024) / 100).toFixed(0) + 'KB';

		// add file size to total size
		sumFileSize = sumFileSize + file.size;

		// unique id to be applied to the <div> block
		var fInc = 'file' + i.toString();
		// string of text to be applied to the body of the <div> block
		var fString = "";
		fString = fString + (i+1).toString() + ': <code id="' + fInc + 'Name">' + file.name + '</code> ';
		fString = fString + 'Size: <var id="' + fInc + 'Size">' + fileSize + '</var> ';
		fString = fString + 'Type: <kbd id="' + fInc + 'Type">' + file.type + '</kbd>';
		// append fString to existing feedBack block
		feedBack.innerHTML = feedBack.innerHTML + '<div id="' + fInc + '">' + fString + '</div>'
	}
	// prepend files section count and total size to feedBack block
	feedBack.innerHTML = '<p>' + i + ' files selected which are ' + (Math.round(sumFileSize * 100 / (1024 * 1024)) / 100).toFixed(1) + 'MB.</p>' + feedBack.innerHTML;
	// enable feedBack block
	feedBack.style = 'display: block;';
}

// Calculates and returns the transfer speed.
function transferSpeed(loaded) {
    var transferTimeSplit = new Date().getTime();
    var tc = (transferTimeSplit - transferTimer) / 1000; // global var transferTimer is set in the xhr.onreadystatechange event.
    var rate = '';
    var speed = Math.round(loaded / tc / 125);
    if(speed > 12500) {
        speed = (speed / 125000);
        rate = speed.toFixed(2) + ' Mb/s';
    } else {
        rate = speed + ' Kb/s';
    }
    return rate;
}

// Validate the form before submission to the server.
function formValidation(form) {
	// clear feedback block
	resetUpload();
	// get form files selection
	var fileInput = document.getElementById('upload-tmpFiles');
	// get feedback block
	var feedBack = document.getElementById('feedBack');

	// if no files are selected notify the client.
	if (fileInput.files.length == 0) {
		feedBack.innerHTML = feedBack.innerHTML + '<li>Select at least one file for upload.</li>';
	}
	// you can add other form validations here ...

	// if any validation errors exist display the notifications in the feedBack block
	if (feedBack.innerHTML.length > 0) {
		feedBack.style.display = "block";
		feedBack.innerHTML = 'Please correct the following issues with your submission:<ul>' + feedBack.innerHTML + '</ul>';
		return false;
	} else {
		return true;
	}
}

// Run on Upload Submit
function startUpload(form) {
	// validate the form, if it fails, abort startUpload
	if (formValidation(form) == false) {
		return false;
	}

	// fetch form 'files to upload' file input data.
	var fileInput = document.getElementById("upload-tmpFiles");
	// fetch form 'information' textarea data.
	var commentInput = document.getElementById("upload-comment");
	// fetch form 'debug mode' checkbox value.
	var debugMode = document.getElementById("debug-mode");

	// create a new formData object using the existing form
	// this requires the use of XMLHttpRequest Level 2 FormData API
	var formData = new FormData();

	// form objects such as textareas, non-file inputs, etc have to be appended to formData
	// append the 'debug mode' checkbox value and the 'information' textarea data to formData
	formData.append('debug.mode', debugMode.checked);
	formData.append('upload.comment', commentInput.value);
	
	// reset the progress bar
	var progressBar = document.getElementById("progressBar");
	var progressPercentage = document.getElementById("progressPercentage");
	progressBar.value = 0;

	// open a connection to our CFML server serving submit.cfm
	xhr.open("POST", "submit.cfm", true);

	// create the 'file' variable using the fileInput.files data
	var file = fileInput.files;

	// append the file count value to formData
	formData.append('file.count', file.length);
	xhr.setRequestHeader("X-File-Count", file.length);

	// loop through fileInput.files data that has been saved to the 'file' variable
	for (var i = 0; i < file.length; i++) {

		// in debug mode return the processed file name
		debugLog(file[i].name);

		// append the 'file' variable data to our new form variable formData as fieldnames, file0, file1, file2, etc...
		formData.append("file" + i, file[i]);

        // optional, pass additional data using http headers that can be processed by the server
        xhr.setRequestHeader("X-File-" + i + "-Last-Modified", file[i].lastModifiedDate.toUTCString()); // .toUTCString() is needed else server can't parse the date
        xhr.setRequestHeader("X-File-" + i + "-Name", file[i].name);
        xhr.setRequestHeader("X-File-" + i + "-Size", file[i].size);
        xhr.setRequestHeader("X-File-" + i + "-Type", file[i].type);
	}

	// submit our new form variable formData and any custom headers to the CFML server
	xhr.send(formData);

	// any responses from the server will be handled by the onreadystatechange event 
	// xhr.onreadystatechange = function(e) { }
	// which is located near the top of this script file
}