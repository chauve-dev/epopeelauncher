window.addEventListener("load", function() {
    window.api.receive("fromActu", (data) => {
        addActualite(data);
    });

    window.api.receive("fromLogin", (data) => {
        document.querySelector('.loader').style.display = 'none';
        if(data.logged == true) {
            document.querySelector(".main-container").innerHTML = `
            <h2>${data.name}</h2>
            <img src="https://crafatar.com/renders/body/${data.uuid}">
            <div class="input-group">
                <input onclick="window.api.send('play_microsoft', {})" type="submit" value="Jouer" />
            </div>
          `;
        }
    });

    window.api.receive("loginUpdate", (data) => {
        this.document.getElementById("loaderpercent").innerHTML = data+"%";
    });

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