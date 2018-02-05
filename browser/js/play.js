// id of tiles
const tilesId =[14, 15,	16,	17,	18,	19,	20,	21, 22, 23, 24, 25, 
                27,	28,	29,	30,	31,	32,	33, 34, 35, 36, 37, 38,	
                40,	41,	42,	43,	44,	45, 46, 47, 48, 49, 50, 51,	
                53,	54,	55,	56,	57, 58, 59, 60, 61, 62, 63, 64, 
                66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 
                79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 
                92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 
                105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116,
                118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129]

// reference to root database
const databaseRef = firebase.database()

// set css class names
const stylePlayed = "tile-played"


showLobby()


// create game reference
var Game = {}

// add event listeners
document.getElementById("display-shares").addEventListener("click", launchGame)
function launchGame(){
    tilesId.forEach(id => {
        document.getElementById(id).addEventListener("click", playTile);
    })
    document.getElementById("display-shares").removeEventListener("click", launchGame)
    document.getElementById("display-shares").innerHTML="no shares purchased yet"
}

document.getElementById("btn_startGame").addEventListener("click", startNewGame)
document.getElementById("btn_returnLobby").addEventListener("click", showLobby)

function playTile(){
    const tileId = this.id
    const checkTilePromise = checkTile(tileId)
    const moveNumberProm= databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").once('value').then(data =>{return data.val() })
    var newMove = {}
    var styleNameProm 
    var chainNameProm
    var chainSizeProm
    var playedTiles
    console.log("played Tile: "+tileId)

    Promise.all([checkTilePromise, moveNumberProm]).then(answer => {
        answerCheckTile = answer[0]
        type = answerCheckTile["type"]
        const moveNumber = answer[1]+1
        console.log("type is " + type)
        switch ( type ) {
            case "empty":
                const oldStyle = document.getElementById(this.id).className
                const newStyle = stylePlayed
                newMove[moveNumber] = {"playedId": tileId, 
                                            "styleChanges": {
                                                "1": {"id": tileId, "old": oldStyle, "new": newStyle}
                                                }
                                            }
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(moveNumber)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain/"+tileId).set("played")
                console.log(this.id)
                break;
            case "opener":
                var chainOpen = prompt("Please enter the number of the chain you want to open (1-7): ", "1")
                console.log(chainOpen + " selected")

                // to do
                // 1. get name of style class
                // 2. prepare data for db write
                // 3. write information to hotel sheet
                // (1)
                styleNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/style").once('value').then(data =>{return data.val() })
                chainNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/name").once('value').then(data =>{return data.val() })
                
                // (2)
                Promise.all([styleNameProm, chainNameProm]).then(promises => {
                    console.log(promises)
                    const styleName = promises[0]
                    const chainName = promises[1]
                    playedTiles = answerCheckTile["playedTiles"] //contains tiles with old style in JSON
                    console.log("playedTiles is")
                    console.log(playedTiles)
                    // prepare data for db write
                    const styleChanges = [{"id": tileId, "old": "empty", "new": styleName}]
                    const updateTiles = {}
                    updateTiles[tileId] =  chainOpen //rather user numbers than names, so names can be changed afterwards
                    playedTiles.forEach(id => {
                        console.log("played Tiles  " + playedTiles)
                        updateTiles[id] = chainOpen //for tileChain node
                        styleChanges.push({"id": id, "old": "played", "new": styleName }) // for move node
                    })
                    const chainSize = playedTiles.length+1;
                    console.log("Chain size is " + chainSize)
                    console.log("update tiles is ")
                    console.log(updateTiles)
                    newMove[moveNumber] = {"playedId": tileId, "styleChanges": styleChanges}  
                    // (3)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").update(updateTiles) 
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/size").set(chainSize)  
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(moveNumber)
                    
                })
                // to-do set price - move to server side?                        
                break;
            case "extender":
                // 1. get existing chain id and get played tiles
                // 2. prepare data for db write
                // 3. write to db
                const chainExtend = answerCheckTile["chain"]
                playedTiles = answerCheckTile["playedTiles"]
                const chainTiles = answerCheckTile["chainTiles"]
                console.log(chainTiles)
                console.log(Object.keys(chainTiles))
                
                styleNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/style").once('value').then(data =>{return data.val() })
                chainNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/name").once('value').then(data =>{return data.val() })
                chainSizeProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/size").once('value').then(data =>{return data.val() })
                // (2)
                Promise.all([styleNameProm, chainNameProm, chainSizeProm]).then(promises => {
                    console.log(promises)
                    const styleName = promises[0]
                    const chainName = promises[1]
                    var chainSize = promises[2]
                    console.log("Read chain size is "+chainSize)
                    var updateTiles = {}
                    updateTiles[tileId] =  chainExtend
                    
                    var styleChanges = [{"id": tileId, "old": "empty", "new": styleName}]
                    playedTiles.forEach(id => {
                        styleChanges.push({"id": id, "old": "played", "new": styleName })
                        updateTiles[id] = chainExtend
                    })
                    newMove[moveNumber] = {"playedId": tileId, "styleChanges": styleChanges}

                    chainSize = chainSize+1+playedTiles.length
                    console.log("new chain size: " + chainSize)

                    // (3)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").update(updateTiles) 
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/size").set(chainSize)  
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(moveNumber)
                })
                break;
            case "merger":
                console.log("an hommage to urge2merge")
                // change tileChains
                // write styleChanges to move
                // update chain node
                const mergerSurvivor = answerCheckTile["mergerSurvivor"]
                const mergedTiles = answerCheckTile["mergedTiles"]
                const mergerDisappearer = answerCheckTile["mergerDisappearer"]
                playedTiles = answerCheckTile["playedTiles"]

                chainProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains").once('value').then(data =>{return data.val() })
                styleNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+mergerSurvivor+"/style").once('value').then(data =>{return data.val() })
                Promise.all([chainProm, styleNameProm]).then(promises =>{
                    const chainsDB = promises[0]
                    const styleMergerSurvivor = promises[1]
                    var newChainSize = 1+playedTiles.length+chainsDB[mergerSurvivor]["size"]
                    mergerDisappearer.forEach(chainID =>{
                        newChainSize+= chainsDB[chainID]["size"]
                    })
                    // set up tile changes
                    var chainpdate = {}
                    chainsDB[mergerSurvivor]["size"]=newChainSize
                    console.log("mergersurivor: "+mergerSurvivor + " new chainSize: "+newChainSize)
                   
                    // chainUpdate[mergerSurvivor]["size"]={newChainSize}
                    var styleChanges = [{"id": tileId, "old": "empty", "new": styleMergerSurvivor}]
                    var updateTiles ={}
                    mergerDisappearer.forEach(chain => {
                        chainsDB[chain]["size"]=0
                        mergedTiles[chain].forEach(id =>{
                            updateTiles[id]=mergerSurvivor
                            styleChanges.push({"id": id, "old": chain, "new": styleMergerSurvivor})
                        })
                    })
                    playedTiles.forEach(id =>{
                        updateTiles[id]=mergerSurvivor
                        styleChanges.push({"id": id, "old": "played", "new": styleMergerSurvivor})
                    })

                    newMove[moveNumber]={"playedId": tileId, "styleChanges": styleChanges}

                    console.log("chainsDB: ")
                    console.log(chainsDB)
                    console.log("styleChanges")
                    console.log(styleChanges)
                    // (3)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").update(updateTiles) 
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/").set(chainsDB)  
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moveNumber").set(moveNumber)
                })
                
                
                
                break;
            case "impossible":
                alert("tile is impossible to play")
                break;

            default:
                alert("something went wrong - contact admin")
        }
    })
}

