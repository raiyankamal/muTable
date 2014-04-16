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
<div class='mutable' id='muTable-container'></div>
```

Write appropriate JavaScript code to fetch and display data as a table
```javascript
$( document ).ready( function () {
	//init widgets
	initTable() ;

});

/* manage contacts muTable */

function initTable() {

	// These columns are shown in the given order
	var columns = [
		{
			name : 'id' ,
			label : 'ID' ,
			readonly : 'true' ,		// set readonly to true if a column shouldn't be editable
		} ,

		{
			name : 'title' ,
			label : 'Title' ,
		} ,

		{
			name : 'val' ,
			label : 'Value' ,
		} ,
	] ;

	var options = { // options
		'add' : true,
		'delete' : true,
		'edit' : true,
		'title' : "My Rows",
		'pagelen' : 15,
		'currentpage' : 0,
	} ;

	// callback functions for different events
	var callback = {
		'onDelete' : deleteRow ,
		'onAddAccept' : addRow ,
		'onEditAccept' : editRow ,
	} ;

	// the url for fetching data from the DB
	var data_source = "example/get_rows.php" ;

	// the HTML DOM element where the table should be shown
	var data_destination = $("#muTable-container") ;

	//populate the table
	var mt = new muTable.muTable(data_source, data_destination, columns, options, callback) ;
}

function addRow(data, row, callback) {
	console.log(data) ;
	
	$.ajax({
		url : 'example/add_row.php' ,
		type : 'POST' ,
		data : {
			title = data['title'] ,
			val = data['val'] ,
		}
	}).done(function (o){
		callback(row, true) ;
	}).fail(function (o){
		callback(row, false) ;
	}).always(function (o){
		console.log(o) ;
	});
}

function editRow(data, row, callback) {

	$.ajax({
		url : 'example/edit_row.php' ,
		type : 'POST' ,
		data : {
			id = data['id'] ,
			title = data['title'] ,
			val = data['val'] ,
		}
	}).done(function (o){
		callback(row, true) ;
	}).fail(function (o){
		callback(row, false) ;
	}).always(function (o){
		console.log(o) ;
	});
}

function deleteRow(data, row, callback) {

	var r = confirm('Are you sure you want to delete '+data['title']+'?') ;

	if(r==true) {
		$.ajax({
			url : 'example/delete_row.php' ,
			type : 'POST' ,
			data : {
				id : data['id'] ,
			}
		}).done(function (o){
			if(o=='')
				callback(row, true) ;
			else
				callback(row, false) ;
		});
	}

}
```


FAQ
===

__Q. Does muTable take care of linking the view and model ?__

A. No, muTable is just an UI. The responsibility of linking is left to the control.