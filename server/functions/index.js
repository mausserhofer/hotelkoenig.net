//Jan2017

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref);
  });
});

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
	console.log(game.payoff)
	game.review = 1
	
	const result = game.result
	
	
	return event.data.ref.set(game)
});

exports.createGameSpecs = functions.database
		.ref('/gameInProgress/{pushId}')
		.onCreate(event => {
	
	const game = event.data.val()
	const length = 108
	
	//create random sequence of tiles with random order
	var arr = []
	for (var i=1; i<=108; i++){ arr[i]=Math.random()}
	var sorted = arr.slice().sort(function(a,b){return b-a})
	var tileFlow = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });	
		
	var tiles = {}
	for (var i=1;i<=108;i++){
		tiles[i] = "void"	
	}
	game.tiles = tiles;
	game.tileFlow = tileFlow;
	
	return event.data.ref.set(game)
})

//define javascript functions
function calc_prob (elo_h, elo_a){
	const	bd = 400
	const denom = 400
	console.log("function cal_prob started")
	var dif = Math.max(Math.min(elo_a-elo_h,bd),-bd)
	var expectation_h = 1/(1+10^(dif/denom))
	
	return expectation_h
	}
	
function ord_comb (x){
	//takes an array as input
	//gives an array of array of possible combinations
	if(x.length==1){
		console.log([x])
		return ([x])
	}
	var y = []
	var vec = []
	for(var i=0; i<x.length; i++) {
		console.log("element:"+i+"with value:"+x[i])
		//take one element out and combine the others
		y[0] = x[i]
		var xLessY = x.filter(el => y.indexOf(el)<0)
		var comb = ord_comb(xLessY) //comb is an array of arrays
		console.log("xLessY"+xLessY)
		console.log(comb)		
		for (var j=0; j<comb.length; j++){
			comb[j].push(y[0])
			vec.push(comb[j])		
		}
	}
	return vec
}
//console.log(calc_prob(1000, 1050))