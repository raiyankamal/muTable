/***********************************************************************************
Copyright (c) 2014, K Raiyan Kamal (raiyan.kamal@gmail.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the FreeBSD Project.
***********************************************************************************/



/* Declaring namespace for muTable */
var muTable = muTable = muTable || {} ;


muTable.column = function (name, label) {
	this.name = name ;
	this.label = label ;
}


/* muTable constructor, creates a new muTable from the supplied data
 * 
 * data_source : source of the data, an url returning JSON array
 * data_dest : the HTML element where the data should be presented in
 * columns : only these colums are shown
 * opt : options, array 
 * callback : array of callback functions
 */
muTable.muTable = function (data_source, data_dest, columns, opt, callback) {
	this.XMLHTTP_STATUS_OK = 200 ;

	this.data_dest = data_dest ;
	this.opt = opt ;
	this.callback = callback ;

	this.columns = columns ;

	muTable.fetchDataForTable(this, data_source, data_dest, columns, opt, callback) ;
}


/* populates a new muTable
 * 
 * data_source : source of the data, an url returning JSON array
 * data_dest : the HTML element where the data should be presented in
 * column : only these colums are shown
 * opt : options, array 
 * callback : array of callback functions
 */
muTable.fetchDataForTable = function (mT, data_source, data_dest, columns, opt, callback) {

	console.log('fetching data for muTable instance from '+data_source) ;

	$.ajax({

		url: data_source ,
		type: "POST",
		contentType: "application/json; charset=utf-8",

	}).done(function(o) {
		mT.build_table(JSON.parse(o), data_dest, columns, opt);
	}).fail(function(o){
		alert('could not load data for mutable');
	});
}

