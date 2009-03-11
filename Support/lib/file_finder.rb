#!/usr/bin/env ruby -wKU

require 'erb'

# max number of found files after sorting by score
MAX_OUTPUT = 100

require File.dirname(__FILE__) + '/fuzzy_file_finder'

TM_FUZZYFINDER_REVERSEPATHMODE = (ENV['TM_FUZZYFINDER_REVERSEPATHMODE'] and ENV['TM_FUZZYFINDER_REVERSEPATHMODE'].to_i != 0) ? true : false
TM_FUZZYFINDER_IGNORE = ENV['TM_FUZZYFINDER_IGNORE'] ? ENV['TM_FUZZYFINDER_IGNORE'].to_s.split(/,/) : nil
TM_FUZZYFINDER_CEILING = ENV['TM_FUZZYFINDER_CEILING'] ? ENV['TM_FUZZYFINDER_CEILING'].to_i : 10000


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


if TM_FUZZYFINDER_REVERSEPATHMODE or search_string =~ /\\(?! )/
  TM_FUZZYFINDER_REVERSEPATHMODE = true
  search_string = search_string.split(/\\(?! )/).reverse.join("/")
end

asset_path = ENV['TM_BUNDLE_SUPPORT'] + '/assets'


# counter for outputted files
cnt = 0

template_path = asset_path + '/_file.html.erb'
template = ERB.new(File.read(template_path))

begin
  FuzzyFileFinder.new(project_path, TM_FUZZYFINDER_CEILING, TM_FUZZYFINDER_IGNORE, FuzzyFileFinder::HtmlCharacterRun).find(search_string).sort{|b,a| a[:score] <=> b[:score] }.each do |p|
    sc = (p[:score].to_f * 100).to_i
    sc = 100 if sc > 100
    hpath = p[:highlighted_path]
    hpath = hpath.split(%r{/(?!span)}).reverse.join("&lt;") if TM_FUZZYFINDER_REVERSEPATHMODE
    puts template.result(binding)
    
    cnt += 1
    if cnt > MAX_OUTPUT
      puts %(<p class="notice">&hellip; more than #{MAX_OUTPUT} files found.</p>)
      break
    end
  end
rescue FuzzyFileFinder::TooManyEntries
  puts %(<p class="error">The root directory ‘#{project_path.gsub(/^#{ENV['HOME']}/, '~')}’ contains more than #{TM_FUZZYFINDER_CEILING} files. To increase the number of files parsed set up a TextMate shell variable <code>TM_FUZZYFINDER_CEILING</code> accordingly.</p>)
rescue
  puts %(<p class="error">#{$!}</p>)  
end

puts %(<p class="notice">nothing found</p>) if cnt == 0



