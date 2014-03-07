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

	muTable.filter = filter ;
	muTable.opt = opt ;

	var table = $("<table class='mutable'>") ;

	var ll = filter.length ;

	var header_row = $("<tr></tr>");
	if(opt['add']==true || opt['edit']==true) {
		var new_th = $( "<th class='toolbox'></th>" ) ;

		if(opt['add']==true) {
			new_th.addClass("add");
			var add_btn = $("<a>&#10010;</a>") ;
			add_btn.click(muTable.addClicked);
			new_th.append(add_btn);
		}

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
 * event handler on a selectable row for click event, adds a new row to the table
 */
muTable.addClicked = function () {
	var table = $(this).parent().parent().parent();
	var new_row = $("<tr></tr>") ;

	var toolbox = $("<td class='toolbox edit'></td>") ;

	var edit = $("<a class=\"hovlink addAccept\" >&#9998</a>");
	edit.click(muTable.editClicked);
	toolbox.append(edit);
	edit.hide();

	var accept = $("<a class=\"hovlink addAccept\" >&#10003</a>");
	accept.click(muTable.addAccept);
	toolbox.append(accept);

	var cancel = $("<a class=\"hovlink addCancel\" >&#10005</a>") ;
	cancel.click(muTable.addCancel);
	toolbox.append(cancel);

	new_row.append(toolbox);

	var ll = muTable.filter.length ;

	//loop through filter array to populate columns in the newly added row
	for(var j=0; j<ll; j++) {
		var new_col = $("<td></td>" ) ;
		var new_data = $("<span></span>") ;
		new_data.hide();
		var new_input = $("<input type='text' value='' />") ;
		new_col.append(new_data) ;
		new_col.append(new_input) ;
		new_row.append(new_col);
	}

	var delete_col = $("<td class='toolbox delete'></td>") ;
	if(muTable.opt['delete']==true) {
		var delete_btn = $("<a>&#10006;</a>") ;
		delete_btn.click(muTable.delete);
		delete_col.append(delete_btn);
		new_row.append(delete_col);
	}

	table.append(new_row);
}

/*
 * event handler on the add-accept button of a row for click event
 */
muTable.addAccept = function (event) {
	event.stopPropagation();						// stop propagation of the click event

	var accept = $(this);
	var toolbox = accept.parent() ;
	var row = toolbox.parent();

	var data = muTable.getRowData(row, "td:not(.toolbox) input", true) ;

	if(muTable.callback!=null && muTable.callback['onAddAccept']!=null) {	// is a callback function specified ?
		var status = muTable.callback['onAddAccept'](data) ;		// invoking callback function
		if(status==muTable.XMLHTTP_STATUS_OK) {						// callback retunred suscces
			row.find("td:not(.toolbox)").each( function (i, e){		// remove text boxes and show updated data in cells				
				var textelem = $(e).children().first() ;
				textelem.text(textelem.next().val());
				textelem.show();
				textelem.next().remove();
			} ) ;	

			toolbox.find(":first-child").show();			// show the editbtn
			toolbox.find(":not(:first-child)").remove();	// remove add_accepth and add_cancel
		}
	}
}

/*
 * event handler on the add-cancel button of a row for click event
 */
muTable.addCancel = function (event) {
	event.stopPropagation();

	var cancel = $(this);
	var toolbox = cancel.parent() ;
	var row = toolbox.parent();

	row.remove();
}


/*
 * get an editable row
 * input : optional, an array containing the values to be filled in text boxes
 */
muTable.getEditableRow = function (input) {

}

/*
 * event handler on the edit button of a row for click event
 */
muTable.editClicked = function (event) {
	event.stopPropagation();						// stop propagation of the click event

	var edit = $(this);
	var toolbox = edit.parent() ;
	var row = toolbox.parent();

	edit.hide();

	var accept = $("<a class=\"hovlink eidtAccept\" >&#10003</a>");
	accept.click(muTable.editAccept);
	toolbox.append(accept);

	var cancel = $("<a class=\"hovlink eidtCancel\" >&#10005</a>") ;
	cancel.click(muTable.editCancel);
	toolbox.append(cancel);

	row.find("td:not(.toolbox)").each( function (){
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
	event.stopPropagation();						// stop propagation of the click event

	var accept = $(this);
	var toolbox = accept.parent() ;
	var row = toolbox.parent();

	var data = muTable.getRowData(row, "td:not(.toolbox) input", true) ;

	if(muTable.callback!=null && muTable.callback['onEditAccept']!=null) {	// is a callback function specified ?
		var status = muTable.callback['onEditAccept'](data) ;		// invoking callback function
		if(status==muTable.XMLHTTP_STATUS_OK) {						// callback retunred suscces
			row.find("td:not(.toolbox)").each( function (i, e){		// remove text boxes and show updated data in cells				
				var textelem = $(e).children().first() ;
				textelem.text(textelem.next().val());
				textelem.show();
				textelem.next().remove();
			} ) ;	

			toolbox.find(":first-child").show();			// show the editbtn
			toolbox.find(":not(:first-child)").remove();	// remove editaccept, editcancel

		}
	}
}

/*
 * event handler on the edit-cancel button of a row for click event
 */
muTable.editCancel = function (event) {
	event.stopPropagation();

	var cancel = $(this);
	var toolbox = cancel.parent() ;
	var row = toolbox.parent();

	toolbox.find(":first-child").show();			// show the editbtn
	toolbox.find(":not(:first-child)").remove();	// remove editaccept, editcancel

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
	event.stopPropagation();						// stop propagation of the click event

	var del = $(this);
	var toolbox = del.parent() ;
	var row = toolbox.parent();

	var data = muTable.getRowData(row, "td:not(.toolbox) span", false) ;

	if(muTable.callback!=null && muTable.callback['onDelete']!=null) {	// is a callback function specified ?
		var status = muTable.callback['onDelete'](data) ;		// invoking callback function
		if(status==muTable.XMLHTTP_STATUS_OK) {					// callback retunred suscces
			row.remove();									//remove the row
		}
	}
}

/*
 * Get the data of a row
 * 
 * row : jquery object, the row to be deleted
 * selector : css selector to find the elements holding the data
 * inputfield : boolean, indicated whether the data should be taken from input fields using .val() function
 */
muTable.getRowData = function (row, selector, inputfield) {
	var data = {} ;											// associative array to hold the updated data
	row.find( selector ).each( function (i, e){		// loop through all the cells in this row except toolbox cells
		if(inputfield==true)
			data[muTable.filter[i]] = $(e).val() ;				// get updated data from input field
		else
			data[muTable.filter[i]] = $(e).text() ;				// get up updated data from element
	} ) ;

	//alert(data['fname']);

	return data ;
}