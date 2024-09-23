//HO MODIFICATO COPY.ID E AGGIUNTO COPY.NUMBER, MA DEVO CONTROLLARE DELETECHORD

var copymap = [],
	clnodes = [],
	copyNum = 0;

function expandCluster(d){//suppongo di avere i dati di un node cluster (d=clNode)
	if(event.ctrlKey){
		releaseCluster(d);
	} else {
	if (simulation) simulation.stop();
	print('cluster click: expand cluster');
	copymap[d.cluster] = [];
	clnodes[d.cluster] = d.nodes;
	copyNum = 0;

	var nodes = d.nodes,
		externalEd = d.externEdges,
		internalEdges = d.internEdges,
		x = nodes.map(function(n){return n.x}),
		y = nodes.map(function(n){return n.y}),
		minX = Math.min.apply(null,x),
		maxX = Math.max.apply(null,x),
		minY = Math.min.apply(null,y),
		maxY = Math.max.apply(null,y),
		cx = (maxX+minX)/2,	//centro del cluster
		cy = (maxY+minY)/2,
		distance = nodes.map(function(n){return Math.sqrt(Math.pow(cx-n.x,2) + Math.pow(cy-n.y,2));}),
		r = Math.max.apply(null, distance) + 6, //raggio del cluster
		intersections = [],	//calcolo delle intersezioni NB mettere a posto le intersezioni.
		copyNodes = [],	//nodi duplicati
		cluster = copymap[d.cluster],
		clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster)),
		hexColor;

	hexColor = d.color.split("(")[1] ? convertRGBtoHex(d.color) : d.color;
	palette.find(function(p){return p.color==hexColor}).element = "cluster";
	palette.find(function(p){return p.color==hexColor}).used = true;

	translateInternalNodes(r, cx, cy, d.cluster);

		d.x = cx;
		d.y = cy;
		//PROIEZIONI
	var projectionNodes = project(nodes.filter(n => (!(externalEd.map(function(e){return e.source.id}).indexOf(n.id)+1) && !(externalEd.map(function(e){return e.target.id}).indexOf(n.id)+1))), cx, cy, r, d.cluster);
		print('projectionNodes');
		print(projectionNodes);

		//INTERSEZIONI
		/*dobbiamo isnerire il cluster di source e target dentro alla funzione intersect, per poter fare il confronto:
		edge = externalEd.find(function(e){return (e.source.id == el.target || e.target.id == el.target) ;});
		verficando che el.target.cluster corrisponda a quello di e.source o di e.target, se è una copia, altrimenti che sia undefined, se non lo è.*/
	intersections = externalEd.map(function(e){return intersect(cx, cy, r, e.source.x, e.source.y, e.target.x, e.target.y, e.source, e.target)})
	print("intersections");
	print(intersections);

	intersectionNodes = intersections.map(function(el){
		var id = nodes.indexOf(el.source)+1 ? el.source.id : el.target.id, //id del nodo originale interno
			copy = {'number': copyNum, 'id': "copy"+ copyNum++, 'cluster': d.cluster, 'x': el.x, 'y': el.y, 'fx': el.x, 'fy': el.y, 'copy':true, 'bonded': true},
			edge = {};//arco di externalEd che contiene il nodo a cui si deve collegare copy
		cluster[copy.number] = id;
		if(id == el.source.id){
			edge = externalEd.find(function(e){return (e.source == el.target || e.target == el.target) ;});

			el.source = copy;//forse questi si possono togliere
			el.target = edge.source == el.target ? edge.source : edge.target;
			print(el.target);
			print(el.source);
			//el.target = net.nodes.find(function(n){return n.id == el.target;});//forse questi si possono togliere
			//associo gli archi ai nodi duplicati
			externalEd.map(function(l){(l.source.id == cluster[copy.number] && l.target == el.target) ? l.source = copy : {}});//finire
		}else{
			edge = externalEd.find(function(e){return e.source == el.source || e.target == el.source;});
			el.source = edge.source == el.source ? edge.source : edge.target;
			print(el.source);
			//el.source = net.nodes.find(function(n){return n.id == el.source;});//forse questi si possono togliere
			el.target = copy;//forse questi si possono togliere
			//associo gli archi ai nodi duplicati
			externalEd.map(function(l){(l.source == el.source && l.target.id == cluster[copy.number]) ? l.target = copy : {}});//finire
		}
		return copy;
	});

	//externalEd.map(function(e){net.edges.push(e);});

	copyNodes = projectionNodes.concat(intersectionNodes);
	print('copyNodes');
	print(copyNodes);
	d.copies = copyNodes;

	//qui devo eseguire le operazioni per effettuare l' ordinamento dei claws

	var exnodes = [],
		i = 0,
		map = [],
		claws = [],
		nodesAngles = calculateAngles(copyNodes, cx, cy);
	print('nodesAngles');
	print(nodesAngles);
	externalEd.map(function(e){//calcolo gli exnodes
	/*	var endpoint = copyNodes.find(function(n){return n==e.source}) ? e.target : e.source,
				node = endpoint.copy ? data.nodes.find(function(n){return n.id == copymap[endpoint.cluster][endpoint.number]}) : endpoint;*/
		var node = copyNodes.find(function(n){return n==e.source}) ? e.target : e.source;
		exnodes.find(function(n){return n == node}) ? {} : exnodes.push(node);
	});
	print(exnodes);
	exnodes.map(function(n){//definisco mappaggio tra exnodes ed indici
		map[i] = n;
		claws[i] = [];
		i++;
		});


	/*projectionNodes.sort(function(a,b){
			var el1 = nodesAngles.find(function(el){return el.index == a}),
				el2 = nodesAngles.find(function(el){return el.index == b});
			return el1.angle - el2.angle;
		});*/
	projectionNodes.map(function(n){//definisco mappaggio tra projectionNodes ed indici
		map[i] = n;
		claws[i] = [];
		claws[i].push(n.number);
		i++;
		});
	/*externalEd.map(function(e){//definisco le claws
		var source = e.source.copy ? data.nodes.find(function(n){return n.id == copymap[e.source.cluster][e.source.number]}) : e.source,
				target = e.target.copy ? data.nodes.find(function(n){return n.id == copymap[e.target.cluster][e.target.number]}) : e.target;
		if(exnodes.find(function(n){return n==source})){
			//node = e.source.copy ? data.nodes.find(function(n){return n.id == copymap[e.source.cluster][e.source.number]}) : e.source;
			claws[map.indexOf(source)].push(e.target.number);
		}else{
			//node = e.target.copy ? data.nodes.find(function(n){return n.id == copymap[e.target.cluster][e.target.number]}) : e.target;
			claws[map.indexOf(target)].push(e.source.number);
		}
		//exnodes.find(function(n){return n==e.source}) ? claws[map.indexOf(e.source)].push(e.target.number) : claws[map.indexOf(e.target)].push(e.source.number);
	});*/
