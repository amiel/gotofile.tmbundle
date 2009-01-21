# file_finder.rb
# Amiel Martin
# 2009-01-21
#
# a proof-of-concept to bring FuzzyFileFinder (http://github.com/jamis/fuzzy_file_finder/tree/master)
# back to textmate. FuzzyFileFinder is a (somewhat improved) implementation of TextMate's "cmd-T"
# functionality written by Jamis Buck. This bundle however isn't quite as useful as TextMate's "cmd-T"
# as it is not integrated enough with TextMate. I'm hoping that somebody will be interested in
# rewriting this to work with Dialog2.

bundle_lib = ENV['TM_BUNDLE_SUPPORT'] + '/lib'
$LOAD_PATH.unshift(bundle_lib) if ENV['TM_BUNDLE_SUPPORT'] and !$LOAD_PATH.include?(bundle_lib)

require ENV['TM_SUPPORT_PATH'] + '/lib/textmate'
require ENV['TM_SUPPORT_PATH'] + '/lib/ui'
require ENV['TM_SUPPORT_PATH'] + '/lib/tm/htmloutput'


require 'fuzzy_file_finder'

module FileFinder
  class << self
    def run
      project_path = ENV['TM_PROJECT_DIRECTORY']
      if project_path.nil?
        TextMate::UI.alert(:warning, 'Warning', 'You cannot use the Fuzzy File Finder unless you are in a Project with multiple files.')
        return nil
      end
    
      search_string = TextMate::UI.request_string(:title => 'Fuzzy File Finder', :prompt => "Enter a string as you would normally in TextMate's ⌘T file finder.")
      if search_string.nil?
        puts 'please enter a search string'
        return nil
      end
      
      fff = FuzzyFileFinder.new(project_path)
      matches = fff.find(search_string)
        
      TextMate::HTMLOutput.show(:title => 'Files', :sub_title => "Files matching \"#{search_string}\"", :html_head => head_stuff) do |io|
        if matches.empty?
          io << "<p>No matches found for \"#{search_string}\"."
        else
          io << '<div id="wrapper">'
          matches.sort{|b,a| a[:score] <=> b[:score] }.each do |match|
            io << output_for_match(match)
          end
          io << '</div>'
        end
      end
    end
    
    private
    def highlight(str)
      str.gsub(/\(([^(]+)\)/, '<span class="highlight">\1</span>')
    end
    
    def url_for(path)
      "txmt://open/?url=file://#{path}" # "&line=#{line}"
    end
    
    def output_for_match(match)
      path = match[:path]
      highlighted_path = highlight(match[:highlighted_path])
      score_width = (match[:score].to_f * 100).to_i
      html = <<-HTML
        <div class="file">
          <div class="score_wrapper"><div class="score" style="width: #{score_width}%;"></div></div>
          <a href="#{url_for(path)}">#{highlighted_path}</a>
        </div>
      HTML
      return html
    end
    
    def head_stuff
      return <<-HTML
        <style type="text/css">
          .file{ border: 1px solid black; margin: 0.25em 0; }
          .file a{ padding-left: 1.25em; display: block; width: 85%; overflow: hidden; }
          .file .score_wrapper{ float:left; width: 10%; height: 1em; border:1px solid white; }
          .file .score{ background-color: #494949; width: 1%; height: 100%; }
          .highlight{ color: #fff; background-color: #494949; }
        </style>
      HTML
    end
  end
end
