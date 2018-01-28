// var config = {
//   apiKey: "AIzaSyAPK054lSzv5mvbPlhJlbYqRa6Kxlm413Q",
//   authDomain: "helosystem-22b06.firebaseapp.com",
//   databaseURL: "https://helosystem-22b06.firebaseio.com",
//   projectId: "helosystem-22b06",
//   storageBucket: "helosystem-22b06.appspot.com",
//   messagingSenderId: "689393286323"
// };
// firebase.initializeApp(config);
// console.log("Firebase connection created")

// get all player from firebase and write them in a table with their current helorating
var databaseRef = firebase.database();
//check if user is already registered for SM2017

var EventAttendantRef = databaseRef.ref('EventAttendant')
var event="SM2017"
var searchFor = event
var txt1 = "<TABLE align='center' width='200pt'> <TH> Nickname"
var txt2 = ""
txt3 = "</TABLE>"
EventAttendantRef.orderByChild('event').equalTo(searchFor).once("value", function(snapshotAll){
  const promiseAll = snapshotAll.forEach(function(data) {
    var playerAuth = data.val()
    console.log(playerAuth.uid)
    const promiseSingle = databaseRef.ref('Player/'+playerAuth.uid).once('value',function (snapshotSingle) {
      var player = snapshotSingle.val()
      console.log(player)
      txt2="<TR> <TD>"+ player['nickname'] + "</TR>" + txt2
      console.log(txt2)
      var txt= txt1+txt2+txt3
      console.log(txt)
      document.getElementById('table_teilnehmer').innerHTML=txt
    });
  });
});


// firebase.auth().onAuthStateChanged(function(user) {
//   if (user){
//     //show
//     console.log("user logged in: " + user.email)
//     document.getElementById("SM_loggedIn").style.display="inline"
//     document.getElementById("SM_notLoggedIn").style.display="none"
//     // if a user is logged in, check if she is registered for the event
//     var EventAttendantRef = databaseRef.ref('EventAttendant')
//     var event="SM2017"
//     var searchFor = event+"_"+user.uid
//     EventAttendantRef.orderByChild('event_UID').equalTo(searchFor).once("value",snapshot => {
//       const userData = snapshot.val();
//       console.log(userData)
//       if (userData==null){
//         document.getElementById('btn_notRegistered').style.display='inline'
//         document.getElementById('btn_registered').style.display='none'
//       } else{
//         document.getElementById('btn_notRegistered').style.display='none'
//         document.getElementById('btn_registered').style.display='inline'
//       }
//     })
//   } else{
//     document.getElementById("SM_loggedIn").style.display="none"
//     document.getElementById("SM_notLoggedIn").style.display="inline"
//   }
// });

// function anmeldungSM() {
//     var today = new Date();
//     var dd = today.getDate();
//     var mm = today.getMonth()+1; //January is 0!
//     var yyyy = today.getFullYear();
//     if(dd<10) { dd = '0'+dd}
//     if(mm<10) { mm = '0'+mm}
//     today = mm + '/' + dd + '/' + yyyy;
//     var event="SM2017"
//     console.log("getting reference to database")
//     var user = firebase.auth().currentUser
//     console.log(user.uid)
//     console.log(user.email)
//     console.log("set new dataset")
//     //check if user is already registered for "SM2017"
//     var EventAttendantRef = firebase.database().ref('EventAttendant')
//     var searchFor = event+"_"+user.uid
//     console.log(searchFor)
//     EventAttendantRef.orderByChild('event_UID').equalTo(searchFor).once("value",snapshot => {
//       const userData = snapshot.val();
//       if (userData==null){
//         var newEventAttendantRef = firebase.database().ref('EventAttendant').push();
//         newEventAttendantRef.set({
//           event: event,
//           uid: user.uid,
//           event_UID: event+"_"+user.uid,
//           email: user.email,
//           comment: "",
//           review: 0,
//           registrationTimestamp: today
//         })
//         alert("Teilnehmer*in hinzugefügt - bitte Seite aktualisieren")
//       } else {
//         alert("Error: User bereits für event angemeldet!")
//       }
//     });

// };

function abmeldungSM(){
  console.log("start abmeldungSM")
  var user = firebase.auth().currentUser
  //find reference
  var EventAttendantRef =  firebase.database().ref("EventAttendant")
  EventAttendantRef.orderByChild("event_UID").equalTo("SM2017_"+user.uid)
  .once('value').then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
          //remove each child
          EventAttendantRef.child(childSnapshot.key).remove();
          alert ("von Event abgemeldet - bitte Seite aktualisieren")
      });
  });
};