externalEd.map(function(e){//definisco le claws
	exnodes.find(function(n){return n==e.source}) ? claws[map.indexOf(e.source)].push(e.target.number) : claws[map.indexOf(e.target)].push(e.source.number);
});

	//devo ordinare le claws
	for (var i = 0; i < claws.length; i++) {
		claws[i].sort(function(a,b){
			var el1 = nodesAngles.find(function(el){return el.index == a}),
				el2 = nodesAngles.find(function(el){return el.index == b});
			print(i+': angle1= '+el1.angle+'; angle2= '+el2.angle);
			print(el1);
			print(el2);
			return circularSort(el1.angle,el2.angle);
		});
	}

	claws.sort(function(a,b){
		var el1 = nodesAngles.find(function(el){return el.index == a[a.length-1]}),// a[0]
			el2 = nodesAngles.find(function(el){return el.index == b[b.length-1]});// b[0]
		return el1.angle - el2.angle;
	});

	print('claws');
	print(claws);

	/*
	var cl0 = nodesAngles.find(function(el){return el.index == claws[0][0]}),
		cl1 = nodesAngles.find(function(el){return el.index == claws[0][claws[0].length-1]});

	if (cl1.angle - cl0.angle > Math.PI) {
		claws[0].sort(function(a,b){
			var n1 = copyNodes.find(function(n){return n.number ==  a}),
				n2 = copyNodes.find(function(n){return n.number ==  b});
			return n1.x - n2.x;
		});
	}*/
	/*var tmp = claws[0][0];
	claws[0][0] = claws[0][1];
	claws[0][1] = tmp;*/

	perm = arcMinimizer(claws, cluster);
	print('perm solution');
	print(perm);
	i = 0;
	perm.map(function(p){//effettuo le permutazioni, cioè sostituisco le coordinate di primo ed ultimo di ogni claw
		var first = copyNodes.find(function(n){return n.number == claws[i][0];}),
			newFirst = copyNodes.find(function(n){return n.number == p.first;}),//non mappo bene
			//last = copyNodes.find(function(n){return n.number == claws[i][claws[i].length-1];}),
			last = {},
			newLast = copyNodes.find(function(n){return n.number == p.last;});
		if(claws[i].length == 2)
			exchangeCoordinates(first, newFirst);
		else{
			exchangeCoordinates(first, newFirst);
			//	ordino la claw
			var tmp = claws[i][0],
				id1 = claws[i].indexOf(first.number),
				id2 = claws[i].indexOf(newFirst.number);
			claws[i][0] = claws[i][id2];
			claws[i][id2] = tmp;
			//	prendo last = l'ultimo elemento
			last = copyNodes.find(function(n){return n.number == claws[i][claws[i].length-1];});
			//scambio last e newLast
			exchangeCoordinates(last, newLast);
			//last.id == newFirst.id ? {} : exchangeCoordinates(last, newLast);//se ho scambiato il primo e l'ultimo non devo rifare lo scambio di coordinate
		}
		print('first, newFirst, last, newLast');
		print([first, newFirst, last, newLast]);
		i++;
	});


	//rimane da modificare listAngles in modo tale che poi i vertici vicini uguali formino un unico arco continuo(quindi siano
	//considerati come unico vertice nel chord diagram)

	//PREPARO PER CREARE IL CHORD
	obj = createAngles(copyNodes, cx, cy, cluster);
	//obj = defineIntervals(copyNodes, cx, cy, cluster);

	map = obj.map;
	print('map');
	print(map);
	listAngles = obj.listAngles;
	print('listAngles');
	print(listAngles);
	listAngles.map(function(a){
		if(map[a.index].length == 1){
			var newAngle = (a.startAngle + a.endAngle)/2,
				fx = cx + r*Math.cos(newAngle-Math.PI/2),// Math.PI/2 tiene conto del cambio di sistema di rif
				fy = cy + r*Math.sin(newAngle-Math.PI/2),
				n = copyNodes.find(function(n){return map[a.index][0] == n.number;}),
				edge = externalEd.find(function(e){return (e.source == n || e.target == n);});

			n.x = fx;
			n.y = fy;
			n.fx = fx;
			n.fy = fy;

			if(typeof edge != 'undefined'){
				sol = intersect(cx, cy, r, edge.source.x, edge.source.y, edge.target.x, edge.target.y, edge.source, edge.target);
				n.x = sol.x;
				n.y = sol.y;
				n.fx = sol.x;
				n.fy = sol.y;
			}
		}else{
			var copies = map[a.index].map(function(c){
						return copyNodes.find(function(copy){return c == copy.number;});
					}),
					copiesAngles = calculateAngles(copies, cx, cy);
			copiesAngles.map(function(ca){
				ca.angle = (ca.angle < a.startAngle && ca.angle < a.endAngle) ? ca.angle + 2*Math.PI : ca.angle;
				if(a.endAngle-a.startAngle > 3*padAngle){
					if(ca.angle-a.startAngle < 2*padAngle){
						ca.angle = a.startAngle+3*padAngle;
						copies.find(function(c){return c.number == ca.index}).x = cx + r*Math.cos(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).y = cy + r*Math.sin(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).fx = cx + r*Math.cos(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).fy = cy + r*Math.sin(ca.angle-Math.PI/2);
					}else if(a.endAngle - ca.angle < 2*padAngle){
						ca.angle = a.endAngle-3*padAngle;
						copies.find(function(c){return c.number == ca.index}).x = cx + r*Math.cos(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).y = cy + r*Math.sin(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).fx = cx + r*Math.cos(ca.angle-Math.PI/2);
						copies.find(function(c){return c.number == ca.index}).fy = cy + r*Math.sin(ca.angle-Math.PI/2);
					}
				}
			});
		}
	});
	//clacolato l'angolo dei copynodes va messo l'algoritmo di programmazione dinamica per permutare le coppie di nodi estremi
	/*if(internalEdges){
		internalEdges.map(function(e){
			e.source = copyNodes.find(function(n){return n.number == cluster.indexOf(e.source.id);});
			e.target = copyNodes.find(function(n){return n.number == cluster.indexOf(e.target.id);});
		});
	}*/
	print('internalEdges');
	print(internalEdges);

	//qui aggiorno gli externalEdges dei chords adiacenti in modo tale che non puntino più al cluster collassato ma ai nodi copia
	//creati per costruire il chord AGGIORNAMENTO EXTERNEDGES DEI CHORDS



	chordg.selectAll('g.diagram')
			.each(function(d){
				//d = dati chord-diagram esterno
				//edges = archi esterni che vanno a finire su una copia di un chord-diagram esterno
				print(d);
				var edges = externalEd.filter(e => (e.source.cluster == d.cluster && e.source.copy) || (e.target.cluster == d.cluster && e.target.copy));
				if(edges){
					d.externEdges.map(function(e){
						edges.map(function(l){
							e.source == l.source && e.target.cluster == l.target.cluster ? e.target = l.target : {};
							e.source == l.target && e.target.cluster == l.source.cluster ? e.target = l.source : {};
							e.target == l.target && e.source.cluster == l.source.cluster ? e.source = l.source : {};
							e.target == l.source && e.source.cluster == l.target.cluster ? e.source = l.target : {};
						});//forse anche qui devi modificare la size degli archi
					});
				}
			});
		//AGGIORNAMENTO EXTERNEDGES DEI NODI DELLA NET
	//NON SO SE FUNZIONA BENE
	//aggiornamento degli externEdges dei cluster ancora collassati all'espansione del cluster corrente:
	/*
	edges: externEdges del cluster in espansione
	e = externEdges cluster collassato che sto considerando
	l = arco di externEdges del cluster in espansione
	cledge = arco di externEdges cluster collassato
	*/
