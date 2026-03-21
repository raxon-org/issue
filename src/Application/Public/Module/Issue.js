import { taskbar } from "/Application/Desktop/Module/Taskbar.js";
import { getSectionById } from "/Module/Section.js";
import { dialog } from "/Dialog/Module/Dialog.js";
import { file } from "/Application/Filemanager/Module/File.js";
import { storage } from "/Application/Issue/Module/Storage.js"
import user from "/Module/User.js";

let issue = {};

issue.init = (id) => {
    taskbar.add('application-issue', id);

    issue.menu(id);
    issue.menu_application(id);
    issue.close(id);
    issue.list(id);
}

issue.close = (id) => {
    let section = getSectionById(id);
    if(!section){
        return;
    }
    let close = section.select('.close');
    if(!close){
        return;
    }
    close.on('click', (event) => {
        taskbar.delete(section.attribute('id'));
    });
}

issue.menu_application = (id) => {
    const section = getSectionById(id);
    if(!section){
        return;
    }
    dialog.click(section, '.menu-application-issue');
}

issue.menu = (id) => {
    const section = getSectionById(id);
    if(!section){
        return;
    }
    const menu = section.select('.menu');
    if(!menu){
        return;
    }
    const menu_file = menu.select('li.file');
    const menu_file_menu = menu.select('.menu-file');
    const menu_file_protector = menu.select('.menu-file-protector');
    if(menu_file){
        menu_file.on('click', (event) => {
            if(menu_file_menu) {
                menu_file_menu.toggleClass('display-none');
            }
            if(menu_file_protector){
                menu_file_protector.toggleClass('display-none');
            }
        });
    }
    if(menu_file_protector){
        menu_file_protector.on('click', (event) => {
            if(menu_file_menu){
                menu_file_menu.addClass('display-none');
                menu_file_protector.addClass('display-none');
            }
        });
    }
    const menu_file_exit = menu.select('.menu-file-exit');
    if(menu_file_exit){
        menu_file_exit.on('click', (event) => {
            taskbar.delete(section.attribute('id'));
            section.remove();
        });
    }
    const menu_file_open = menu.select('.menu-file-open');
    if(menu_file_open){
        menu_file_open.on('click', (event) => {
            if(menu_file_protector){
                menu_file_protector.trigger('click');
            }
            console.log('need application file manager open url');
            console.log(file);
            /*
            const file_manager_section = getSection(file.data.get('section.id'));
            if(!file_manager_section){
                return;
            }*/
            /*
            const input = file_manager_section.select('input[name="address"]');
            if(!input){
                return;
            }
             */
        });
    }
    dialog.click(section, '.menu');
}

issue.list = (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    console.log(section);
    const url = storage.data.get('backend.issue.list');
    console.log(url);
}

export { issue }