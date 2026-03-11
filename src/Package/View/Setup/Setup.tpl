{{$register = Package.Raxon.Issue:Init:register()}}
{{if(!is.empty($register))}}
{{Package.Raxon.Issue:Import:role.system()}}
{{$flags = flags()}}
{{$options = options()}}
{{Package.Raxon.Issue:Main:install($flags, $options)}}
{{/if}}