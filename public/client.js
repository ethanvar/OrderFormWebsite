
var options = {
	logging: false,
	trackingTimeSensitivity: 10,
	mouseTrackingElement: '#trackarea',
	debug: true,
	autoTracking: false,
	appKey: "StQ5YP5Q06tyW6V",
	appSecret: "Awcp46y1t+nn9Q86ZOVIgM7hSax3wEQ2hTwDZDI9tDxT3hGMJUUGvQyG84l88n8sHQ==",
	trackingInterval: 60,
	sensorPollingFrequency: 10,
	packageId: "order.form.com"
};

kinetic = new ZFS.KineticTracker(options);
kinetic.init();

function signUp(){
    console.log('singIn')
    let user = {};
	user.name = document.getElementById("nameCr").value;
	user.password = document.getElementById("pswCr").value;
	
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
		}
	}
	
	req.open("POST", '/SignUp');
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(user));
}

function logIn(){
    let user = {};
	user.name = document.getElementById("name").value;
	user.password = document.getElementById("psw").value;
	console.log(user);
	let req = new XMLHttpRequest();
    req.open("POST", '/logIn');
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(user));

	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			location.href('/');
		}
	}

}

function changePrivacy() {
    let user = {};
	user.name = document.getElementById("username").innerHTML;
	console.log(user.name)
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			alert("status changed");
			location.href = window.location.href;
		}
	}
	
	//Send a POST request to the server containing the user data
	req.open("POST", '/users/setprivacy');
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(user));
}

function change(){
	let searchdiv = document.getElementById("searchdiv");
	searchdiv.innerHTML='';
	let input = document.getElementById("search-input").value;
	console.log(input);
	input = input.toLowerCase();
	var xhttp = new XMLHttpRequest();
	xhttp.open( "GET", '/names/' + input);
	xhttp.send(input);

	xhttp.onreadystatechange=function() {
		if (xhttp.readyState==4 && xhttp.status==200) {
			let searchResults = JSON.parse(xhttp.responseText);
			console.log(searchResults);
			for(let i = 0; i < searchResults.length; i++) {
				let searchR = document.createElement("a");
				let searchT = document.createTextNode(searchResults[i].username);
				searchR.href = "/users/"+searchResults[i]._id;

				searchR.appendChild(searchT);
				let br = document.createElement("br");
				searchdiv.append(searchR);
				searchdiv.append(br);
			}
		}
	}
}