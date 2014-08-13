<!--- submit.cfm --->
<!---
	This page handles the uploads to the server and returns the results to the browser.
	It has intentionally been kept simple and verbose.
	It should not be used on a production server without modification!
--->

<!--- Use Debug mode? --->
<cfif structKeyExists(FORM, "debug.mode")>
	<cfif FORM["debug.mode"] eq "on">
		<!--- Client JavaScript disabled and checkbox is checked --->
		<cfset debugMode = true>
	<cfelse>
		<!--- Client Javascript enabled and FORM 'debug.mode' checkbox was checked then it will set debugMode variable to true otherwise will set to false --->
		<cfset debugMode = FORM["debug.mode"]>
	</cfif>
<cfelse>
	<!--- Client JavaScript disabled and checkbox is not checked --->
	<cfset debugMode = false>
</cfif>

<!--- 
	If FORM.file.count does not exist (we assume client JavaScript is disabled) then set fileCount variable to 1.
	As ColdFusion/Railo will only successfully process the first upload.
 --->
<cfif structKeyExists(FORM, "file.count") is false>
	<cfset fileCount = 1>
<cfelse>
	<cfset fileCount = FORM.file.count>
</cfif>

<!--- Upload all files to the CFML server destination path. --->
<!--- Make sure the path exists and is correct. --->
<cffile 
	action="uploadall"
	destination="/tmp/"
	nameConflict="MakeUnique"
	result="uploadResults">

<!--- HTML to return to client's browser --->
<cfoutput>

	<p>A total of #fileCount# files were uploaded.</p>

	<!--- Loop through the UploadResults --->
	<cfloop from="1" to="#fileCount#" index="i">

		<div id="upload-result-#i#">File #i#: <code>#uploadResults[i].clientfile#</code> at #round(uploadResults[i].filesize / ( 1024 * 1024 ) )#MB
			<cfif uploadResults[i].filewassaved is true>
				was saved to the server as <code>#uploadResults[i].serverfile#</code> in <code>#uploadResults[i].serverdirectory#</code>.
			<cfelse>
				was not saved to the server.
			</cfif>
		</div>

		<!--- CFDUMP the uploadResults for each file --->
		<cfif debugMode>
			<cfdump label="cffile result #i#" var="#uploadResults[i]#">
		</cfif>

	</cfloop>

	<!--- CFDUMP the headers and the form data for the form post --->
	<cfif debugMode>
		<cfdump label="GetHttpRequestData().headers" var="#GetHttpRequestData().headers#">
		<cfdump label="GetHttpRequestData().method" var="#GetHttpRequestData().method#">
		<cfdump label="GetHttpRequestData().protocol" var="#GetHttpRequestData().protocol#">
		<cfdump label="FORM" var="#form#">
	</cfif>

</cfoutput>