#!/usr/bin/ruby
require 'erb'

asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'

html_path = asset_path + '/gotofile.html.erb'
css_path = asset_path.gsub(' ', '%20') + '/gotofile.css'
js_path = asset_path.gsub(' ', '%20') + '/gotofile.js'

project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || ENV['TM_FILEPATH'] && File.dirname(ENV['TM_FILEPATH'])

js_vars = {
  :bundle_support => ENV['TM_BUNDLE_SUPPORT'],
  :path_to_ruby => ENV['TM_RUBY'] || 'ruby',
}.collect { |var, value| "var #{var} = '#{value}';\n" }


puts ERB.new(File.read(html_path)).result
