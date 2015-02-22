//Bootstrap and jQuery work
//searching, sorting, pagination and ajax from json data
//compatible with IE8, IE11
//Note:- JSON data should not contain duplicates in data array
if (window.jQuery && data){
    jQuery(document).ready(function() {
		if (!Array.prototype.indexOf){
		  Array.prototype.indexOf = function(elt /*, from*/)
		  {
			var len = this.length >>> 0;

			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				 ? Math.ceil(from)
				 : Math.floor(from);
			if (from < 0)
			  from += len;

			for (; from < len; from++)
			{
			  if (from in this &&
				  this[from] === elt)
				return from;
			}
			return -1;
		  };
		}
        (function(w, $, d) {
            //-----------------------
            //Declaration
            //-----------------------
            var e = '#' + d.settings.id;
            c = 5;
            v = {}; 
            (d.settings.debug)?(l = function(m) {
                console.log(m);
            }):(l = function(){});
            var iD = function(start) { 									//insert data from json to table
                var end = (d.data.length < d.settings.rows) ? d.data.length : parseInt(d.settings.rows) + start;
                $('#data-table tbody').html('');						 //clearing the present table first
                for (var i = start; i < end; i++) {
					var tr = "<tr></tr>";
                    $(e).find('tbody').append(tr);
                    for (var j = 0; j < c - 2; j++){ //adding json data tables
                        try {
							var data = (d.data[i][j] instanceof Array)?d.data[i][j][0]:d.data[i][j];
							var td1 = '<td data-col="' + d.data.indexOf(d.data[i]) + '">' + data + '</td>';
							$(e).find('tbody tr:last-child').append(td1);
						} catch(error){
							l('Error:'+error);
							$(e).find('tbody tr:last-child').remove();		//remove the last added row
							add_extras();									//perform the extra steps
							return;
						}
						l('Index:'+i+':'+j+':'+d.data[i][j]);
					}
                }
                //run the extra redo-work
				add_extras();
            };
            v.count = 0;
            v.getKeyByValue = function(value, obj) {
                for (var prop in obj) {
                    if (this.hasOwnProperty(prop)) {
                        if (this[prop] === value)
                            return prop;
                    }
                }
            };
			//Extras
			//appending edit and delete options
			var add_extras = function(){
					$(e).find('tbody tr').append('<td class="edit" data-toggle="modal" data-target="#editModal"></td><td class="delete" data-toggle="modal" data-target="#delModal"></td>');
					$('.edit').html('<button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-edit"></span></button>');
					$('.delete').html('<button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
					add_events();
				};
			//--------------------------
            //Event Handling-----------------
            //--------------------------
			var add_events = function(){
				
				 $('.edit').click(function() {
                    var ele = $(this);
                    $('#editModal .modal-body form').html('');		//clearing data
                    var tar = ele.closest('tr'), 
                    jsonIndex = tar.find('td:first').attr('data-col');
                    l('jsonIndex:\t' + jsonIndex);
                    for (var key in d.data[jsonIndex]) {
						var data = (d.data[jsonIndex][key] instanceof Array)?(
						$(document.createElement('div')).
							append('<label>' + d.cols[key]  + '</label><select class="form-control" data-index-content="' + key + '"></select>').
							each(function(){
								for(var i=0;i<d.data[jsonIndex][key].length;i++)
									$(this).find('select').append('<option>'+d.data[jsonIndex][key][i]+'</option>');
								$(this).find('option:first').attr('selected','selected');
								}).
							appendTo('#editModal .modal-body form')
						):( $('#editModal .modal-body form').append('<div><label>' + d.cols[key] + '</label><input type="text" value="' + d.data[jsonIndex][key] + '" class="form-control" data-index-content="' + key + '"/>'))
                        $('#editModal .modal-body form').attr('data-index', jsonIndex);
                    }
                  
                    $('#editModal .modal-body form').html();
                });
			    
                $('.delete').click(function() {					//delete data event
                    //modal event triggers
                    delTarget = $(this).closest('tr');
					data_col = parseInt(delTarget.find('td:first').attr("data-col"));
					l('data_col:'+data_col);					//log console data
                });
				
				$('#btn-yes').click(function(){					//confirm delete data event
                    $('#delModal').modal('hide');
                    d.data.splice(data_col,1);					//remove element from json
					delTarget.remove();							//remove element from table
				});
				
				$('#btn-cancel').click(function() {				//cancel data update event
                    $('#editModal').modal('hide');
                });
				
				 $('#btn-update').click(function() {			//update data event(challenging)
                    
					var ele = $('#editModal .modal-body form');
					var col = parseInt(ele.attr('data-index'));
					var data = d.data[col];
					ele.find('[data-index-content]').each(function(){
						var key = parseInt($(this).attr('data-index-content'));
						var val = $(this).val();
						(d.data[col][key] instanceof Array)?(function(){
							var tmp = d.data[col][key][0];
							var index = d.data[col][key].indexOf(val);
							d.data[col][key][0] = val;					//interchanging array key values
							d.data[col][key][index] = tmp				//interchanging array key values
						})():(d.data[col][key]=val);
						l(d);
					});
					iD(data_page-1);									//reload table
					$('#editModal').modal('hide');						//hide modal
				});
                
			};
			//--------------------------
			//Pagination
			//--------------------------
			var add_pagination = function(){
				$('ul.pagination > li:last');
                for (var i = 1; i < d.data.length / d.settings.rows; i++) {
                    $('ul.pagination > li:last').before('<li><a href="" data-page="' + (i + 1) + '">' + (i + 1) + '</a></li>');
                }
				data_total_page = d.data.length/d.settings.rows;	//counts total pages
				data_last_page = data_page = 1;					//initialize page to 1
                $('ul.pagination a').click(function() {			//activate pagination
                    var data_attr = $(this).attr('data-page');
					data_page = data_attr;
					l('Paginated page request:'+data_page+' Last page request:'+data_last_page);
					$('[data-page="'+data_last_page+'"]').css('background-color','#fff');
					if(data_page == -1){						//previous request
						if(data_last_page>1){
							$('#data-table tbody').html('');			//emptying data
							data_last_page = data_last_page - 1;
							iD((data_last_page - 1) * d.settings.rows );
							l('current-page'+data_page+'\tLast-page'+data_last_page);
							$(this).css('background-color','#fff');
							
						}
					} else if(data_page == -2){					//next request
						if(data_last_page < data_total_page){
							$('#data-table tbody').html('');			//emptying data
							iD((data_last_page) * d.settings.rows );
							data_last_page = data_last_page + 1;
							$(this).css('background-color','#fff');
							
						}
					} else {									//page request
						$('#data-table tbody').html('');			//emptying data
						iD((data_page - 1) * d.settings.rows);
						data_last_page = data_attr;
					}
					$('[data-page="'+data_last_page+'"]').css('background-color','#eee');
                    $("#data-table").trigger("update");			//update sorting with tablesorter
					return false;
                });
			}
            //--------------------------
            //Setup-----------------
            //--------------------------
            var setup = function() {
                for (var i in d.cols)
                    $(e).find('thead tr').append('<th data-column="'+i+'"><span class="glyphicon glyphicon-sort"></span> ' + d.cols[i] + '</th>');
				
				iD(0);				//init table data
				add_pagination();	//add pagination
				
                //-----------------------------------
                //One time event Handling------------
                //-----------------------------------
				$('#btn-no').click(function(){					//don't delete data event
					$('#delModal').modal('hide');
				});
				
				var $table = $("#data-table").tablesorter(
				 {
					 widgets: ["filter"],
					 widgetOptions: {
						filter_external : '.search',
						filter_columnFilters : false
						//filter_defaultFilter: { 1 : '~{query}' }
					 }
				 }
				 );
				 $("#update-to-server").click(function(){
					 $.ajax({
						 type: "POST",
						 url:"index.html",
						 data:JSON.stringify(data.data),									//data to be sent
						 contentType: "application/json; charset=utf-8",
						 success:function(response,status,xhr){								//modify your ajax respone hear
							alert('Data successfully submitted to server');
							console.log(data);
							},
						 error:function(){alert('Data submission error to server');},
						 complete:function(){alert('Data submissoin request complete');}	//ajax response callback
					 });
					 
				 });
			}
            //-----------------------
            //Initialize
            //-----------------------
            setup();
        })(window, jQuery, data);
    });
}