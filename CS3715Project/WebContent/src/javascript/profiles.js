/*global localStorage*/
var fAdd;

window.onload = function() {
	fAdd = document.getElementById("fAdd");
	fAdd.addEventListener("click", addFriend);
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
    	};
      	localStorage.setItem("People",JSON.stringify(People));
    	localStorage.setItem("WebToKey", JSON.stringify(WebToKey));
    }
	fListPopulator();
};

function fListPopulator() {
    var key = window.location.pathname.split('/').pop().split('_').pop().split('.')[0];
    var people = JSON.parse(localStorage.getItem("People"));
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

function addFriend() {
    var WebToKey = JSON.parse(localStorage.getItem("WebToKey"));
    var key = WebToKey[window.location.pathname.split('/').pop().split('_').pop().split('.')[0]];
    var fList = document.getElementById("fList");
    var selected = fList.options[fList.selectedIndex].value;
    var fContainer = document.getElementById("fContainer");
    var people = JSON.parse(localStorage.getItem("People"));
    
    if(people[key].friends[selected]) {
        //Already a Friend
    } else {
        people[key].friends[selected] = true; 
        localStorage.setItem("People",JSON.stringify(people));
        fContainer.innerHTML += formatFriend(selected);
    }
}

function formatFriend(key){
    var entry = JSON.parse(localStorage.getItem("People"))[key];
    var str = "<div class=\"fElem\"><p class=\"fInfo\"><a href=\"profile_"+entry.ref+".html\">"+entry.name+"</a><br>"+entry.info+"</p><img class=\"fImg\" src=\"../../img/profile/"+entry.ref+".png\" width=\"50\" height=\"73.3\"></div>";
    return str;
}
