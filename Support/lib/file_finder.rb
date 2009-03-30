#!/usr/bin/env ruby -wKU

# STDOUT from this file is expected to be HTML and is placed in the <div id="result"> section of gotofile.html.erb
# STDERR from this file is expected to be javascript and is evaluated

require 'erb'
require File.dirname(__FILE__) + '/fuzzy_file_finder'
require File.dirname(__FILE__) + '/default_prefs'
require ENV['TM_SUPPORT_PATH'] + '/lib/osx/plist'

# read and check prefs from arguments
begin
  max_output      = Integer(ARGV[1])
  init_search     = ARGV[2]
  file_ceiling    = Integer(ARGV[3])
  ignore_globs    = ARGV[4]
  reverse_mode    = (ARGV[5] == '0') ? false : true
  progress_delay  = Integer(ARGV[6])
rescue
  puts %(<p class="error">#{$!}.</p>)
end

ignore_glob_array = (ignore_globs.empty?) ? nil : ignore_globs.to_s.split(/ *, */)


project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || ENV['TM_FILEPATH'] && File.dirname(ENV['TM_FILEPATH'])

if project_path.nil?
  puts '<p class="notice">GoToFile could not determine a base location to start searching. Please open a project or save this file.</p>'
  exit
end

search_string = ARGV[0].gsub(/(\\( ))|(([^\\]) )/, '\2')

if search_string.nil? || search_string.empty?
  print '<p class="notice">Please enter a search</p>'
  exit
end


if reverse_mode or search_string =~ /\\(?! )/
  reverse_mode = true
  search_string = search_string.split(/\\(?! )/).reverse.join("/")
end

asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'

# counter for outputted files
cnt = 0

template_path = asset_path + '/_file.html.erb'
template = ERB.new(File.read(template_path))

begin
  FuzzyFileFinder.new(
        project_path, 
        file_ceiling, 
        ignore_glob_array, 
        FuzzyFileFinder::HtmlCharacterRun).find(search_string).sort{|b,a| a[:score] <=> b[:score] }.each do |p|
    sc = (p[:score].to_f * 100).to_i
    sc = 100 if sc > 100
    hpath = p[:highlighted_path]
    hpath = hpath.split(%r{/(?!span)}).reverse.join("&lt;") if reverse_mode
    absolute_path = p[:path]
    friendly_path = absolute_path.gsub(/^#{ENV['HOME']}/, '~')
    puts template.result(binding)
    
    cnt += 1
    if cnt >= max_output
      puts %(<p class="notice">&hellip; more than #{max_output} files found.</p>)
      break
    end
  end
rescue FuzzyFileFinder::TooManyEntries
  puts %(<p class="error">The root directory ‘#{project_path.gsub(/^#{ENV['HOME']}/, '~')}’ contains more than #{file_ceiling} files. To increase the number of files parsed set up <code>CEILING</code> in the preferences accordingly.</p>)
rescue
  puts %(<p class="error">#{$!}</p>)  
end

puts %(<p class="notice">nothing found</p>) if cnt == 0



