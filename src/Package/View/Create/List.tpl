{{$response = Package.Raxon.Issue:Issue:list(flags(), options())}}
{{$response|>object:'json'}}