{{$create = Package.Raxon.Issue:Task:create(flags(), options())}}
{{$create|>object:'json'}}