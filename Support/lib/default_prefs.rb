# default preferences
def default_prefs
{
  'max_output'    => '100',   # max number of found files after sorting by score
  'init_search'   => "",      # initial search pattern
  'file_ceiling'  => '10000', # max number of files scanned
  'ignore_globs'  => "",      # file globs ignored
  'reverse_mode'  => 'false', # global reverse mode
  'progress_delay'=> '200',   # time in ms before progress bar appears
  'auto_close'    => 'false', # close window after opening selected file in TM
  'pref_path'     => ENV['HOME'] + '/Library/Preferences/com.macromates.textmate.gotofile.plist'
}
end