try{
	clusters.map(function(cl){
			var edges = externalEd.filter(e => e.source.cluster == cl.cluster || e.target.cluster == cl.cluster);

			cl.externEdges.map(function(e){
				if((e.source.cluster == d.cluster || e.target.cluster == d.cluster) && e.size > 1){
					while(e.size != 1){
						var edge = {'source': e.source, 'target': e.target, 'size': 1, 'label': e.label};
						e.controlPoints ? edge.controlPoints = e.controlPoints : {};
						e.splineData ? edge.splineData = e.splineData : {};
						cl.externEdges.push(edge);

						e.size--;
					}
				}
			});
			/*qui sopra mi faceva comodo scomporli con dimensioni pari ad 1 perchè sapevo che ogni arco di size 1 corrispondeva ad
			un collegamento con una copia, in realtà con gli archi pesati, ad una copia si può collegare un arco di size anche
			maggiore di 1, per cui il controllo con e.size != 1 per distinguere i casi in cui ho un cluster collassato da quelli
			in cui ho un collegamento singolo non va più bene formalmente*/

			//mappaggio degli externEdges dei cluster collassati sulle copie del chord-diagram appena creato
			/*edges.map(function(l){//edges può avere archi di size > 1 verso il cluster cli
				var i = l.size,
						//adjacencyList = l.source.copy ? nodesAdjacency[cluster[l.source.number]] : nodesAdjacency[cluster[l.target.number]];
				while(i != 0){
						//e = arco cluster esterno 			l = arco cluster considerato				forse ci va anche nodesAdjacency[e.target.id].indexOf(cluster[l.source.number])+1)
					var cledge = cl.externEdges.find(e => ((e.source.cluster == d.cluster && !(e.source.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.target.id)+1)) ||
																									(e.source.cluster == d.cluster && !(e.source.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.target.id)+1)) ||
																									(e.target.cluster == d.cluster && !(e.target.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.source.id)+1)) ||
																									(e.target.cluster == d.cluster && !(e.target.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.source.id)+1))));	*/
				/*	var cledge = cl.externEdges.find(e => ((e.source.cluster == d.cluster && !(e.source.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.target.id)+1) && !(cl.externEdges.find(function(m){return (m.source == l.source && m.target == e.target) || (m.source == e.target && m.target == l.source)}))) ||
																								 (e.source.cluster == d.cluster && !(e.source.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.target.id)+1) && !(cl.externEdges.find(function(m){return (m.source == l.target && m.target == e.target) || (m.source == e.target && m.target == l.target)}))) ||
																							 	 (e.target.cluster == d.cluster && !(e.target.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.source.id)+1) && !(cl.externEdges.find(function(m){return (m.source == l.target && m.target == e.source) || (m.source == e.source && m.target == l.target)}))) ||
																								 (e.target.cluster == d.cluster && !(e.target.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.source.id)+1) && !(cl.externEdges.find(function(m){return (m.source == l.source && m.target == e.source) || (m.source == e.source && m.target == l.source)}))))),*/
			 /* 	 var cledge = cl.externEdges.find(e => ((e.source.cluster == d.cluster && !(e.source.copy) && l.target.cluster == cl.cluster) ||
 															(e.source.cluster == d.cluster && !(e.source.copy) && l.source.cluster == cl.cluster) ||
 															(e.target.cluster == d.cluster && !(e.target.copy) && l.source.cluster == cl.cluster) ||
 															(e.target.cluster == d.cluster && !(e.target.copy) && l.target.cluster == cl.cluster)));*/
			/*				u = {},
							v = {};

							//nodo originale cluster d
							if(l.source.cluster == d.cluster){
								if(!(l.source.copy))
									u = l.source;
								else {
									u = nodes.find(function (n){return n.id == copymap[l.source.cluster][l.source.number]});
								}
							}else{
								if(!(l.target.copy))
									u = l.target;
								else {
									u = nodes.find(function (n){return n.id == copymap[l.target.cluster][l.target.number]});
								}
							}

							//nodo originale cluster cl
							if(cledge.source.cluster == cl.cluster){
								if(!(cledge.source.copy))
									v = cledge.source;
								else {
									v = nodes.find(function (n){return n.id == copymap[cledge.source.cluster][cledge.source.number]});
								}
							}else{
								if(!(cledge.target.copy))
									v = cledge.target;
								else {
									v = nodes.find(function (n){return n.id == copymap[cledge.target.cluster][cledge.target.number]});
								}
							}
							//u = l.source.cluster == d.cluster && !(l.source.copy) ? l.source : ! l.target, //nodo originale cluster d
						//	v = cledge.source.cluster == cl.cluster ? cledge.source : cledge.target; //nodo originale cluster cl
				//	cledge.label = data.edges.find(function(e){return (e.source==u||e.target==u)&&(e.source==v||e.target==v)}).label;

					if(typeof cledge == 'undefined'){
						var err = {'clExternEdges': cl.externEdges, 'l':l, 'thisExternalEdges':edges};
						l.source.copy ? err['originalNode'] = d.nodes.find(function(n){return n.id == copymap[d.cluster][l.source.number]}) : err['originalNode'] = d.nodes.find(function(n){return n.id == copymap[d.cluster][l.target.number]})
						cl.externEdges.map(function(e){
							print("TABELLA VERITà CONDIZIONI:");
							print(Boolean(e.source.cluster == d.cluster) +" "+ Boolean(!(e.source.copy))+" "+ Boolean(l.target.cluster == cl.cluster) +" "+ (typeof nodesAdjacency[cluster[l.source.number]] == 'undefined' ? false : (nodesAdjacency[cluster[l.source.number]].indexOf(e.target.id)+1)));//Boolean((nodesAdjacency[cluster[l.source.number]].indexOf(e.target.id)+1)));
							print(Boolean(e.source.cluster == d.cluster) +" "+ Boolean(!(e.source.copy))+" "+ Boolean(l.source.cluster == cl.cluster) +" "+ (typeof nodesAdjacency[cluster[l.target.number]] == 'undefined' ? false : (nodesAdjacency[cluster[l.target.number]].indexOf(e.target.id)+1)));//Boolean((nodesAdjacency[cluster[l.target.number]].indexOf(e.target.id)+1)));
							print(Boolean(e.target.cluster == d.cluster) +" "+ Boolean(!(e.target.copy)) +" "+ Boolean(l.source.cluster == cl.cluster) +" "+(typeof nodesAdjacency[cluster[l.target.number]] == 'undefined' ? false : (nodesAdjacency[cluster[l.target.number]].indexOf(e.source.id)+1)));//Boolean((nodesAdjacency[cluster[l.target.number]].indexOf(e.source.id)+1)));
							print(Boolean(e.target.cluster == d.cluster) +" "+ Boolean(!(e.target.copy)) +" "+ Boolean(l.target.cluster == cl.cluster )+" "+(typeof nodesAdjacency[cluster[l.source.number]] == 'undefined' ? false : (nodesAdjacency[cluster[l.source.number]].indexOf(e.source.id)+1)));//Boolean((nodesAdjacency[cluster[l.source.number]].indexOf(e.source.id)+1)));
						});
						throw err;
					}
					cledge.source.cluster == d.cluster && l.target.cluster == cl.cluster ? cledge.source = l.source : {};
					cledge.source.cluster == d.cluster && l.source.cluster == cl.cluster ? cledge.source = l.target : {};
					cledge.target.cluster == d.cluster && l.source.cluster == cl.cluster ? cledge.target = l.target : {};
					cledge.target.cluster == d.cluster && l.target.cluster == cl.cluster ? cledge.target = l.source : {};
					//cledge.label = l.label;//24/05/2019
					cledge.label = data.edges.find(function(e){return (e.source==u||e.target==u)&&(e.source==v||e.target==v)}).label;
					print(cledge);
					print(l.size+1 - i);
					i--;


				}
			});*/

			var interClusterEdges = data.edges.map(function(e){
					if((d.nodes.find(function(n){return e.source.id == n.id;}) && cl.nodes.find(function(n){return e.target.id == n.id;})) || (d.nodes.find(function(n){return e.target.id == n.id;}) && cl.nodes.find(function(n){return e.source.id == n.id;})) )
						return {'source': e.source, 'target': e.target, 'size': e.value, 'label': e.label};
					}),
					copylist = edges.map(function(e){return e.source.copy ? e.source : e.target;});

					interClusterEdges = interClusterEdges.filter(e => typeof e != 'undefined');

			cl.externEdges = cl.externEdges.filter(e => !(e.source.cluster==d.cluster || e.target.cluster==d.cluster));
			interClusterEdges.map(function(e){
					if(d.nodes.find(function(n){return e.source==n;}))
						e.source = copylist.find(function(c){return copymap[d.cluster][c.number] == e.source.id;});
					else
						e.target = copylist.find(function(c){return copymap[d.cluster][c.number] == e.target.id;});

					cl.externEdges.push(e);
			});

		});
}catch(err){
		print(err);
		print('errore');
}
/*	LA FACCENDA NON è ANCORA CHIUSA, SI PRESENTA UN BUG QUANDO CHIUDO E RIAPRO DUE CLUSTER PIù VOLTE, BISOGNA TROVARE IL MODO DI
	CHIUDERE GLI AGGIORNAMENTI.*/



	//sintesi delle repliche dello stesso arco esterno in un solo arco di size = somma delle size delle repliche
	externalEd.map(function(e){
		var edge = {},
			size = e.size;
		e.size = 0;
// ALESSANDRA
		// edge = externalEd.find(function(l){return l.source == e.source && l.target == e.target && l.size > 0});
		edge = externalEd.find(function(ed){return e != edge &&
								((ed.source.copy && e.source.copy && copymap[ed.source.cluster][ed.source.number] == copymap[e.source.cluster][e.source.number] && ed.target == e.target) ||
			 					 (ed.target.copy && e.target.copy && copymap[ed.target.cluster][ed.target.number] == copymap[e.target.cluster][e.target.number] && ed.source == e.source) ||
								 (ed.source.copy && e.target.copy && copymap[ed.source.cluster][ed.source.number] == copymap[e.target.cluster][e.target.number] && ed.target == e.source) ||
								 (ed.target.copy && e.source.copy && copymap[ed.target.cluster][ed.target.number] == copymap[e.source.cluster][e.source.number] && ed.source == e.target));});
		//edge ? edge.size += size : e.size = size;
		if(edge){
			edge.size += size;
			edge.label = concatenateStrings(edge.label,e.label);
			// if (!(edge.label.includes(e.label) || e.label.includes(edge.label))){
			// 	edge.label = edge.label+"\n"+e.label;
			// }
		}else{e.size = size;}
	});
	externalEd = externalEd.filter(e => !(e.size==0));

	//prima di creare adjacencyMatrix ci va messo l'algoritmo che mappa gli archi sui nodi copia

	adjacencyMatrix = crossingReducer(internalEdges, map, listAngles, d.cluster);
	console.log('adjacencyMatrix');
	console.log(adjacencyMatrix);

	//13_04_19 funzione di rimappaggio angoli:
	//weighIntervals(obj, adjacencyMatrix);
	weighIntervals2(obj, adjacencyMatrix); //post-processing suddividendo gli intervalli angolari in "vincolati" e "non vincolati"
	console.log('obj');
	console.log(obj);
	console.log('listAngles');
	console.log(listAngles);
	console.log('map');
	console.log(map);


	// ALESSANDRA - se ci sono due copies di uno stesso arc nel cluster node d che vanno in un chord-diagram esterno, questo codice le unisce
	d.externEdges.map(function(e){
		if (d.externEdges.indexOf(e)) {
				for (var j = 0; j < d.externEdges.length; j++) {
					if ((e.target.copy && d.externEdges[j].target.copy && e.source.cluster == d.cluster && e.target.cluster == d.externEdges[j].source.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										 || (e.target.copy && d.externEdges[j].source.copy && e.source.cluster == d.cluster && e.target.cluster == d.externEdges[j].target.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])
										 || (e.source.copy && d.externEdges[j].target.copy && e.target.cluster == d.cluster && e.source.cluster == d.externEdges[j].source.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										 || (e.source.copy && d.externEdges[j].source.copy && e.target.cluster == d.cluster && e.source.cluster == d.externEdges[j].target.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])){

							if (!chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].target.copy && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number] && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
									d.externEdges[j].target = e.target;
							if (!chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].source.copy && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number] && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
									d.externEdges[j].source = e.target;
							if (!chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].target.copy && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number] && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
									d.externEdges[j].target = e.source;
							if (!chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].source.copy && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number] && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
									d.externEdges[j].source = e.source;

							// e.size += d.externEdges[j].size;
							// e.label = concatenateStrings(e.label,d.externEdges[j].label);
						}
				}
		}
	});


	var chord = createChord(listAngles, adjacencyMatrix, r, cx, cy, d, map);
	//var chord = createChord(obj.listAngles, adjacencyMatrix, r, cx, cy, d, obj.map);





	//aggiornamento externEdges collegati a matrici
	matrixg.selectAll("g.matrix").each(function (dm, i) {
		splineEdges = dm.externEdges.filter(e => e.source.cluster == d.cluster || e.target.cluster == d.cluster);
		if(splineEdges.length > 0){
			externalEd.map(function(ed){
				splineEdges.map(function(sp){
					// if(ed.source == sp.source || ed.target == sp.target){
					// 	console.log(sp.controlPoints);
					// 	ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
					// 	ed.controlPoints[0][0] = sp.controlPoints[0][0];
					// 	ed.controlPoints[0][1] = sp.controlPoints[0][1];
					// 	ed.controlPoints[1][0] = sp.controlPoints[1][0];
					// 	ed.controlPoints[1][1] = sp.controlPoints[1][1];
					// 	ed.controlPoints[2][0] = sp.controlPoints[2][0];
					// 	ed.controlPoints[2][1] = sp.controlPoints[2][1];
					// 	ed.controlPoints[3][0] = sp.controlPoints[3][0];
					// 	ed.controlPoints[3][1] = sp.controlPoints[3][1];
					// 	ed.splineData = sp.splineData;
					// }
					if(ed.target == sp.target){
						// console.log(sp.controlPoints);
						ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
						ed.controlPoints[0][0] = sp.controlPoints[0][0];
						ed.controlPoints[0][1] = sp.controlPoints[0][1];
						ed.controlPoints[1][0] = sp.controlPoints[1][0];
						ed.controlPoints[1][1] = sp.controlPoints[1][1];
						ed.controlPoints[2][0] = sp.controlPoints[2][0];
						ed.controlPoints[2][1] = sp.controlPoints[2][1];
						ed.controlPoints[3][0] = sp.controlPoints[3][0];
						ed.controlPoints[3][1] = sp.controlPoints[3][1];
						ed.splineData = sp.splineData;
					}
					if(ed.source == sp.source){
						// console.log(sp.controlPoints);
						ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
						ed.controlPoints[0][0] = sp.controlPoints[0][0];
						ed.controlPoints[0][1] = sp.controlPoints[0][1];
						ed.controlPoints[1][0] = sp.controlPoints[1][0];
						ed.controlPoints[1][1] = sp.controlPoints[1][1];
						ed.controlPoints[2][0] = sp.controlPoints[2][0];
						ed.controlPoints[2][1] = sp.controlPoints[2][1];
						ed.controlPoints[3][0] = sp.controlPoints[3][0];
						ed.controlPoints[3][1] = sp.controlPoints[3][1];
						ed.splineData = sp.splineData;
					}
					if(ed.target == sp.source){
						// console.log(sp.controlPoints);
						ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
						ed.controlPoints[0][0] = sp.controlPoints[3][0];
						ed.controlPoints[0][1] = sp.controlPoints[3][1];
						ed.controlPoints[1][0] = sp.controlPoints[2][0];
						ed.controlPoints[1][1] = sp.controlPoints[2][1];
						ed.controlPoints[2][0] = sp.controlPoints[1][0];
						ed.controlPoints[2][1] = sp.controlPoints[1][1];
						ed.controlPoints[3][0] = sp.controlPoints[0][0];
						ed.controlPoints[3][1] = sp.controlPoints[0][1];
						ed.splineData = sp.splineData;
					}
					if(ed.source == sp.target){
						// console.log(sp.controlPoints);
						ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
						ed.controlPoints[0][0] = sp.controlPoints[3][0];
						ed.controlPoints[0][1] = sp.controlPoints[3][1];
						ed.controlPoints[1][0] = sp.controlPoints[2][0];
						ed.controlPoints[1][1] = sp.controlPoints[2][1];
						ed.controlPoints[2][0] = sp.controlPoints[1][0];
						ed.controlPoints[2][1] = sp.controlPoints[1][1];
						ed.controlPoints[3][0] = sp.controlPoints[0][0];
						ed.controlPoints[3][1] = sp.controlPoints[0][1];
						ed.splineData = sp.splineData;
					}
				});
			});
		}
	});

	//aggiornamento nodi ed archi della rete
	nodeg.selectAll('circle.node.cluster').select(function(c){return c.cluster==d.cluster ? this : null}).remove();
	linkg.selectAll('line.link').select(function(e){return (e.source.cluster==d.cluster || e.target.cluster==d.cluster) ? this : null}).remove();
	net.nodes = net.nodes.filter(n => !(n.cluster == d.cluster));
	net.edges = net.edges.filter(e => !(e.source.cluster==d.cluster || e.target.cluster==d.cluster));
	externalEd.map(function(e){net.edges.push(e);});

	//translateInternalNodes(r, cx, cy, d.cluster);

	div.transition()
       .duration(200)
       .style("opacity", 0);

	updateNodes();//funzione presente nel file listeners
	updateEdges();//funzione presente nel file listeners
	updateEdges();//funzione presente nel file listeners
	updateHulls();
}
} // END EXPANDCLUSTER

