// id of tiles
const tilesId = [1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 
                13, 14, 15,	16,	17,	18,	19,	20,	21, 22, 23, 24, 
                25, 26, 27,	28,	29,	30,	31,	32,	33, 34, 35, 36,
                37, 38, 39,	40,	41,	42,	43,	44,	45, 46, 47, 48,
                49, 50, 51,	52,	53,	54,	55,	56,	57, 58, 59, 60,
                61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72,
                73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
                85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
                97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108]

// reference to root database
const databaseRef = firebase.database()

showLobby()


// create game reference
var Game = {}

// add event listeners
tilesId.forEach(id => {
    document.getElementById(id).addEventListener("click", playTile);
})
document.getElementById("btn_startGame").addEventListener("click", startNewGame)
document.getElementById("btn_returnLobby").addEventListener("click", showLobby)

function playTile(){
    const tileId = this.id
    switch ( checkTile(tileId) ) {
        case "empty":
            console.log("empty stone")
            break;
        case "createChain":
            console.log("choose chain")
            break;
        case "mergeChains":
            console.log("Chains must be murged")
            break;
        default:
            Game.moveNumber+=1
            const newMove = {}
            newMove[Game.moveNumber] = tileId
            console.log("newMove is: " + newMove)
            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(Game.moveNumber)
            console.log(this.id)
    }
}

function checkTile(){
    return "go ahead"
}

function joinGame(){
    eraseTable()
    console.log(this.id)
    Game.gameKey = this.id
    databaseRef.ref("gameInProgress/"+this.id+"/moveNumber").once('value')
        .then(function(data){
            Game.moveNumber = data.val()
            console.log("Game joined - currennt move number is " + Game.moveNumber)

    })
    showBoard()
    const updateTiles = databaseRef.ref("gameInProgress/"+this.id+"/moves").on('child_added', function(data){
        displayBoard(data)     
    })   

}
function eraseTable(){
    tilesId.forEach(function(id){
        document.getElementById(id).className= "tile-empty"
    })
    console.log("table erased")
}

function startNewGame(){  
    eraseTable()
    
    console.log("starting new game....")
    const gameRef = databaseRef.ref("gameInProgress").push()
    Game.gameKey = gameRef.key //save reference to game in game object
    console.log(Game.gameKey)
    Game.role = "creator"
    Game.moveNumber = 0
    gameRef.set({"creator": firebase.auth().currentUser.uid})
    gameRef.set({"moves": {1: 4}})
    gameRef.set({"moveNumber": 0})

    // create event listener
    const updateTiles = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").on('child_added', function(data){
        displayBoard(data)
    })

    Game.listener = updateTiles
    showBoard()
    console.log(updateTiles)
}

function displayBoard(data){
    console.log("listerner function fired")
    const playedTileId = data.val()
    document.getElementById(playedTileId).className ="tile-blue"
    console.log(playedTileId)
}

function showLobby(){
    document.getElementById("game-in-progress").style.display="none"
    document.getElementById("game-set-up").style.display="block"
    document.getElementById("active-game-section").style.display="block"
    // show all games in progress
    var txt1 = "<TABLE align='center' width='500'> <TH> Game ID <TH> Züge <TH> Zugnummer <TH> beitreten "
    var txt2=""
    const prom = databaseRef.ref("gameInProgress").on("value", function(data) { //detach prom when not needed anymore
        gameInProgress = data.val();
        console.log(gameInProgress)
        for (var game in gameInProgress) {
            console.log(gameInProgress[game])
            txt2 = txt2 + "<TR> <TD>" + game + "<TD>"+ gameInProgress[game]['moves'] + "<TD>" + gameInProgress[game]['moveNumber'] 
            + "<TD id='" + game + "'>" + "Join game" + "</TR>"
        }
        txt3 = "</TABLE>"
        var txt = txt1+txt2+txt3
        //console.log(txt)
        document.getElementById('games-overview').innerHTML=txt
        for (var game in gameInProgress) {
            document.getElementById(game).addEventListener("click", joinGame);
        }
    })

}

function showBoard(){
    document.getElementById("game-in-progress").style.display="block"
    document.getElementById("game-set-up").style.display="none"
    document.getElementById("active-game-section").style.display="none"
    databaseRef.ref("gameInProgress").off()
}