muTable.muTable.prototype = {

	/* creates the HTML table element
	 */
	build_table : function (data, data_dest, columns, opt) {

		this.opt = opt ;
		this.data = data ;
		var num_col = columns.length ;

		var table = $("<table class='mutable'>") ;
		this.table = table ;

		var ll = columns.length ;

		var thead = $("<thead></thead>");								// header of the table

		if( this.opt['title']!=undefined ) {							//if title of table is set
			var title_row = $("<tr><td colspan=" + num_col + "><h1>" + this.opt['title'] + "</h1></td></tr>");					//the title element
			$(thead).append(title_row) ;								//append the title
		}

		var header_row = $("<tr></tr>");								// header row element for the table

		if(opt['add']==true || opt['edit']==true) {						// if either of the add or edit options are enabled then we would need an extra column
			var new_th = $( "<th class='toolbox'></th>" ) ;				// the td element for the extra column

			if(opt['add']==true) {										// populate this column only if the add option is enabled
				new_th.addClass("add");
				var add_btn = $("<a>&#10010;</a>") ;
				add_btn.click({mT: this,}, this.addClicked);
				new_th.append(add_btn);
			}

			header_row.append(new_th);									// append the extra column to the header row
		}
		
		for(var j=0; j<ll; j++) {										// populate the header row with appropriate column names
			var t = ( columns[j].label==undefined ) ? columns[j].name : columns[j].label ;	// if label is set for a column then the column name from DB is replaced
			var new_th = $("<th>" + t + "</th>") ;
			header_row.append(new_th);
		}

		if(opt['delete']==true) {
			var new_th = $("<th class='toolbox'></th>") ;
			header_row.append(new_th);
		}

		thead.append(header_row) ;

		table.append(thead) ;											// add header to table

		var tbody = $("<tbody></tbody>") ;

		var l = data.length ;
		var start_index = 0 ;
		var end_index = l ;

		if(opt['pagelen']!=undefined) {
			if(opt['currentpage']==undefined || this.opt['currentpage']*this.opt['pagelen'] > l)
				opt['currentpage'] = 0 ;
			start_index = this.opt['currentpage'] * this.opt['pagelen'] ;
			end_index = start_index + this.opt['pagelen'] ;
			end_index = ( end_index >= l ) ? l : end_index ;
		}

		console.log("currentpage : "+this.opt['currentpage']);
		console.log("pagination : "+start_index+" "+end_index);

		this.populate(data, start_index, end_index, columns, opt, tbody) ;

		table.append(tbody);

		var tfoot = $("<tfoot></tfoot>");			// footer of the table


		/* pagination */
		this.paginate(tfoot) ;
		table.append(tfoot);

		data_dest.append(table);
	} ,

	/*
	 * populate table with data between given indices
	 *
	 * data : rows in JSON array
	 * start_index : start from here
	 * end_index : end before this index
	 * columns : array columns to be shown, in the given order
	 * opt : muTable options
	 * tbody : tbody of the target table
	 */
	populate : function (data, start_index, end_index, columns, opt, tbody) {

		var ll = columns.length ;

		for(var i=start_index; i<end_index ; i++) {
			var new_row = $("<tr id='row_"+i+"' ></tr>") ;

			if(opt['edit'] || opt['add']) {									// an extra column is needed if either of the add or edit options are enabled

				var edit_col = $("<td class='toolbox edit'></td>") ;

				//whether the rows are editable
				if(opt['edit']==true) {
					var edit_btn = $("<a>&#9998;</a>") ;
					edit_btn.click({mT: this,} , this.editClicked) ;
					edit_col.append(edit_btn);
				}

				new_row.append(edit_col);
			}

			//loop through entries in data[i] to populate columns
			for(var j=0; j<ll; j++) {
				if(data[i].hasOwnProperty(columns[j].name)) {
					var new_col = $("<td><span>" + data[i][columns[j].name] + "</span></td>" ) ;
					if(columns[j].readonly)
						new_col.addClass('readonly') ;
					new_row.append(new_col);
				}
			}


			//whether the rows are deletable
			if(undefined != opt['delete'] && true == opt['delete']) {
				var delete_col = $("<td class='toolbox delete'></td>") ;
				var delete_btn = $('<a >&#10006;</a>') ;
				delete_btn.click({mT: this,} , this.delete);
				delete_col.append(delete_btn);
				new_row.append(delete_col);
			}


			if(opt['select']==true)
				new_row.click({mT: this,} , this.rowToggle) ;

			tbody.append(new_row) ;
		}	
	} ,


	/*
	 * navigates to the next/prev page
	 * next : if true then moves to the next page, otherwise moves to the previous page
	 */
	 navigate : function (e) {

	 	var mT = e.data.mT ;

		this.opt['currentpage'] += ($(this).hasClass('next'))? 1 : -1 ;

	 	var start_index = mT.opt['currentpage'] * mT.opt['pagelen'] ;
	 	var end_index = start_index + mT.opt['pagelen'] ;
	 	var l = mT.data.length ;

		end_index = ( end_index >= l ) ? l : end_index ;

		mT.table.find("tbody").empty();

		console.log(start_index);
		console.log(end_index);
		mT.populate(mT.data, start_index, end_index, mT.columns, mT.opt, mT.table.find("tbody")) ;
		mT.paginate(mT.table.find("tfoot"));
	} ,


	/*
	 * creates the pagination links
	 *
	 * tfoot : footer of the table where the new pagination should be shown
	 */
	paginate : function (tfoot) {
		if(this.opt['pagelen']!=undefined) {		//if pagination is defined

			var prev = "" ;
			var next = "" ;
			var l = this.data.length ;
			console.log(this.opt['currentpage']);
			if(this.opt['currentpage']>0) {
				prev = $("<a class='prev'>&lt;</a>") ;
				prev.click({mT: this,} , this.navigate);
			}

			if( (this.opt['currentpage']+1) * this.opt['pagelen'] < l) {
				next = $("<a class='next'>&gt;</a>") ;
				next.click({mT: this,} , this.navigate);
			}
			
			var page = $("<span>"+(this.opt['currentpage']+1)+"</span>");

			var pagination_row = $("<tr class='pagination' ></tr>") ;
			var colspan = this.columns.length + ( (this.opt['edit']||this.opt['add']) ? 1 : 0 ) + ( (this.opt['delete']) ? 1 : 0  );
			var pagination_col = $("<td class='toolbox' colspan=" + colspan + "></td>") ;
			pagination_col.append(prev).append(page).append(next) ;
			pagination_row.append(pagination_col) ;
			
			tfoot.empty();
			tfoot.append(pagination_row) ;				// pagination is appended to table footer
		}
	} ,


	/*
	 * event handler on a selectable row for click event
	 */
	rowToggle : function () {
		var row = $(this) ;
		if( $(row).hasClass("selected-row") ) {
			$(row).removeClass("selected-row");
		} else {
			$(row).addClass("selected-row");
		}
	} ,

	/*
	 * event handler on a selectable row for click event, adds a new row to the table
	 */
	addClicked : function (e) {

		var mT = e.data.mT ;

		var table = $(this).parent().parent().parent().parent().find('tbody');
		var new_row = $("<tr></tr>") ;

		var toolbox = $("<td class='toolbox edit'></td>") ;

		var edit = $("<a class=\"hovlink addAccept\" >&#9998</a>");
		edit.click({mT: mT,} , mT.editClicked);
		toolbox.append(edit);
		edit.hide();

		var accept = $("<a class=\"hovlink addAccept\" >&#10003</a>");
		accept.click( {mT: mT,}, mT.addAccept);
		toolbox.append(accept);

		var cancel = $("<a class=\"hovlink addCancel\" >&#10005</a>") ;
		cancel.click({mT: mT,} , mT.addCancel);
		toolbox.append(cancel);

		new_row.append(toolbox);

		var ll = mT.columns.length ;

		//loop through the columns array to populate columns in the newly added row
		for(var j=0; j<ll; j++) {
			var new_col = $("<td></td>" ) ;
			var new_data = $("<span></span>") ;
			new_data.hide();

			if(!mT.columns[j].readonly) {
				var new_input = $("<input type='text' value='' />") ;
				new_col.append(new_input) ;
			}

			new_col.append(new_data) ;
			new_row.append(new_col);
		}

		var delete_col = $("<td class='toolbox delete'></td>") ;
		if(mT.opt['delete']==true) {
			var delete_btn = $("<a>&#10006;</a>") ;
			delete_btn.click({mT: mT,} , mT.delete);
			delete_col.append(delete_btn);
			new_row.append(delete_col);
		}

		table.prepend(new_row);
	} ,

	/*
	 * event handler on the add-accept button of a row for click event
	 */
	addAccept : function (event) {
		event.stopPropagation();						// stop propagation of the click event

		var mT = event.data.mT ;

		var accept = $(this);
		var toolbox = accept.parent() ;
		var row = toolbox.parent();

		var data = mT.getRowData(row, true) ;

		if(mT.callback!=null && mT.callback['onAddAccept']!=null) {	// is a callback function specified ?
			mT.callback['onAddAccept'](data, row, mT.addAcceptComplete ) ;				// invoking callback function
		}
	} ,

	/*
	 * The default callback function to cleanup the UI upon completion of the addAccept transaction
	 */
	addAcceptComplete : function (row, suscces) {

		if(suscces) {												// the transaction was successful
			row.find("td:not(.toolbox)").each( function (i, e){		// remove text boxes and show updated data in cells	
				var textelem = $(e).children().first() ;
				textelem.text(textelem.next().val());
				textelem.show();
				textelem.next().remove();
				textelem = undefined ;
			} ) ;

			var toolbox = row.find('td.toolbox') ;
			toolbox.find(":first-child").show();			// show the editbtn
			toolbox.find(":not(:first-child)").remove();	// remove add_accepth and add_cancel
		}
		else {
			alert("Could not save, please try again or cancel.") ;
		}
	} ,

	/*
	 * event handler on the add-cancel button of a row for click event
	 */
	addCancel : function (event) {
		event.stopPropagation();
		var row = $(this).parent().parent();
		row.remove();
	} ,


	/*
	 * get an editable row
	 * input : optional, an array containing the values to be filled in text boxes
	 */
	getEditableRow : function (input) {

	} ,

	/*
	 * event handler on the edit button of a row for click event
	 */
	editClicked : function (event) {
		event.stopPropagation();						// stop propagation of the click event

		var mT = event.data.mT ;

		var edit = $(this);
		var toolbox = edit.parent() ;
		var row = toolbox.parent();

		edit.hide();

		var accept = $("<a class=\"hovlink eidtAccept\" >&#10003</a>");
		accept.click({mT: mT,} , mT.editAccept);
		toolbox.append(accept);

		var cancel = $("<a class=\"hovlink eidtCancel\" >&#10005</a>") ;
		cancel.click({mT: mT,} , mT.editCancel);
		toolbox.append(cancel);

		row.find("td:not(.toolbox)").each( function (i, e){

			if(!mT.columns[i].readonly) {			
				var textelem = $(this).children().first() ;
				textelem.hide();
				var tbox = $("<input type='text' placeholder='write new text here' value='"+textelem.text()+"' >");
				$(this).append(tbox);
			}

		} ) ;
	} ,

	/*
	 * event handler on the edit-accept button of a row for click event
	 */
	editAccept : function (event) {
		event.stopPropagation();						// stop propagation of the click event
		var mT = event.data.mT ;
		var row = $(this).parent().parent() ;
		var data = mT.getRowData(row, true) ;

		if(mT.callback!=null && mT.callback['onEditAccept']!=null) {	// is a callback function specified ?
			mT.callback['onEditAccept'](data, row, mT.editAcceptComplete) ;
		}
	} ,

	/*
	 * The default function to cleanup the UI after completion of the editAccept transaction
	 */
	editAcceptComplete : function (row, suscces) {
		if(suscces) {												// the transaction was successful
			row.find("td:not(.toolbox)").each( function (i, e){		// remove text boxes and show updated data in cells	
				var textelem = $(e).children().first() ;
				textelem.text(textelem.next().val());
				textelem.show();
				textelem.next().remove();
				textelem = undefined ;
			} ) ;

			var toolbox = row.find('td.toolbox') ;
			toolbox.find(":first-child").show();			// show the editbtn
			toolbox.find(":not(:first-child)").remove();	// remove editaccept, editcancel
		}
		else {
			alert("Could not save, please try again or cancel.") ;
		}
	} ,


	/*
	 * event handler on the edit-cancel button of a row for click event
	 */
	editCancel : function (event) {
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
	} ,

	/*
	 * event handler on the delete button of a row for click event
	 */
	delete : function (event) {
		event.stopPropagation();						// stop propagation of the click event

		var mT = event.data.mT ;

		var del = $(this);
		var toolbox = del.parent() ;
		var row = toolbox.parent();

		var data = mT.getRowData(row, false) ;

		if(mT.callback!=null && mT.callback['onDelete']!=null) {	// is a callback function specified ?		
			mT.callback['onDelete'](data, row, mT.deleteComplete) ;
		} else {
			row.remove() ;
		}
	} ,

	deleteComplete : function (row, suscces) {
		console.log('deleteComplete') ;
		console.log(this) ;
		if(suscces) {												// the transaction was successful
			row.remove() ;
		}
		else {
			alert("Could not delete, please try again.") ;
		}
	} ,

	/*
	 * Get the data of a row
	 * 
	 * row : jquery object, the row to be deleted
	 * selector : css selector to find the elements holding the data
	 * inputfield : boolean, indicated whether the data should be taken from input fields using .val() function
	 */
	getRowData : function (row, inputfield) {
		var data = {} ;
		var mT = this ;
		//var c = row[0].getElementsByTagName('td') ;
		row.find( "td:not(.toolbox)" ).each( function (i, e){		// loop through all the cells in this row except toolbox cells
			//var j = [].indexOf.call(c, $(e).parent()[0] ) ;
			//if(mT.opt['edit'] || mT.opt['add'])
			//	j-- ;

			if(mT.columns[i].readonly) {
				data[mT.columns[i].name] = $(e).text() ;
			}
			else {
				if(inputfield==true)
					data[mT.columns[i].name] = $(e).find('input').val() ;				// get updated data from input field
				else
					data[mT.columns[i].name] = $(e).find('span').text() ;				// get up updated data from element
			}

		} ) ;

		console.log(data) ;
		return data ;
	} ,

} ;

	//jQuery.noConflict();
