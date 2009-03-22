/*
 * the following will be assigned by the ruby file
 * * bundle_support
 * * path_to_ruby
 */



function create_object(object, properties) {
	for (var prop in properties) {
		object[prop] = properties[prop];
	}
}

/* initializers */
var GoToFile = function(){
	this.selected_file = null;
};

var SelectedFile = function(num){
	this.num = num;
	this.selector = 'result_' + num;
};

var Helper = function(){};


create_object(GoToFile, {
	/* constants and class variables */
	/* make this a singleton */
	instance: null,
	
	/* class methods */
	
	setup: function(){
		window.setTimeout(function(){
			GoToFile.instance = new GoToFile; /* create a global instance */
			Helper.element("search").focus();
			document.onkeydown = GoToFile.handle_keydown;
			document.onkeyup = GoToFile.handle_keyup;
		}, 1); // wait for page to load in an unreliable way
	},
	
	
	handle_search: function(value){
		GoToFile.instance.start_search(value);
	},
	
	handle_keydown: function(event){
		if (typeof event == "undefined") event = window.event;

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
	
	// this callback gets called by fuzzy_file_finder.rb
	// to indicate the progress of scanning through files
	progress: function(percent, text){
		Helper.set_style("footer_progress", 'width', percent);
		Helper.element("footer_progress_text").innerHTML = text;		
	},

	/* instance methods and variables */
	prototype: {

		start_search: function(){
			if (this.textmate_command) this.textmate_command.cancel();
			TextMate.isBusy = false;
			Helper.set_style("footer_progress", 'width', "0px");
			Helper.element("footer_progress_text").innerHTML = '';
			Helper.element("result").innerHTML = '';

			
			this.progress_wheel.start();
			this.selected_file = null;
			this.output_buffer = "";
			this.set_selection(0);
			
			
			var cmd = "'" + path_to_ruby + "' '" + bundle_support + "/lib/file_finder.rb' '" + Helper.element("search").value + "'";
			
			this.textmate_command = TextMate.system(cmd, function(task) {
				GoToFile.instance.textmate_command_finished();
			});
			this.textmate_command.onreadoutput = function(str){ GoToFile.instance.textmate_command_stdout(str); };
			this.textmate_command.onreaderror = function(str){ GoToFile.instance.textmate_command_stderr(str); };
		},
		
		
		textmate_command_stdout: function(str){
			this.output_buffer += str;
		},
		
		textmate_command_stderr: function(str){
			eval(str);
		},
		
		textmate_command_finished: function(){
			this.progress_wheel.stop();
			Helper.element('result').innerHTML = this.output_buffer;
			this.change_selection(0);
		},
		
		progress_wheel: {
			progress_timer: null,
			
			start: function(){
				window.clearTimeout(this.progress_timer);
				this.progress_timer = window.setTimeout(this.show, 2);
			},
		
			show: function(){
				Helper.show("progress");
				Helper.set_style("footer", 'height', "16px");
			},
		
			stop: function(){
				window.clearTimeout(this.progress_timer);
				Helper.hide("progress");
				Helper.set_style("footer_progress", 'width', '0');
				Helper.set_style("footer", 'height', '0');
				Helper.element("footer_progress_text").innerHTML = '';
			}
		},


		set_selection: function(file){
			if (this.selected_file) Helper.remove_class(this.selected_file.selector, 'selected');
			this.selected_file = file;
			if (this.selected_file) {
				Helper.add_class(this.selected_file.selector, 'selected');
				this.selected_file.scroll_to();
			}
		},
		
		insert_escaped_space: function(){
			Helper.insert_escaped_space('search');
			this.start_search();
		},
		
		change_selection: function(delta){
			var num = 0,
				reopen_quicklook = SelectedFile.quicklook.cancel(),
				total_count = Helper.element('result').getElementsByTagName('input').length;
			if (this.selected_file) num = this.selected_file.num;
			num += delta;
			if (num >= total_count) num = 0;
			if (num < 0) num = total_count - 1;
			this.set_selection(new SelectedFile(num));
			if (reopen_quicklook) this.selected_file.quicklook();
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
					if (Helper.element('search').value == "")
						window.close();
					else
						Helper.element('search').value = '';
					break;
				case 32: // space
					if (event.altKey)
						this.insert_escaped_space();
					else
						if (this.selected_file) this.selected_file.quicklook();
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
		}
	}
});



create_object(SelectedFile, {
	// quicklook needs to keep its state beyond
	// SelectedFileS short life		
	quicklook: {
		command: null,
		command_id: 0,

		cancel: function(){
			var closed_quicklook = this.command != null;
			if (this.command) this.command.cancel();
			this.command = null;
			return closed_quicklook;
		},

		open: function(file){
			var display_id = this.command_id + 1;
			if (this.command) {
				this.cancel();
			} else {
				this.command_id = display_id;
				this.command = TextMate.system("qlmanage -p '" + file + "'", function(task){					
					var that = SelectedFile.quicklook;
					if (display_id == that.command_id)
						that.command = null;
				});
			}
		}
	},
	
	prototype: {
		quicklook: function(){
			SelectedFile.quicklook.open(this.actual_path());
		},
		
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
		
		
		scroll_to: function() {
			var item = Helper.element(this.selector),
				itemPos = Helper.get_top_offset(this.selector),
				headHeight = Helper.element('head').offsetHeight;
			if (itemPos < document.body.scrollTop + headHeight) {
				document.body.scrollTop = itemPos - headHeight - 1;
			} else if ((itemPos + item.offsetHeight >= document.body.clientHeight + document.body.scrollTop)) {
				document.body.scrollTop = itemPos - document.body.clientHeight + item.offsetHeight + 1;
			}
		},
		
		actual_path: function(){
			return Helper.element(this.selector).getElementsByTagName('input')[0].value;
		}
	}
});


create_object(Helper, {
	add_class: function(dom_id, klass){
		Helper.element(dom_id).className += ' ' + klass;
	},
	
	// this doesn't really cover every possible case
	// ie, if an element has a class foo-de-bar and you called remove_class(element, 'bar')...
	remove_class: function(dom_id, klass){
		var e = Helper.element(dom_id);
		e.className = e.className.replace(new RegExp("\\b" + klass + "\\b"), ' ');
	},
	
	insert_escaped_space: function(dom_id){
		var searchBox = this.element(dom_id),
			query = searchBox.value,
			selStart = searchBox.selectionStart;
		searchBox.value = query.substr(0, selStart) + "\\ " + query.substr(searchBox.selectionEnd);
		searchBox.selectionStart = selStart + 2;
		searchBox.selectionEnd = searchBox.selectionStart;
		return searchBox.value;
	},
	
	show: function(dom_id){
		Helper.set_style(dom_id, 'display', 'block');
	},
	
	hide: function(dom_id){
		Helper.set_style(dom_id, 'display', 'none');
	},
	
	set_style: function(dom_id, attribute, value){
		Helper.element(dom_id).style[attribute] = value;
	},
	
	get_top_offset: function(dom_id){
		var element = Helper.element(dom_id),
			top_offset = 0;

		while(element != null){
			top_offset += element.offsetTop;
			element = element.offsetParent;
		}
		return top_offset;
	},
	
	debug: function(s, t){
		Helper.element('debug').innerHTML = s;
		Helper.show('debug');
		setTimeout(function(){ Helper.hide('debug'); }, t||1000);
	},
	
	element: function(dom_id){
		return document.getElementById(dom_id);
	}
});


GoToFile.setup();

