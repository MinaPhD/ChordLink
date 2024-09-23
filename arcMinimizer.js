//Algoritmo di programmazione dinamica per la minimizzazione del numero di copie sulla circonferenza del chord-diagram

function arcMinimizer(g,clusterMap){

	var perm = [],//array contenente l'insieme delle permutazioni dei singoli gruppi(claws)
		cost = 0,
		prevPerms = [],//permutazioni all'iterazione precedente
		previous = {}, //permutazione j-esima gruppo precedente
		group = [],//gruppo(claw) corrente
		currPerms = [], // permutazioni calcolate per il gruppo corrente
		current = {},//permutazione gruppo corrente
		finalPerms = [];//permutazioni gruppo finale

	perm[0] = [];
	if(g[0].length == 1){//se la lunghezza è 1 first e last sono lo stesso 
		perm[0].push({'first': g[0][0], 'last': g[0][0], 'cost': cost, 'initial': g[0][0]});
	}else{
		for (i = 0; i < g[0].length; i++){
			for (j = 0; j < g[0].length; j++){
				if (i != j)
					perm[0].push({'first': g[0][i], 'last': g[0][j], 'cost': cost, 'initial': g[0][i]});
			}
		}
	}

	for (var i = 1; i < g.length; i++){//i scorre i gruppi
		prevPerms = perm[i-1];
		group = g[i];
		currPerms = [];
		perm[i] = [];
		cost ++; // aggiornamento costo

		print('prevPerms');
		print(prevPerms);
		print('END prevPerms');
		print('group '+i+': '+group);

		for (var j = 0; j < prevPerms.length; j++){//j scorre le permutazioni precedenti per creare quelle nuove
			previous = prevPerms[j];
		//	print('previous');
		//	print(previous);
			if(group.length == 1){
				current = {'prev': previous, 'first': group[0], 'last': group[0], 'initial': previous.initial};
				cost = updateCosts(previous, current, cost, clusterMap);
				currPerms.push(current);
				//print('CURRENT: ');
				//print(current);
				print('cost '+cost);
			}else{
				for(var k = 0; k < group.length; k++){
					for(var z = 0; z < group.length; z++){
						if(k != z){
							current = {'prev': previous, 'first': group[k], 'last': group[z], 'initial': previous.initial};
							cost = updateCosts(previous, current, cost, clusterMap);
							currPerms.push(current);
							print('CURRENT: ');
							print(current);
							print('cost '+cost);
						}
					}
				}
			}
		}

		perm[i] = currPerms.filter(c => c.cost == cost);
		if(i == g.length-1){
			print("arcMinimizer: permutazioni dell'ultimo gruppo:");
			print(perm[i]);
			cost++;
			perm[i].map(function(p){
				clusterMap[p.last] == clusterMap[p.initial] ? {} : p.cost++;
				cost > p.cost ? cost = p.cost : {};
			});
			finalPerms = perm[i].filter(p => p.cost == cost);
			print('final cost: '+cost);
		}
	}
	return findSolution(finalPerms[0]);
}


function findSolution(final){
	var sol = [],//array delle soluzioni
		current = final,//permutazione corrente della catena percorsa all'indietro
		i = 0;//indice dell'array che corrisponde nell'ordine all'indice della claw considerata in g ==> sol[i] è la sol di g[i]
	while(current){
		sol.unshift({'first': current.first, 'last': current.last});
		current = current.prev;
		i++;
	}

		print("arcMinimizer: "+k);
		print("arcMinimizer: SOLUZIONE");
		print(sol);


	return sol;
}

function updateCosts(previous, current, cost, clusterMap){
	if(clusterMap[previous.last] != clusterMap[current.first])
		current.cost = previous.cost + 1;
	else{
		print('sono finito nell else '+clusterMap[previous.last]+ '  '+clusterMap[current.first]);
		current.cost = previous.cost;
		print('COSTO INVARIATO: current cost -> '+current.cost+' previous cost -> '+previous.cost);
	}
	if(current.cost < cost){ //se c'è almeno una permutazione che non aumenta il costo
		print('c\'è almeno una permutazione che non aumenta il costo');
		cost = current.cost;
		print('COSTO AGGIORNATO: '+cost);
	}
	return cost;
}

//test delle funzioni
/*
var g = [];
g[0] = [1,4];
g[1] = [1,3];
g[2] = [3];
g[3] = [7];
g[4] = [4,2];

print(g);
print(arcMinimizer(g));*/
