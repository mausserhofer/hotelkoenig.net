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
        // console.log(element)
        var P = 1
        var comparisons = Combinatorics.combination(element, 2)
        comparisons.forEach(singleComp => {
            // console.log(singleComp)
            // console.log(calc_prob(singleComp[0], singleComp[1]))
            P = P * calc_prob(heloArray[singleComp[0]], heloArray[singleComp[1] ])
        }) //P now contains the probability for one order to occur
        // console.log("The probability for this scenario is: "+P)
        // calculate 'win' in this scenario
        for (var k=0; k<buyInArray.length; k++) {
            scenBuyIn[element[k]] = payoffArray[k] * P
            buyInArray[k] = buyInArray[k] + scenBuyIn[k]
        }
        //to-do repair 
        // console.log("single scneario: "+scenBuyIn)
        // console.log("total: "+buyInArray)
    });

    var sumPO =0
    payoffArray.forEach(po => sumPO += po)
    var sumBI = 0
    buyInArray.forEach(bi => sumBI+= bi)
    var faktor = sumPO/sumBI
    for (var k = 0; k<buyInArray.length; k++){
        buyInArray[k] = buyInArray[k]*faktor
    }
  
    return buyInArray
}

buyIn = calculateBuyIn( [1100, 1000, 1000], [10, 0, 0])
buyIn.forEach(num => sum += num)
console.log("The buyin for the player is: " + buyIn)
console.log("Sum check: "+ sum)
// console.log("The buyin for the player is: " + calculateBuyIn( [1200, 1110, 990], [10, 3, 0]))

// //console.log(calc_prob(1000, 1050))