muTable
=======

A javascript library for interactive table UI


Dependency
==========
jQuery


How to Use
==========
Include the muTable.js in your page source
```
<script src='muTable/muTable.js'></script>
```
Optinal: you can also include the muTable stylesheet, or customize it
```
<link rel=StyleSheet href='muTable/style.css' type='text/css'>
```

Create a div in your HTML for showing the table
```
<div class='mutable' id='table_div'></div>
```

Write appropriate JavaScript code to fetch and display data as a table
```javascript
$( document ).ready(function() {

	var filter = ['fname', 'lname', 'phone', 'mobile', 'fax', 'email', 'address'] ;	// the column to be shown, in given order
	var label = ['Name', '', 'Telephone', 'Cell', 'Fax', 'email', 'Address'] ;	// the column labels, overrides the name from the DB	
	var options = {
		'select': false, 
		'add': true, 
		'edit': true, 
		'delete' : true,
		'pageln' : 10,
		'currentpage' : 1
		} ;	// interactivity options

	// callback functions for different events
	var callback = {
		'onAddAccept' : function (data) {
			console.log(data);
			//TODO : put your own stuffs here
		},
		'onEditAccept' : function (data) {
			console.log(data);
			//TODO : put your own stuffs here
		},
		'onDelete' : function(data) {
			console.log(data);
			//TODO : put your own stuffs here
			//when you are satisfied with deletion in the back end, tell muTable working in the front to remove the row
			if(confirmedDeletion)
				muTable.removeRow(row) ;
		}
	} ;

	// the url for fetching data from the DB
	var data_source = 'mutable_data.php' ;

	// the HTML DOM element where the table should be shown
	var data_destination = $('#table_div') ;

	//populate the table
	muTable.getNewMuTable(data_source, data_destination, filter, options, callback) ;
});
```
