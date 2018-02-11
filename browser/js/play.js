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

// convert tilesID to tilesDescription (i.e. 45 to 3H)
var dictionary = {}
const alphabet = {0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "I"}
for (tileId in tilesId){
    dictionary[tilesId[tileId]] = (tilesId[tileId]%13) + alphabet[Math.floor((tilesId[tileId]-13) / 13)]
}
// console.log(dictionary)

const newSharesId = ["chain0-shares", "chain1-shares", "chain2-shares","chain3-shares", "chain4-shares", "chain5-shares", "chain6-shares"]
const cashStart = 6000
const enumerate = [0,1,2,3,4,5,6]

// reference to root database
const databaseRef = firebase.database()

// set css class names
const stylePlayed = "tile-played"

showLobby()

// create game object
var Game = {}

// add event listeners
document.getElementById("btn_launchGame").addEventListener("click", launchGame)
document.getElementById("btn_startGame").addEventListener("click", startNewGame)
document.getElementById("btn_returnLobby").addEventListener("click", showLobby)

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

function drawTiles(n, tilePlayer){

    var drawnTiles = []
    const lengthAvailableTiles = Object.keys(tilePlayer).length
    
    for (var i=0;i<n;i++){
        const indexDrawnTile = randomInt(lengthAvailableTiles-i)
        drawnTiles.push( tilePlayer.splice(indexDrawnTile,1)[0])
    }   

    databaseRef.ref("gameInProgress/"+Game.gameKey+"/tilePlayer").set(tilePlayer)
    console.log("drawn tiles in funciton are "+drawnTiles)

    return drawnTiles
  }

function launchGame(){
    // start game with logged in players
    // give players an order (for shares table)
    databaseRef.ref("gameInProgress/"+Game.gameKey+"/tilePlayer").set(tilesId)
    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(1)

    const playerProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").once('value').then(data=>{return data.val()})
    Promise.all([playerProm]).then(answer =>{
        var playerDB = answer[0]
        
        // create playerOrder node
        var playerOrder = {}
        const player = Object.keys(playerDB)
        const numberPlayer = player.length
        const randShift = randomInt(numberPlayer)
        for (var i = 1; i<140;i++){
            playerOrder[i]= player[(i-randShift) % numberPlayer]
        }
        databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/playerOrder").set(playerOrder)
        
        // assign tiles to player
        const numberTiles = 6 * Object.keys(playerDB).length // six tiles for every player
        databaseRef.ref("gameInProgress/"+Game.gameKey+"/tilePlayer").once("value", function(tp) {
            var tilePlayer = tp.val()
            var tiles = drawTiles(numberTiles, tilePlayer)
            console.log("drawn tiles are " + tiles)
            
            for (playerId in playerDB){
                playerDB[playerId]["tiles"] = tiles.splice(0,6) //take first six elements and remove them
            }

            for (var i = 1;i<=numberPlayer;i++){ //reverse operation to above - assigning playerIds a orderal number
                playerDB[playerOrder[i]]["order"]=i
            }

            databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").set(playerDB)
            databaseRef.ref("gameInProgress/"+Game.gameKey+"/started").set(true)
        })

    })
  }

function addListener(){
    console.log("adding listener")
    //handle Event Listener
    for (var i = 0; i<=5;i++){
        document.getElementById("player-tile"+i).addEventListener("click", playTile)
    }
    // tilesId.forEach(id => {
    //     document.getElementById(id).addEventListener("click", playTile);
    // })  
    // document.getElementById("display-shares").innerHTML="no shares purchased yet"
    document.getElementById("btn-buy-shares").addEventListener("click", buyShares)
    document.getElementById("btn_launchGame").removeEventListener("click", launchGame)
    document.getElementById("btn_launchGame").style.display="none"

    // hide rows of table that are not needed
    databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").once('value', data =>{
        const numberPlayer = Object.keys(data.val()).length
        for (var i = 1;i<=6;i++){
            if (i <= numberPlayer) document.getElementById("table-row-shares-p"+i).style.display=""
            else document.getElementById("table-row-shares-p"+i).style.display="none"
        }
        Game.playerInit = data.val()
    })

    

  }

