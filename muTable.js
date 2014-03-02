/* Declaring namespace for muTable */
var muTable = muTable = muTable || {} ;


/* populates a new muTable
 * @data_source : source of the data, an url returning JSON array
 * @data_dest : the HTML element where the data should be presented in
 * @filter : only these colums are shown
 * @opt : options, array 
 */
muTable.getNewMuTable = function (data_source, data_dest, filter, opt) {

	//alert(data_source);

	var t=new XMLHttpRequest();
	t.onreadystatechange=function()
	{
		if(t.readyState==4 )
		{
			table = JSON.parse(t.responseText);
			muTable.putData(table, data_dest, filter, opt);
		}
	}
	t.open("GET", data_source, true) ;
	t.send(null) ;
}

/* creates the HTML table element
 */
muTable.putData = function(data, data_dest, filter, opt) {

	var table = $("<table class=\"mutable\">") ;

	var ll = filter.length ;

	var text = "<tr>" ;
	/*
	if(opt['select']==true)
		text += "<th class=\"toolbox\">&nbsp;</th>" ;*/

	if(opt['edit']==true)
		text += "<th class=\"toolbox\">&nbsp;</th>" ;
	
	for(var j=0; j<ll; j++) {
		text += "<th>" + filter[j] + "</th>" ;
	}

	if(opt['delete']==true)
		text += "<th class=\"toolbox\">&nbsp;</th>" ;

	text += "</tr>" ;
	var header_row = $(text) ;
	table.append(header_row) ;

	var l = data.length ;
	for(var i=0; i<l ; i++) {
		var text = "<tr id=\"row_"+i+"\" >" ;

		var tool_text = "" ;

		//whether the rows are editable
		if(opt['edit']==true) {
			tool_text += "<td class=\"edit\"><a>&#9998;</a></td>" ;
		}

		tool_text += "</td>" ;
		text += tool_text ;

		for(var j=0; j<ll; j++) {
			if(data[i].hasOwnProperty(filter[j])) {
				text += "<td>" + data[i][filter[j]] + "</td>" ;
			}
		}

		//whether the rows are deletable
		if(opt['delete']==true)
			text += "<td class=\"delete\"><a>&#10006;</a></td>" ;

		text += "</tr>" ;

		//create jQuery object
		var new_row = $(text) ;
		new_row.click(muTable.rowToggle) ;

		table.append(new_row) ;
	}


	data_dest.append(table);
}

/*
 * event handler on a selectable row for click event
 */
muTable.rowToggle = function () {
	var row = $(this) ;
	if( $(row).hasClass("selected-row") ) {
		$(row).removeClass("selected-row");
	} else {
		$(row).addClass("selected-row");
	}
}

/*
 * get and editable row
 * @input : optional, an array containing the values to be filled in text boxes
 */
muTable.getEditableRow = function (input) {

}

/*
 * event handler on the edit button of a row for click event
 */
muTable.editClicked = function () {

}

/*
 * event handler on the edit-accept button of a row for click event
 */
muTable.editAccept = function() {

}

/*
 * event handler on the edit-cancel button of a row for click event
 */
muTable.editCancel = function () {

 }

/*
 * event handler on the delete button of a row for click event
 */
muTable.delete = function() {

}