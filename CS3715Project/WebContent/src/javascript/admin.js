var ip;
var port;
var reset;
function load() {
    ip = location.hostname;
    port = location.port;
    reset = document.getElementById('reset');
    reset.addEventListener("click", serverReset);
};

function serverReset(current,target) {
    var http = new XMLHttpRequest();
    var fdata = new FormData();
    fdata.append('admin','reset');
    http.open('POST','http://' + ip + ':' + port +'/server');
    http.send(fdata);
}