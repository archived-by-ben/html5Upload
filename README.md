html5Upload
===========

HTML5 multiple files upload JavaScript example for CFML/ColdFusion/Railo using XMLHttpRequest Level 2. It has no need for JavaScript library dependancies such as JQuery.

####Requirements

* ColdFusion, Railo or CFML compatible server that supports the `cffile action = "uploadAll"` tag or the `FileUploadAll` function.
* A client web browser that supports _HTML5_, _XMLHttpRequest Level 2_ and the _FormData API_. [Can I use XMLHttpRequest 2?](http://caniuse.com/xhr2)
* A client web browser that has JavaScript turned on.

####Recommendation

* A client web browser with its JavaScript console enabled to view `console.log` outputs. You can use [FireBug in FireFox](https://getfirebug.com), [DevTools console in Chrome](https://developer.chrome.com/devtools/index) or the [Web Inspector console in Safari](https://developer.apple.com/safari/tools/).

####Important!

`submit.js` in its current form is too verbose as it is intended for debugging and feedback. **It should not be used in a production environment without modification**.

####Usage

1. Download the ZIP `html5Upload-master.zip` and extract it into the webroot of your CFML server.
2. Edit `submit.cfm` and make sure the `savedUploadsPath` variable at line 9 points to a valid directory. This is where the file uploads will be saved.
3. View `upload.html` in a modern web browser. For a ColdFusion server running on a local machine the URL to do this might be [http://localhost:8500/html5Upload-master/upload.html](http://localhost:8500/html5Upload-master/upload.html).

####How does it work?

The application comes with 3 primary files plus a customized version of [BootStrap](http://getbootstrap.com) for some basic HTML5 theming.
* `upload.html` A standard HTML5 file upload form. One important difference is it uses a JavaScript `onclick` event to submit the form.
* `submit.cfm` A typical CFML page that uses the `cffile action = "uploadAll" to receive and save file uploads to the server.
* `submit.js` Is where the magic happens. It uses _XMLHttpRequest_ to submit the form to the server and handle any responses returned by the server.
 
When the `upload.html` _Upload files!_ button is clicked a `submit.js` `startUpload()` function is triggered. It has the content of the form passed to it and analyses that content. The function creates a new internal form using the web browser's _FormData API_ and fills it in using the data sourced from the submitted form. Most importantly it creates a new collection of <input type="file"> field-names that are compatible with the CFML `cffile action = "uploadAll"` tag and the `FileUploadAll` function.

The `startUpload()` function POSTs the _FormData API_ generated form to `submit.cfm` using the in-browser `XMLHttpRequest()` function. `submit.cfm` treats the POST as a typical form and handles it with the `cffile action = "uploadAll"` tag. All errors or success messages created by `submit.cfm` are returned to web browser as HTML tags sent over HTTP. These replies are handled by _XMLHttpRequest_ events contained in `submit.js`. The events use JavaScript to update the HTML DOM which refresh the client web browser with the updated HTML tags.

![Form submission comparision](https://github.com/bengarrett/html5Upload/blob/master/screenshots/form.submission.comparison.png)

####Sample screenshots

![Files selection](https://github.com/bengarrett/html5Upload/blob/master/screenshots/pre-upload.files.section.png)

![Uploading files](https://github.com/bengarrett/html5Upload/blob/master/screenshots/upload.files.progress.1.png)

![Uploading files completed](https://github.com/bengarrett/html5Upload/blob/master/screenshots/upload.files.progress.2.png)

[Upload files without the html5Upload JavaScript](https://github.com/bengarrett/html5Upload/blob/master/screenshots/no.javascript.upload.files.failed.png)

[Upload files with debug mode](https://github.com/bengarrett/html5Upload/blob/master/screenshots/debug.mode.upload.files.png)

[Uploading aborted](https://github.com/bengarrett/html5Upload/blob/master/screenshots/upload.files.abort.png)

####Resources used
* [New Tricks in XMLHttpRequest2 by Eric Bidelman](http://www.html5rocks.com/en/tutorials/file/xhr2/)
* [Html5 File Upload with Progress by Shiv Kumar](http://www.matlus.com/html5-file-upload-with-progress/)
* [w3schools - The XMLHttpRequest Object](http://www.w3schools.com/dom/dom_http.asp)
* [W3C - File API](http://www.w3.org/TR/file-upload/)
* [W3C - FormData XMLHttpRequest](https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html)

####Licence
[The MIT License (MIT)](http://opensource.org/licenses/MIT)
Copyright (c) 2014 Ben Garrett
