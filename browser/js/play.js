// id of tiles
const tilesId = [1,2,3,4,5,6,7,8,9, 13,	14,	15,	16,	17,	18,	19,	20,	21, 25,	26,	27,	28,	29,	30,	31,	32,	33, 37,	38,	39,	40,	41,	42,	43,	44,	45, 49,	50,	51,	52,	53,	54,	55,	56,	57]

// reference to root database
const databaseRef = firebase.database()

// create game reference
var Game = {}

// add event listeners
tilesId.forEach(id => {
    document.getElementById(id).addEventListener("click", playTile);
})
document.getElementById("btn_startGame").addEventListener("click", startNewGame)

function playTile(){
    Game.moveNumber+=1
    const newMove = {}
    newMove[Game.moveNumber] = this.id
    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(Game.moveNumber)
    console.log(this.id)
}

function startNewGame(){
    document.getElementById("game-in-progress").style.display="block"
    document.getElementById("game-set-up").style.display="none"
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
        console.log("listerner function fired")
        const playedTileId = data.val()
        document.getElementById(playedTileId).classList.add("tile-blue")
        console.log(playedTileId)
    })

    Game.listener = updateTiles
    
    console.log(updateTiles)

}