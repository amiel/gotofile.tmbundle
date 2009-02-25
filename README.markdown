# Outline #

“GoToFile” imitates TextMate’s “Go to File…” ⌘T functionality [see here](http://manual.macromates.com/en/working_with_multiple_files#moving_between_files_with_grace). In addition it is possible to narrow down the list of files by considering (parts of) the file path using '/' as a delimiter. 

Furthermore it is not only possible to open the selected file in TextMate but also to:

* open the selected file in the default application (by using “open”)
* activate QuickLook
* insert the relative path from the current file (that file which had the focus while invoking “GoToFile”) to the selected one
* insert the absolute path.

The list of found files is sorted by the score which is calculated inside of Jamis Buck's “Fuzzy File Finder” routine. The maximum number of outputted files is set to 100 (can be changed in “FileFinder.rb” line 4).

To ignore certain files add a TM variable called "TM\_FUZZYFINDER\_IGNORE", in it put the file globs separated by commas. For example: '\*.pyc,\*.zip,\*.gz,\*.bz,\*.tar,\*.jpg,\*.png,\*.gif,\*.avi,\*.wmv,\*.ogg,\*.mp3,\*.mov'.

This GUI makes usage of makes usage of Jamis Buck's [“Fuzzy File Finder”](http://github.com/jamis/fuzzy_file_finder) and was inspired by Amiel Martin's [“FuzzyFileFinder”](http://github.com/amiel/gotofile.tmbundle/tree/amiels_original) bundle which a few code fragments are taken from.

# Installation #

“GoToFile” can now be found on GetBundles.

# Usage #

<button>⇧⌘K</button> invokes “GoToFile”. The root directory will be taken from `$TM_PROJECT_DIRECTORY` || `$TM_DIRECTORY` || current directory. “GoToFile” won't work on unsaved documents. There is a mouse-over event to display the entire file path.


## Input Field ##

Type characters in order to narrow down the list of files. The dialogue will be updated while typing. To search only in certain folders type for instance: `s/rb` or `s/li/mm` etc.

Normally spaces are ignored. If one wants to look for a space one has to escape the space: `\␣`

## Shortcuts ##

* <button>CLICK</button> or <button>&#x21A9;</button> opens the file in TextMate
* <button>⌥ CLICK</button> or <button>⌥&#x21A9;</button> opens the file with the default application
* <button>⇧ CLICK</button> or <button>⇧&#x21A9;</button> inserts the relative file path
* <button>⇧⌥ CLICK</button> or <button>⇧⌥&#x21A9;</button> inserts the absolute file path
* <button>SPACE</button> toggles the QuickLook mode (Leopard only)
* <button>⌥ SPACE</button> adds an (escaped) space character in the search query
* <button>↑</button> and <button>↓</button> navigates through the list of files
* <button>^F</button> sets the focus to the input field
* <button>⌘W</button> closes the “GoToFile” window

# Official Git Repos #

Can be found here: http://github.com/amiel/gotofile.tmbundle

# ToDo / wish list #

* window should close when a file is opened
* move css / javascript to separate files
* clean up javascript (incorporate [sizzle](http://sizzlejs.com/))

***also check out the todo list on the [github wiki](http://wiki.github.com/amiel/gotofile.tmbundle/todo)***

# Contributions #

***Date: Feb 25 2009***
<pre>
-  Jamis Buck &mdash; fuzzy_file_finder library - <a href="mailto:jamis@37signals.com">jamis@37signals.com </a>
</pre>
<pre>
-  Amiel Martin&nbsp;&nbsp;<a href="mailto:amiel.martin@gmail.com">amiel.martin@gmail.com</a>
-  Hans-Jörg Bibiko&nbsp;&nbsp;<a href="mailto:bibiko@eva.mpg.de">bibiko@eva.mpg.de</a>
-  Eric Doughty-Papassideris&nbsp;&nbsp;github:ddlsmurf
-  Travis Jeffery&nbsp;&nbsp;<a href="mailto:t.jeffery@utoronto.ca">t.jeffery@utoronto.ca</a>
-  Eric O'Connell &nbsp;&nbsp;github:drd
-  Nathan Carnes&nbsp;&nbsp;github:nathancarnes
</pre>
