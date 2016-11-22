var ip;
var reset;
function load() {
    ip = location.hostname;
    reset = document.getElementById('reset');
    reset.addEventListener("click", serverReset);
};

function serverReset(current,target) {
    var http = new XMLHttpRequest();
    var fdata = new FormData();
    fdata.append('admin','reset');
    http.open('POST','http://' + ip + ':8080/server');
    http.send(fdata);
}