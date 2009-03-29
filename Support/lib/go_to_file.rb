#!/usr/bin/ruby

require 'erb'

asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'
asset_path_for_html = asset_path.gsub(' ', '%20')

html_path = asset_path + '/gotofile.html.erb'

# why do we need this (bibiko) ??
# project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || ENV['TM_FILEPATH'] && File.dirname(ENV['TM_FILEPATH'])

## todo : read these values from plist
# max number of found files after sorting by score
max_output = 100
# initial search pattern
init_search = "/"
# max number of files scanned
file_ceiling = 10000
# file globs ignored
ignore_globs = "*.tmproj"
# global reverse mode
reverse_mode = 0

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
