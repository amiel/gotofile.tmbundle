--
-- inserts the absolute path into the current document and 
-- activates it
--
-- Mar 03 2009 - written by Hans-J. Bibiko bibiko@eva.mpg.de
--

on run (argv)
	set chosenFile to item 1 of argv
	tell application "TextMate"
		tell document 1 to activate
		try
			set curFile to the path of document 1
			set dummy to the length of curFile
		on error
			insert "${1:" & chosenFile & "}" with as snippet
			do shell script "open 'txmt://open?'"
			return
		end try
		insert "${1:" & chosenFile & "}" with as snippet
		do shell script "open 'txmt://open?url=file://" & curFile & "'"
	end tell
end run