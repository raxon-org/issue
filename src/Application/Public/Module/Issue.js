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

issue.default = (type) => {
    switch (type) {
        case 'config': {
            return {
                node : {
                    user : user.get('uuid'),
                    options : {
                        list : {
                            node: {
                                page : 1,
                                limit : "*",
                                sort:  "title=ASC",
                                where: "",
                                "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.filter",
                                "request-method": "GET"
                            },
                            selector: ".issue-list",
                            label : {
                                page: 1,
                                limit: "*",
                                sort: "text=ASC",
                                where: "",
                                "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.label",
                                "request-method": "GET"
                            }
                        }
                    }
                }
            }
        }

    }
}

issue.config = (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    const token = user.token();
    const url = storage.data.get('backend.issue.config');

    const data_delete = {
        "uuid": "cb734616-2bd2-419b-ae06-5a9c891aa3cb",
        "request-method": "DELETE",
    }
    header('Authorization', 'Bearer ' + token);
    request(url, data_delete, (url, response) => {
        console.log(response);
    });
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
                const data = issue.default('config');
                header('Authorization', 'Bearer ' + token);
                request(url, data, (url, create) => {
                    const data = {
                        "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.config",
                        "where": "user === " + user.get('uuid'),
                        "request-method": "GET",
                    };
                    header('Authorization', 'Bearer ' + token);
                    request(url, data, (url, response) => {
                        storage.data.set('issue.config', response?.list[0]);
                        issue.load('issue.list', 'issue.config.options.list.node');
                        issue.load('issue.label.list', 'issue.config.options.list.label');

                        //we can hold active tab in storage and then load it
                        issue.list(id);
                    });
                });
            } else {
                storage.data.set('issue.config', response?.list[0]);
                issue.load('issue.list', 'issue.config.options.list.node');
                issue.load('issue.label.list', 'issue.config.options.list.label');
                issue.list(id);
            }
        });
    }
}

issue.load = (type, attribute) => {
    let url;
    let token;
    let data;
    switch (type) {
        case 'issue.list':
            url = storage.data.get('backend.' + type);
            token = user.token();
            data = storage.data.get(attribute);
            if(
                url &&
                token &&
                data
            ) {
                header('Authorization', 'Bearer ' + token);
                request(url, data, (url, response) => {
                    storage.data.set(type, response);
                    console.log('set issue.list');
                });
            }
        break;
        case 'issue.label.list':
            url = storage.data.get('backend.' + type);
            token = user.token();
            data = storage.data.get(attribute);
            if(
                url &&
                token &&
                data
            ) {
                header('Authorization', 'Bearer ' + token);
                request(url, data, (url, response) => {
                    storage.data.set(type, response);
                    console.log('set issue.label.list');
                });
            }
        break;
    }
}

issue.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

issue.list = async (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    const config = storage.data.get('issue.config');
    const issue_list = storage.data.get('issue.list');
    const issue_label_list = storage.data.get('issue.label.list');
    if(!config){
        return;
    }
    if(!issue_list){
        console.log('issue_list not loaded');
        await issue.sleep(1/60);
        await issue.list(id);
        return;
    }
    if(!issue_label_list){
        console.log('issue_label_list not loaded');
        await issue.sleep(1/60);
        await issue.list(id);
        return;
    }
    console.log('READY');
    console.log(issue_list);
    console.log(issue_label_list);
    let label_list = {};
    for(let i=0; i < issue_label_list?.list?.length; i++ ){
        let label = issue_label_list.list[i];
        label_list[label.uuid] = label;
        label_list[label.uuid].count = 0;
    }
    label_list[''] = {
        uuid: "",
        text: "No Label",
        is: {
            created: _('_').microtime(true)
        },
        color: {
            text: "rgba(0,0,0,1)",
            background: "rgba(255,255,255,1)"
        },
        count: 0
    };
    for(let i=0; i < issue_list?.list?.length; i++){
        let issue = issue_list.list[i];
        if(!issue.label){
            label_list[''].count++;
        } else {
            for(let j=0; j < issue.label.length; j++){
                let label_uuid = issue.label[j];
                label_list[label_uuid].count++;
            }
        }
    }
    let body_issue_list = section.select('.body .issue-list');
    let container = section.select('labels');
    if(!container){
        container = document.createElement('div');
        container.classList.add('labels');
    }
    for(let uuid in label_list){
        if(label_list[uuid].count === 0){
            delete label_list[uuid];
        } else {
            let label = document.createElement('div');
            label.classList.add('label');
            label.setAttribute('data-uuid', uuid);
            label.innerHTML = label_list[uuid].text + ' <small>(' + label_list[uuid].count + ')</small>';
            label.style.backgroundColor = label_list[uuid].color.background;
            label.style.color = label_list[uuid].color.text;
            container.append(label);
        }
    }
    body_issue_list.append(container);
    console.log(label_list);
    // const tab = section.select(config?.options?.list?.selector)

}

export { issue }