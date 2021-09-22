var slider = document.getElementById("ramrange");
var output = document.getElementById("demo");
output.innerHTML = slider.value+"G";

slider.max = window.api.maxosram;

slider.oninput = function() {
    output.innerHTML = this.value+"G";
}

slider.onmouseup  = function() {
    output.innerHTML = this.value+"G";
    window.api.setMaxRam(this.value);
}

slider.value = window.api.getMaxRam;
output.innerHTML = window.api.getMaxRam+"G";
document.querySelector(".fakeInput").innerHTML = window.api.javaPath;

window.api.receive("javaPath", (data) => {
    document.querySelector(".fakeInput").innerHTML = data.filePaths[0];
});
