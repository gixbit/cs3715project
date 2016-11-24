/*global localStorage*/
var fAdd;
var fRemove;
var ip;
var port;
var myVar = setInterval(markerTimer, 5000);
function getTime() {
	var date = new Date();
	var hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var min  = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var sec = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    var year = date.getFullYear();
    var month = ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1);
    var day = (date.getDate() < 10 ? "0" : "") + date.getDate();
    return month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
}
function markerTimer() {
    callGPS(addLocation);
}
function load() {
	ip = location.hostname;
	port = location.port;
	fAdd = document.getElementById("fAdd");
	fAdd.addEventListener("click", add);
	fRemove = document.getElementById("fRemove");
	fRemove.addEventListener("click", remove);
	serverGet(fPagePopulator);
};

function callGPS(callback){
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(callback);
	}
	else {
		alert("No position data available");
	}
}

function addLocation(position){
	var pos = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	};
	serverGet(Marker, pos);
}
function Marker(data, pos){
	var form = new FormData();
	var people = data.People;
	var WebToKey = data.WebToKey;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var locs = document.getElementById("locations");
	pos = round(pos,2);
	var winfo = formatInfoWindow(pos, people[PageKey]);
	form.append(PageKey,JSON.stringify({
		ele: formatElement(pos, people[PageKey]),
		gps: pos,
		info: winfo
	}));
	serverAddMarker(form);
}
function serverAddMarker(fdata) {
	var http = new XMLHttpRequest();
	http.open('POST','http://' + ip + ':'+ port + '/location');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				//nothing for now
			}
		}
	}
	http.send(fdata);
}
function serverAddFriend(current,target) {
	var http = new XMLHttpRequest();
	var fdata = new FormData();
	fdata.append('add',current);
	fdata.append('add',target);
	http.open('POST','http://' + ip +':'+port+  '/profile');
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
	http.open('POST','http://' + ip +':'+port+ '/profile');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				serverGet(fListPopulator);
			}
		}
	}
	http.send(fdata);
}
function serverGet(callback, pos) {
	var request = new XMLHttpRequest();
	request.open('GET', 'http://' + ip +':'+port+ '/server/data', true);
	request.responseType = 'application/json';
	var jObj = undefined;
	request.onload = function(e) {
		jObj = JSON.parse(this.response).Data;
		if(pos) {
			callback(jObj,pos);
		} else {
			callback(jObj);
		}
	};
	request.send();
}
function round(pos,precision) {
	pos.lat = (Math.round(pos.lat * Math.pow(10,precision))/Math.pow(10,precision));
	pos.lng = (Math.round(pos.lng * Math.pow(10,precision))/Math.pow(10,precision));
	return pos;
}
function formatInfoWindow(pos, person) {
	var d = getTime();
	var s = "<p class=\"winfo\">Name: "+person.first+' '+person.last+"</p>"+"<p class=\"winfo\">Time: "+d+"</p>"+"<p class=\"winfo\">Location: "+pos.lat+", "+pos.lng+"</p>";
	return s;
}
function fPagePopulator(data) {
	var web = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
	key = data.WebToKey[web];
	var hTitle = document.getElementById('hTitle');
	var pTitle = document.getElementById('pTitle');
	var dImg = document.getElementById('dImg');
	var dInfo = document.getElementById('dInfo');
	var dSchedule = document.getElementById('dSchedule');
	hTitle.innerHTML += data.People[key].first + ' ' + data.People[key].last;
	pTitle.innerHTML += 'Welcome to ' + data.People[key].first + '\'s Page';
	dInfo.innerHTML += '<li class="pElem">Birthday: '+ data.People[key].birthday +'</li>';
	dInfo.innerHTML += '<li class="pElem">Location: <a href="../location/'+ web +'">'+ data.People[key].location +'</a></li>';
	dInfo.innerHTML += '<li class="pElem">PhoneNumber: '+ data.People[key].phone +'</li>';
	dSchedule.innerHTML += formatSchedule(data.People[key].schedule);
	dImg.innerHTML += '<img class="pImg" src="../img/profile/'+ web +'_th.png">';
	fListPopulator(data);
}
function fListPopulator(data) {
	var people = data.People;
	var key = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
	var fList = document.getElementById("fList");
	var fContainer = document.getElementById("fContainer");
	fList.innerHTML = '<option value=\"default\">Select a Person</option>';
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
function formatElement(pos,person) {
	var d = getTime();
	var time = d.toLocaleString();
	var str='<tr><th>'+person.first+' '+person.last+'</th><th>'+pos.lat+', '+ pos.lng+'</th><th>'+time+'</th><th><button onclick=centerOn("'+person.ref+'")>Center</button></th></tr>';
	return str;
}
