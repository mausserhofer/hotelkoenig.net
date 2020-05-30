//test file
console.log("this is a javascript test")
	
function calc_prob (elo_h, elo_a){
	const	bd = 400
	const denom = 400
	//this is a test comment
	const uselessvar = 10
	console.log("function cal_prob started")
	var dif = Math.max(Math.min(elo_a-elo_h,bd),-bd)
	console.log("diff: "+dif)
	var expectation_h = 1/(1+10**(dif/denom))
	
	console.log (uselessvar)
	return expectation_h
	}

console.log("probability: " +calc_prob(1000, 1050))	
console.log("10 to the three: " + 10**3)	
	
function ord_comb (x){
	//takes an array as input
	//gives an array of array of possible combinations
	if(x.length==1){
		//console.log([x])
		return ([x])
	}
	var y = []
	var vec = []
	for(var i=0; i<x.length; i++) {
		//console.log("element:"+i+"with value:"+x[i])
		//take one element out and combine the others
		y[0] = x[i]
		var xLessY = x.filter(el => y.indexOf(el)<0)
		var comb = ord_comb(xLessY) //comb is an array of arrays
		//console.log("xLessY"+xLessY)
		//console.log(comb)		
		for (var j=0; j<comb.length; j++){
			comb[j].push(y[0])
			vec.push(comb[j])		
		}
	}
	return vec
}

var res = ord_comb([1,2,5])
console.log("the possible combinations are:")
console.log(res)

//console.log("try set diff")
var x = [1,2,3]
var y = [1,8]
diff = x.filter(el=>y.indexOf(el)<0)
//console.log(diff)

//console.log("calculate prob")	
//var p = calc_prob(1000,1200)
//console.log(p)