function getPrice(chain, size){ // calculate price according to acquire rules
    // console.log("chain: "+chain + " size: "+size)
    var basis = 0
    var addOn = 0
    chain = Number(chain)
    size = Number(size)
    switch (chain){
        case 1:
        case 2:
            basis = 0
            break;
        case 3:
        case 4:
        case 5:
            basis = 1
            break;
        case 6:
        case 7:
            basis = 2
            break;
        default:
            alert("chain value "+chain + " not ok, should be between 1 and 7")
            return 0
    }
    if (size<2) {addOn = 0; basis = 0}
    else if(2  <= size <=  7) addOn = size
    else if (7  < size <= 10 ) addOn = 7
    else if (11 < size <= 20) addOn = 8
    else if (21 < size <= 30) addOn = 9
    else if (31 < size <= 40) addOn = 10
    else if (41 < size) addOn = 11
    const price =  (100*(addOn+basis))
    // console.log("price is "+price)
    return price
  }

function getBonus(chain, size, result){
    // result is json object with name and shares of players
    const price = getPrice(chain,size)*10

    //idea: go through players and memorize who had the most and second-most shares (and with how many)
    var first = {shares: -99, name: []}
    var second = {shares: -99, name: []}
    for( key in result){
        if(result[key]>first["shares"]){
            second["name"] = first["name"]
            second["shares"]=first["shares"]
            first["name"]=[key]
            first["shares"]=result[key]
        }
        else if (first["shares"]>result[key]>second["shares"]){
            second["name"]=[key]
            second["shares"]=result[key]
        }
        else if( result[key]==first["shares"]){
            first["name"].push(key)
            second={shares: 0, name: []}
        }
        else if (result[key]==second["shares"]){
            second["name"].push(key)
        }
    }

    var bonus = {}
    const firstPlaces = first["name"].length
    // if (second["name"][0]) {const secondPlaces = second["name"].length}
    // else {const secondPlaces = 0}
    const secondPlaces = 0
    first["name"].forEach(player =>{
        bonus[player]=hkRound(price/firstPlaces)
    })
    if (firstPlaces==1 & secondPlaces>=1){
        second["name"].forEach(player =>{
            bonus[player]=hkRound(price/(2*secondPlaces))
        })
    } else if (secondPlaces==0){
        for (player in bonus){
            bonus[player] = bonus[player]*3/2
        }
    }
    result = {"bonus":bonus, "first": first, "second":second}
    return result

  }

function computeWealth(playerDB, chainsDB){
    var updatePlayer = {}
    var bonus = {}
    var wealth = 0
    for (uid in playerDB){
        wealth = playerDB[uid]["cash"]

        for (var i = 0; i <= 6; i++){
            wealth += playerDB[uid]["shares"][i]*chainsDB[i+1]["price"]
        }
        playerDB[uid]["wealth"] = wealth
    }
    // console.log("new player wealth from shares: "+wealth)
    
    for (chain in chainsDB){
        if (chain > 20) continue
        var position = {}
        for (uid in playerDB){
            position[uid]=playerDB[uid]["shares"][chain-1]
        }   
        bonus = getBonus(chain, chainsDB[chain]["size"], position)["bonus"]
        // console.log("bonus")
        // console.log(bonus)
        for (uid in bonus){
            playerDB[uid]["wealth"] = playerDB[uid]["wealth"]+bonus[uid]
        }
    }
    return {"playerDB": playerDB}
  }

function setWealth(){
    const playerProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").once('value').then(data=>{return data.val()})
    const chainsProm  = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains").once('value').then(data =>{return data.val() })

    const updatePlayer = Promise.all([playerProm, chainsProm]).then(promises =>{
        var playerDB = promises[0]
        var chainsDB = promises[1]
        const newPlayerDB = computeWealth(playerDB, chainsDB)["playerDB"]
        databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").set(playerDB)
    })
  }

function hkRound(number){
    // console.log("number: "+number)
    return (100*Math.round(number/100,0))
  }

