{{$response = Package.Raxon.Issue:Label:create(flags(), options())}}
{{$response|>object:'json'}}