var ip;
var port;

function serverGet(callback) {
    var request = new XMLHttpRequest();
    request.open('GET', 'http://' + ip +':'+port+'/server/data', true);
    request.responseType = 'text/plain';
    var jObj = undefined;
    request.onload = function(e) {
        jObj = JSON.parse(this.responseText).Data;
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
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome;
    var isIE = /*@cc_on!@*/false;
    var isEdge = window.navigator.userAgent.indexOf("Edge") > -1;
    if(isSafari) {
        document.getElementById('styles').innerHTML += '<link rel="stylesheet" type="text/css" href="../css/landingSafari.css">';
    } else {
        document.getElementById('styles').innerHTML += '<link rel="stylesheet" type="text/css" href="../css/landingBasic.css">';
    }
    serverGet(userPopulator);
}