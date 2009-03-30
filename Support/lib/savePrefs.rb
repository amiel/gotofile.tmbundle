#!/usr/bin/env ruby -wKU

require File.dirname(__FILE__) + '/default_prefs'
require ENV['TM_SUPPORT_PATH'] + '/lib/osx/plist'

prefs = {
  'max_output'      => ARGV[0],
  'init_search'     => ARGV[1],
  'file_ceiling'    => ARGV[2],
  'ignore_globs'    => ARGV[3],
  'reverse_mode'    => ARGV[4],
  'progress_delay'  => ARGV[5],
}

begin
  open(default_prefs['pref_path'], "w") {|io| io << prefs.to_plist }
rescue
  puts $!
end

