//Algoritmo di programmazione dinamica per la minimizzazione del numero di copie sulla circonferenza del chord-diagram

//exports.arcMinimizer = (function(g,clusterMap){
function arcMinimizer(g,clusterMap){
	var currentPerms = [],
			previousPerms = [],
			localMinCost = 0,
			solution = {};

	previousPerms = createCurrentPerms(g[0]);

	for (var i = 1; i < g.length; i++) {
		currentPerms = createCurrentPerms(g[i]);
		//al primo passo devo associare le initials
		if(i==1)
			calculateInitialPermutations(previousPerms, currentPerms, clusterMap);
		else
			calculatePermutations(previousPerms, currentPerms, clusterMap);
		localMinCost = minCost(currentPerms);
		previousPerms = currentPerms.filter(cp => cp.cost == localMinCost);
	}
	if(g.length != 1){
		calculateClosure(currentPerms, clusterMap);
		solution = findSolution(currentPerms);
	}
	return g.length == 1 ? [{'first':g[0][0], 'last': g[0][g[0].length-1]}] : calculateSolutionArray(solution);
}

/*-----------------------------------------------------------------------------
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------*/

function createCurrentPerms(group){
	var currentPerms = [],
			current = {};
	if(group.length > 1){
		for(var k = 0; k < group.length; k++){
			for(var z = 0; z < group.length; z++){
				if(k != z){
					current = {'first': group[k], 'last': group[z], 'cost': 0};
					currentPerms.push(current);
				}
			}
		}
	}else{
		current = {'first': group[0], 'last': group[0], 'cost': 0};
		currentPerms.push(current);
	}
	return currentPerms;
}

function calculateInitialPermutations(previousPerms, currentPerms, clusterMap){
	currentPerms.map(function(cr){
		var i = 0,
				initials = [],
				control = false;
		while (!control) {
			calculateCost(previousPerms[i], cr, clusterMap);
			if(cr.cost == 0)
				initials.push(previousPerms[i]);
			if(i == previousPerms.length-1){
				control = true;
				if(initials.length == 0)
					initials = previousPerms;
			}
			i++;
		}
		calculateCost(initials[0], cr, clusterMap);
		cr.initials = initials;
		cr.prev = initials[0];
	});
}

/*previousPerms[i] = {first: , last: , cost: , prev: , initials: }
	currentPerms[j] = {first: , last: }*/
function calculatePermutations(previousPerms, currentPerms, clusterMap){
	currentPerms.map(function(cr){
		var i = 0,
				minCost = false;
		while (!minCost) {
			calculateCost(previousPerms[i], cr, clusterMap);
			if(cr.cost == previousPerms[i].cost || i == previousPerms.length-1){
				minCost = true;
				cr.prev = previousPerms[i];
				cr.initials = previousPerms[i].initials;
			}
			i++;
		}
	});
}

function calculateCost(previous, current, clusterMap){
	if(clusterMap[previous.last] != clusterMap[current.first])
		current.cost = previous.cost + 1;
	else
		current.cost = previous.cost;
}

/*
perms[i] = {first: , last: , cost: , prev: , initials: }
*/
function calculateClosure(perms, clusterMap){
	perms.map(function(p){
		var i = 0,
				minCost = false;


		while (!minCost) {
			minCost = closureCost(p, p.initials[i], clusterMap);
			if(i == p.initials.length-1 && !minCost){
				p.cost += 1;
				p.initials = p.initials[i];
				minCost = true;
			}
			i++;
		}

	});
}

function closureCost(p,initial,clusterMap){
	var minCost = false;
	if(clusterMap[p.last] == clusterMap[initial.first]){
		minCost = true;
		p.initials = initial;
	}
	return minCost;
}

function minCost(currentPerms){
	var minCost = (min, cv) => min.cost < cv.cost ? min : cv;
	return currentPerms.reduce(minCost).cost;
}

function findSolution(perms){
	var minCost = (min, cv) => min.cost < cv.cost ? min : cv;
	return perms.reduce(minCost);
}

function calculateSolutionArray(final){
	var sol = [],//array delle soluzioni
		current = final,//permutazione corrente della catena percorsa all'indietro
		initial = final.initials,
		i = 0;//indice dell'array che corrisponde nell'ordine all'indice della claw considerata in g ==> sol[i] è la sol di g[i]
	while(current){
		sol.unshift({'first': current.first, 'last': current.last});
		current = current.prev;
		i++;
	}
	sol[0].first = initial.first;
	sol[0].last = initial.last;
	return sol;
}

/*-----------------------------------------------------------------------------
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------*/