function deleteChord(d){//d in questo caso sono i dati legati all'oggetto chord diagram
	var clusterNode = d,
		clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster));//individuo i nodi cluster collassati nella rete
	net.nodes.push(clusterNode);
	d.copies = [];
	d.externEdges = [];
	/*d.externEdges.map(function(e){
		e.source.copy ? e.source = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.source.number]}) : e.target = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.target.number]});
		//e.source.copy ? e.source = clusterNode : e.target = clusterNode;
	});*/
	/*d.internEdges.map(function(e){
		e.source = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.source.number]});
		e.target = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.target.number]});
		//e.source.copy ? e.source = clusterNode : e.target = clusterNode;
	});*/

	//translateBackInternalNodes(d.cluster);

	net.edges.map(function(e){
		var size = e.size,
			edge = {}, //arco con nodo originale che metto su externEdges
			l = {}, //arco già presente in net.edges
			el = {}; //arco già presente in d.externEdges

		if(e.source.cluster == d.cluster && e.source.copy) {
			var original = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.source.number]});
			e.source = clusterNode;
			edge = {'source': original, 'target': e.target, 'size': e.size, 'label': e.label};
		}
		else if (e.target.cluster == d.cluster && e.target.copy){
			var original = d.nodes.find(function(n){return n.id == copymap[d.cluster][e.target.number]});
			e.target = clusterNode;
			edge = {'source': e.source, 'target': original, 'size': e.size, 'label': e.label};
		}

		e.controlPoints ? edge.controlPoints = e.controlPoints : {};
		e.splineData ? edge.splineData = e.splineData : {};
		e.size = 0;
		l = net.edges.find(function(l){return ((l.source == e.source && l.target == e.target && l.size > 0) || (l.target == e.source && l.source == e.target && l.size > 0))});//controllo presenza di copie
		//se è già presente l'arco ne aumento la size (l.target == e.source && l.source == e.target && l.size > 0)
		if(l){
			l.size += size;
			l.label = concatenateStrings(l.label,e.label);
			// if (!(l.label.includes(e.label) || e.label.includes(l.label))){
			// 	l.label = l.label+"\n"+e.label;
			// }
		}else
			e.size = size;

