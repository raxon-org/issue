import { object } from "/Module/Object.js";
import { uuid }  from "/Module/Web.js";


let storage = {};

storage.data = {
    data : {},
    set : (attribute, value) => {
        if(
            window.performance?.memory?.usedJSHeapSize <
            (
                window.performance?.memory?.jsHeapSizeLimit -
                (
                    256 * 1024 * 1024 //stay 256 MB from max.
                )
            )
        ){
            if (typeof attribute === 'object') {
                for (let attr in attribute) {
                    object.set(attr, attribute[attr], storage.data.data);
                }
            } else {
                object.set(attribute, value, storage.data.data);
            }
        }
        else if(!window.performance?.memory?.jsHeapSizeLimit){
            if (typeof attribute === 'object') {
                for (let attr in attribute) {
                    object.set(attr, attribute[attr], storage.data.data);
                }
            } else {
                object.set(attribute, value, storage.data.data);
            }
        } else {
            throw new Error('Memory limit exceeded (' + window.performance?.memory?.usedJSHeapSize + ')');
        }
    },
    has : (attribute) => {
        return object.has(attribute, storage.data.data);
    },
    get : (attribute) => {
        return object.get(attribute, storage.data.data);
    },
    delete : (attribute) => {
        return object.delete(attribute, storage.data.data);
    }
};

storage.size = () => {
    let size = storage.data.get('size.real');
    if(size){
        return size;
    } else {
        let index;
        let max = 1024; // 1024 MB
        let key = uuid();
        let test = '';
        try {
            for (index = 1; index <= max; index++) {
                test = 'a'.repeat(1024 * 1024 * index);
                storage.data.data.size = {
                    max : max * 1024 * 1024,
                    real : test.length,
                    free : test.length
                }
                storage.data.set(key, test); // 511 MB
                //localStorage.setItem(key, test); // 5 MB
            }
        } catch (e) {
            storage.data.delete(key);
            // localStorage.removeItem(key);
        }
        storage.data.delete(key);
        // localStorage.removeItem(key);
    }
}

storage.random_string =  (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_+-=[]{};\'\:\"|,./<>?';
    let counter = 0;
    let result = '';
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        counter += 1;
    }
    return result;
}

storage.init = () => {
}

export { storage };