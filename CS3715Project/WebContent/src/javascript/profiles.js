/*global localStorage*/
var fAdd;
function load() {
	var fAdd = document.getElementById("fAdd");
	fAdd.addEventListener("click", add);
	var dat = serverGet(fListPopulator);
};
function serverAddFriend(current,target) {
	var http = new XMLHttpRequest();
	var fdata = new FormData();
	fdata.append('add[]',current);
	fdata.append('add[]',target);
	http.open('POST','http://localhost:8080');
	http.send(fdata);
}
function serverGet(callback) {
	var request = new XMLHttpRequest();
  	request.open("GET", "http://127.0.0.1:8080/server/data.json", false);
  	request.responseType = 'application/json';
  	var jObj = undefined;
	request.onload = function(e) {
		jObj = JSON.parse(this.response).Data;
  	};
	request.send(null);
	callback(jObj);
}
function fListPopulator(data) {
	var people = data.People;
    var key = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
    var fList = document.getElementById("fList");
    var fContainer = document.getElementById("fContainer");
    for (var p in people) {
        if(key != people[p].ref) {
            fList.innerHTML += fListFormatter(p, people[p].name);
        } else {
            for(var f in people[p].friends) {
                fContainer.innerHTML += formatFriend(f);
            }
        }
    }
}
function fListFormatter(key,value){
    var str = "<option value=\"" + key + "\">"+ value +"</option>";
    return str;
}

function add() {
	serverGet(addFriend);
}
function addFriend(data){
	var people = data.People;
    var key = data.WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
    var fList = document.getElementById("fList");
    var selected = fList.options[fList.selectedIndex].value;
    var fContainer = document.getElementById("fContainer");
    
    if(people[key].friends[selected]) {
        //Already a Friend
    } else {
        people[key].friends[selected] = true;
        serverAddFriend(key,selected);
        fContainer.innerHTML += formatFriend(people[selected]);
    }
}

function formatFriend(entry){
    var str = "<div class=\"fElem\"><p class=\"fInfo\"><a href=\"profile_"+entry.ref+".html\">"+entry.name+"</a><br>"+entry.info+"</p><img class=\"fImg\" src=\"../../img/profile/"+entry.ref+".png\" width=\"50\" height=\"73.3\"></div>";
    return str;
}
