console.log("get logged in user")

//get current Nickname
var user = firebase.auth().currentUser;
console.log(user)
//currentNickname = firebase.database().ref("Player/"+ user.uid+"/nickname")
document.getElementById("txt_nickname").value = "Nickname.."

//update nickname on click
function updateNickname(){
  var user = firebase.auth().currentUser;
  var nickname = document.getElementById("txt_nickname").value
  alert("Nickname geändert auf: "+ nickname)
  var ref = firebase.database().ref("Player/"+user.uid+"/nickname").set(nickname)
}

function eraseText(){
    var user = firebase.auth().currentUser;
    document.getElementById("txt_nickname").value = ""
}
