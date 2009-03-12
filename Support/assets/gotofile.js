/*
 * the following will be assigned by the ruby file
 * * bundle_support
 * * path_to_ruby
 */



/* initializer */
var GoToFile = function(){
	this.selected_file = null;
};

var SelectedFile = function(num){
	this.num = num;
	this.selector = '#result_' + num;
};

jQuery.extend(GoToFile, {
	/* constants and class variables */
	/* make this a singleton */
	instance: null,
	
	/* class methods */
	
	setup: function(){
		$(document).ready(function(){
			GoToFile.instance = new GoToFile; /* create a global instance */
			$("#search").focus();
			$(document).keydown(GoToFile.handle_keydown);
			$(document).keyup(GoToFile.handle_keyup);
		});
	},
	
	handle_search: function(value){
		GoToFile.instance.start_search(value);
	},
	
		
	handle_keydown: function(event){
		if (typeof event == "undefined") event = window.event;
		// $('#result').text(wkey);
		switch(event.keyCode) {
			case 9: // tab
			case 38: // up
			case 40: // down
			case 33: // page up
			case 34: // page down
				GoToFile.instance.change_selection_for_event(event);
				// fallthrough intentional to stop propagation
			case 32: // space
			case 27: // escape
			case 13: // return/enter
				event.stopPropagation();
				event.preventDefault();	
				break;
		}
	},
	
	handle_keyup: function(event){
		if (typeof event == "undefined") event = window.event;
		switch(event.keyCode) {
			case 27: // escape
			case 32: // space
			case 13: // return/enter
				GoToFile.instance.action_for_event(event);
				// fallthrough intentional to stop propagation
			case 9: // tab
			case 38: // up
			case 40: // down
			case 33: // page up
			case 34: // page down
				event.stopPropagation();
				event.preventDefault();
				break;
		}
	},

	handle_click: function(num){
		GoToFile.instance.set_selection(new SelectedFile(num));
		GoToFile.instance.action_select_file(event);
	},
	

	/* instance methods and variables */
	prototype: {

		start_search: function(){
			if (this.textmate_command) this.textmate_command.cancel();
			TextMate.isBusy = false;
			$("#footer_progress").css('width', "0px");
			$("#footer_progress_text").empty();
			$("#result").empty();
			
			this.progress_wheel.start();
			this.set_selection(0);
			this.selected_file = null;
			this.output_buffer = "";
			
			var cmd = "'" + path_to_ruby + "' '" + bundle_support + "/lib/file_finder.rb' '" + $("#search").val() + "'";
			this.textmate_command = TextMate.system(cmd, function(task) {
				GoToFile.instance.textmate_command_finished();
			});
			this.textmate_command.onreadoutput = function(str){ GoToFile.instance.textmate_command_stdout(str); };
			this.textmate_command.onreaderror = function(str){ GoToFile.instance.textmate_command_stderr(str); };
		},
		
		textmate_command_stdout: function(str){
			this.output_buffer += str;
			// $('#result).append() doesn't work here because str is buffered
			// and we are not guarranteed that str is valid html
		},
		
		textmate_command_stderr: function(str){
			var arr = str.split("|",2);
			$("#footer_progress").css('width', arr[0]);
			$("#footer_progress_text").html(arr[1]);
		},
		
		textmate_command_finished: function(){
			this.progress_wheel.stop();
			$('#result').html(this.output_buffer);
			if (this.selected_file == null)
				this.change_selection(0);
		},
		
		progress_wheel: {
			start: function(){
				window.clearTimeout(this.progress_timer);
				this.progress_timer = window.setTimeout(this.show, 2);
			},
		
			show: function(){
				$("#progress").show();
				$("#footer").css('height', "16px");
			},
		
			stop: function(){
				window.clearTimeout(this.progress_timer);
				$("#progress").hide();
				$("#footer_progress").css('width', '0');
				$("#footer").css('height', '0');
				$("#footer_progress_text").empty();
			}
		},

		set_selection: function(file){
			if (this.selected_file) $(this.selected_file.selector).removeClass('selected');
			this.selected_file = file;
			if (this.selected_file) {
				$(this.selected_file.selector).addClass('selected');
				this.selected_file.scroll_to();
			}
		},
		
		change_selection: function(delta){
			var num = 0,
				total_count = $('#result').find('.file').length;
			if (this.selected_file) num = this.selected_file.num;
			num += delta;
			if (num >= total_count) num = 0;
			if (num < 0) num = total_count - 1;
			this.set_selection(new SelectedFile(num));
		},
		
		change_selection_for_event: function(event){
			var num = 0;
			switch(event.keyCode) {
				case 9: // tab
					if (event.shiftKey)
						num = -1;
					else
						num = 1;
					break;
				case 38: // up
					num = -1;
					break;
				case 40: // down
					num = 1;
					break;
				case 33: // page up
					num = -10;
					break;
				case 34: // page down
					num = 10;
					break;
			}
			
			this.change_selection(num);
		},

		action_for_event: function(event){
			switch(event.keyCode) {
				case 27: // escape
					if (this.textmate_command) this.textmate_command.cancel();
					this.progress_wheel.stop();
					if ($('#search').val() == "")
						window.close();
					else
						$('#search').val("");
					break;
				case 32: // space
					if (event.altKey)
						this.insert_escaped_space();
					else
						this.selected_file.quicklook();
					break;
				case 13: // return/enter
					this.action_select_file(event);
					break;
			}
		},
		
		/*
		 * this is what is run when a file is chosen
		 * ie, it is clicked on or enter is pressed
		 */
		action_select_file: function(event) {
			if (event.shiftKey && event.altKey) this.selected_file.insert_path();
			else if (event.shiftKey) this.selected_file.insert_relative_path();
			else if (event.altKey) this.selected_file.open_file();
			else this.selected_file.go_to_file();
		},
		
		// 
		// example usage:
		// 
		// setTimeout(this.bind(func, arg), 5000);	
		bind: function() {
			var _func = arguments[0] || null,
				_obj = this;

			 // get rid of the first argument (was the function)
			 // we would use shift() but arguments is not actually an array
			var _args = $.grep(arguments, function(v, i) {
			        return i > 0;
			});

			return function() {
			        return _func.apply(_obj, _args);
			};
		}
	}
});