function findNeighbors(id){
    const idNumber = Number(id)
    const neighborId = [idNumber-13,idNumber-1,idNumber+1,idNumber+13]
    var promises = []
    var neighbors = {}
    neighborId.forEach(id =>{
        promises.push( 
            databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain")
                .orderByKey()
                .equalTo(String(id))
                .once('value')
                .then(function(data){   
                    // console.log(data.val())
                    // neighbors.push( data.val())
                    return data.val()
                }) 
        )
    })
    return Promise.all(promises).then(function(prAll){
        // console.log(neighbors)
        prAll.forEach(pr => {
            for (key in pr){
                neighbors[key]=pr[key]
            }
        })
        return neighbors
    })
}

function checkTile(id){
    // console.log("checking tile for id "+id)
    return findNeighbors(id).then(neighbors => {
        console.log(neighbors)
        var answer = ""
        // do cases
        var numEmpty = 0
        var numPlayed = 0
        var numChains = 0
        var playedTiles = []
        var chainTiles = {}
        var countChains = {}// 1:0,2:0, 3:0, 4:0, 5:0, 6:0, 7:0}
        for (key in neighbors){
            switch(neighbors[key]){
                case "empty": {numEmpty++; break}
                case "played": {numPlayed++; playedTiles.push(key); break}
                default: {
                    numChains++; 
                    const tempJSON = {}
                    chainTiles[key] = neighbors[key]
                    countChains[neighbors[key]] = 1
                }
            }
        }
        console.log("empty/played/chains: " + numEmpty + " " + numPlayed + " " + numChains)

        if (numEmpty === 4) {
            console.log("check is empty")
            answer = "empty"
            return {"type": answer, "playedTiles": playedTiles}
        }
        else if (numChains === 0) {
            console.log("check is opener")
            answer = "opener"
            return {"type": answer, "playedTiles": playedTiles}
        }
        else { //check which chains border tile
            console.log("extender, merger or impossible")
            const involvedChains = Object.keys(countChains)
            console.log(involvedChains.length)
            if( involvedChains.length===1){
                answer="extender"
                console.log("chain is "+involvedChains[0])
                return {"type": answer, "playedTiles": playedTiles, "chain": involvedChains[0],"chainTiles": chainTiles}
            }
            else {
                const promises = []
                promises.push(databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains").once('value').then(data => {return data.val()}))
                promises.push(databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").once('value').then(data => {return data.val()}))
                const chainsSizes = []
                var countSafeChain = 0
                return Promise.all(promises).then(answers => {
                    chainsDB = answers[0]
                    console.log("chainsDB")
                    console.log(chainsDB)
                    const tileChain = answers[1]
                    console.log("tileChain")
                    console.log(tileChain)
                    for (chainId in countChains){
                        countChains[chainId]=chainsDB[chainId]["size"]
                        if (countChains[chainId]>10) countSafeChain++
                    }
                    console.log(countChains)
                    if (countSafeChain>=2){
                        answer = "impossible"
                        return {"type": answer}
                    } else {
                        answer= "merger"
                        
                        // give (1) merger survivor (2) tiles to be changed to merger survivor (3) merger disappearers
                        chainsSorted = Object.keys(countChains).sort(function(a,b){return countChains[b]-countChains[a]})
                        // to-do prompt if multiple chains are equally large - merger survivor must be first in array
                        const mergerSurvivor = chainsSorted[0]
                        const mergerDisappearer = chainsSorted.slice(1,chainsSorted.length)
                        mergedTiles = {}
                        mergerDisappearer.forEach(chain =>{mergedTiles[chain]=[]})
                        for (tileId in tileChain){
                            mergerDisappearer.forEach(chain =>{ 
                                if( tileChain[tileId]===chain){
                                    mergedTiles[chain].push(tileId)
                                }
                            })
                        }
                        console.log("merged Tiles")
                        console.log(mergedTiles)
                        return {"type": answer, 
                                "mergerSurvivor": mergerSurvivor, 
                                "mergerDisappearer": mergerDisappearer,
                                "mergedTiles": mergedTiles,
                                "playedTiles": playedTiles}
                    }
                    
                    return data.val()
                })
                return {"type": answer, "playedTiles": playedTiles, "chainTiles": chainTiles}
            }
        }
    })
}

function joinGame(){
    eraseTable()
    console.log(this.id)
    Game.gameKey = this.id
    databaseRef.ref("gameInProgress/"+this.id+"/moveNumber").once('value')
        .then(function(data){
            const moveNumber = data.val()
            console.log("Game joined - currennt move number is " + moveNumber)

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

    const gameInit = {  "chains": createEmptyChainObject(),
                        "tileChain": createEmptyTileChainObject(),
                        "user": createEmptyUserObject(),
                        "creator": firebase.auth().currentUser.uid,
                        "moveNumber": 0,
                        "player": firebase.auth().currentUser.uid } 
    gameRef.set(gameInit)

    // create event listener
    const updateTiles = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").on('child_added', function(data){
        displayBoard(data)
    })

    Game.listener = updateTiles
    showBoard()
    console.log(updateTiles)
}

function createEmptyTileChainObject(){
    const tileChainObject = {}
    for (var i=1;(1+13*11)>i;i++){
       tileChainObject[i]="empty"
    }
    return tileChainObject;
}

function createEmptyChainObject(){
    const chainObject = {
                            1: {"name": "luxor",        "size":  0, "price": 0, "tiles": {}, "style": "tile-luxor"},
                            2: {"name": "tower",        "size":  0, "price": 0, "tiles": {}, "style": "tile-tower"},
                            3: {"name": "festival",     "size":  0, "price": 0, "tiles": {}, "style": "tile-festival"},
                            4: {"name": "wisconsin",    "size":  0, "price": 0, "tiles": {}, "style": "tile-wisconsin"},
                            5: {"name": "hairport",     "size":  0, "price": 0, "tiles": {}, "style": "tile-hairport"},
                            6: {"name": "continental", "size":  0, "price": 0, "tiles": {}, "style": "tile-continental"},
                            7: {"name": "himperial",    "size":  0, "price": 0, "tiles": {}, "style": "tile-himperial"},
                            99: {"name": "played",      "size":  0, "price": 0, "tiles": {}, "style": "tile-played"},
    }
    
    return chainObject
}

function createEmptyUserObject(){
    const userObject = {
        "metadata": {"numberPlayer":1, "maxPlayer": 4, "style": "standard"},
        [firebase.auth().currentUser.uid]: {"role": "player", "creator": true, "shares": [0,0,0,0,0,0,0], "cash":0}
    }
    return userObject
    // [firebase.auth().currentUser]
}

function displayBoard(data){
    // console.log("listerner function fired")
    const styleChanges = data.val()["styleChanges"]
    styleChanges.forEach(changeTile =>{
        // console.log(styleChanges)
        const newStyle = changeTile["new"]
        const tileId = changeTile["id"]
        document.getElementById(tileId).className=newStyle
    })
}

function showLobby(){
    document.getElementById("game-in-progress").style.display="none"
    document.getElementById("game-set-up").style.display="block"
    document.getElementById("active-game-section").style.display="block"
    // show all games in progress
    var txt1 = "<TABLE align='center' width='500'> <TH> Game ID <TH> Zugnummer <TH> beitreten "
    var txt2=""
    const prom = databaseRef.ref("gameInProgress").on("value", function(data) { //detach prom when not needed anymore
        gameInProgress = data.val();
        console.log(gameInProgress)
        for (var game in gameInProgress) {
            console.log(gameInProgress[game])
            // const moves = ""+gameInProgress[game]['moves']["1"]["playedId"]
            txt2 = txt2 + "<TR> <TD>" + game +  "<TD>" + gameInProgress[game]['moveNumber'] 
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