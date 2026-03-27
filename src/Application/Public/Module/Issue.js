import { taskbar } from "/Application/Desktop/Module/Taskbar.js";
import { getSectionById } from "/Module/Section.js";
import { dialog } from "/Dialog/Module/Dialog.js";
import { file } from "/Application/Filemanager/Module/File.js";
import { storage } from "/Application/Issue/Module/Storage.js"
import user from "/Module/User.js";

let issue = {};

issue.init = async (id) => {
    taskbar.add('application-issue', id);

    issue.menu(id);
    issue.menu_application(id);
    issue.close(id);
    await issue.config(id);
}

issue.default = (type) => {
    switch (type) {
        case 'config': {
            return {
                node : {
                    user : user.get('uuid'),
                    options : {
                        list : {
                            all: {
                                page : 1,
                                limit : "*",
                                sort:  "title=ASC",
                                where: "",
                                "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.filter",
                                "request-method": "GET"
                            },
                            active: {
                                page : 1,
                                limit : 30,
                                sort:  "title=ASC",
                                where: "status === 'open'",
                                "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.filter.open",
                                "request-method": "GET"
                            },
                            selector: ".issue-list",
                            label : {
                                all: {
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



issue.config = async (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    const token = user.token();
    const url = storage.data.get('backend.issue.config');

    const data_delete = {
        "uuid": "593d8910-2a9e-42da-a1de-053dd68d03f3",
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
        request(url, data, async (url, response) => {
            console.log(response);
            if (response?.count === 0) {
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
                issue.load('issue.list.all', 'issue.config.options.list.all');
                issue.load('issue.label.list.all', 'issue.config.options.list.label.all');
                await issue.list(id);
            }
        });
    }
}

issue.load = (type, attribute) => {
    let url;
    let token;
    let data;
    switch (type) {
        case 'issue.list.all':
            url = storage.data.get('backend.issue.list');
            console.log(url);
            token = user.token();
            data = storage.data.get(attribute);
            console.log(data);
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
        case 'issue.label.list.all':
            url = storage.data.get('backend.issue.label.list');
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

issue.rgb_to_rgba = (rgb, alpha) => {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "rgba(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + "," + alpha + ")";
}

issue.list = async (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    const config = storage.data.get('issue.config');
    const issue_list_all = storage.data.get('issue.list.all');
    const issue_label_list_all = storage.data.get('issue.label.list.all');
    if(!config){
        return;
    }
    if(!issue_list_all){
        console.log('issue_list not loaded');
        await issue.sleep(1/60);
        await issue.list(id);
        return;
    }
    if(!issue_label_list_all){
        console.log('issue_label_list not loaded');
        await issue.sleep(1/60);
        await issue.list(id);
        return;
    }
    console.log('READY');
    console.log(issue_list_all);
    console.log(issue_label_list_all);
    let label_list = {};
    for(let i=0; i < issue_label_list_all?.list?.length; i++ ){
        let label = issue_label_list_all.list[i];
        label_list[label.uuid] = label;
        label_list[label.uuid].count = 0;
    }
    label_list[''] = {
        uuid: "",
        text: "No Label",
        is: {
            created: _('_').microtime(true),
            modified: _('_').microtime(true)
        },
        color: {
            text: "rgb(0,0,0)",
            background: "rgb(255,255,255)",
            hover: {
                text: "rgb(0,0,0)",
                background: "rgb(255,255,255)"
            }
        },
        count: 0
    };
    console.log(issue_list_all?.list.length);
    for(let i=0; i < issue_list_all?.list?.length; i++){
        let issue = issue_list_all?.list[i];
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
        container = _('_').create('div');
        container.classList.add('labels');
    }
    console.log(label_list);
    for(let uuid in label_list){
        console.log(label_list[uuid]);
        if(label_list[uuid].count === 0){
            delete label_list[uuid];
        } else {
            let label = document.createElement('div');
            label.classList.add('label');
            label.setAttribute('data-uuid', uuid);
            label.innerHTML = label_list[uuid].text + ' <span class="count">' + label_list[uuid].count + '</span>';
            console.log(issue.rgb_to_rgba(label_list[uuid].color.background, 0.7));
            label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
            label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            container.append(label);
            let label_count = container.select('.count');
            label.addEventListener("mouseenter", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.hover.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.hover.text, 1);
            });

            label.addEventListener("mouseout", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            });
            label.addEventListener("focus", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.hover.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.hover.text, 1);
            });

            label.addEventListener("blur", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 1);
            });
            label_count.addEventListener("mouseenter", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.hover.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.hover.text, 1);
            });

            label_count.addEventListener("mouseout", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            });
            label_count.addEventListener("focus", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.hover.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.hover.text, 1);
            });

            label_count.addEventListener("blur", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 1);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 1);
            });
        }
    }
    body_issue_list.append(container);
    container = section.select('issues');
    if(!container){
        container = document.createElement('div');
        container.classList.add('issues');
    }
    for(let i=0; i < issue_list_all?.list?.length; i++){
        //issue_list.list[i];
        let issue = document.createElement('div');
        issue.classList.add('issue');
        issue.setAttribute('data-uuid', issue_list_all.list[i].uuid);
        let text = '';
        text += '<ul>';
        text += '<li class="title">Title</li>';
        text += '<li class="labels">Labels</li>';
        text += '<li class="is-modified">Modified</li>';
        text += '<li class="title">' + issue_list_all.list[i].title + '</li><li class="labels">';
        for(let uuid in label_list){
            text += '<span class="label" style="background: ' + label_list[uuid].color.background +'; color: ' + label_list[uuid].color.text + ';">' + label_list[uuid].text + '</span>';
        }
        let is_modified = _('_').date('Y-m-d H:i:s', issue_list_all.list[i].is.modified);
        text += '</li><li class="is-modified"><small>'+ is_modified +'</small></li>'
        text += '</li></ul>';
        issue.innerHTML = text;
        container.append(issue);

    }
    body_issue_list.append(container);
    body_issue_list.removeClass('display-none');
    // const tab = section.select(config?.options?.list?.selector)

}

export { issue }