/*
 * the following will be assigned by the ruby file
 * * bundle_support
 * * dpath
 * * fpath
 * * path_to_ruby
 */



var myCommand = null;
var actpath = "";
var oldterm;
  fpath = fpath + "/";
  dpath = dpath + "/";

var rpath = fpath.replace(dpath,'');
outStr = "";
var aTimer;
var term;
var ft;
var current_file=null;
var current_ql_command=null;
var current_ql_command_id=0;


function startSearch(t) {
    term = t;
    window.clearTimeout(aTimer);
    myCommand.cancel();
    aTimer = window.setTimeout("startSearchTimed()", 5);
}
function startSearchTimed() {
    TextMate.isBusy = true;
    outStr = "";
    document.getElementById("result").innerHTML = "";
    setSelection(null);
    var cmd = "'" + path_to_ruby + "' '" + bundle_support + "/lib/file_finder.rb' '" + term + "'";
    myCommand = TextMate.system(cmd,
    function(task) {});
    myCommand.onreadoutput = output;
    TextMate.isBusy = false;
}
function output(str) {
    outStr += str;
    document.getElementById("result").innerHTML = outStr;
	if (current_file == null)
		changeSelect(1);
}

function setFile(path) {
    actpath = path;
}

function gotofile() {
    if (actpath != "") {
        myCommand = TextMate.system("mate '" + actpath + "'", function(task) {});
    }
}
function insertPath() {
    if (actpath != "") {
        cmd = "osascript -e 'tell app \"TextMate\" to insert \"${1:"+actpath+"}\" as snippet true' &";
        TextMate.system(cmd, null);
        TextMate.system("open 'txmt://open?'", null);
    }
}
function insertRelPath() {
    if (actpath != "") {
        relpath = actpath.replace(dpath,'');
        sp = rpath.split("/");
        rp = "";
        if(actpath.replace(/\/[^\/]*\/?$/, '')+"/" == fpath) {
            relpath = actpath.replace(fpath,'');
        } else {
            for(n=0; n<(sp.length-1);n++) {rp=rp+"../";}
        }
        cmd = "osascript -e 'tell app \"TextMate\" to insert \"${1:"+rp+relpath+"}\" as snippet true' &";
        TextMate.system(cmd, null);
        TextMate.system("open 'txmt://open?'", null);
    }
}
function openFile() {
    if (actpath != "") {
        myCommand = TextMate.system("open '" + actpath + "'", function(task) {});
    }
}
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

function myClick(path) {
    wkey = event.keyCode;
    actpath = path;
    if (event.shiftKey && event.altKey) insertPath();
    else if (event.shiftKey) insertRelPath();
    else if (event.altKey) openFile();
    else gotofile();
}

function getItemTopOffset(item) {
	var parent = item;
	var top = item.offsetTop;
	while(parent = parent.offsetParent)
		top += parent.offsetTop;
	return top;
}
function scrollToItem(item) {
	var itemPos = getItemTopOffset(item.parentNode);
	var headHeight = document.getElementById('head').offsetHeight;
	if (itemPos < document.body.scrollTop + headHeight) {
		document.body.scrollTop = itemPos - headHeight - 2;
	} else if ((itemPos + item.parentNode.offsetHeight >= document.body.clientHeight + document.body.scrollTop)) {
		document.body.scrollTop = itemPos;
	}
}

/* stolen from jquery */
function grep( elems, callback, inv ) {
	var ret = [];

	// Go through the array, only saving the items
	// that pass the validator function
	for ( var i = 0, length = elems.length; i < length; i++ )
		if ( !inv != !callback( elems[ i ], i ) )
			ret.push( elems[ i ] );

	return ret;
}

function addClass(elem, className) {
	alert(elem.className);
	elem.className += (elem.className ? " " : "") + className;
}

function removeClass(elem, className) {
	elem.className = grep(elem.className.split(/\s+/), function(name){
		return name == className;
	}, true).join(" ");
}

function setSelection(item) {
	if (item == current_file) return;
	var bReopenQuickLook = cancel_quicklook();
	if (current_file) {
		removeClass(current_file.parentNode, "selected");
	}
	current_file = item;
	if (current_file) {		
		addClass(current_file.parentNode, "selected");
		setFile(current_file.value);
		scrollToItem(current_file);
		if (bReopenQuickLook)
			quicklook();
	}
}

function changeSelect(y) {
	var oItems = document.getElementById('result').getElementsByTagName("input");
	var iCurIndex = -1;
	if (current_file)
		for (var i=0; i < oItems.length; i++) {
			if (oItems[i] == current_file) {
				iCurIndex = i;
				break;
			}
		};
	iCurIndex += y;
	if (iCurIndex >= oItems.length) iCurIndex = 0;
	if (iCurIndex < 0) iCurIndex = oItems.length - 1;
	if (iCurIndex >= 0 && iCurIndex < oItems.length) {
		setSelection(oItems[iCurIndex]);
	}
	else {
		setSelection(null);
	};
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
document.onkeydown = function keyPress(event) {
    if (typeof event == "undefined") event = window.event;
    wkey = event.keyCode;
	if (wkey == 32 || wkey == 27) {
		event.stopPropagation();
		event.preventDefault();
	} else if (wkey == 38 || wkey == 40 || wkey == 33 || wkey == 34 || wkey == 9) {
	  event.stopPropagation();
	  event.preventDefault();
	var iDiff = 1;
	if (wkey == 33)
		iDiff = -10;
	else if (wkey == 34)
		iDiff = 10;
	else if (wkey == 38 || (wkey == 9 && event.shiftKey))
		iDiff = -1;
		
	  changeSelect(iDiff);
    } else if (wkey == 13) {
	  event.stopPropagation();
	  event.preventDefault();
	}
};
document.onkeyup = function keyPress(event) {
    if (typeof event == "undefined") event = window.event;
    wkey = event.keyCode;
    if (wkey == 38 || wkey == 40 || wkey == 33 || wkey == 34 || wkey == 9) {
	  event.stopPropagation();
	  event.preventDefault();
    }
    if (wkey == 27) {
        if (document.getElementById('search').value == "")
                window.close();
        else
                document.getElementById('search').value = "";
        event.stopPropagation();
        event.preventDefault();
    }
    if (wkey == 32) {
		if (event.altKey)
			insertEscapedSpace();
		else
			quicklook();
		event.stopPropagation();
		event.preventDefault();
	}
    if (wkey == 13) {
        if (event.shiftKey && event.altKey) insertPath();
        else if (event.shiftKey) insertRelPath();
        else if (event.altKey) openFile();
        else gotofile();
	  event.stopPropagation();
	  event.preventDefault();
    }
};