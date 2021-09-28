window.addEventListener("load", function() {
    window.api.receive("fromActu", (data) => {
        addActualite(data);
    });

    window.api.receive("fromLogin", (data) => {
        document.querySelector('.loader').style.display = 'none';
        if(data.logged == true) { 
            document.getElementById("loginform").style.display = 'none';
            document.querySelector(".main-container").innerHTML += `
            <h2 data="temp">${data.name}</h2>
            <img data="temp" src="https://crafatar.com/renders/body/${data.uuid}">
            <div data="temp" class="input-group">
                <input id="play" onclick="window.api.send('play', {})" type="submit" value="Jouer" />
            </div>
            <a data="temp" class="input-link" onclick="
            logout();
            ">
              Déconnexion
            </a>
          `;
        }
    });



    window.api.receive("loginUpdate", (data) => {
        this.document.getElementById("loaderpercent").innerHTML = data.percent+"%";
        this.document.getElementById("loadermessage").innerHTML = data.message;
    });

    window.api.receive("update_forge", (data) => {
        document.querySelector('#modpack_loading').style.display = 'flex';
        this.document.getElementById("forge_progress").style.width = data.progress+"%";
        this.document.getElementById("forge_downloaded").innerHTML = data.downloaded;
        this.document.getElementById("forge_total").innerHTML = data.total;
        this.document.getElementById("forge_percent").innerHTML = data.progress+"%";
    });

    window.api.receive("update_modpack", (data) => {
        document.querySelector('#modpack_loading').style.display = 'flex';
        this.document.getElementById("modpack_progress").style.width = data.progress+"%";
        this.document.getElementById("modpack_downloaded").innerHTML = data.downloaded;
        this.document.getElementById("modpack_total").innerHTML = data.total;
        this.document.getElementById("modpack_percent").innerHTML = data.progress+"%";
    });

    this.window.api.receive("update_done", (data) => {
        document.querySelector('#modpack_loading').style.display = 'none';
    });

    this.window.api.receive("enable_button", (data) => {
        console.log(data)
        document.querySelector('#play').disabled = !data;
    });



    this.window.api.receive("update-error-launcheur", (data) => {
        document.querySelector('#launcher_loading').style.display = 'none';
    })

    this.window.api.receive("download-progress-launcheur", (data) => {
        document.querySelector('#launcher_loading').style.display = 'flex';
        this.document.getElementById("launcher_progress").style.width = data.progress+"%";
        this.document.getElementById("launcher_downloaded").innerHTML = data.downloaded;
        this.document.getElementById("launcher_total").innerHTML = data.total;
        this.document.getElementById("launcher_percent").innerHTML = data.progress+"%";
    })

    window.api.send("getActu", {});
});

moment(new Date()).format('D MMMM YYYY');

function addActualite (actualites) {
    actualites.forEach(function ({Titre, content, published_at}) {
    let element = `<h2>${Titre}</h2>
                            ${content}
                            <hr>
                            <small>${moment(new Date(published_at)).format("D MMM YYYY")}</small>`;
        let htmlElement = document.createElement("div");
        htmlElement.className = "news";
        htmlElement.innerHTML = element;
        document.querySelector(".news-container").insertAdjacentElement("afterbegin", htmlElement);
    });
}

function mojangAuth() {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    window.api.send('mojang', {
        email: email,
        password: password
    })
}

function logout() {
    document.getElementById('loginform').style.display = 'flex';
    window.api.send('logout', {});
    document.querySelectorAll('[data="temp"]').forEach(element=>element.remove())
}