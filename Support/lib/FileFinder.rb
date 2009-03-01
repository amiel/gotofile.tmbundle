#!/usr/bin/env ruby -wKU

# max number of found files after sorting by score
MAX_OUTPUT = 100

require File.dirname(__FILE__) + '/fuzzy_file_finder'

TM_FUZZYFINDER_REVERSEPATHMODE = (ENV['TM_FUZZYFINDER_REVERSEPATHMODE'] and ENV['TM_FUZZYFINDER_REVERSEPATHMODE'].to_i != 0) ? true : false
TM_FUZZYFINDER_IGNORE = ENV['TM_FUZZYFINDER_IGNORE'] ? ENV['TM_FUZZYFINDER_IGNORE'].to_s.split(/,/) : nil
TM_FUZZYFINDER_CEILING = ENV['TM_FUZZYFINDER_CEILING'] ? ENV['TM_FUZZYFINDER_CEILING'].to_i : 10000


project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || ENV['TM_FILEPATH'] && File.dirname(ENV['TM_FILEPATH'])

if project_path.nil?
  puts '<p class="notice">no search path given</p>'
  exit
end

search_string = ARGV[0].gsub(/([^\\]) /, '\1') # this would be better with a look-behind, but this works

if search_string.empty?
  print '<p class="notice">Please enter a search</p>'
  exit
end


if search_string =~ /\\(?! )/
  TM_FUZZYFINDER_REVERSEPATHMODE = true
  search_string = search_string.split(/\\(?! )/).reverse.join("/")
else
  search_string = search_string.split("/").reverse.join("/") if TM_FUZZYFINDER_REVERSEPATHMODE
end


# counter for outputted files
cnt = 0

begin
  FuzzyFileFinder.new(project_path, TM_FUZZYFINDER_CEILING, TM_FUZZYFINDER_IGNORE).find(search_string).sort{|b,a| a[:smart_score] <=> b[:smart_score] }.each do |p|
    sc = (p[:smart_score].to_f * 100).to_i
    hpath = p[:highlighted_path]
    hpath = hpath.split("/").reverse.join("&lt;") if TM_FUZZYFINDER_REVERSEPATHMODE
    puts <<-HTML
    <div class='file'>
      <div title='#{sc}%' class='score_wrapper'>
        <div class='score' style='width: #{sc}%;'></div>
      </div>
      <div class='in_wrapper'>
        <input class='in' type='text' size='1' readonly disabled onfocus='setFile("#{p[:path]}")'>
      </div>
      <div>
        <span class='mylink' title='#{p[:path].gsub(/^#{ENV['HOME']}/, '~')}' onclick='myClick("#{p[:path]}")'>
    #{hpath.gsub('￰','<span class=\'highlight\'>').gsub('￱','</span>')}
        </span>
      </div>
    </div>
    HTML
    cnt = cnt + 1
    if cnt > MAX_OUTPUT
      puts %(<p class="notice">… more than #{MAX_OUTPUT} files found.</p>)
      break
    end
  end
rescue
  puts $!
end


