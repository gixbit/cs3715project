var ip;
var port;

function serverGet(callback) {
    var request = new XMLHttpRequest();
    request.open('GET', 'http://' + ip +':'+port+ '/server/data', true);
    request.responseType = 'application/json';
    var jObj = undefined;
    request.onload = function(e) {
        jObj = JSON.parse(this.response).Data;
        callback(jObj);
    };
    request.send();
}

function userPopulator(data) {
    profiles = document.getElementById("people");
    for (var k in data['People']) {
        profiles.innerHTML += '<a class="preview" href="profile/'+data['People'][k].ref+'"><img class="profiles" src="img/profile/'+data['People'][k].ref+'_th.png"></a>';
    }

}

function load() {
    ip = location.hostname;
    port = location.port;
    serverGet(userPopulator);
}