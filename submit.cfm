<!--- submit.cfm --->
<!---
	This page handles the uploads to the server and returns the results to the browser.
	It has intentionally been kept simple and verbose.
	It should not be used on a production server without modification!
--->
<!--- Directory to save uploads to. --->
<!--- Make sure the path exists and is correct. --->
<cfset savedUploadsPath = "C:\Temp\">
<!--- <cfset savedUploadsPath = "/tmp/"> --->

<!--- Converts file size as bytes into kB or MB --->
<cffunction name="filesize" access="private">
	<cfargument name="bytes" type="numeric" required="true">
	<cfset size = "">
	<cfif arguments.bytes lte 1048576>
		<cfset size = "#Round(arguments.bytes / 1024 )#kB">
	<cfelse>
		<cfset size = (arguments.bytes / ( 1024 * 1024 ) )>
		<cfset size = "#NumberFormat(size, "0.0")#MB">
	</cfif>
	<cfreturn size>
</cffunction>

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

<!--- Check that the directory saved to savedUploadsPath exists --->
<cfif directoryExists(savedUploadsPath) is false>
	<cfthrow message="Cannot save uploads as #savedUploadsPath# does not exist, to fix edit variable ##savedUploadsPath##">
</cfif>

<!--- Upload all files to the CFML server destination path. --->
<cffile 
	action="uploadall"
	destination="#savedUploadsPath#"
	nameConflict="MakeUnique"
	result="uploadResults">

<!--- HTML to return to client's browser --->
<cfoutput>

	<p>A total of #fileCount# files were uploaded.</p>

	<!--- Loop through the UploadResults --->
	<cfloop from="1" to="#fileCount#" index="i">

		<div id="upload-result-#i#">File #i#: <code>#uploadResults[i].clientfile#</code> at #filesize(uploadResults[i].filesize)#
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