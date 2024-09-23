//euristica per la scelta della copia a cui assegnare un arco

goog.require('goog.structs.PriorityQueue');

function crossingReducer(internalEdges, map, listAngles, cluster){
	/*
	map: mappaggio tra nodi copia ed indici della matrice del chord
	internalEdges: archi che collegano i nodi originali
	listAngles: lista degli angoli associati ai gruppi rispetto all'ordine del chord
	*/
	var adjM = Array(map.length).fill(0).map(()=>Array(map.length).fill(0)),//adjacency matrix
		numEdges = 0, 
		leftovers = [], //array with edges that have more than one possible disposition
		p = new goog.structs.PriorityQueue();//priority queue from the Closure Library from google
		
	//1. Definire un ordinamento sui gruppi, cioè sui nodi del chord: l'ordinamento può essere dato dagli indici di map
	//NB su listAngles i gruppi sono già ordinati in ordine crescente di angolo e  corrispondono agli indici di map

	/*NB internalEdges contiene già il mappaggio con i nodi copia, noi vogliamo che invece dei nodi copia ci siano i nodi originali, 
	quindi calcoliamo il mappaggio all'indietro.*/

	//2. Creare adj matrix con archi che possono essere messi in un solo modo e generare la lista di archi che hanno più disposizioni.
	print('crossingReducer map');
	print(map);
	print('crossingReducer internalEdges');
	print(internalEdges);
	print('crossingReducer listAngles');
	print(listAngles);
	//print('crossingReducer copymap-cluster');
	//print(copymap[cluster]);
	internalEdges.map(function(e){ //initialize matrix and leftovers
		var u = [],
			v = [],
			size = weightSortedEdges(e.size);
			/*source = copymap[cluster][e.source.id],
			target = copymap[cluster][e.target.id];*/
		for(var i=0; i<copymap[cluster].length; i++){
			if(copymap[cluster][i]==e.source.id && !(u.indexOf(getIndexOf(map, i)[0])+1))
				u.push(getIndexOf(map, i)[0]);//gli u e gli v che metto dentro non sono gli indici dei gruppi ma sono i nodi copia!!
			else if(copymap[cluster][i]==e.target.id && !(v.indexOf(getIndexOf(map, i)[0])+1))
				v.push(getIndexOf(map, i)[0]);
		}
		if(u.length==1 && v.length==1)
			addEdge(adjM, u[0], v[0], size);//QUI AGGIUNGO COME ARGOMENTO 'SIZE'
		else{
			//leftovers.push({'edge':e, 'u':u, 'v':v});
			for (var i = 0; i < u.length; i++) {
				for (var j = 0; j < v.length; j++) {
					leftovers.push({'edge':e, 'u':u[i], 'v':v[j], 'size': size});//QUI AGGIUNGO COME PROPRIETà 'SIZE'
				}
			}
		}
	});

	numEdges = countEdges(adjM);
	//initialize priorityqueue
	leftovers.map(function(l){p.enqueue(calculateCost(l.u, l.v, adjM, listAngles, numEdges, 1), l);});

	print('INIZIO EURISTICA');
		print('p');
		print(p);
		print(p.getValues());

	/*fatto ciò, su leftovers ho la lista degli archi che hanno più copie possibili, mentre ho posiionato nella adjaency matrix gli
	archi  con una sola copia possibile.*/
	//print('leftovers');
	//print(leftovers);
	while(!p.isEmpty()){ 


		sol = p.dequeue();//solution with minimum cost
		//print('sol');
		//print(sol);
		addEdge(adjM, sol.u, sol.v, sol.size); //qui aggiungo il quarto argomento 'SOL.SIZE'
		numEdges++;
	//	updateCosts(p, sol.edge, adjM, listAngles, numEdges);
		leftovers = p.getValues();
		leftovers = leftovers.filter(l => !(l.edge == sol.edge));//filtering other dispositions of the solution

		p.clear();
		if(leftovers.length > 0)
		leftovers.map(function(l){	p.enqueue(calculateCost(l.u, l.v, adjM, listAngles, numEdges, 1), l);  });//ricalculate costs

	}
			print('p');
		print(p);
	return adjM;
}

//calcolo il peso dell'ordinamento in base al numero di disposizioni


function calculateCost(u, v, matrix, angles, numEdges, a){//CONTROLLARE
	var elems = d3.range(matrix.length),
		cr = 0,
		ar = 0,
		alpha = a,
		beta = 1-alpha,
		interni = [],
		cost;
	u < v ? interni = elems.filter(n =>	n > u && n< v) : interni = elems.filter(n =>	n > v && n < u);//controllare intervalli
	//print('u: '+u+' v: '+v);
	//print(interni);
	for(var i=0; i<interni.length; i++){
		for(var j=0; j<matrix.length; j++){//se j non è tra gli interni sarà tra gli esterni, quindi avrò incroci
			if(!(interni.indexOf(j)+1) && matrix[interni[i]][j] != 0) {
				cr += matrix[interni[i]][j];
				ar = minAngle(u, v, interni[i], j, angles);
			}
		}
	}
	numEdges == 0 ? numEdges = 1 : {};
	cost = alpha*cr/numEdges + beta*(1-ar/Math.PI);
	
	return cost;
}

/*function updateCosts(p, e, matrix, listAngles, numEdges){

	var leftovers = p.getValues();
	leftovers = leftovers.filter(l => !(l.edge == e));

	p.clear();
	if(leftovers.length > 0)
		leftovers.map(function(l){	p.enqueue(calculateCost(l.u, l.v, matrix, listAngles, numEdges), l);  });
}*/

function chooseSolution(sols, matrix){
	var distance = Infinity;
		sol = {};
	sols.map(function(s){
		var d = Math.abs(s.e1-s.e2);
		d > matrix.length/2 ? d = matrix.length - d : {};//se la distanza è maggiore di metà dei nodi, prendo l'altra parte come distanza
		if(d < distance){
			distance = Math.abs(s.e1-s.e2);
			sol = s;
		}
	});
	return sol;
}

function addEdge(matrix, i, j, size){//qui aggiungo un argomento che sarà la e.size dell'arco associato, mappata su livelli da 1 a 4
	matrix[i][j] = size;
	matrix[j][i] = size;
}

function minAngle(u, v, u1, v1, angles){
	var groups = angles.filter(a => a.index == u || a.index == v || a.index == u1 || a.index == v1),
		alpha = 0,
		//beta = 0,
		minAlpha = Infinity;
	groups.sort(function(a,b){return a.startAngle - b.startAngle;});
	for (var i = 0; i < groups.length; i++) {
		if(i == groups.length-1)
			alpha = Math.abs(groups[0].startAngle - groups[i].endAngle);
		else
			alpha = Math.abs(groups[i+1].startAngle - groups[i].endAngle);
		//beta = 2*Math.PI - alpha;
		alpha < minAlpha ? minAlpha = alpha : {};
	}
	return minAlpha;
}

function countEdges(matrix){
	var matrixSum = matrix.reduce(function(a,b) { return a.concat(b) }) // flatten array
     	  .reduce(function(a,b) { return a + b }); 
    return matrixSum/2;
}