// ALESSANDRA
		 // el = d.externEdges.find(function(ed){return (edge.target.cluster == ed.source.cluster && edge.target.cluster == d.cluster || edge.target.cluster == ed.target.cluster && edge.target.cluster == d.cluster || edge.source.cluster == ed.source.cluster && edge.source.cluster == d.cluster || edge.source.cluster == ed.target.cluster && edge.source.cluster == d.cluster);});
		 el = d.externEdges.find(function(l){return ((l.source == edge.source && l.target == edge.target) || (l.target == edge.source && l.source == edge.target))});
		//non fa la sommare 			(l.target == edge.source && l.source == edge.target)
	//	el ? el.size += edge.size : (edge.size ? d.externEdges.push(edge) : print("deleteCluster 369: !el && edge.size = 0"));
		if(el){
			el.size += edge.size;
			el.label = concatenateStrings(el.label,edge.label);
			l = d.externEdges.find(function(l){return l.source == el.source && l.target == el.target || l.source == el.target && l.target == el.source});
			l.source = edge.source;
			l.target = edge.target;
			// if (!(el.label.includes(edge.label) || edge.label.includes(el.label))){
			// 	el.label = el.label+"\n"+edge.label;
			// }
		}else{
			if(edge.size){
					d.externEdges.push(edge);
				}
			}

	});

 // ALESSANDRA - se ci sono due copies di uno stesso arc di un chord diagram esterno che vanno nel cluster node d, questo codice le unisce
	net.edges.map(function(e){
		if (d.externEdges.indexOf(e)) {
				for (var j = 0; j < d.externEdges.length; j++) {
					if ((e.target.copy && d.externEdges[j].target.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].source.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										 || (e.target.copy && d.externEdges[j].source.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].target.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])
										 || (e.source.copy && d.externEdges[j].target.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].source.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										 || (e.source.copy && d.externEdges[j].source.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].target.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])){

							if (!chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].target.copy && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
									d.externEdges[j].target = e.target;
							if (!chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].source.copy && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
									d.externEdges[j].source = e.target;
							if (!chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].target.copy && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
									d.externEdges[j].target = e.source;
							if (!chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].source.copy && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
									d.externEdges[j].source = e.source;

							// e.size += d.externEdges[j].size;
							// e.label = concatenateStrings(e.label,d.externEdges[j].label);
						}
				}
		}
	});

	/*net.edges.map(function(e){//18/05/19
		var duplicate = net.edges.find(function(edge){return (edge.target == e.source && edge.source == e.target)});
		if(typeof duplicate !== 'undefined'){
			e.size += duplicate.size;
			duplicate.size = 0; //lo faccio per rimuoverlo alla fine
		}
	});*/
	net.edges = net.edges.filter(e => e.size > 0);

	translateBackInternalNodes(d.cluster);

	updateNodes();
	updateEdges();
	updateEdges();//devo raggruppare gli archi multipli verso cluster in un unico arco con peso dato dalla somma delle copie


	//AGGIORNAMENTO EXTERNEDGES DEI CHORDS
	chordg.select("g."+d.cluster).remove();
	chordg.selectAll('g.diagram')
			.each(function(d){
				print(d);
				d.externEdges.map(function(e){
					var edge = {},
							size = e.size;
					e.size = 0;
					e.source.cluster == clusterNode.cluster && e.source.copy ? e.source = clusterNode : {};
					e.target.cluster == clusterNode.cluster && e.target.copy ? e.target = clusterNode : {};
// ALESSANDRA
					// edge = d.externEdges.find(function(l){return l.source == e.source && l.target == e.target && l.size > 0});
					edge = d.externEdges.find(function(l){return ((l.source == e.source && l.target == e.target && l.size > 0) || (l.target == e.source && l.source == e.target && l.size > 0))});//controllo presenza di copie

					// edge ? edge.size += size : e.size = size;
					if(edge){
						edge.size += size;
						edge.label = concatenateStrings(edge.label,e.label);
						// if (!(edge.label.includes(e.label) || e.label.includes(edge.label))){
						//   edge.label = edge.label+"\n"+e.label;
						// }
					}else
						e.size = size;

				});//forse è necessario sommare gli archi uguali

			});

	//AGGIORNAMENTO EXTERNEDGES DEI NODI CLUSTER DELLA NET
	clusters.map(function(cl){
		cl.externEdges.map(function(e){
			var edge = {},
				size = e.size;
			e.size = 0;
			e.source.cluster == d.cluster ? e.source = clusterNode : {};
			e.target.cluster == d.cluster ? e.target = clusterNode : {};
// ALESSANDRA
			// edge = cl.externEdges.find(function(l){return l.source == e.source && l.target == e.target && l.size > 0});
			edge = cl.externEdges.find(function(l){return ((l.source == e.source && l.target == e.target && l.size > 0) || (l.target == e.source && l.source == e.target && l.size > 0))});//controllo presenza di copie

			//edge ? edge.size += size : e.size = size;
			if(edge){
				edge.size += size;
				edge.label = concatenateStrings(edge.label,e.label);
        // if (!(edge.label.includes(e.label) || e.label.includes(edge.label))){
        //   edge.label = edge.label+"\n"+e.label;
        // }
      }else
				e.size = size;

		});
		cl.externEdges = cl.externEdges.filter(e => !(e.size==0));
	});
	copymap[d.cluster] = [];
	/*forse devo modificare anche gli externEdges dei nodi cluster collassati
	manca il caso opposto, cioè quando apro un cluster devo informare gli altri chord diagram che sono cambiati i riferimenti
	dal cluster ai nodi copia siccome quando ne chiudo uno al posto delle copie ci metto il cluster ? fare delle prove*/

	div.transition()
       .duration(200)
       .style("opacity", 0);

    print("centro");
    print("("+d.x+";"+d.y+")");

    updateHulls();
}//END DELETECHORD

function removeNode(d, n, arcData){//un problema da considerare può essere che d è legato al diagram ma non al nodo collassato: controllare che vado ad espandere il nodo collassato
	var oldExternEdges = [],
		newExternEdges = [];

	d.map = [];
	/* gli internEdges che elimino diventano i nuovi externEdges (nodo interno, n), gli externEdges che elimino
	 * (n, nodo esterno) diventano archi normali (net.edges)
	 */
	 //rimarrebbe da posizionare il nodo in maniera radiale rispetto al cluster
 	positionNode(n, d, arcData);
	//aggiorno internEdges
	newExternEdges = d.internEdges.filter(e => e.source == n || e.target == n); //vecchi intern di n diventano nuovi extern
	d.internEdges = d.internEdges.filter(e => !(e.source == n || e.target == n));//elimino vecchi intern di n

	//aggiorno externEdges
	oldExternEdges = d.externEdges.filter(e => e.source == n || e.target == n);
	d.externEdges = d.externEdges.filter(e => !(e.source == n || e.target == n));

	//aggiorno d.nodes e net.nodes
	d.nodes = d.nodes.filter(dn => dn != n);
	net.nodes.push(n);

	delete n.cluster;
	n.group_data = net.nodes[0].group_data;
	d.size--;

	d.x = (d.x*(d.size+1) - n.x)/d.size //update centroid
	d.y = (d.y*(d.size+1) - n.y)/d.size //update centroid

	//aggiorno net.edges
	newExternEdges.map(function(e){//devo passare n come parametro dentro map
		var size = e.size,
        	l = {},
        	netE = {};
		e.target.id == this.id ? e.target = this : e.source = this;
		d.externEdges.push(e);

		netE = {'source': e.source, 'target': e.target, 'size': e.size, 'label': e.label};
		e.controlPoints ? netE.controlPoints = e.controlPoints : {};
		e.splineData ? netE.splineData = e.splineData : {};
		getCluster(e.source) == d.cluster ? netE.source = d : {};//controllare qui
		getCluster(e.target) == d.cluster ? netE.target = d : {};
		l = net.edges.find(function(l){return (l.source == netE.source && l.target == netE.target)});//controllare
		//senza controllo dell'ordine di source e target potrò avere due archi ripetuti ma non è un problema
		if(l)
			l.size += size;
		else
			net.edges.push(netE);
	}, n);

	oldExternEdges.map(function(e){
		var size = e.size,
        	l = {},
        	netE = {};
        e.target.id == this.id ? e.target = this : e.source = this;

        //da qui controllo se c'è già un arco esterno verso il cluster con lo stesso estremo
        netE = {'source': e.source, 'target': e.target, 'size': e.size, 'label': e.label};
				e.controlPoints ? netE.controlPoints = e.controlPoints : {};
				e.splineData ? netE.splineData = e.splineData : {};
        netE.target.id == this.id ? netE.target = d : netE.source = d;//conrollare qui

// // ALESSANDRA
// 		// l = net.edges.find(function(l){return (l.source == netE.source && l.target == netE.target && l.size > 0)});//controllare
// 		l = net.edges.find(function(l){return ((l.source == netE.source && l.target == netE.target && l.size > 0) || (l.target == netE.source && l.source == netE.target && l.size > 0))});//controllo presenza di copie
//
// 		if(l)
// 			l.size -= size;
// 		else
// 			e.size = size;

		net.edges.push(e);//lo devo pushare alla fine
	}, n);

// ALESSANDRA
	//aggiornamento externEdges cluster collassati
	clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster)),
	clusters.map(function(cl){
			var clnodes = cl.nodes,
					originalEdges = data.edges.filter(e =>	(e.source == n && clnodes.includes(e.target)) || (e.target == n && clnodes.includes(e.source)));
					originalEdges.map(function(o){cl.externEdges.push({'source': o.source, 'target': o.target, 'size': o.value, 'label': o.label});});
	});

	net.edges = net.edges.filter(e => e.size > 0);
//	net.nodes.push(d);

	updateNodes();
	updateEdges();
	updateEdges();
	expandCluster(d);

} // END REMOVENODE

function positionNode(n, diagData, arcData){
	var cx = diagData.x,
			cy = diagData.y;

	n.x = cx + 1.8*diagData.r*Math.cos(arcData.angle-Math.PI/2);
	n.y = cy + 1.8*diagData.r*Math.sin(arcData.angle-Math.PI/2);
}

function addNode(d, n){
	/*in questa funzione eseguo le seguenti cose: viene lanciata quando un nodo viene draggato all'interno dell'area di un cluster, quindi
	quando con dragEnd la posizione rilevata ricade su quella di un chord diagram aperto(forse la calcolo con la formula di una circonferenza parametrica).
	La funzione fa la seguente cosa:richiama deleteChord (o forse una sua versione che non crea il pallino con il cluster), prende il cluster
	con i dati 'd' e li aggiorna con il nodo, in particolare il nodo aggiunto viene inserito in d.nodes, poi vengono aggiornati gli d.internEdges
	e gli d.externEdges. A questo punto si richiama expandCluster su d.*/
	var newInternEdges = [],
		newExternEdges = [];

	//aggiorno internEdges
	newInternEdges = d.externEdges.filter(e => e.source == n || e.target == n);
	d.externEdges = d.externEdges.filter(e => !(e.source == n || e.target == n));
	newInternEdges.map(function(e){ d.internEdges.push(e); });
	//aggiorno externEdges
	newExternEdges = net.edges.filter(e => e.source == n || e.target == n);
	newExternEdges = newExternEdges.filter(e => !(e.source == d || e.target == d));

	n.cluster = d.cluster;//19/05/2019
	n.group_data = d;
	d.nodes.push(n);//aggiungo il nodo al cluster
	d.size ++;
	d.x = (d.x*(d.size-1) + n.x)/d.size //update centroid
	d.y = (d.y*(d.size-1) + n.y)/d.size //update centroid
	net.nodes = net.nodes.filter(node => !(node == n));


	print('toggle');
	newExternEdges.map(function(e){
			var size = e.size,
        	l = {},
					edge = 	{'source': e.source, 'target': e.target, 'size': e.size, 'label': e.label};
			e.controlPoints ? edge.controlPoints = e.controlPoints : {};
			e.splineData ? edge.splineData = e.splineData : {};
			d.externEdges.push(edge);
			d.link_count += size;
			getCluster(e.source) == d.cluster ? e.source = d : {};
			getCluster(e.target) == d.cluster ? e.target = d : {};
			e.size = 0;

// ALESSANDRA
			// l = net.edges.find(function(l){return (l.source == e.source && l.target == e.target && l.size > 0)});//controllare
			l = net.edges.find(function(l){return ((l.source == e.source && l.target == e.target && l.size > 0) || (l.target == e.source && l.source == e.target && l.size > 0))});//controllo presenza di copie

			if(l){
				l.size += size;
				l.label = concatenateStrings(l.label,e.label);
				// if (!(edge.label.includes(e.label) || e.label.includes(edge.label))){
				//   edge.label = edge.label+"\n"+e.label;
				// }
			}else
				e.size = size;
		});
	//aggiornamento degli elementi della rete
	net.edges = net.edges.filter(e => !(e.source == n || e.target == n) && e.size > 0);
	net.nodes.push(d);
	//-----------------------------------------------------------------
	updateNodes();
	updateEdges();
	expandCluster(d);
} // END ADDNODE

