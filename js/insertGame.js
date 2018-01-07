function insertGame() {
    console.log("getting places")
    var place1 = document.getElementById("p1").value;
    var place2 = document.getElementById("p2").value;
    var place3 = document.getElementById("p3").value;
    var place4 = document.getElementById("p4").value;
    var place5 = document.getElementById("p5").value;
    var place6 = document.getElementById("p6").value;

    //get today date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) { dd = '0'+dd}
    if(mm<10) { mm = '0'+mm}
    today = mm + '/' + dd + '/' + yyyy;

    console.log("getting reference to database")
    var newGameRef = firebase.database().ref('Game').push();
    var author = firebase.auth().currentUser
    var payoff = document.getElementById("selectPayoff").value
    var comment = document.getElementById("comment").value
    console.log(payoff)
    console.log(author.email + "  " + author.uid)
    console.log("set new dataset")
    newGameRef.set({
      result: {
        1: place1,
        2: place2,
        3: place3,
        4: place4,
        5: place5,
        6: place6
      },
      comment: comment,
      payoff: payoff,
      review: 0,
      registeredByUid: author.uid,
      registeredByEmail: author.email,
      gameTimestamp: today
    })
}
