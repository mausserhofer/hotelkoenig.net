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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in. show modify login area
    txt=user.email + " ist signed in."
    document.getElementById("login-area").style.display="none"
    document.getElementById("loggedIn-area").style.display="inline"
    document.getElementById("box_signedIn").innerHTML=txt
    document.getElementById("box_signedIn").style.display="inline"

    // show insert new game forms
    document.getElementById("frm_newGame").style.display="inline"
    document.getElementById("box_newGame").style.display="none"
  } else {
    // No user is signed in.
    document.getElementById("login-area").style.display="inline"
    document.getElementById("loggedIn-area").style.display="none"
    //do not show insert new game forms
    document.getElementById("frm_newGame").style.display="none"
    document.getElementById("box_newGame").style.display="inline"
  }
});

function resetPassword() {
  var emailAddress = document.getElementById("email").value;
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
    // Email sent.
    alert("Email zum Zurücksetzen des Passwortes an "+email +" gesendet.")
  }).catch(function(error) {
    // An error happened.
    alert("Fehler beim Versenden des Emails. Bitte email in Feld email eingeben. ")
  });
};

function signIn() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(errorMessage);
  });
};

function register(){
  //register authentication user
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  const promise = firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(email, password);
  promise
    .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorMessage);
  })
    .then(userMeta => {
      console.log(userMeta);
      user=userMeta.user
      console.log(user.uid)
      user.sendEmailVerification().then(function() {
        console.log("Email sent")
      }).catch(function(error) {
        console.log(error)
      });
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10) { dd = '0'+dd}
      if(mm<10) { mm = '0'+mm}
      today = mm + '/' + dd + '/' + yyyy;
      var playerRef = firebase.database().ref('Player/'+user.uid);
      playerRef.set({
        uid: user.uid,
        nickname: user.uid,
        email: user.email,
        heloNow: 1000,
        heloTimestamp: today
      });
      alert("Um deinen Nicknamen zu ändern, gehe bitte in die Client zone!")
    });
};

function signOut(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    console.log("user signed out")
  }).catch(function(error) {
    // An error happened.
    console.log(error)
  });
};
