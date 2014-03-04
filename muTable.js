/* Declaring namespace for muTable */
var muTable = muTable = muTable || {} ;

muTable.XMLHTTP_STATUS_OK = 200 ;

muTable.callback = {} ;

/* populates a new muTable
 * 
 * data_source : source of the data, an url returning JSON array
 * data_dest : the HTML element where the data should be presented in
 * filter : only these colums are shown
 * opt : options, array 
 * callback : array of callback functions
 */
muTable.getNewMuTable = function (data_source, data_dest, filter, opt, callback) {

	//alert(data_source);

	var t=new XMLHttpRequest();
	t.onreadystatechange=function ()
	{
		if(t.readyState==4 )
		{
			if(t.status==muTable.XMLHTTP_STATUS_OK) {
				table = JSON.parse(t.responseText);
				muTable.putData(table, data_dest, filter, opt);
				muTable.callback = callback ;
			} else {
				table = "error loading data for table" ;
			}
		}
	}
	t.open("GET", data_source, true) ;
	t.send(null) ;
}

/* creates the HTML table element
 */
muTable.putData = function (data, data_dest, filter, opt) {

	var table = $("<table class='mutable'>") ;

	var ll = filter.length ;

	//var text = "<tr>" ;
	var header_row = $("<tr></tr>");

	if(opt['edit']==true) {
		var new_th = $( "<th class='toolbox'>&nbsp;</th>" ) ;
		header_row.append(new_th);
	}
	
	for(var j=0; j<ll; j++) {
		var new_th = $("<th>" + filter[j] + "</th>") ;
		header_row.append(new_th);
	}

	if(opt['delete']==true) {
		var new_th = $("<th class='toolbox'>&nbsp;</th>") ;
		header_row.append(new_th);
	}

	//text += "</tr>" ;
	//var header_row = $(text) ;
	table.append(header_row) ;

	var l = data.length ;
	for(var i=0; i<l ; i++) {
		var new_row = $("<tr id='row_"+i+"' ></tr>") ;

		var edit_col = $("<td class='toolbox edit'></td>") ;

		//whether the rows are editable
		if(opt['edit']==true) {
			var edit_btn = $("<a>&#9998;</a>") ;
			edit_btn.click(muTable.editClicked) ;
			edit_col.append(edit_btn);
		}

		new_row.append(edit_col);

		//loop through entries in data[i] to populate columns
		for(var j=0; j<ll; j++) {
			if(data[i].hasOwnProperty(filter[j])) {
				var new_col = $("<td><span>" + data[i][filter[j]] + "</span></td>" ) ;
				new_row.append(new_col);
			}
		}

		var delete_col = $("<td class='toolbox delete'></td>") ;

		//whether the rows are deletable
		if(opt['delete']==true) {
			var delete_btn = $("<a>&#10006;</a>") ;
			delete_btn.click(muTable.delete);
			delete_col.append(delete_btn);
		}

		new_row.append(delete_col);

		//create jQuery object
		//var new_row = $(text) ;
		if(opt['select']==true)
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
 * get an editable row
 * @input : optional, an array containing the values to be filled in text boxes
 */
muTable.getEditableRow = function (input) {

}

/*
 * event handler on the edit button of a row for click event
 */
muTable.editClicked = function (event) {
	event.stopPropagation();

	var edit = $(this);
	var toolbox = edit.parent() ;
	var row = toolbox.parent();

	edit.hide();
	var accept = $("<a class=\"hovlink summaryEidtAccept\" >&#10003</a>");
	accept.click(muTable.editAccept);
	toolbox.append(accept);

	var cancel = $("<a class=\"hovlink summaryEidtCancel\" >&#10005</a>") ;
	cancel.click(muTable.editCancel);
	toolbox.append(cancel);

	row.find("td:not(.toolbox)").each( function(){
		var textelem = $(this).children().first() ;
		textelem.hide();
		var tbox = $("<input type='text' placeholder='write new text here' value='"+textelem.text()+"' >");
		$(this).append(tbox);
	} ) ;
}

/*
 * event handler on the edit-accept button of a row for click event
 */
muTable.editAccept = function (event) {
	event.stopPropagation();
	if(muTable.callback!=null && muTable.callback['onEditAccept']!=null) {
		muTable.callback['onEditAccept']("xyz") ;
	}

	//TODO : send the data collected from text boxes to DB

	//TODO : resotore the UI
}

/*
 * event handler on the edit-cancel button of a row for click event
 */
muTable.editCancel = function (event) {
	event.stopPropagation();

	var cancel = $(this);
	var toolbox = cancel.parent() ;
	var row = toolbox.parent();

	toolbox.find(":first-child").show();
	toolbox.find(":not(:first-child)").remove();

	row.find("td:not(.toolbox)").each( function(){
		var textelem = $(this).children().first() ;
		textelem.show();
		textelem.next().remove();
	} ) ;
}

/*
 * event handler on the delete button of a row for click event
 */
muTable.delete = function (event) {
	event.stopPropagation();
}