function releaseCluster(d){

	var clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster)),
			thisData = d;
	d3.event.preventDefault();

	//update nodes in net.nodes
	d.nodes.map(function(n){
		delete n.cluster;
		n.group_data = net.nodes[0].group_data;
		net.nodes.push(n);
	});

	net.nodes = net.nodes.filter(node => node != d);

	//update net.edges with internalEdges
	d.internEdges.map(function(e){
		net.edges.push(e);
	});


//aggiornamento externEdges cluster collassati
		clusters.map(function(cl){
				var clnodes = cl.nodes,
						nodes = d.nodes,
						originalEdges = data.edges.filter(e =>	((clnodes.indexOf(e.source)+1)&&(nodes.indexOf(e.target)+1)) || ((nodes.indexOf(e.source)+1)&&(clnodes.indexOf(e.target)+1))	);
				cl.externEdges = cl.externEdges.filter(e => !(e.source.cluster == d.cluster || e.target.cluster == d.cluster));
				originalEdges.map(function(o){cl.externEdges.push({'source': o.source, 'target': o.target, 'size': o.value, 'label': o.label});});
				});

				//aggiornamento externEdges collegati a matrici
				matrixg.selectAll("g.matrix").each(function (d, i) {
					splineEdges = d.externEdges.filter(e => e.source.cluster == thisData.cluster || e.target.cluster == thisData.cluster);
					if(splineEdges.length > 0){
						thisData.externEdges.map(function(ed){
							splineEdges.map(function(sp){
								// if(ed.source == sp.source || ed.target == sp.target){
								// 	console.log(sp.controlPoints);
								// 	ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
								// 	ed.controlPoints[0][0] = sp.controlPoints[0][0];
								// 	ed.controlPoints[0][1] = sp.controlPoints[0][1];
								// 	ed.controlPoints[1][0] = sp.controlPoints[1][0];
								// 	ed.controlPoints[1][1] = sp.controlPoints[1][1];
								// 	ed.controlPoints[2][0] = sp.controlPoints[2][0];
								// 	ed.controlPoints[2][1] = sp.controlPoints[2][1];
								// 	ed.controlPoints[3][0] = sp.controlPoints[3][0];
								// 	ed.controlPoints[3][1] = sp.controlPoints[3][1];
								// 	ed.splineData = sp.splineData;
								//
								// //	updateSplines();
								// }

								if(ed.target == sp.target){
									// console.log(sp.controlPoints);
									ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[0][0];
									ed.controlPoints[0][1] = sp.controlPoints[0][1];
									ed.controlPoints[1][0] = sp.controlPoints[1][0];
									ed.controlPoints[1][1] = sp.controlPoints[1][1];
									ed.controlPoints[2][0] = sp.controlPoints[2][0];
									ed.controlPoints[2][1] = sp.controlPoints[2][1];
									ed.controlPoints[3][0] = sp.controlPoints[3][0];
									ed.controlPoints[3][1] = sp.controlPoints[3][1];
									ed.splineData = sp.splineData;
								}
								if(ed.source == sp.source){
									// console.log(sp.controlPoints);
									ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[0][0];
									ed.controlPoints[0][1] = sp.controlPoints[0][1];
									ed.controlPoints[1][0] = sp.controlPoints[1][0];
									ed.controlPoints[1][1] = sp.controlPoints[1][1];
									ed.controlPoints[2][0] = sp.controlPoints[2][0];
									ed.controlPoints[2][1] = sp.controlPoints[2][1];
									ed.controlPoints[3][0] = sp.controlPoints[3][0];
									ed.controlPoints[3][1] = sp.controlPoints[3][1];
									ed.splineData = sp.splineData;
								}
								if(ed.target == sp.source){
									// console.log(sp.controlPoints);
									ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[3][0];
									ed.controlPoints[0][1] = sp.controlPoints[3][1];
									ed.controlPoints[1][0] = sp.controlPoints[2][0];
									ed.controlPoints[1][1] = sp.controlPoints[2][1];
									ed.controlPoints[2][0] = sp.controlPoints[1][0];
									ed.controlPoints[2][1] = sp.controlPoints[1][1];
									ed.controlPoints[3][0] = sp.controlPoints[0][0];
									ed.controlPoints[3][1] = sp.controlPoints[0][1];
									ed.splineData = sp.splineData;
								}
								if(ed.source == sp.target){
									// console.log(sp.controlPoints);
									ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[3][0];
									ed.controlPoints[0][1] = sp.controlPoints[3][1];
									ed.controlPoints[1][0] = sp.controlPoints[2][0];
									ed.controlPoints[1][1] = sp.controlPoints[2][1];
									ed.controlPoints[2][0] = sp.controlPoints[1][0];
									ed.controlPoints[2][1] = sp.controlPoints[1][1];
									ed.controlPoints[3][0] = sp.controlPoints[0][0];
									ed.controlPoints[3][1] = sp.controlPoints[0][1];
									ed.splineData = sp.splineData;
								}
							});
						});
					}
				});

	//update net.edges with externEdges: elimino tutti gli archi verso cluster e ci metto quelli externEdges
	net.edges = net.edges.filter(e => !(e.source == d || e.target == d));//controllare
	d.externEdges.map(function(e){
		net.edges.push(e);
	});

	hexColor = d.color.split("(")[1] ? convertRGBtoHex(d.color) : d.color;
	if(d.nodes[0].community){
		palette.find(function(p){return p.color==hexColor}).element = "hull";
		palette.find(function(p){return p.color==hexColor}).used = true;
	}else{
		palette.find(function(p){return p.color==hexColor}).used = false;
		palette.find(function(p){return p.color==hexColor}).element = "";
	}

	updateNodes();
	updateEdges();
	updateEdges();
  updateHulls();//non devo mettere questa, ma una funzione che crea un nuovo hull
}

function translateInternalNodes(r, cx, cy, cluster){
	/*var radialDistance = Math.sqrt(Math.pow(cx-x,2)+Math.pow(cy-y,2));
	Math.pow(cx-x,2)+Math.pow(cy-y,2) < Math.pow(r,2); funzione di controllo se un nodo è dentro al chord*/
	var r1prec = 0,
		r2prec = r,
		alpha = 0.6,
		eps = 1/(2*net.nodes.length+1),
		traslationNeeded,
		nodes = net.nodes.filter(n => !(n.cluster === cluster));
	nodes.sort(function(a,b){
		return (Math.pow(cx-a.x,2)+Math.pow(cy-a.y,2)) - (Math.pow(cx-b.x,2)+Math.pow(cy-b.y,2));
	});
	nodes.length > 0 ? traslationNeeded = Math.sqrt(Math.pow(cx-nodes[0].x,2)+Math.pow(cy-nodes[0].y,2)) - 6 < r : traslationNeeded = false;
	if(traslationNeeded){
		nodes.map(function(n){
			var x1 = n.x - cx, //distanza lungo x dal centro
				y1 = n.y - cy, //distanza lungo y dal centro
				r1 = Math.sqrt(Math.pow(cx-n.x,2)+Math.pow(cy-n.y,2)), //distanza nodo centro circonferenza
				delta = r1 - r1prec,
				//r2 = (r-r1) + r1*0.5, //valore di traslazione in direzione radiale(arrivo al bordo e ci aggiungo qualcosa)
				r2 = r2prec + delta*alpha,
				d = r2 > r1 ? r2 - r1 : 0; //d indica il valore di traslazione in direzione radiale
				dx = d * x1/r1, //traslazione lungo x
				dy = d * y1/r1; //traslazione lungo y
			r1prec = r1;
			r2prec = r2;
			alpha -= eps;
			n.x += dx;//devo considerare il minimo tra la nuova posizione e quella vecchia
			n.y += dy;
			n.traslations ? {} : n.traslations = [];
			n.traslations.push({'cl':cluster, 'x':dx, 'y':dy});
			print("alpha: "+alpha+" dx:"+dx+" dy: "+dy);
		});
	}
	updateNodes();
	updateEdges();
	updateEdges();
}

function translateBackInternalNodes(cluster){
	var traslatedNodes = net.nodes.filter(n => n.traslations && (typeof n.cluster != "undefined" ? !(cluster == n.cluster) : true) );//typeof n.cluster != "undefined" ? (!n.cluster.equals(cluster) : true)
	print(traslatedNodes);
	if(traslatedNodes)
		traslatedNodes.map(function(n){
			var tr = n.traslations.filter(t => t.cl == cluster);
			print(tr);
			if(tr.length > 0){
				n.x = n.x - tr[0].x;
				n.y = n.y - tr[0].y;
			}
			n.traslations = n.traslations.filter(t => t.cl != cluster);
			print(n.x+" "+n.y);
		});
}