function buyShares(){
    const userId = firebase.auth().currentUser.uid
    console.log("buying shares")
    const playerProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").once('value').then(data=>{return data.val()})
    const moveProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").once('value').then(data=>{return data.val()})
    const moveNumberProm  = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").once('value').then(data =>{return data.val() })
    const chainsProm  = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains").once('value').then(data =>{return data.val() })
    const movesStatusProm  = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves"+"/status").once('value').then(data =>{return data.val() })
    return Promise.all([playerProm, moveProm, moveNumberProm, chainsProm, movesStatusProm]).then(promises => {
        playerDB = promises[0]
        movesDB = promises[1]
        moveNumber = promises[2]
        chains = promises[3]
        movesStatus = promises[4]
        console.log(movesStatus)
        console.log(chains)
        myTurn(userId).then(action =>{
            if (action == "buyShares") {
                console.log("moveNumber is "+moveNumber)
                var newShares = []
                newSharesId.forEach(id => {
                    newShares.push(Number(document.getElementById(id).value))
                    document.getElementById(id).value=0
                })
                // console.log(newShares)
                //to-do check that sum is below 3 and shares still available
                var updateMove = {[userId]:{}}
                var updateWealth = {}
                var updateCash = {[userId]:{}}
                var updatePlayer = {[userId]:{"shares": {}}}
                updatePlayer[userId] = playerDB[userId]
                enumerate.forEach(i =>{
                    if (newShares[i]!== 0) { //chain enumeratoin starts with 1, change eventually
                        updateMove[userId][i+1]= {  "chain": i+1,
                                                    "old": playerDB[userId]["shares"][i], 
                                                    "new": playerDB[userId]["shares"][i]+newShares[i], 
                                                    "bought":newShares[i]} 
                    }
                    updatePlayer[userId]["shares"][i] = playerDB[userId]["shares"][i]+newShares[i]
                })
                
                // substract cash
                var spentCash = 0
                for (key in chains){
                    if (key > 20) break;
                    // console.log(key)
                    spentCash += chains[key]["price"]*newShares[key-1]
                    // console.log(spentCash)
                }
                updatePlayer[userId]["cash"] = playerDB[userId]["cash"] - spentCash
                
                updateCash[userId] = {"buyShares": spentCash, "new": updatePlayer[userId]["cash"]}
                console.log("spent cash. " + spentCash)
                // console.log(updatePlayer)
                // compute wealth
                const newPlayerDB = computeWealth(playerDB, chains)["playerDB"]
                for (player in newPlayerDB){
                    updateWealth[player]= {"oldBuyShares": playerDB[player]["wealth"], "new": newPlayerDB[player]["wealth"]}
                }
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/player/").update(updatePlayer)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/"+moveNumber+"/shares").update(updateMove)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/"+moveNumber+"/cash").update(updateCash)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/"+moveNumber+"/wealth").update(updateWealth)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(moveNumber+1)
                databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/tilePlayed").set(false)

                document.getElementById("display-turn").innerHTML= "next player to play a tile"

                endGame(chains)
             }
            else if (actoin="playTile"){ //action not equals "buyShares"
                alert ("no tile has been played yet - play a tile before purchasing shares")
            } else{
                alert ("not your turn")
            }
        })
    })
  }
function endGame(chains){
    var gameEndable = false
    var allChainSafe = true
    var noChainYet = true
    for (chain in chains){
        if (chains[chain]["size"]>0) noChainYet = false
        if (chains[chain]["size"]> 40) gameEndable=true
        if (chains[chain]["size"]<=10 || chains[chain]["size"] >0) allChainSafe = false
    }

    if (allChainSafe == true & noChainYet == false) gameEndable = true

    if (gameEndable){
        const endGame = prompt("Do you want to end the game? (Yes/No)", "Yes")
        if (endGame){
            databaseRef.ref("gameInProgress/"+Game.gameKey+"/finished").true
            alert("Game has ended!")
        }
    }
 }
