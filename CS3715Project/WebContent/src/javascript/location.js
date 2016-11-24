/* myLoc.js */
/*global localStorage*/
/*global google*/
const munCoord = {lat: 47.5738, lng: -52.7329};
const avalonCoord = {lat: 47.5613, lng: -52.7541};
const dtCoord = {lat: 47.5605, lng: -52.7128};
const villageCoord = {lat: 47.5350, lng: -52.7509};
var e;
var map;
var marker;
var labelMarker;
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var ip;
var port;
var WebToKey;
var markerUpdate = setInterval(markerTimer, 5000);
var markerResume = undefined;
var halt = false;

function resumeTimer() {
	if(halt) {
		halt = false;
	}
}
function markerTimer() {
	if (!halt) {
    	getGpsLoc(setGpsLoc);
   	}
}
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
load = function() {
	initMap();
	ip = location.hostname;
	port = location.port;
	e = document.getElementById("locDropDown");
	serverGet(lPagePopulator);
};

lPagePopulator = function(data) {
	WebToKey = data.WebToKey;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var people = data.People;
	var sheader = document.getElementById('sheader');
	sheader.innerHTML += '<img id="profilePic" src="../img/profile/'+people[PageKey].ref+'_th.png">';
	sheader.innerHTML += '<span id="name">'+ people[PageKey].first + ' ' + people[PageKey].last + '</span>';

	locationPopulator(data);
}
locationPopulator = function(data) {
	var people = data.People;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	for (var j in marker) {
		try{
			marker[j].setMap(undefined);
		}catch(err){}
	}
	marker = {};
	labelMarker = {};
	labelIndex = 0;
	var locs = document.getElementById("locations");
	locs.innerHTML = "<tr><th>Name</th><th>Location</th><th>TimeStamp</th><th>Directions</th></tr>";
	for(var p in people) {
		if(p == PageKey || people[PageKey]['friends'][p]){

			var l = people[p]['locations'];
			if(!marker[p]) {
				marker[p] = undefined;
				labelMarker[p] = labels[labelIndex++ % labels.length];
			}
			if(people[p]['locations']){
				locs.innerHTML += l.ele;
				markerMaker(people,p);
			}
		}
	}
};
function markerMaker(people,p) {
	var infowindow = undefined;
	var mark = undefined;
	infowindow = new google.maps.InfoWindow({
		content: people[p].locations.info
	});
	mark = new google.maps.Marker({
		position: people[p].locations.gps,
		map: map,
		label: labelMarker[p],
		title: people[p].first + ' ' + people[p].last
	});
	mark.addListener('click', function() {
		infowindow.open(map, mark);
	});
	marker[p] = mark;
}
function serverGet(callback,pos) {
	var request = new XMLHttpRequest();
	request.open('GET', 'http://' + ip + ':'+ port + '/server/data', true);
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
	request.send(null);
}
function serverAddMarker(fdata) {
	var http = new XMLHttpRequest();
	http.open('POST','http://' + ip + ':'+ port + '/location');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				serverGet(locationPopulator);
			}
		}
	}
	http.send(fdata);
}
function initMap() {

	var start = {lat: 47.5605, lng: -52.7128};
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 12,
	  center: start,
	});

}


function getGpsLoc(callback){
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(callback);
	}
	else {
		alert("No position data available");
	}
}

function setGpsLoc(position){
	var pos = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	};
	serverGet(Marker, pos);
}

function Marker(data, pos){
	var form = new FormData();
	var people = data.People;
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
function centerOn(p) {
	map.setCenter(marker[WebToKey[p]].getPosition());
	for (var j in marker) {
		try{
			if(j != WebToKey[p]){
				marker[j].setMap(undefined);
			} else {
				halt = true;
				clearTimeout(markerResume);
				markerResume = setTimeout(resumeTimer, 10000);
				marker[j].setMap(map);
			}
		}catch(err){}
	}
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
function formatElement(pos,person) {
	var d = getTime();
	var time = d.toLocaleString();
	var str='<tr><th>'+person.first+' '+person.last+'</th><th>'+pos.lat+', '+ pos.lng+'</th><th>'+time+'</th><th><button onclick=centerOn("'+person.ref+'")>Center</button></th></tr>';
	return str;
}