function radius(cx,cy,x,y){
	return Math.sqrt(Math.pow(cx-x,2) + Math.pow(cy-y,2));
}
function acos(cX, r, x){
	return Math.acos((x - cX)/r);
}
function asin(cY, r, y){
	return Math.asin((y - cY)/r);
}

function atan2(cx,cy,x,y){
	return Math.atan2(y-cy,x-cx);
}

function exchangeCoordinates(n1, n2){
	var tmp = {'x': n1.x, 'y': n1.y};
	n1.x = n2.x;
	n1.y = n2.y;
	n2.x = tmp.x;
	n2.y = tmp.y;
}

function project(nodes, cx, cy, r, cluster){
	return nodes.map(function(n){
		var copy = {},
		fx = cx + r*Math.cos(acos(cx, radius(cx,cy,n.x,n.y), n.x)),
		fy = cy + r*Math.sin(asin(cy, radius(cx,cy,n.x,n.y), n.y));
	copy = {'number': copyNum, 'id':"copy"+ copyNum++, 'cluster': cluster, 'x': fx, 'y': fy, 'fx': fx, 'fy': fy, 'copy': true, 'bonded': false};
	copymap[cluster][copy.number] = n.id;

	return copy;//eliminare gli elementi grafici (nodi proiettati e link interni)
	});
}

function intersect(cX, cY, r, x1, y1, x2, y2, src, trg){//(x1,y1) sono le coordinate del nodo nel cluster, (x2,y2) quelle del nodo esterno collegato
  var m = (y2-y1)/(x2-x1),
      q = (x2*y1-x1*y2)/(x2-x1),
      a = 1+Math.pow(m,2),
      b = m*q-cX-cY*m,
      c = Math.pow(cX,2) + Math.pow(q,2) - 2*cY*q + Math.pow(cY,2) - Math.pow(r,2),
      xsol1 = (-b + Math.sqrt(Math.pow(b,2)-a*c))/a,
      xsol2 = (-b - Math.sqrt(Math.pow(b,2)-a*c))/a,
      ysol1 = m*xsol1 + q,
      ysol2 = m*xsol2 + q,
	  dist1,dist2;
  if(Math.sqrt(Math.pow(x2-cX,2) + Math.pow(y2-cY,2)) > r + 0.001){
      dist1 = Math.sqrt(Math.pow(x2-xsol1,2) + Math.pow(y2-ysol1,2));
      dist2 = Math.sqrt(Math.pow(x2-xsol2,2) + Math.pow(y2-ysol2,2));
  }else{
	  dist1 = Math.sqrt(Math.pow(x1-xsol1,2) + Math.pow(y1-ysol1,2));
      dist2 = Math.sqrt(Math.pow(x1-xsol2,2) + Math.pow(y1-ysol2,2));
  }

  if(dist1<dist2)
    return {x: xsol1, y: ysol1, source: src, target: trg};
  else
    return {x: xsol2, y: ysol2, source: src, target: trg};
}

//FUNZIONI DI PREPARAZIONE PER IL CHORD

function createAngles(nodes, cx, cy, cluster){
	var listAngles = calculateAngles(nodes, cx, cy);

    listAngles[0].startAngle = (listAngles[listAngles.length-1].angle + listAngles[0].angle + 2*Math.PI)/2 - 2*Math.PI;
    listAngles[0].endAngle = (listAngles[1].angle + listAngles[0].angle)/2;
	for (i = 1; i < listAngles.length-1; i++){
		//non ho fatto il controllo dei nodi copia vicini uguali
		listAngles[i].startAngle = (listAngles[i-1].angle + listAngles[i].angle)/2;
		listAngles[i].endAngle = (listAngles[i+1].angle + listAngles[i].angle)/2;
	}
	listAngles[listAngles.length-1].startAngle = (listAngles[listAngles.length-2].angle + listAngles[listAngles.length-1].angle)/2;
	listAngles[listAngles.length-1].endAngle = listAngles[0].startAngle + 2*Math.PI;

	print('listAngles');
	print(listAngles);

	listAngles = groupCopies(listAngles, cluster);

	return listAngles;
}

//funzione di post-processing angles effettuata solo su archi non vincolati
function weighIntervals2(obj, matrix){
	var listAngles = obj.listAngles,
		map = obj.map,
		deltaAlpha, deltaA, deltaB, B2, A1, cond1, cond2;

	for (var i = 0; i < listAngles.length; i++) {
		listAngles[i].deg = rowSum(matrix, i);
		listAngles[i].deg == 0 ? listAngles[i].deg = 0.1 : {};
	}
	//INIZIALIZZAZIONE ultimo-primo:-----------------------------
	if(listAngles[0].endAngle < 2*Math.PI) {
		listAngles[0].endAngle += 2*Math.PI;
		listAngles[0].startAngle += 2*Math.PI;
	}
	B2 = listAngles[0].endAngle;
	A1 = listAngles[listAngles.length-1].startAngle;
	deltaAlpha = B2 - A1;
	if(!listAngles[0].bonded || !listAngles[listAngles.length-1].bonded){
		deltaA = deltaAlpha*(listAngles[listAngles.length-1].deg/(listAngles[listAngles.length-1].deg + listAngles[0].deg));
		cond1 = (deltaA < Math.abs(listAngles[listAngles.length-1].endAngle - listAngles[listAngles.length-1].startAngle)) && !listAngles[listAngles.length-1].bonded;
		cond2 = (deltaA > Math.abs(listAngles[listAngles.length-1].endAngle - listAngles[listAngles.length-1].startAngle)) && !listAngles[0].bonded;
		if(cond1 || cond2){
			listAngles[listAngles.length-1].endAngle = listAngles[listAngles.length-1].startAngle + deltaA;
			listAngles[0].startAngle = listAngles[listAngles.length-1].endAngle;
		}
	}
	listAngles[0].endAngle -= 2*Math.PI;
	listAngles[0].startAngle -= 2*Math.PI;
	//-----------------------------------------------------------
	for (var i = 0; i < listAngles.length-1; i++) {
		B2 = listAngles[i+1].endAngle;
		A1 = listAngles[i].startAngle;
		deltaAlpha = B2 - A1; //intervallo che dato dalla somma dei due intervalli
		if(!listAngles[i].bonded || !listAngles[i+1].bonded){
			deltaA = deltaAlpha*(listAngles[i].deg/(listAngles[i].deg + listAngles[i+1].deg));
			cond1 = (deltaA < listAngles[i].endAngle - listAngles[i].startAngle) && !listAngles[i].bonded;
			cond2 = (deltaA > listAngles[i].endAngle - listAngles[i].startAngle) && !listAngles[i+1].bonded;
			print("conditions weigh2");
			print(cond1);
			print(cond2);
			if(cond1 || cond2){
				listAngles[i].endAngle = listAngles[i].startAngle + deltaA;
				listAngles[i+1].startAngle = listAngles[i].endAngle;
			}

			/*else{
				listAngles[i].endAngle = listAngles[i].startAngle + deltaA;
				listAngles[i+1].startAngle = listAngles[i].endAngle;
			}*/
		}
	}
	print("weighIntervals listAngles:");
	print(listAngles);
}

function calculateAngles(nodes, cx, cy){
	var listAngles = nodes.map(function(n){
			var alpha = atan2(cx, cy, n.x, n.y) + Math.PI/2;
			if(alpha < 0)
				alpha += 2*Math.PI;
			//print("angle params "+n.id+": alpha "+alpha+" cx "+cx+" n.x "+n.x);
			return {index: n.number, angle: alpha, bonded: n.bonded};
		})
	listAngles.sort(function (a, b) {
      return a.angle - b.angle;
    });
    return listAngles;
}

function groupCopies(l, cluster){//l=listAngles
	var obj = {},
		map = [],//mappaggio tra nodi copia ed indici della matrice del chord
		newList = [],//nuova lista di angoli con i nodi copia vicini accorpati
		j = 0;//indice mappaggio
//inizializzazione
	map[0] = [];
	map[0].push(l[0].index);
	newList[0] = {'index': 0, 'startAngle': l[0].startAngle, 'endAngle': l[0].endAngle, 'bonded': l[0].bonded};
//inizio controllo
	for (var i = 1; i < l.length; i++) {
		if(cluster[l[i].index] == cluster[l[i-1].index]){//se sono dello stesso tipo
			map[j].push(l[i].index);
			newList[j].endAngle = l[i].endAngle;
		}else{//altrimenti vado avanti e ne creo uno nuovo
			j++;
			map[j] = [];
			map[j].push(l[i].index);
			newList[j] = {'index': j, 'startAngle': l[i].startAngle, 'endAngle': l[i].endAngle, 'bonded': l[i].bonded};
		}
	}

//chiusura tra primo e ultimo
	if(cluster[l[0].index] == cluster[l[l.length-1].index]){
		newList[0].startAngle = newList[j].startAngle;//aggiorno gli angoli del primo della lista
		newList[0].endAngle += 2*Math.PI;
		newList.pop();//elimino l'ultimo intervallo di angoli che ho incorporato nel primo
		map[j].map(function(i){map[0].push(i);});//aggiorno la lista di indici del primo gruppo con quelli dell'ultimo gruppo
		map.pop(); //elimino la lista di indici dell'ultimo gruppo
	}

	obj.map = map;//questo servirà per costruire la matrice di adiacenza e il chord(colori)
	obj.listAngles = newList;//questa è la nuova lista di angoli raggruppati
	return obj;
}