function playTile(){
    const tileId = this.name
    const uid = firebase.auth().currentUser.uid
    console.log("uid "+uid)
    const checkTilePromise  = checkTile(tileId)
    const moveNumberProm    = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").once('value').then(data =>{return data.val() })
    const tilePlayerProm    = databaseRef.ref("gameInProgress/"+Game.gameKey+"/tilePlayer").once('value').then(data =>{return data.val() })
    var newMove = {}
    var styleNameProm 
    var chainNameProm
    var chainSizeProm
    var playedTiles
    console.log("played Tile: "+tileId)
    myTurn(uid).then(action => {
        if (action==="playTile"){
            Promise.all([checkTilePromise, moveNumberProm, tilePlayerProm]).then(answer => {
                answerCheckTile = answer[0]
                
                type = answerCheckTile["type"]
                const moveNumber = answer[1]
                tilePlayerDB = answer[2]
                // console.log("type is " + type)
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
                        databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(moveNumber)
                        databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain/"+tileId).set("played")
                        // console.log(this.id)
                        break;
                    case "opener": //to-do give free share to founder
                        var chainOpen = prompt("Please enter the number of the chain you want to open (1-7): ", "1")
                        // to do
                        // 1. get name of style class
                        // 2. prepare data for db write
                        // 3. write information to hotel sheet
                        // (1)
                        styleNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/style").once('value').then(data =>{return data.val() })
                        chainNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/name").once('value').then(data =>{return data.val() })
                        playerOpenShareProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/player/"+uid+"/shares/"+(chainOpen-1)).once('value').then(data =>{return data.val() })
                        // (2)
                        Promise.all([styleNameProm, chainNameProm, playerOpenShareProm]).then(promises => {
                            // console.log(promises)
                            const styleName = promises[0]
                            const chainName = promises[1]
                            const sharesAfterOpener = promises[2]+1
                            playedTiles = answerCheckTile["playedTiles"] //contains tiles with old style in JSON
                            // console.log("playedTiles is")
                            // console.log(playedTiles)
                            // prepare data for db write
                            const styleChanges = [{"id": tileId, "old": "empty", "new": styleName}]
                            const updateTiles = {}
                            updateTiles[tileId] =  chainOpen //rather user numbers than names, so names can be changed afterwards
                            playedTiles.forEach(id => {
                                // console.log("played Tiles  " + playedTiles)
                                updateTiles[id] = chainOpen //for tileChain node
                                styleChanges.push({"id": id, "old": "played", "new": styleName }) // for move node
                            })
                            const chainSize = playedTiles.length+1;
                            // console.log("Chain size is " + chainSize)
                            // console.log("update tiles is ")
                            // console.log(updateTiles)
                            const shares = {[uid]: {[chainOpen]: {"type": "bonus", "chain": chainOpen, "old": sharesAfterOpener-1, "openBonus": 1, "new": sharesAfterOpener}}}
                            newMove[moveNumber] = {"playedId": tileId, "styleChanges": styleChanges, "shares": shares}  
                            // (3)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").update(updateTiles) 
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/size").set(chainSize)  
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainOpen+"/price").set(getPrice(chainOpen, chainSize))  
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/player/"+uid+"/shares/"+(chainOpen-1)).set(sharesAfterOpener)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(moveNumber)
                        })
                                           
                        break;
                    case "extender":
                        // 1. get existing chain id and get played tiles
                        // 2. prepare data for db write
                        // 3. write to db
                        const chainExtend = answerCheckTile["chain"]
                        playedTiles = answerCheckTile["playedTiles"]
                        const chainTiles = answerCheckTile["chainTiles"]
                        // console.log(chainTiles)
                        // console.log(Object.keys(chainTiles))
                        
                        styleNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/style").once('value').then(data =>{return data.val() })
                        chainNameProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/name").once('value').then(data =>{return data.val() })
                        chainSizeProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/size").once('value').then(data =>{return data.val() })
                        // (2)
                        Promise.all([styleNameProm, chainNameProm, chainSizeProm]).then(promises => {
                            // console.log(promises)
                            const styleName = promises[0]
                            const chainName = promises[1]
                            var chainSize = promises[2]
                            // console.log("Read chain size is "+chainSize)
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
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/"+chainExtend+"/price").set(getPrice(chainExtend, chainSize))  
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(moveNumber)
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
                        playerProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").once('value').then(data =>{return data.val() })
                        Promise.all([chainProm, styleNameProm, playerProm]).then(promises =>{
                            const chainsDB = promises[0]
                            const styleMergerSurvivor = promises[1]
                            const playerDB = promises[2]
                            var newChainSize = 1+playedTiles.length+chainsDB[mergerSurvivor]["size"]
                            mergerDisappearer.forEach(chainID =>{
                                newChainSize+= chainsDB[chainID]["size"]
                            })
                            // set up tile changes
                            var chainpdate = {}
                            chainsDB[mergerSurvivor]["size"]=newChainSize
                            chainsDB[mergerSurvivor]["price"]=getPrice(mergerSurvivor, newChainSize)
                            console.log("mergersurivor: "+mergerSurvivor + " new chainSize: "+newChainSize)
                            
                            // payout bonus payments to majority shareholder
                            // use getBonus-functions - need as input dictionary with shares
                            cash = {}
                            mergerDisappearer.forEach(chainID => {
                                result={}
                                for (player in playerDB){
                                    result[player] = playerDB[player]["shares"][chainId-1]
                                } 
                                console.log("result")
                                console.log(result)

                                const bonus = getBonus(chainId, chainsDB[chainId]["size"], result)["bonus"]
                                console.log("bonus")
                                console.log(bonus)
                                for (player in bonus){
                                    playerDB[player]["cash"] =  playerDB[player]["cash"]+ bonus[player]
                                    cash[player] = {"type": "merger", "new": playerDB[player]["cash"]}
                                }
                            })   

                            // chainUpdate[mergerSurvivor]["size"]={newChainSize}
                            var styleChanges = [{"id": tileId, "old": "empty", "new": styleMergerSurvivor}]
                            var updateTiles ={}
                            mergerDisappearer.forEach(chain => {
                                chainsDB[chain]["size"]=0
                                chainsDB[chain]["price"]=0
                                mergedTiles[chain].forEach(id =>{
                                    updateTiles[id]=mergerSurvivor
                                    styleChanges.push({"id": id, "old": chainsDB[chain]["style"], "new": styleMergerSurvivor})
                                })
                            })
                            playedTiles.forEach(id =>{
                                updateTiles[id]=mergerSurvivor
                                styleChanges.push({"id": id, "old": "played", "new": styleMergerSurvivor})
                            })

                            newMove[moveNumber]={"playedId": tileId, "styleChanges": styleChanges, "cash": cash}
                            // (3)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/tileChain").update(updateTiles) 
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves").update(newMove)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/chains/").set(chainsDB)  
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/moveNumber").set(moveNumber)
                            databaseRef.ref("gameInProgress/"+Game.gameKey+"/player").set(playerDB)
                        })
                        break;
                    case "impossible":
                        alert("tile is impossible to play - choose another tile")
                        break;

                    default:
                        alert("something went wrong - contact admin")
                }
                // exchange tile
                if (["empty", "opener", "extender", "merger"].indexOf(type)>-1){
                    setWealth()
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/sharesBought").set(false)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status/tilePlayed").set(true)
                    databaseRef.ref("gameInProgress/"+Game.gameKey+"/player/"+uid+"/tiles").once("value", data =>{
                        var tilesDB = data.val()
                        for (key in tilesDB){
                            if (tilesDB[key]==tileId){
                                tilesDB[key]= drawTiles(1, tilePlayerDB)[0]
                            }
                        }
                        databaseRef.ref("gameInProgress/"+Game.gameKey+"/player/"+uid+"/tiles").set(tilesDB)
                    })
                    document.getElementById("display-turn").innerHTML=mapUid(uid) + " to buy shares"
                }
            })
        } else if (action="buyShares"){
            alert("You already played a tile - now purchase shares or just end your turn with clicking on the 'Buy Shares and end turn'-Button")
        }else {
            alert("it is an other player's turn"); return "not my turn"
        }

        //update chain prices
    })
  }

