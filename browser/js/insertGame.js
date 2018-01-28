function insertGame() {
  console.log("getting places")
  const html_id = ["p1", "p2", "p3", "p4", "p5", "p6"]
  var nicknamesInput = []
  var numPlayerInput = 0
  html_id.forEach(function(id){
    const singleInput = document.getElementById(id).value
    if (singleInput){
      numPlayerInput += 1
      nicknamesInput.push(document.getElementById(id).value)
    }
  })
  // console.log(nicknamesInput)
   console.log("Number Player inputted: "+numPlayerInput)

  //get today date
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10) { dd = '0'+dd}
  if(mm<10) { mm = '0'+mm}
  today = mm + '/' + dd + '/' + yyyy;

  //create asynchronous firebase request to check if inserted text is empty or a username
  console.log("Start retrieving helo")
  var prLookUpUser = []
  nicknamesInput.forEach(function(nickname){
    prLookUpUser.push(firebase.database().ref("Player").orderByChild("nickname").equalTo(nickname).once('value'))
  })
  
  //when queries finished collect results in JSON partPlayer
  const all_pr = Promise.all(prLookUpUser).then( results =>{
    partPlayer = {}
    result = {}
    var placeCounter = 0
    results.forEach(function(user){
      placeCounter += 1
      // console.log(user.val())
      var userArray = user.val()
      for (key in userArray){
        partPlayer[placeCounter] = userArray[key]
        result[placeCounter] = userArray[key].uid
        // console.log(userArray[key])
        console.log(partPlayer)
      }
    })  

    //check if usernames were found
    var numPlayerFound = 0
    for (key in partPlayer){
      console.log(partPlayer[key].uid)
      numPlayerFound += 1
    }

    // do some testing on partPlayer
    console.log("Start investigating partPlayer")
    console.log(partPlayer)
    console.log(partPlayer['2'].uid)
    console.log(partPlayer[1]['uid'])
     // console.log(partPlayer.email)
    console.log("End investigating player")

    if (numPlayerInput == numPlayerFound){
      console.log("all nicknames could be found - proceed")
      console.log("getting reference to database to save game")
      var newGameRef = firebase.database().ref('Game').push();
      var author = firebase.auth().currentUser
      var payoff = document.getElementById("selectPayoff").value
      var comment = document.getElementById("comment").value
      console.log(payoff)
      console.log(author.email + "  " + author.uid)
      console.log("set new dataset")
      const prWriteGame = newGameRef.set({
        result: result,
        result_all: partPlayer,
        comment: comment,
        payoff: payoff,
        review: 0,
        registeredByUid: author.uid,
        registeredByEmail: author.email,
        gameTimestamp: today
      })
      prWriteGame.then(message  => {
        html_id.forEach(function(id){
          document.getElementById(id).value=""
        })
        document.getElementById("div_insertGame").innerHTML = "Spiel erfolgreich hinzugefügt"
      })
      .catch(message  =>{
        alert("Fehler im Schreiben der Daten")
        console.log(message)
      })
    
    } else {
      alert("not all players have been found - check nicknames for typos!")
    }

  })
}
