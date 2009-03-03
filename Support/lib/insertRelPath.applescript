--
-- inserts the relative path to the file passed as first shell argument 
-- seen from TextMate's current document into the current document and 
-- activates it
--
-- if TextMate's current document hasn't saved yet it inserts the absolute path instead
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
		set curPath to (do shell script "dirname " & quoted form of curFile)
		set chosenPath to (do shell script "dirname " & quoted form of chosenFile)
		set chosenFileName to (do shell script "basename " & quoted form of chosenFile)
		set AppleScript's text item delimiters to "/"
		set curPathArr to text items of curPath
		set chosenPathArr to text items of chosenPath
		set curPathArrLen to length of curPathArr
		set chosenPathArrLen to length of chosenPathArr
		set maxLoop to curPathArrLen
		if chosenPathArrLen < maxLoop then
			set maxLoop to chosenPathArrLen
		end if
		set idx to 1
		repeat
			if idx > maxLoop then
				exit repeat
			end if
			if item idx of chosenPathArr = item idx of curPathArr then
				set idx to idx + 1
			else
				exit repeat
			end if
		end repeat
		set relPath to ""
		repeat with i from idx to curPathArrLen
			set relPath to relPath & "../"
		end repeat
		repeat with i from idx to chosenPathArrLen
			set relPath to relPath & item i of chosenPathArr & "/"
		end repeat
		set relPath to relPath & chosenFileName
		insert "${1:" & relPath & "}" with as snippet
		do shell script "open 'txmt://open?url=file://" & curFile & "'"
	end tell
end run