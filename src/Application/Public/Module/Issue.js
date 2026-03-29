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
                                "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.filter",
                                "request-method": "GET"
                            },
                            selector: ".issue-list",
                            status: "open",
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
        "uuid": "85062429-f6c0-401c-9352-1d84f21c9c21",
        "request-method": "DELETE",
    }
    header('Authorization', 'Bearer ' + token);
    request(url, data_delete, (url, response) => {
        console.log(response);
    });
    const data = {
        "output.filter[]": "Package:Raxon:Issue:Output:Filter:Application:Issue:issue.config",
        "where": "user === '" + user.get('uuid') + "'",
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
                        "where": "user === '" + user.get('uuid') + "'",
                        "request-method": "GET",
                    };
                    header('Authorization', 'Bearer ' + token);
                    request(url, data, async (url, response) => {
                        storage.data.set('issue.config', response?.list[0]);
                        issue.load('issue.list.all', 'issue.config.options.list.all');
                        issue.load('issue.label.list.all', 'issue.config.options.list.label.all');

                        //we can hold active tab in storage and then load it
                        await issue.list(id);
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
        case 'issue.list.active':
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
    if( !rgb ) {
        return "rgba(0,0,0,0)";
    }
    return "rgba(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + "," + alpha + ")";
}

issue.list = async (id) => {
    const section = getSectionById(id);
    if (!section) {
        return;
    }
    let active_load = storage.data.get('issue.list.load.active');
    if(!active_load){
        storage.data.set('issue.list.load.active', true);
        issue.load('issue.list.active', 'issue.config.options.list.active');
    }
    const config = storage.data.get('issue.config');
    const issue_list_all = storage.data.get('issue.list.all');
    const issue_label_list_all = storage.data.get('issue.label.list.all');
    const issue_list_active = storage.data.get('issue.list.active');
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
    if(!issue_list_active){
        console.log('issue_list_active not loaded');
        await issue.sleep(1/60);
        await issue.list(id);
        return;
    }
    console.log('READY');
    console.log(issue_list_all);
    console.log(issue_label_list_all);
    console.log(issue_list_active);
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
            modified: _('_').microtime(true),
            special: "no-label",
        },
        color: {
            text: "rgb(0,0,0)",
            background: "rgb(255,255,255)"
        },
        count: 0
    };
    console.log(issue_list_all?.list.length);
    for(let i=0; i < issue_list_all?.list?.length; i++){
        let issue = issue_list_all?.list[i];
        if(!issue.status){
            continue;
        }
        let status = config?.options?.list?.status;
        if(!status){
            status = 'open';
        }
        if(
            issue.status !== status &&
            status !== 'all'
        ){
            continue;
        }
        if(!issue.label){
            label_list[''].count++;
        } else {
            for(let j=0; j < issue.label.length; j++){
                let label_uuid = issue.label[j];
                label_list[label_uuid][issue.status].count++;
            }
        }
    }
    section.select('.body .issue-list').html('');
    let body_issue_list = section.select('.body .issue-list');
    let container = section.select('labels');
    if(!container){
        container = _('_').create('div');
        container.classList.add('labels');
    }
    console.log(label_list);
    for(let uuid in label_list){
        console.log(label_list[uuid]);
        /*
        if(label_list[uuid].count === 0){
            // delete label_list[uuid];
        } else {
         */
            let label = _('_').create('div');
            label.classList.add('label');
            label.setAttribute('data-uuid', uuid);
            label.innerHTML = label_list[uuid].text + ' <span class="count">' + label_list[uuid].count + '</span>';
            console.log(issue.rgb_to_rgba(label_list[uuid].color.background, 0.7));
            label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
            label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            container.append(label);
            label.addEventListener("mouseenter", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.9);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.9);
            });
            label.addEventListener("mouseover", () => {
                label.trigger('mouseenter');
            });
            label.addEventListener("mouseout", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            });
            label.addEventListener("focus", () => {
                label.classList.add("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.9);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.9);
            });

            label.addEventListener("blur", () => {
                label.classList.remove("focus");
                label.style.backgroundColor = issue.rgb_to_rgba(label_list[uuid].color.background, 0.7);
                label.style.color = issue.rgb_to_rgba(label_list[uuid].color.text, 0.7);
            });
            /*
        }
             */
    }
    body_issue_list.append(container);

    let count = body_issue_list.select('.count');
    if(count){
        if(is.nodeList(count)){
            for(let i=0; i < count.length; i++){
                count[i].addEventListener("mouseenter", () => {
                    let label = count[i].closest('.label');
                    label.trigger('mouseenter');
                });
                count[i].addEventListener("focus", () => {
                    let label = count[i].closest('.label');
                    label.trigger('focus');
                });
                count[i].addEventListener("mouseout", () => {
                    let label = count.closest('.label');
                    label.trigger('mouseout');
                });
                count[i].addEventListener("blur", () => {
                    let label = count.closest('.label');
                    label.trigger('blur');
                });
            }
        } else {
            count.addEventListener("mouseenter", () => {
                let label = count.closest('.label');
                label.trigger('mouseenter');
            });
            count.addEventListener("focus", () => {
                let label = count.closest('.label');
                label.trigger('focus');
            });
            count.addEventListener("mouseout", () => {
                let label = count.closest('.label');
                label.trigger('mouseout');
            });
            count.addEventListener("blur", () => {
                let label = count.closest('.label');
                label.trigger('blur');
            });
        }
    }
    container = section.select('issues');
    if(!container){
        container = document.createElement('div');
        container.classList.add('issues');
    }
    for(let i=0; i < issue_list_active?.list?.length; i++){
        //issue_list.list[i];
        let issue = document.createElement('div');
        issue.classList.add('issue');
        issue.setAttribute('data-uuid', issue_list_all.list[i].uuid);
        let text = '';
        text += '<ul>';
        text += '<li class="title">Title</li>';
        text += '<li class="labels">Labels</li>';
        text += '<li class="is-modified">Modified</li>';
        text += '<li class="title">' + issue_list_active.list[i].title + '</li><li class="labels">';
        for(let uuid in label_list){
            let label_length = issue_list_active.list[i]?.label?.length ?? 0;

            if(label_length === 0 && label_list[uuid]?.is?.special === 'no-label'){
                text += '<span class="label" style="background: ' + label_list[uuid].color.background +'; color: ' + label_list[uuid].color.text + ';">' + label_list[uuid].text + '</span>';
            } else {
                if(in_array(uuid, issue_list_active.list[i]?.label)){
                    text += '<span class="label" style="background: ' + label_list[uuid].color.background +'; color: ' + label_list[uuid].color.text + ';">' + label_list[uuid].text + '</span>';
                }
            }
        }
        let is_modified = _('_').date('Y-m-d H:i:s', issue_list_active.list[i].is.modified);
        text += '</li><li class="is-modified"><small>'+ is_modified +'</small></li>'
        text += '</li></ul>';
        issue.innerHTML = text;
        container.append(issue);

    }
    body_issue_list.append(container);
    body_issue_list.removeClass('display-none');
    const footer_issue_list = section.select('.footer .issue-list');
    if(footer_issue_list){
        const label_status = _('_').create('label');
        const button_status = _('_').create('button');
        button_status.classList.add('status');
        button_status.innerHTML = 'Open';
        footer_issue_list.appendChild(button_status);
        label_status.classList.add('status');
        label_status.innerHTML = 'Status';
        footer_issue_list.appendChild(label_status);
        const button_filter = _('_').create('button');
        button_filter.classList.add('filter');
        button_filter.innerHTML = 'Filter';
        footer_issue_list.appendChild(button_filter);
        footer_issue_list.removeClass('display-none');
        let status = footer_issue_list.select('[name="status"]');
        if(status && !status.data('init')){
            status.on('change', (event) => {
                let value = event.target.value;
                let options = status.select('option');
                if(is.nodeList(options)){
                    for(let i=0; i < options.length; i++){
                        options[i].removeAttribute('selected');
                    }
                }
                else if(options){
                    options.removeAttribute('selected');
                }
                let option = status.select('option[value="' + value + '"]');
                option.attribute('selected', 'selected');
                let patch;
                switch(value){
                    case 'all':
                        config.options.list.status = value;
                        storage.data.set('issue.config.options.list.status', value);
                        patch = {
                            node: {
                                uuid: config.uuid,
                                options: {
                                    list: {
                                        status: value,
                                        active: {
                                            where: ""
                                        }
                                    }
                                }
                            },
                            "request-method": "PATCH"
                        }
                        if(user.token()){
                            header('Authorization', 'Bearer ' + user.token());
                            request(storage.data.get('backend.issue.config'), patch, async (url, response) => {
                                storage.data.set('issue.config', response?.node);
                                // storage.data.delete('issue.list.all');
                                // storage.data.delete('issue.label.list.all');
                                section.select('.body .issue-list').html('');
                                storage.data.delete('issue.list.load.active');
                                storage.data.delete('issue.list.active');
                                // issue.load('issue.list.all', 'issue.config.options.list.all');
                                // issue.load('issue.label.list.all', 'issue.config.options.list.label.all');

                                //we can hold active tab in storage and then load it
                                await issue.list(id);
                            });
                        }
                        break;
                    case 'open':
                    case 'active':
                    case 'closed':
                    case 'error':
                        config.options.list.status = value;
                        storage.data.set('issue.config.options.list.status', value);
                        patch = {
                            node: {
                                uuid: config.uuid,
                                options: {
                                    list: {
                                        status: value,
                                        active: {
                                            where: "status === '" + value + "'"
                                        }
                                    }
                                }
                            },
                            "request-method": "PATCH"
                        }
                        if(user.token()){
                            header('Authorization', 'Bearer ' + user.token());
                            request(storage.data.get('backend.issue.config'), patch, async (url, response) => {
                                storage.data.set('issue.config', response?.node);
                                // storage.data.delete('issue.list.all');
                                // storage.data.delete('issue.label.list.all');
                                storage.data.delete('issue.list.load.active');
                                storage.data.delete('issue.list.active');
                                // issue.load('issue.list.all', 'issue.config.options.list.all');
                                // issue.load('issue.label.list.all', 'issue.config.options.list.label.all');

                                //we can hold active tab in storage and then load it
                                await issue.list(id);
                            });
                        }
                        break;
                }
            });
            let value = config?.options?.list?.status ?? 'all';
            let options = status.select('option');
            if(is.nodeList(options)){
                for(let i=0; i < options.length; i++){
                    options[i].removeAttribute('selected');
                }
            }
            else if(options){
                options.removeAttribute('selected');
            }
            let option = status.select('option[value="' + value + '"]');
            option.attribute('selected', 'selected');
            status.data('init', true);
        }
    }
    // const tab = section.select(config?.options?.list?.selector)

}

export { issue }