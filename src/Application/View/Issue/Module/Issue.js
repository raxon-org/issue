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

        const section = document.getElementById("{{$id}}");
        const titleInput = section.querySelector('input[name="name"]');
        const branchInput = section.querySelector('input[data-auto-branch="true"]');
        if (titleInput && branchInput) {
            titleInput.addEventListener('input', function () {
                const slug = this.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                branchInput.value = slug ? 'issue/' + slug : '';
            });
        }
    }
);