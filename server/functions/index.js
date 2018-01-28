

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Take the text parameter passed to this HTTP endpoint and insert it into the
// // Realtime Database under the path /messages/:pushId/original
// exports.addMessage = functions.https.onRequest((req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into the Realtime Database using the Firebase Admin SDK.

//   admin.database().ref('/messages').push({original: original}).then(snapshot => {
//     // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//     res.redirect(303, snapshot.ref);
//   });
// });

//Create a cloud function that calculates that triggers when a new game is inserted
exports.updateHelo = functions.database
		.ref('/Game/{pushId}')
		.onCreate(event => {
	const game = event.data.val()
	//to-do
	//1. find players that participated in the game and get their helo
	//2. call calculate helo function to get helo movements
	//3. update helo in player
	//4. add helo-movements to game
	// console.log(game.payoff)
    game.heloWorked = 1
    
    // 1. get players
    var heloArray = []
    var uidArray = []

    var counter = 0
    // 2. calculate buyin
    game.result_all.forEach(element => {
        counter +=1
       heloArray.push(element.heloNow) 
       uidArray.push(element.uid)
       console.log("Run "+counter +": "+element)
    });
    var numPlayer = game.result.length -1
    console.log(game.result)
    console.log("number player: " + numPlayer)
    var payoffArray = []
    if (game.payoff==="Standard"){
        switch (numPlayer){
            case 2:
                payoffArray = [10,0]
                break;
            case 3:
                payoffArray = [15, 5,  0]
                break;
            case 4:
                payoffArray = [20, 10, 5, 0]
                break;
            case 5:
                payoffArray = [25, 15, 10, 5, 0] 
                break;
            case 6:
                payoffArray = [30, 20, 15, 10, 5, 0]
                break;
            default:
                payoffArray = []
        }
    }

    const heloTotal = calculateBuyIn(heloArray, payoffArray)
    const heloStart = heloTotal[0]
    const heloMove = heloTotal[1]
    const heloEnd = heloTotal[2]
    const buyIn = heloTotal[3]
    console.log(heloTotal)
    console.log("Helo Movements: " + heloMove)
    console.log("BuyIn: "+buyIn)

    // 3. write helo movements to database
    console.log(game.result_all)
    console.log( admin.database().ref('Player/'+uidArray[1].uid+'/heloNow'))
    
    for (var i =0; i<numPlayer; i++){
        console.log("Write new Helo for player "+(i+1))
        admin.database().ref('Player/'+uidArray[i]+'/heloNow').set(heloEnd[i])
    }
    

    // 4. write helos to game
    i = 0
    game.result_all.forEach(player => {
        player.heloPosteriori = heloEnd[i]
        i++
    })

    //console.log(calc_prob(1000,1100))
	
	return event.data.ref.set(game)
});



var Combinatorics = require('js-combinatorics');

//define javascript functions
function calc_prob (elo_h, elo_a){
	const	bd = 800
	const denom = 400
	// console.log("function cal_prob started")
	var dif = Math.max(Math.min(elo_a-elo_h,bd),-bd)
	var expectation_h = 1/(1+Math.pow(10,dif/denom))
	
	return expectation_h
	}
	
function ord_comb (x){
	//takes an array as input
	//gives an array of array of possible combinations
	if(x.length === 1){
		// console.log([x])
		return ([x])
	}
	var y = []
	var vec = []
	for(var i=0; i<x.length; i++) {
		// console.log("element:"+i+"with value:"+x[i])
		//take one element out and combine the others
		y[0] = x[i]
		var xLessY = x.filter(el => y.indexOf(el)<0)
		var comb = ord_comb(xLessY) //comb is an array of arrays
		// console.log("xLessY"+xLessY)
		// console.log(comb)		
		for (var j=0; j<comb.length; j++){
			comb[j].push(y[0])
			vec.push(comb[j])		
		}
	}
	return vec
}

function calculateBuyIn (heloArray, payoffArray){
    const numPlayer = heloArray.length
    const count = [0,1,2,3,4,5]
    const combinations = ord_comb(count.slice(0,numPlayer))
    var buyInArray = [0,0,0,0,0,0].slice(0, numPlayer)
    
    // console.log(combinations)

    //iterate through combinatoins
    combinations.forEach(element => {
        var scenBuyIn = [0,0,0,0,0,0].slice(0, numPlayer)
        //get two comparisons
        // console.log("---------------")
        // console.log("Scenario: " + element)
        var P = 1
        var comparisons = Combinatorics.combination(element, 2)
        comparisons.forEach(singleComp => {
            // console.log(singleComp)
            // console.log(calc_prob(heloArray[singleComp[0]], heloArray[singleComp[1]] ))
            P = P * calc_prob(heloArray[singleComp[0]], heloArray[singleComp[1] ])
        }) //P now contains the probability for one order to occur
        // console.log("The probability for this scenario is: "+P)
        // calculate 'win' in this scenario
        for (var k=0; k<buyInArray.length; k++) {
            scenBuyIn[element[k]] = payoffArray[k] * P
        }
        for (k=0; k<buyInArray.length; k++) {
            buyInArray[k] = buyInArray[k] + scenBuyIn[k]
        }
        // console.log("single scneario: "+scenBuyIn)
        // console.log("total: "+buyInArray)
    });

    var sumPO =0
    var heloMove = []
    var heloEnd = []
    payoffArray.forEach(po => sumPO += po)
    var sumBI = 0
    buyInArray.forEach(bi => sumBI+= bi)
    var faktor = sumPO/sumBI
    for (var k = 0; k<buyInArray.length; k++){
        buyInArray[k] = buyInArray[k]*faktor
        heloMove[k] = -buyInArray[k]+payoffArray[k]
        heloEnd[k] = heloArray[k]+heloMove[k]
    }
    
    // for convenience: return three array, start helos, helo movements and end helos
    return [heloArray, heloMove, heloEnd, buyInArray]
}
// exports.createGameSpecs = functions.database
// 		.ref('/gameInProgress/{pushId}')
// 		.onCreate(event => {
	
// 	const game = event.data.val()
// 	const length = 108
	
// 	//create random sequence of tiles with random order
// 	var arr = []
// 	for (var i=1; i<=108; i++){ arr[i]=Math.random()}
// 	var sorted = arr.slice().sort(function(a,b){return b-a})
// 	var tileFlow = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });	
		
// 	var tiles = {}
// 	for (var j=1;j<=108;j++){
// 		tiles[j] = "void"	
// 	}
// 	game.tiles = tiles;
// 	game.tileFlow = tileFlow;
	
// 	return event.data.ref.set(game)
// })

//define javascript functions