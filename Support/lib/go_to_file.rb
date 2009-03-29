#!/usr/bin/env ruby -wKU

require 'erb'
require File.dirname(__FILE__) + '/default_prefs'
require ENV['TM_SUPPORT_PATH'] + '/lib/osx/plist'


asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'
asset_path_for_html = asset_path.gsub(' ', '%20')

html_path = asset_path + '/gotofile.html.erb'

pref_file_path = ENV['HOME'] + '/Library/Preferences/com.macromates.textmate.gotofile.plist'

# why do we need this (bibiko) ??
# project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || ENV['TM_FILEPATH'] && File.dirname(ENV['TM_FILEPATH'])

unless File.exist?(pref_file_path)
  begin
    open(pref_file_path, "w") {|io| io << default_prefs.to_plist }
  rescue
    # todo : error output
  end
end

if File.exist?(pref_file_path)
  begin
    saved_prefs = OSX::PropertyList::load(File.open(pref_file_path, "r"))
  rescue
    # todo : error output
  end
end

# check prefs and prepare them for js
max_output    = Integer(saved_prefs['max_output']).abs rescue max_output = default_prefs['max_output']
init_search   = saved_prefs['init_search'] || default_prefs['init_search']
file_ceiling  = Integer(saved_prefs['file_ceiling']).abs rescue file_ceiling = default_prefs['file_ceiling']
ignore_globs  = saved_prefs['ignore_globs'] || default_prefs['ignore_globs']
reverse_mode  = saved_prefs['reverse_mode'] || default_prefs['reverse_mode'] 

js_vars = {
  :bundle_support => ENV['TM_BUNDLE_SUPPORT'],
  :path_to_ruby   => ENV['TM_RUBY'] || 'ruby',
  :max_output     => max_output,
  :init_search    => init_search,
  :file_ceiling   => file_ceiling,
  :ignore_globs   => ignore_globs,
  :reverse_mode   => reverse_mode,
}.collect { |var, value| "var #{var} = '#{value}';\n" }



puts ERB.new(File.read(html_path)).result
