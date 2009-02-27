#!/usr/bin/ruby
require 'erb'

File.delete("/tmp/TM_db.busy") if File.exist?('/tmp/TM_db.busy')

asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'

html_path = asset_path + '/gotofile.html.erb'
css_path = asset_path.gsub(' ', '%20') + '/gotofile.css'
js_path = asset_path.gsub(' ', '%20') + '/gotofile.js'


js_vars = {
  :bundle_support => ENV['TM_BUNDLE_SUPPORT'],
  :fpath => ENV['TM_DIRECTORY'],
  :dpath => ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || File.dirname(ENV['TM_FILEPATH']),
  :path_to_ruby => ENV['TM_RUBY'] || 'ruby',
}.collect { |var, value| "var #{var} = '#{value}';\n" }


puts ERB.new(File.read(html_path)).result
