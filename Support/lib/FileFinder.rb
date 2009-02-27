#!/usr/bin/env ruby -wKU

# max number of found files after sorting by score
MAX_OUTPUT = 100

require File.dirname(__FILE__) + '/fuzzy_file_finder'

if ENV['TM_FUZZYFINDER_REVERSEPATHMODE']
  TM_FUZZYFINDER_REVERSEPATHMODE = (ENV['TM_FUZZYFINDER_REVERSEPATHMODE'].to_i == 0) ? false : true
else
  TM_FUZZYFINDER_REVERSEPATHMODE = false
end

if ENV['TM_FUZZYFINDER_IGNORE']
  TM_FUZZYFINDER_IGNORE = ENV['TM_FUZZYFINDER_IGNORE'].to_s.split(/,/)
else
  TM_FUZZYFINDER_IGNORE = nil
end

if ENV['TM_FUZZYFINDER_CEILING']
  TM_FUZZYFINDER_CEILING = ENV['TM_FUZZYFINDER_CEILING'].to_i
else
  TM_FUZZYFINDER_CEILING = 10000
end


begin
  project_path = ENV['TM_PROJECT_DIRECTORY'] || ENV['TM_DIRECTORY'] || File.dirname(ENV['TM_FILEPATH'])
rescue
  puts "<i><small>no search path given</small></i>"
  exit
end

search_string = ARGV[0].gsub(/\\ /, '￰').gsub(/ /, '').gsub(/￰/, ' ')

if search_string.empty?
  print ""
  exit
end

if search_string =~ /\\/
  TM_FUZZYFINDER_REVERSEPATHMODE = true
  search_string = search_string.split("\\").reverse.join("/")
else
  search_string = search_string.split("/").reverse.join("/") if TM_FUZZYFINDER_REVERSEPATHMODE
end


# counter for outputted files
cnt = 0

begin
  FuzzyFileFinder.new(project_path, TM_FUZZYFINDER_CEILING, TM_FUZZYFINDER_IGNORE).find(search_string).sort{|b,a| a[:smart_score] <=> b[:smart_score] }.each do |p|
    sc = (p[:score].to_f * 100).to_i
    hpath = p[:highlighted_path]
    hpath = hpath.split("/").reverse.join("&lt;") if TM_FUZZYFINDER_REVERSEPATHMODE
    puts <<-HTML
    <div class='file'>
      <div  title='#{sc}%' class='score_wrapper'>
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
      puts "<i><small>… more than #{MAX_OUTPUT} files found.</small></i>"
      break
    end
  end
rescue
  puts $!
end