function mapUid(uid){
    console.log("Game.playerInit")
    console.log(Game.playerInit)
    // to-do map every uid of n participating players to a number 1...n
    for (player in Game.playerInit){
        if (player==uid)  {
            console.log("player found in Game Init")
            console.log("order is "+Game.playerInit[player]["order"])
            return Game.playerInit[player]["order"]
        }
    }
  }

function myTurn(uid){
    const movesStatusProm = databaseRef.ref("gameInProgress/"+Game.gameKey+"/moves/status").once('value').then(data=>{return data.val()})
    
    return Promise.all([movesStatusProm]).then(promises =>{
        const movesStatus = promises[0]
        console.log(movesStatus)
        if(movesStatus["playerOrder"][movesStatus["moveNumber"]]==uid){
            if (movesStatus["tilePlayed"] === false) return "playTile"
            else return "buyShares"
        } else {
            return "not your move"
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
        // console.log(neighbors)
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
        // console.log("empty/played/chains: " + numEmpty + " " + numPlayed + " " + numChains)

        if (numEmpty === 4) {
            // console.log("check is empty")
            answer = "empty"
            return {"type": answer, "playedTiles": playedTiles}
        }
        else if (numChains === 0) {
            // console.log("check is opener")
            answer = "opener"
            return {"type": answer, "playedTiles": playedTiles}
        }
        else { //check which chains border tile
            // console.log("extender, merger or impossible")
            const involvedChains = Object.keys(countChains)
            console.log(involvedChains.length)
            if( involvedChains.length===1){
                answer="extender"
                // console.log("chain is "+involvedChains[0])
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
                    // console.log("chainsDB")
                    // console.log(chainsDB)
                    const tileChain = answers[1]
                    // console.log("tileChain")
                    // console.log(tileChain)
                    for (chainId in countChains){
                        countChains[chainId]=chainsDB[chainId]["size"]
                        if (countChains[chainId]>10) countSafeChain++
                    }
                    // console.log(countChains)
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
                        // console.log("merged Tiles")
                        // console.log(mergedTiles)
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

function joinGameAsPlayer(){
    joinGame(this.id)
 }

function joinGame(gameId){
    eraseTable()
    console.log("Game id: " + gameId)
    Game.gameKey = gameId
    const uid = firebase.auth().currentUser.uid
    databaseRef.ref("gameInProgress/"+gameId+"/moves/status/moveNumber").once('value')
        .then(function(data){
            const moveNumber = data.val()
            console.log("Game joined - currennt move number is " + moveNumber)
    })

    showBoard() //includes shares, cash and wealth

    const updateTiles = databaseRef.ref("gameInProgress/"+gameId+"/moves")
        .on('child_added', function(data){displayBoard(data)  })   

    databaseRef.ref("gameInProgress/"+gameId+"/moves")
        .on('child_changed', function(data){ displayBoard(data) })   

    // as long as game has not started yet, add player uid to player
    databaseRef.ref("gameInProgress/"+gameId+"/started").once('value').then(data =>{
        started = data.val()
        if (!started){
            databaseRef.ref("gameInProgress/"+gameId+"/player").update(createEmptyPlayerObject())
        }
    })
    // TO-DO funktionsweise noch nicht getestet
    databaseRef.ref("gameInProgress/"+gameId+"/started").on('value', data =>{
            if (data.val()) {
                addListener()
                document.getElementById("player-tiles").style.display="block"
                document.getElementById("display-turn").innerHTML="Game started!"
                data.ref.off()
                databaseRef.ref("gameInProgress/"+gameId+"/player/"+uid+"/tiles").on('value', tilesRaw =>{
                    const tiles = tilesRaw.val()
                    for (i in tiles){
                        document.getElementById("player-tile"+i).innerHTML=dictionary[tiles[i]]
                        document.getElementById("player-tile"+i).name=tiles[i]
                    }
                })
            }
    })
 }
function startNewGame(){      
    console.log("starting new game....")
    const gameRef = databaseRef.ref("gameInProgress").push()
    Game.role = "creator"

    const gameInit = {  "chains": createEmptyChainObject(),
                        "tileChain": createEmptyTileChainObject(),
                        "user": createEmptyUserObject(),
                        "creator": firebase.auth().currentUser.uid,
                        "player": createEmptyPlayerObject(),
                        "moves": {"status": {"moveNumber": 0, "tilePlayed": false}},
                        "tilePlayed": false,
                        "started": false,
                        "finished": false,
                        "player": createEmptyPlayerObject()} 
    gameRef.set(gameInit)

    joinGame(gameRef.key)
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
function createEmptyPlayerObject(){
    var playerObject = {}
    playerObject[firebase.auth().currentUser.uid]={"shares": [0,0,0,0,0,0,0], "cash":cashStart, "wealth":cashStart}
    // console.log(playerObject)
    return playerObject
 }
function createEmptyUserObject(){
    const userObject = {
        "metadata": {"numberPlayer":1, "maxPlayer": 4, "style": "standard"},
        [firebase.auth().currentUser.uid]: {"role": "player", "creator": true}
    }
    return userObject
    // [firebase.auth().currentUser]
 }
function eraseTable(){
    tilesId.forEach(function(id){
        document.getElementById(id).className= "tile-empty"
    })
    console.log("table erased")
 }
function displayBoard(data){
    // console.log("Function displayBoard")
    // console.log(data.val())
    // console.log("listerner function fired")
    const styleChanges = data.val()["styleChanges"]
    if (styleChanges != null){
        styleChanges.forEach(changeTile =>{
            // console.log(styleChanges)
            const newStyle = changeTile["new"]
            const tileId = changeTile["id"]
            document.getElementById(tileId).className=newStyle
        })
     }
    // to do process shares, cash and wealth here
    const cash = data.val()["cash"]
    if (cash != null){
        for (player in cash){
            // console.log(cash)
            // console.log("playerId: "+player)
            const playerOrder = mapUid(player)
            document.getElementById("cash-p"+playerOrder).innerHTML=cash[player]["new"]
        }
     }

    const wealth = data.val()["wealth"]
   
    if (wealth != null){
        for (player in wealth){
            const playerOrder = mapUid(player)
            document.getElementById("wealth-p"+playerOrder).innerHTML=wealth[player]["new"]
        }
      }

    const shares = data.val()["shares"]
    if (shares != null){
        for (player in shares){
            for (chain in shares[player]){
                const playerOrder = mapUid(player)
                document.getElementById("shares-p"+playerOrder+"-chain"+chain).innerHTML=shares[player][chain]["new"]
            }
        }
     }
 }

function showLobby(){
    console.log("showing lobby")
    document.getElementById("game-in-progress").style.display="none"
    document.getElementById("game-set-up").style.display="block"
    document.getElementById("active-game-section").style.display="block"
    // show all games in progress
    var txt1 = "<TABLE align='center' width='500'> <TH> Game ID <TH> Zugnummer <TH> Number Player <TH> beitreten "
    var txt2=""
    const prom = databaseRef.ref("gameInProgress").on("value", function(data) { //detach prom when not needed anymore
        gameInProgress = data.val();
        // console.log(gameInProgress)
        for (var game in gameInProgress) {
            // console.log(gameInProgress[game])
            // const moves = ""+gameInProgress[game]['moves']["1"]["playedId"]
            txt2 = txt2 + "<TR> <TD>" + game +  "<TD>" + gameInProgress[game]['moves']['status']['moveNumber'] 
            + "<TD> "+Object.keys(gameInProgress[game]["player"]).length
            + "<TD id='" + game + "'>" + "Join game" + "</TR>"
        }
        txt3 = "</TABLE>"
        var txt = txt1+txt2+txt3
        //console.log(txt)
        document.getElementById('games-overview').innerHTML=txt
        for (var game in gameInProgress) {
            document.getElementById(game).addEventListener("click", joinGameAsPlayer);
        }
    })
 }

function showBoard(){
    document.getElementById("game-in-progress").style.display="block"
    document.getElementById("game-set-up").style.display="none"
    document.getElementById("active-game-section").style.display="none"
    databaseRef.ref("gameInProgress").off()
 }