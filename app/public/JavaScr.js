const data = (new function(){
    let int = 0;
    const arr = {};
    this.init = (callback) => {
        util.ajax({method:"GET"}, data => {
            data.map(std => {
                arr[std.Id] = std;
                int = std.Id;
            });
            int++
            if (typeof callback == "function") callback();
        });
    }
    this.create = obj => {
        obj.Id = int++;
        arr[obj.Id] = obj;
        util.ajax({method:"POST", body: JSON.stringify(obj)});
        return obj;
    }
    this.getAll = () => {
        return Object.values(arr);
    }
    this.get = id => arr[id];
    this.update = obj => {
        arr[obj.Id] = obj;
        util.ajax({method:"PUT", body: JSON.stringify(obj)});
        return obj;
    }
    this.delete = id => {
        delete arr[id];
        util.ajax({method:"DELETE", path: "/" + id});

    }
});

const util = new function() {
    this.ajax = (params, callback) => {
        let url = "";
        if(params.path != undefined) {
            url = params.path;
            delete params.path;
        }
        fetch("/student"+url, params).then(data => data.json()).then(callback);
    }
    this.parse = (tpl, obj) => {
        let str = tpl;
        for (let k in obj) {
            str = str.replaceAll("{" + k + "}", obj[k]);
        }
        return str;
    };
    this.id = el => document.getElementById(el);
    this.q = el => document.querySelectorAll(el);
    this.listen = (el, type, callback) => el.addEventListener(type, callback);
}

const student = new function() {
    this.submit = () => {
        const st = {
            name: util.id("name").value,
            group: util.id("group").value,
            phone: util.id("phone").value,
            email: util.id("email").value,
        };
        if (util.id("Id").value === "-1") data.create(st)
        else {
            st.Id = util.id("Id").value;
            data.update(st);
        }
        this.render();
        util.id("fcenter").style.display = "none";
    }
    this.remove = () => {
        data.delete(activeStudent);
        activeStudent = null;
        this.render()
        util.id("dcenter").style.display = "none"
    }
    const init = () => {
        data.init(() => {
            this.render();
        });
        util.q(".add").forEach(el=>{
            util.listen(el, "click", add);
        });
        util.q(".close").forEach(el => {
            util.listen(el, "click", () => {
                util.id(el.dataset["id"]).style.display = "none";
            });
        });
        util.q(".submit").forEach(el => {
            util.listen(el, "click", () => {
                this[el.dataset["func"]]();
            });
        });
    };
    const add = () => {
        util.q("#fcenter form")[0].reset();
        util.id("Id").value = "-1";
        util.id("fcenter").style.display = "block";
    };
    const edit = el => {
        util.q("#fcenter form")[0].reset();
        const st = data.get(el.dataset["id"]);
        for (let k in st){
            util.id(k).value = st[k];
        }
        util.id("fcenter").style.display = "block";
    };
    let activeStudent = null;
    const rm = el => {
        util.id("dcenter").style.display = "block";
        activeStudent = el.dataset["id"];
    };
    const listeners = {edit: [], rm: []};
    const clearListener = () => {
        listeners.edit.forEach(el => {
            el.removeEventListener("click", edit);
        });
        listeners.rm.forEach(el => {
            el.removeEventListener("click", rm);
        });
        listeners.edit = [];
        listeners.rm = [];
    };
    const addListener = () => {
        util.q(".edit").forEach(el =>{
            listeners.edit.push(el);
            util.listen(el, "click", () => edit(el));
        });
        util.q(".rm").forEach(el =>{
            listeners.rm.push(el);
            util.listen(el, "click", () => rm(el));
        });
    };
    this.render = () => {
        clearListener()
        util.id("table").innerHTML = data
            .getAll()
            .map(el => util.parse(tpl, el)).join("");
        addListener();
    };
    const tpl = `
        <tr>
        <td>{name}</td>
        <td>{group}</td>
        <td>{phone}</td>
        <td>{email}</td>
        <td>
            <input class="edit" data-id="{Id}" type="button" value="Изменить">
            <input class="rm" data-id="{Id}" type="button" value="Удалить">
        </td>
        </tr>
    `;
    window.addEventListener("load", init);
}