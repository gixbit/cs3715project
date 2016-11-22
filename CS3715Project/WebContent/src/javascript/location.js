/* myLoc.js */
/*global localStorage*/
/*global google*/
const munCoord = {lat: 47.5738, lng: -52.7329};
const avalonCoord = {lat: 47.5613, lng: -52.7541};
const dtCoord = {lat: 47.5605, lng: -52.7128};
const villageCoord = {lat: 47.5350, lng: -52.7509};
var e;
var uDropDown;
var map;
var marker;
var labelMarker;
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var ip;
load = function() {
	ip = location.hostname;
	e = document.getElementById("locDropDown");
	e.addEventListener("change", menuSel);
	serverGet(lPagePopulator);
};

lPagePopulator = function(data) {
	var WebToKey = data.WebToKey;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var people = data.People;
	var sheader = document.getElementById('sheader');
	uDropDown = document.getElementById("userDropDown");
	uDropDown.innerHTML += "<option value=\""+PageKey+"\">"+ people[PageKey].first + ' ' + people[PageKey].last +"</option>";
	for (var p in people[PageKey].friends) {
		uDropDown.innerHTML += "<option value=\""+p+"\">"+ people[p].first + ' ' + people[p].last +"</option>";
	}
	sheader.innerHTML += '<img id="profilePic" src="../img/profile/'+people[PageKey].ref+'_th.png">';
	sheader.innerHTML += '<span id="name">'+ people[PageKey].first + ' ' + people[PageKey].last + '</span>';

	locationPopulator(data);
}
locationPopulator = function(data) {
	var WebToKey = data.WebToKey;
	var people = data.People;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	marker = {};
	labelMarker = {};
	var locs = document.getElementById("locations");
	locs.innerHTML = "<tr><th>Name</th><th>Location</th><th>TimeStamp</th><th>Directions</th></tr>";
	for(var l in people[PageKey].locations) {
		if(!marker[l]) {
			marker[l] = [];
			labelMarker[l] = labels[labelIndex++ % labels.length];
		}
		if(l != PageKey) {
			for(var k in people[PageKey].locations[l]){
				markerMaker(people,PageKey,l,k);		    	}
		} else {
			for(var k in people[PageKey].locations[l]){
				locs.innerHTML += people[PageKey].locations[l][k].ele;
				markerMaker(people,PageKey,l,k);
			}
		}
	}
};
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

function initMap() {

	var start = {lat: 47.5605, lng: -52.7128};
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 12,
	  center: start,
	});

}

function menuSel(){
	var pos;
	var userSel = e.options[e.selectedIndex].value;

	switch (userSel) {
		case "gps":
			getGpsLoc(setGpsLoc); //async operation
			break;
		case "mun":
			pos = munCoord;
			newMarker(pos);
			break;
		case "avalon":
			pos = avalonCoord;
			newMarker(pos);
			break;
		case "downtown":
			pos = dtCoord;
			newMarker(pos);
			break;
		case "village":
			pos = villageCoord;
			newMarker(pos);
			break;
		default:
			break;
	}
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
	newMarker(pos);
}

function newMarker(pos){
	var form = new FormData();
	var people = JSON.parse(localStorage.getItem("People"));
	var WebToKey = JSON.parse(localStorage.getItem("WebToKey"));
	var SelectKey = uDropDown.options[uDropDown.selectedIndex].value;
	var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var locs = document.getElementById("locations");
	pos = round(pos,4);
	var winfo = formatInfoWindow(pos,people[SelectKey].name);
	if(PageKey == SelectKey) {
		form.append(PageKey +'|'+ SelectKey,JSON.stringify({
			ele: formatElement(pos, SelectKey),
			gps: pos,
			info: winfo
		}));
		/**
		people[PageKey].locations[SelectKey].unshift({
			ele: formatElement(pos, SelectKey),
			gps: pos,
			info: winfo
		});
		*/
	} else {
		form.append(PageKey +'|'+ SelectKey,JSON.stringify({
			gps: pos,
			info: winfo
		}));
		/*
		people[PageKey].locations[SelectKey].unshift({
			gps: pos,
			info: winfo
		});
		*/
	}
	serverAddMarker(form);
}
function serverAddMarker(fData) {
	var http = new XMLHttpRequest();
	http.open('POST','http://' + ip + ':8080/location');
	http.onreadystatechange = function() {
		if(http.readyState === 4){
			if(http.status === 200) {
				serverGet(locationPopulator);
			}
		}
	}
	http.send(fdata);
}
function markerMaker(people,PageKey,l,k) {
	var infowindow = undefined;
	var mark = undefined;
	infowindow = new google.maps.InfoWindow({
		content: people[PageKey].locations[l][k].info
	});
	mark = new google.maps.Marker({
		position: people[PageKey].locations[l][k].gps,
		map: map,
		label: labelMarker[l],
		title: people[l].name
	});
	mark.addListener('click', function() {
		infowindow.open(map, mark);
	});
	marker[l].unshift(mark);
}
function round(pos,precision) {
	pos.lat = (Math.round(pos.lat * Math.pow(10,precision))/Math.pow(10,precision));
	pos.lng = (Math.round(pos.lng * Math.pow(10,precision))/Math.pow(10,precision));
	return pos;
}
function formatInfoWindow(pos,name) {
	var d = new Date().toLocaleString();
	var s = "<p class=\"winfo\">Name: "+name+"</p>"+"<p class=\"winfo\">Time: "+d+"</p>"+"<p class=\"winfo\">Location: "+pos.lat+", "+pos.lng+"</p>";
	return s;
}
function formatElement(pos,name) {
	var d = new Date();
	var time = d.toLocaleString();
	var str="<tr><th>"+name+"</th><th>"+pos.lat+", "+ pos.lng+"</th><th>"+time+"</th><th>Link</th></tr>";
	return str;
}
