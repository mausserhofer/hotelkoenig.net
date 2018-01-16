// var config = {
//   apiKey: "AIzaSyAPK054lSzv5mvbPlhJlbYqRa6Kxlm413Q",
//   authDomain: "helosystem-22b06.firebaseapp.com",
//   databaseURL: "https://helosystem-22b06.firebaseio.com",
//   projectId: "helosystem-22b06",
//   storageBucket: "helosystem-22b06.appspot.com",
//   messagingSenderId: "689393286323"
// };
// firebase.initializeApp(config);
//
// console.log("Firebase connection created")

// get all player from firebase and write them in a table with their current helorating
var databaseRef = firebase.database();
var playerRef = databaseRef.ref('Player');

// query for the ten highest heloNow scores
//let playerMax = 10
var txt1 = "<TABLE align='center' width='200pt'> <TH> Name <TH> HELO"
var txt2 = ""
playerRef.orderByChild('heloNow').limitToLast(10).once('value')
  .then(function(snapshot) {
    // handle read data.
    console.log("what else")
    console.log(snapshot)
    snapshot.forEach(function(data) {
    player = data.val()
    txt2="<TR> <TD>"+ player['nickname'] + "<TD>" + player['heloNow'] + "</TR>" + txt2
    //console.log(txt)
  })
txt3 = "</TABLE>"
var txt= txt1+txt2+txt3
//console.log(txt)
document.getElementById('heloTable').innerHTML=txt
});
