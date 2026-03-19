{{$response = Package.Raxon.Issue:Label:list(flags(), options())}}
{{$response|>object:'json'}}