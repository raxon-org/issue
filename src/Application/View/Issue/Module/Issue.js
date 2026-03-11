//{{RAX}}
import { version } from "/Module/Priya.js";
import { root } from "/Module/Web.js";
import { dialog } from "/Dialog/Module/Dialog.js";
import { issue } from "/Application/Issue/Module/Issue.js"
import { taskbar } from "/Application/Desktop/Module/Taskbar.js";
require(
    [
        root() + 'Application/Issue/Css/Issue.css?' + version(),
        root() + 'Dialog/Css/Dialog.css?' + version(),
    ],
    function(){
        issue.init("{{$id}}");
        dialog.init("{{$id}}");
        taskbar.active("{{$id}}");
    }
);