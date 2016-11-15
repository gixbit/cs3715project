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
var marker = {};
var labelMarker = {};
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

window.onload = function() {
	//localStorage.removeItem("People");
	if(localStorage.getItem("People")) {
	} else {
        var People = {
    	    Rory: { 
    	        ref: "RoryCampbell", 
    	        name: "Rory Campbell", 
    	        info: "Memorial University",
    	        friends: {},
    	        locations: {}
    	    },
    	    John: { 
    	        ref: "JohnHollett", 
    	        name: "John Hollett", 
    	        info: "Memorial University",
    	        friends: {},
    	        locations: {}
    	    },
    	    Michael: { 
    	        ref: "MichaelSullivan", 
    	        name: "Michael Sullivan", 
    	        info: "Memorial University",
    	        friends: {},
    	        locations: {}
    	    },
    	    Karl: { 
    	        ref: "KarlChiasson", 
    	        name: "Karl Chiasson", 
    	        info: "Memorial University",
    	        friends: {},
    	        locations: {}
    	    }
    	};
    	var WebToKey = {
    	    RoryCampbell: "Rory",
    	    MichaelSullivan: "Michael",
    	    KarlChiasson: "Karl",
    	    JohnHollett: "John"
    	}
    	localStorage.setItem("People",JSON.stringify(People));
    	localStorage.setItem("WebToKey", JSON.stringify(WebToKey));
	}
	e = document.getElementById("locDropDown");
	e.addEventListener("change", menuSel);
	uDropDown = document.getElementById("userDropDown");
	var runThis = function() {
		var WebToKey = JSON.parse(localStorage.getItem("WebToKey"));
	    var people = JSON.parse(localStorage.getItem("People"));
	    var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	    var locs = document.getElementById("locations");
    	locs.innerHTML = "<tr><th>Name</th><th>Location</th><th>TimeStamp</th><th>Directions</th></tr>";
	    uDropDown.innerHTML += "<option value=\""+PageKey+"\">"+ people[PageKey].name +"</option>";
	    for (var p in people[PageKey].friends) {
	    	uDropDown.innerHTML += "<option value=\""+p+"\">"+ people[p].name +"</option>";
	    }
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
	runThis();
};


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
    var people = JSON.parse(localStorage.getItem("People"));
    var WebToKey = JSON.parse(localStorage.getItem("WebToKey"));
    var SelectKey = uDropDown.options[uDropDown.selectedIndex].value;
    var PageKey = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
	var locs = document.getElementById("locations");
	pos = round(pos,4);
	var winfo = formatInfoWindow(pos,people[SelectKey].name);
	if(!people[PageKey].locations[SelectKey]){
		people[PageKey].locations[SelectKey] = [];
	}
    if(PageKey == SelectKey) {
    	people[PageKey].locations[SelectKey].unshift({
    		ele: formatElement(pos, SelectKey), 
    		gps: pos,
    		info: winfo
    	});
    } else {
    	people[PageKey].locations[SelectKey].unshift({
    		gps: pos,
    		info: winfo
    	});
    }
    var infowindow = new google.maps.InfoWindow({
        content: winfo
    });
	if(marker[SelectKey]){
		var mrker = new google.maps.Marker({
			position: pos,
			map: map,
			label: labelMarker[SelectKey],
			title: people[SelectKey].name
	    });
		marker[SelectKey].unshift(mrker);
		mrker.addListener('click', function() {
          infowindow.open(map, mrker);
        });
		if(marker[SelectKey].length > 5) {
			var m = marker[SelectKey].pop();
			m.setMap(null);
		}
	} else {
		marker[SelectKey] = [];
		labelMarker[SelectKey] = labels[labelIndex++ % labels.length];
		var mrker = new google.maps.Marker({
			position: pos,
			map: map,
			label: labelMarker[SelectKey],
			title: people[SelectKey].name
	    });
		mrker.addListener('click', function() {
            infowindow.open(map, mrker);
        });
		marker[SelectKey].unshift(mrker);
	}	
    if(people[PageKey].locations[SelectKey].length > 5) {
    	var l = people[PageKey].locations[SelectKey].pop();
    }
    locs.innerHTML = "<tr><th>Name</th><th>Location</th><th>TimeStamp</th><th>Directions</th></tr>";
    for(var l in people[PageKey].locations[PageKey]) {
    	locs.innerHTML += people[PageKey].locations[PageKey][l].ele;
    }
    localStorage.setItem("People", JSON.stringify(people));
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