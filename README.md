muTable
=======

A javascript library for interactive table UI


Dependency
==========
jQuery


How to Use
==========
1. Include the muTable.js in your page source
```
<script src="muTable/muTable.js"></script>
```
Optinal: you can also include the muTable stylesheet, or customize it
```
<link rel=StyleSheet href="muTable/style.css" type="text/css">
```
2. Create a div in your HTML for showing the table
```
<div class="mutable" id="table_div"></div>
```
3. Write appropriate JavaScript code to fetch and display data as a table
```
<script type="text/javascript">

$( document ).ready(function() {

	var filter = ["fname", "lname", "phone", "mobile", "fax", "email", "address"] ;	// the column to be shown, in given order
	var options = {'select': false, 'add': true, 'edit': true, 'delete' : true,} ;	// interactivity options

	// callback functions for different events
	var callback = {
		'onAddAccept' : function (data) {
			console.log(data);
			return muTable.XMLHTTP_STATUS_OK ;
		},
		'onEditAccept' : function (data) {
			console.log(data);
			return muTable.XMLHTTP_STATUS_OK ;
		},
		'onDelete' : function(data) {
			return muTable.XMLHTTP_STATUS_OK ;
		}
	} ;

	// the url for fetching data from the DB
	var data_source = "<?php echo $main->baseUrl; ?>/site/mutable_data.php" ;

	// the HTML DOM element where the table should be shown
	var data_destination = $("#table_div") ;

	//populate the table
	muTable.getNewMuTable(data_source, data_destination, filter, options, callback) ;
});

</script>
```