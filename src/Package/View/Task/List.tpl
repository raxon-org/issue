{{$response = Package.Raxon.Issue:Task:list(flags(), options())}}
{{$response|>object:'json'}}