jQuery.extend(SelectedFile, {
	prototype: {
		
		go_to_file: function(){
			var cmd = "file -b '" + this.actual_path() + "' | grep -q text && mate '" + this.actual_path() + "' &";
			TextMate.system(cmd, null);
		},
		
		insert_path: function(){
			var cmd = "osascript '" + bundle_support + "/lib/insertPath.applescript' '" + this.actual_path() + "' &";
	        TextMate.system(cmd, null);
		},
		
		insert_relative_path: function(){
			var cmd = "osascript '" + bundle_support + "/lib/insertRelPath.applescript' '" + this.actual_path() + "' &";
	        TextMate.system(cmd, null);
		},
		
		open_file: function(){
			TextMate.system("open '" + this.actual_path() + "' &", null);
		},
		
		
		
		// get_top_offset: function(item) {
		// 	var parent = item;
		// 	var top = item.offsetTop;
		// 	while(parent = parent.offsetParent)
		// 		top += parent.offsetTop;
		// 	return top;
		// },
		
		scroll_to: function() {
			var item = $(this.selector)[0];
			var itemPos = $(this.selector).position().top; //this.get_top_offset(item);
			var headHeight = $('#head')[0].offsetHeight;
			// $('#result').append('scroll_to itemPos(' + itemPos + ') headHieght(' + headHeight + ')<br>');
			if (itemPos < document.body.scrollTop + headHeight) {
				document.body.scrollTop = itemPos - headHeight - 1;
			} else if ((itemPos + item.offsetHeight >= document.body.clientHeight + document.body.scrollTop)) {
				document.body.scrollTop = itemPos - document.body.clientHeight + item.offsetHeight + 1;
			}
		},
		
		
		
		actual_path: function(){
			return $(this.selector).find('input[name=path]').val();
		}
	}
});

GoToFile.setup();

/* below is old code that we are cleaning up */


var current_ql_command=null;
var current_ql_command_id=0;




function cancel_quicklook() {
	var closed_quicklook = current_ql_command != null;
	if (current_ql_command)
		current_ql_command.cancel();
	current_ql_command = null;
	return closed_quicklook;
}
function quicklook() {
	if (!current_file) return;
	var display_id = current_ql_command_id + 1;
	if (current_ql_command)
		cancel_quicklook();
	else {
		current_ql_command_id = display_id;
		current_ql_command = TextMate.system("qlmanage -p '" + actpath + "'", function(task) {
			if (display_id == current_ql_command_id)
				current_ql_command = null;
		});
	}
}







function insertEscapedSpace() {
	var searchBox = document.getElementById('search');
	var query = searchBox.value;
	var selStart = searchBox.selectionStart;
	searchBox.value = query.substr(0, selStart) + "\\ " + query.substr(searchBox.selectionEnd);
	searchBox.selectionStart = selStart + 2;
	searchBox.selectionEnd = searchBox.selectionStart;
	startSearch(searchBox.value);
}
// document.onkeydown = function keyPress(event) {
//     if (typeof event == "undefined") event = window.event;
//     wkey = event.keyCode;
// 	if (wkey == 32 || wkey == 27) {
// 		event.stopPropagation();
// 		event.preventDefault();
// 	} else if (wkey == 38 || wkey == 40 || wkey == 33 || wkey == 34 || wkey == 9) {
// 	  event.stopPropagation();
// 	  event.preventDefault();
// 	var iDiff = 1;
// 	if (wkey == 33)
// 		iDiff = -10;
// 	else if (wkey == 34)
// 		iDiff = 10;
// 	else if (wkey == 38 || (wkey == 9 && event.shiftKey))
// 		iDiff = -1;
// 		
// 	  changeSelect(iDiff);
//     } else if (wkey == 13) {
// 	  event.stopPropagation();
// 	  event.preventDefault();
// 	}
// };
// document.onkeyup = function keyPress(event) {
//     if (typeof event == "undefined") event = window.event;
//     wkey = event.keyCode;
//     if (wkey == 38 || wkey == 40 || wkey == 33 || wkey == 34 || wkey == 9) { /* up, down, page up, page down, tab *?
// 	  event.stopPropagation();
// 	  event.preventDefault();
//     }
//     if (wkey == 27) { /* escape */
//         if (myCommand) myCommand.cancel();
//         window.clearTimeout(progressTimer);
//         window.clearTimeout(startTimer);
//         stopProgressWheel();
//         if (document.getElementById('search').value == "")
//                 window.close();
//         else
//                 document.getElementById('search').value = "";
//         event.stopPropagation();
//         event.preventDefault();
//     }
//     if (wkey == 32) { /* space */
// 		if (event.altKey)
// 			insertEscapedSpace();
// 		else
// 			quicklook();
// 		event.stopPropagation();
// 		event.preventDefault();
// 	}
//     if (wkey == 13) { /* return */
//         if (event.shiftKey && event.altKey) insertPath();
//         else if (event.shiftKey) insertRelPath();
//         else if (event.altKey) openFile();
//         else gotofile();
// 	  event.stopPropagation();
// 	  event.preventDefault();
//     }
// };