//FUNZIONI DI PREPARAZIONE PER IL CHORD: 130419-----------------------------------------------------------------------------------
function defineIntervals(nodes, cx, cy, cluster){//questa andrebbe messa al posto di createAngles
	var listAngles = calculateAngles(nodes, cx, cy),//index; angle
		n = listAngles.length,
		dangle = 0.02//1*Math.PI/180; //4 gradi
	/*quando aggiungo il dangle devo mettere un controllo:
	se el.endAngle = el.angle + dangle supera lo startAngle successivo, allora non metto dangle*/
	/*listAngles.map(function(el){
		el.startAngle = el.angle-dangle/2;
		el.endAngle = el.angle+dangle/2;
	});
	*/
	listAngles.map(function(el){
		el.startAngle = el.angle;//-dangle/2;
		el.endAngle = el.angle;//+dangle/2;
	});

/*se la differenza tra angoli è minore di dangle, prendo il punto medio, altrimenti aggiungo il dangle;
così anche sulla finzione sotto salto il controllo*/
	/*for (var i = 1; i < listAngles.length+1; i++) {
		listAngles[i%n].startAngle - dangle/2 > listAngles[(i-1)%n].endAngle ? listAngles[i%n].startAngle -= dangle/2 : {}
		listAngles[i%n].endAngle + dangle/2 < listAngles[(i+1)%n].startAngle ? listAngles[i%n].endAngle += dangle/2 : {}
	}*/

	for (var i = 1; i < listAngles.length+1; i++) {//probabilmente fa la stessa cosa dell'altro codice sopra
		if((listAngles[i%n].startAngle - listAngles[(i-1)%n].endAngle) > dangle){
			listAngles[i%n].startAngle -= dangle/2;
			listAngles[(i-1)%n].endAngle += dangle/2;
		}
	}

	if(listAngles[0].endAngle < 2*Math.PI) {
		listAngles[0].endAngle += 2*Math.PI;
		listAngles[0].startAngle += 2*Math.PI;
	}
	if((listAngles[0].startAngle - listAngles[listAngles.length-1].endAngle) > dangle){
		listAngles[0].startAngle -= dangle/2;
		listAngles[listAngles.length-1].endAngle += dangle/2;
	}

	listAngles[0].endAngle -= 2*Math.PI;
	listAngles[0].startAngle -= 2*Math.PI;


	/*devo fare un controllo una volta sola e cambiare in maniera contemporanea (i+1).startAngle ed (i).endAngle*/

	listAngles = groupCopies(listAngles, cluster);
	print("defineIntervals listAngles");
	print(listAngles);
	return listAngles;//qui viene realizzato il passo 1
}

//funzione di post processing pesando tutti gli archi di circonferenza con vincoli quando lo spazio tra 2 angoli < 0.02
function weighIntervals(obj, matrix){//questa è quella che andrà messa dopo la creazione della matrice
	var listAngles = obj.listAngles,
		map = obj.map,
		deltaAlpha, deltaA, deltaB, B2, A1;

	for (var i = 0; i < listAngles.length; i++) {
		listAngles[i].deg = rowSum(matrix, i);
		listAngles[i].deg == 0 ? listAngles[i].deg = 0.1 : {};
	}
	//INIZIALIZZAZIONE ultimo-primo:-----------------------------
	if(listAngles[0].endAngle < 2*Math.PI) {
		listAngles[0].endAngle += 2*Math.PI;
		listAngles[0].startAngle += 2*Math.PI;
	}
	B2 = listAngles[0].endAngle;
	A1 = listAngles[listAngles.length-1].startAngle;
	deltaAlpha = B2 - A1;

	deltaA = deltaAlpha*(listAngles[listAngles.length-1].deg/(listAngles[listAngles.length-1].deg + listAngles[0].deg));
	if(listAngles[0].startAngle - listAngles[listAngles.length-1].endAngle > 0.02){
		if(deltaA < Math.abs(listAngles[listAngles.length-1].endAngle - listAngles[listAngles.length-1].startAngle))
			listAngles[0].startAngle = listAngles[listAngles.length-1].endAngle;
		else if(deltaA > listAngles[0].startAngle - listAngles[listAngles.length-1].startAngle)
			listAngles[listAngles.length-1].endAngle = listAngles[0].startAngle;
		else{
			listAngles[listAngles.length-1].endAngle = listAngles[listAngles.length-1].startAngle + deltaA;
			listAngles[0].startAngle = listAngles[listAngles.length-1].endAngle;
		}
	}
	else{
		listAngles[0].startAngle = (listAngles[0].startAngle - listAngles[listAngles.length-1].endAngle)/2;
		listAngles[listAngles.length-1].endAngle = (listAngles[0].startAngle - listAngles[listAngles.length-1].endAngle)/2;
	}
	listAngles[0].endAngle -= 2*Math.PI;
	listAngles[0].startAngle -= 2*Math.PI;
	//-----------------------------------------------------------
	for (var i = 0; i < listAngles.length-1; i++) {
		B2 = listAngles[i+1].endAngle;
		A1 = listAngles[i].startAngle;
		deltaAlpha = B2 - A1; //intervallo che dato dalla somma dei due intervalli

		deltaA = deltaAlpha*(listAngles[i].deg/(listAngles[i].deg + listAngles[i+1].deg));
		if(listAngles[i+1].startAngle - listAngles[i].endAngle > 0.02){
			if(deltaA < listAngles[i].endAngle - listAngles[i].startAngle)
				listAngles[i+1].startAngle = listAngles[i].endAngle;
			else if(deltaA > listAngles[i+1].startAngle - listAngles[i].startAngle)
				listAngles[i].endAngle = listAngles[i+1].startAngle;
			else{
				listAngles[i].endAngle = listAngles[i].startAngle + deltaA;
				listAngles[i+1].startAngle = listAngles[i].endAngle;
			}
		}
		else{
			listAngles[i+1].startAngle = (listAngles[i].endAngle + listAngles[i+1].startAngle)/2;
			listAngles[i].endAngle = (listAngles[i].endAngle + listAngles[i+1].startAngle)/2;
		}
	}
	print("weighIntervals listAngles:");
	print(listAngles);
}
//--------------------------------------------------------------------------------------------------------------------------------

function buildSpline(p1, p2, p3, r, cx, cy){
	//p1 = external point
	//p2 = old position
	//p3 = shifted position
	var dP1P2 = Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2)),
		delta = 0.2*r,
		dC1P1 = dP1P2 - 2*delta,
		c1 = {'x': p1.x + (dC1P1/dP1P2)*(p2.x-p1.x), 'y': p1.y + (dC1P1/dP1P2)*(p2.y-p1.y)},
		dC2P1 = dP1P2 - delta,
		c2 = {'x': p1.x + (dC2P1/dP1P2)*(p2.x-p1.x), 'y': p1.y + (dC2P1/dP1P2)*(p2.y-p1.y)},
		linedata = [{'x':p1.x, 'y':p1.y},  c2],
		alpha = atan2(cx, cy, c2.x, c2.y) < 0 ? atan2(cx, cy, c2.x, c2.y) + 2*Math.PI : atan2(cx, cy, c2.x, c2.y),
		beta = atan2(cx, cy, p3.x, p3.y) < 0 ? atan2(cx, cy, p3.x, p3.y) + 2*Math.PI : atan2(cx, cy, p3.x, p3.y),
		theta = Math.sign(beta-alpha) * Math.PI/16,
		r2 = r + delta/2,
		i = 1;

		//print('alpha: '+alpha +'	beta:'+beta+' theta:'+theta);

		while (alpha > beta ? alpha + i*theta > beta : alpha + i*theta < beta){
			//print('angle: '+(alpha + i*theta) +'	beta:'+beta);
			linedata.push({'x': cx + r2*Math.cos(alpha + i*theta), 'y': r2*Math.sin(alpha + i*theta) + cy});
			i++;
		}

		linedata.push({'x':p3.x, 'y':p3.y});

		return linedata;
}

function createAdjMatrix(edges, nodes, map){
	var adjacencyMatrix = Array(map.length).fill(0).map(()=>Array(map.length).fill(0));
	if(edges){
		edges.map(function(e){
			adjacencyMatrix[getIndexOf(map, e.source.number)[0]][getIndexOf(map, e.target.number)[0]] = 1;
			adjacencyMatrix[getIndexOf(map, e.target.number)[0]][getIndexOf(map, e.source.number)[0]] = 1;
		});
	}
	return adjacencyMatrix;
}

function getIndexOf(arr, n) {
  for (var i = 0; i < arr.length; i++) {
    var index = arr[i].indexOf(n);
    if (index > -1) {
      return [i, index];
    }
  }
}

function rowSum(matrix, i){
	var sum = 0;
	for (var j = 0; j < matrix[i].length; j++) {
		sum += matrix[i][j];
	}
	return sum;
}

function circularSort(a,b){//effettua l'ordinamento circolare
		if(Math.abs(a - b) > Math.PI)
			return b - a;
		else
			return a - b;
	}
