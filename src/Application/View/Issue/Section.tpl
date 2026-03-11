{{block.html()}}
<section id="{{$id}}" name="application-issue-{{config('controller.name')}}" class="display-none">
{{require(config('controller.dir.view') + config('controller.title') + '/Section/Dialog.tpl')}}
</section>
{{/block}}