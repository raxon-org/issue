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
    issue.config(id);
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

issue.config = (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    const url = storage.data.get('backend.issue.config');
    const token = user.token();
    const data = {
        "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.config",
        "where": "user === " + user.get('uuid'),
        "request-method": "GET",
    };
    if (token) {
        header('Authorization', 'Bearer ' + token);
        request(url, data, (url, response) => {
            console.log(response);
            if(response?.count === 0){
                //init config
                const data = {
                    node : {
                        user : user.get('uuid'),
                        options : {
                            list : {
                                node: {
                                    output : {
                                        filter : [
                                            "Package:Raxon:Issue:Output:Filter:Application:Issue:filter"
                                        ]
                                    },
                                    page : 1,
                                    limit : 30,
                                    sort: {
                                        "title": "ASC"
                                    },
                                    where: "",
                                    "request-method": "GET"
                                },
                                selector: ".issue-list"
                            }
                        }
                    }
                }
                header('Authorization', 'Bearer ' + token);
                request(url, data, (url, create) => {
                    console.log(create);
                    const data = {
                        "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.config",
                        "where": "user === " + user.get('uuid'),
                        "request-method": "GET",
                    };
                    header('Authorization', 'Bearer ' + token);
                    request(url, data, (url, response) => {
                        storage.data.set('issue.config', response?.list[0]);
                        //we can hold active tab in storage and then load it
                        issue.list(id);
                    });
                });
            } else {
                storage.data.set('issue.config', response?.list[0]);
                issue.list(id);
            }
        });
    }
}


issue.list = (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    /**
     * so we need all labels and all issues
     * and these need to be combined
     * and sorted from most till 0
     * and leave all 0's out of the list
     */
    console.log(section);
    let config = storage.data.get('issue.config');
    let view = config?.options?.list?.view;
    if(view){
        console.log(view);
    } else {
        const url = storage.data.get('backend.issue.list');
        const label_url = storage.data.get('backend.issue.label.list');
        const token = user.token();
        if(token){
            header('Authorization', 'Bearer ' + token);
            request(url, data, (url, response) => {
                header('Authorization', 'Bearer ' + token);
                request(label_url, data, (label_url, label_response) => {
                    console.log(label_response);
                })
                console.log(response);
            });
        }
    }
    // const data = config?.options?.list?.node;
    // const tab = section.select(config?.options?.list?.selector)

}

export { issue }