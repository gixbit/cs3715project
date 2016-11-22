/*global localStorage*/
var fAdd;
var fRemove;
var ip;
function load() {
	ip = location.hostname;
	fAdd = document.getElementById("fAdd");
	fAdd.addEventListener("click", add);
	fRemove = document.getElementById("fRemove");
	fRemove.addEventListener("click", remove);
	serverGet(fPagePopulator);
};
function serverAddFriend(current,target) {
	var http = new XMLHttpRequest();
	var fdata = new FormData();
	fdata.append('add',current);
	fdata.append('add',target);
	http.open('POST','http://' + ip + ':8080/profile');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				serverGet(fListPopulator);
			}
		}
	}
	http.send(fdata);
}
function serverRemoveFriend(current,target) {
	var http = new XMLHttpRequest();
	var fdata = new FormData();
	fdata.append('remove',current);
	fdata.append('remove',target);
	http.open('POST','http://' + ip + ':8080/profile');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				serverGet(fListPopulator);
			}
		}
	}
	http.send(fdata);
}
function serverGet(callback) {
	var request = new XMLHttpRequest();
	request.open('GET', 'http://' + ip + ':8080/server/data.json', true);
	request.responseType = 'application/json';
	var jObj = undefined;
	request.onload = function(e) {
		jObj = JSON.parse(this.response).Data;
		callback(jObj);
	};
	request.send(null);
}
function fPagePopulator(data) {
	var web = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
	key = data.WebToKey[web];
	fListPopulator(data);
	var hTitle = document.getElementById('hTitle');
	var pTitle = document.getElementById('pTitle');
	var dImg = document.getElementById('dImg');
	var dInfo = document.getElementById('dInfo');
	var dSchedule = document.getElementById('dSchedule');
	hTitle.innerHTML += data.People[key].first + ' ' + data.People[key].last;
	pTitle.innerHTML += 'Welcome to ' + data.People[key].first + '\'s Page';
	dImg.innerHTML += '<img class="pImg" src="../img/profile/'+ web +'_th.png">';
	dInfo.innerHTML += '<li class="pElem">Birthday: '+ data.People[key].birthday +'</li>';
	dInfo.innerHTML += '<li class="pElem">Location: <a href="../location/'+ web +'">'+ data.People[key].location +'</a></li>';
	dInfo.innerHTML += '<li class="pElem">PhoneNumber: '+ data.People[key].phone +'</li>';
	dSchedule.innerHTML += formatSchedule(data.People[key].schedule);

}
function fListPopulator(data) {
	var people = data.People;
	var key = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
	var fList = document.getElementById("fList");
	var fContainer = document.getElementById("fContainer");
	fList.innerHTML = '<option value=\"default\">Select a Friend</option>';
	fContainer.innerHTML = '';
	for (var p in people) {
		if(key != people[p].ref) {
			fList.innerHTML += fListFormatter(p, people[p]);
		} else {
			for(var f in people[p].friends) {
				fContainer.innerHTML += formatFriend(people[f]);
			}
		}
	}
}
function fListFormatter(key,value){
	var str = '<option value="' + key + '">'+ value.first + ' ' + value.last + '</option>';
	return str;
}

function add() {
	serverGet(addFriend);
}
function remove(){
	serverGet(removeFriend);
}
function removeFriend(data){
	var people = data.People;
	var key = data.WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var fList = document.getElementById("fList");
	var selected = fList.options[fList.selectedIndex].value;
	var fContainer = document.getElementById("fContainer");

	if(people[key].friends[selected]) {
		people[key].friends[selected] = undefined;
		serverRemoveFriend(key,selected);
	} else {
		//Not a Friend
	}
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
	}
}

function formatInnerDay(inner) {
	var str = '';
	for(var data in inner) {
		str += '<li>'+inner[data]+'</li>';
	}

	return str;
}

function formatDays(day) {
	var str = '';
	for(var d in day) {
		str += '<li>'+d+'<ul>' + formatInnerDay(day[d]) +'</ul></li>';
	}
	return str;
}

function formatSchedule(data){

	var str = '<ul>'+ formatDays(data) +'</ul>';
	return str;
}
function formatFriend(friend){
	var str = '<div class="fElem"><p class="fInfo"><a href="'+friend.ref+'">'+friend.first + ' ' + friend.last+'</a><br>'+friend.info+'</p><img class="fImg" src="../img/profile/'+friend.ref+'.png" width="50" height="73.3"></div>';
	return str;
}
