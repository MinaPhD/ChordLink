
var copymap = [],
	clnodes = [],
	copyNum = 0,
	config = {
				cellSize: 16,
				cellColor: "#FFFFFF",//bianco
				cellColorLink: "#000000",//nero
				cellColorDiag: "#0000FF",//questo colore cambia in base al colore del cluster nella funzione di creazine dell'oggetto grafico
				cellStroke: "lightgrey",
				cellStrokeWidth: 1.5,
				cellStrokeOpacity: 1.0,
				ordering: 'none',
				allowLabels: false,
				margin: 30
			};
/*
			// default visual properties
				this.config.cellSize = config && 'cellsize' in config ? config.cellsize : 10;
				this.config.cellColor = config && 'cellcolor' in config ? config.cellcolor : "#FFFFFF";
				this.config.cellColorLink = config && 'cellcolorlink' in config ? config.cellcolorlink : "#000000";
				this.config.cellColorDiag = config && 'cellcolordiag' in config ? config.cellcolordiag : "#0000FF";
				this.config.cellStroke = config && 'cellstroke' in config ? config.cellstroke : "lightGray"; //"#0000FF";
				this.config.cellStrokeWidth = config && 'cellstrokewidth' in config ? config.cellstrokewidth : 1;

				this.config.margin = config && 'margin' in config ? config.margin : 30;
				this.config.bridgeStroke = config && 'bridgestroke' in config ? config.bridgestroke : "lightGray"; //"#0000FF";
				this.config.bridgeStrokeWidth = config && 'bridgestrokewidth' in config ? config.bridgestrokewidth : 1;
				this.config.ordering = config && 'ordering' in config ? config.ordering : 'none';
				this.config.allowLabels = config && 'allowlabels' in config ? config.allowlabels : true;
*/


/*
clNode-->d:{
						cluster,
						nodes = [],
						size,
						color,
						link_count,
						x,
						y,
						externEdges = [],
						internEdges = [],
						kThreshold,
						opacityScale
						}
*/
function expandMatrix(d){
	if(event.ctrlKey){
		d3.event.preventDefault();
		releaseCluster(d);
	} else {
	if(d3.event.type!="end")//dragevent
		d3.event.preventDefault();

	if (simulation) simulation.stop();
	copymap[d.cluster] = [];
	clnodes[d.cluster] = d.nodes;
	copyNum = 0;


		//cluster = d.cluster,// >> node id should be unique during the whole program because we use the same viewmatrix array to create svg nodes
				//	sticky: false, fixed: false, // indicates if the node is fixed in the force layout
	var	nodes = d.nodes,
			externalEd= d.externEdges,
			internalEdges = d.internEdges,
			x = nodes.map(function(n){return n.x}),
		  y = nodes.map(function(n){return n.y}),
		  minX = Math.min.apply(null,x),
		  maxX = Math.max.apply(null,x),
		  minY = Math.min.apply(null,y),
		  maxY = Math.max.apply(null,y),
		  cx = (maxX+minX)/2,	//centro del cluster
		  cy = (maxY+minY)/2,
		  nodeSize = d.cluster.size,// * _this.config.cellSize,
			intersectionNodes = [],
			width = d.cluster.size * config.cellSize + config.margin, //config.cellSize e config.margin vanno definiti a priori, fanno parte delle config definite da nodetrix
			height = d.cluster.size * config.cellSize + config.margin, // size of the box to avoid overlap in d3cola and visual size
			hexColor;

				d.x = cx;
				d.y = cy;
				d.dragged = false;

				hexColor = d.color.split("(")[1] ? convertRGBtoHex(d.color) : d.color;

				palette.find(function(p){return p.color== hexColor}).element = "cluster";
				palette.find(function(p){return p.color== hexColor}).used = true;

//--------------------------MATRIX REORDERING-------------------------------------------------
					//1. creiamo la struttura dati della matrice
					var matrixData = createDataMatrix(nodes, internalEdges);
					//2. dobbiamo ottenere la matrice di adiacenza dei valori a partire da data
					adjacency = getMatrixValues(matrixData);
					//3. applichiamo reorder.leaforder(adjacency) dove adjacency è la matrice costruita prima
					leaforder = reorder.leafOrder().distance(science.stats.distance.manhattan)(adjacency);
					//4. scambiamo l'ordine dei nodi secondo il risultato di leaforder
					nodes = switchNodes(nodes, leaforder);
					//5. ricostruiamo la matrice dei dati
					matrixData = createDataMatrix(nodes, internalEdges);
//--------------------------MATRIX REORDERING-------------------------------------------------


//costruzione della regione cuscinetto

				var sideSize, //lato regione cuscinetto
			      dimensioneCuscinetto = 40,
			      newMinX = 0,
			      newMaxX = 0,
			      newMinY = 0,
			      newMaxY = 0;

				if (maxY-minY > maxX-minX){
					newMinY = - dimensioneCuscinetto/2;
					sideSize=maxY-minY;
					newMaxY = sideSize + dimensioneCuscinetto;

					newMinX = - dimensioneCuscinetto/2;
					newMaxX = dimensioneCuscinetto + sideSize;
				}
				else {//maxX-minX
					newMinX = - dimensioneCuscinetto/2;
					sideSize=maxX-minX;
					newMaxX = sideSize + dimensioneCuscinetto;
					newMinY = - dimensioneCuscinetto/2;
					newMaxY = dimensioneCuscinetto + sideSize;
				}

				var distance = nodes.map(function(n){return Math.sqrt(Math.pow(cx-n.x,2) + Math.pow(cy-n.y,2));}), // distanza nodo-centro
				  /*  r = Math.max.apply(null, distance) + 6, //raggio del cluster
				    intersections = [],	//calcolo delle intersezioni NB mettere a posto le intersezioni.*/
				    copyNodes = [],	//nodi duplicati
				    cluster = copymap[d.cluster],
						clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster));//individuo i nodi cluster collassati nella rete

				translateInternalNodes((config.cellSize*matrixData.length + dimensioneCuscinetto/2)*Math.sqrt(2)/2, cx, cy, d.cluster); // butta fuori dalla regione del cluster in direzione radiale i nodi che non sono del cluster

				minX = cx - config.cellSize*matrixData.length/2;
				minY = cy - config.cellSize*matrixData.length/2;
				//INTERSEZIONI
				/*intersections = externalEd.map(function(e){return intersect(cx, cy, r, e.source.x, e.source.y, e.target.x, e.target.y, e.source.id, e.target.id, minX + newMinX, minX + config.cellSize*matrixData.length + dimensioneCuscinetto/2, minY + newMinY, minY + config.cellSize*matrixData.length + dimensioneCuscinetto/2)})
				print("intersections");
				print(intersections);

				intersectionNodes = intersections.map(function(el){
					var id = nodes.map(function(n){return n.id}).indexOf(el.source)+1 ? el.source : el.target, //id del nodo originale interno
						copy = {'number': copyNum, 'id': "copy"+ copyNum++, 'cluster': d.cluster, 'x': el.x, 'y': el.y, 'fx': el.x, 'fy': el.y, 'copy':true, 'bonded': true},
						edge = {};//arco di externalEd che contiene il nodo a cui si deve collegare copy
					cluster[copy.number] = id;//cluster = copymap[d.cluster]
					if(id == el.source){
						edge = externalEd.find(function(e){return e.source.id == el.target || e.target.id == el.target;});
						el.source = copy;//forse questi si possono togliere
						el.target = edge.source.id == el.target ? edge.source : edge.target;
						print(el.target);
						print(el.source);
						//el.target = net.nodes.find(function(n){return n.id == el.target;});//forse questi si possono togliere
						//associo gli archi ai nodi duplicati
						externalEd.map(function(l){(l.source.id == cluster[copy.number] && l.target.id == el.target.id) ? l.source = copy : {}});//finire
					}else{
						edge = externalEd.find(function(e){return e.source.id == el.source || e.target.id == el.source;});
						el.source = edge.source.id == el.source ? edge.source : edge.target;
						print(el.source);
						//el.source = net.nodes.find(function(n){return n.id == el.source;});//forse questi si possono togliere
						el.target = copy;//forse questi si possono togliere
						//associo gli archi ai nodi duplicati
						externalEd.map(function(l){(l.source.id == el.source.id && l.target.id == cluster[copy.number]) ? l.target = copy : {}});//finire
					}
					return copy;
				});

				// copyNodes = projectionNodes.concat(intersectionNodes);
				copyNodes = intersectionNodes;
		    print('copyNodes');
		    print(copyNodes);
		    d.copies = copyNodes;*/

/*	copy = {'number': copyNum,
						'id': "copy"+ copyNum++,
						'cluster': d.cluster,
						'x': el.x,
						'y': el.y,
						'fx': el.x,
						'fy': el.y,
						'copy':true,
						'bonded': true}
*/

				d.matrixCopyNodes = {
					top: [],
					right: [],
					bottom: [],
					left: []
				};

//controllare la posizione di maxX e maxY che non sia la x e la y delle caselle estreme
//ho cambiato le coordinate max e ho aggiunto 1, perchè guardando la funzione di creazione delle righe e celle, c'è una traslazione di 1 rispetto ad x e ad y.

				d.matrixCopyNodes.top = matrixData[0].map(function(el,j){//matrixData[j][j].node è il nodo corrispondente
					copy = {		'number': copyNum,
											'id': "copy"+ copyNum++,
											'cluster': d.cluster,
											'x': minX + config.cellSize*j + config.cellSize/2,
											'y': minY,
											'fx': minX + config.cellSize*j + config.cellSize/2,
											'fy': minY,
											'copy':true,
											'bonded': true	};
					cluster[copy.number] = matrixData[j][j].node.id;
					return copy;
				});

				d.matrixCopyNodes.bottom = matrixData[0].map(function(el,j){//matrixData[j][j].node è il nodo corrispondente
					copy = {		'number': copyNum,
											'id': "copy"+ copyNum++,
											'cluster': d.cluster,
											'x': minX + config.cellSize*j + config.cellSize/2,
											'y': minY + config.cellSize*matrixData.length,
											'fx': minX + config.cellSize*j + config.cellSize/2,
											'fy': minY + config.cellSize*matrixData.length,
											'copy':true,
											'bonded': true	};
					cluster[copy.number] = matrixData[j][j].node.id;
					return copy;
				});

				d.matrixCopyNodes.right = matrixData[0].map(function(el,j){//matrixData[j][j].node è il nodo corrispondente
					copy = {		'number': copyNum,
											'id': "copy"+ copyNum++,
											'cluster': d.cluster,
											'x': minX + config.cellSize*matrixData.length,
											'y': minY  + config.cellSize*j + config.cellSize/2,
											'fx': minX + config.cellSize*matrixData.length,
											'fy': minY  + config.cellSize*j + config.cellSize/2,
											'copy':true,
											'bonded': true	};
					cluster[copy.number] = matrixData[j][j].node.id;
					return copy;
				});

				d.matrixCopyNodes.left = matrixData[0].map(function(el,j){//matrixData[j][j].node è il nodo corrispondente
					copy = {		'number': copyNum,
											'id': "copy"+ copyNum++,
											'cluster': d.cluster,
											'x': minX,
											'y': minY  + config.cellSize*j + config.cellSize/2,
											'fx': minX,
											'fy': minY  + config.cellSize*j + config.cellSize/2,
											'copy':true,
											'bonded': true	};
					cluster[copy.number] = matrixData[j][j].node.id;
					return copy;
				});

				externalEd.map(function(e){
					var side = sideAssignment(cx, cy, e.source, e.target, minX, minX + config.cellSize*matrixData.length, minY, minY + config.cellSize*matrixData.length, d),
							node = d.nodes.indexOf(e.source)+1 ? d.nodes.find(n=>n==e.source) : d.nodes.find(n=>n==e.target),
							copy = {};
					e.controlPoints == undefined ? e.controlPoints=[] : {};
					console.log(node);
					console.log(e);

					if(side == "left"){
						copy = d.matrixCopyNodes.left.find(n => cluster[n.number] == node.id);
						if(d.nodes.indexOf(e.source)+1){
							e.source = copy;
							e.controlPoints[0] = [copy.x,copy.y];
							e.controlPoints[1] = [copy.x - dimensioneCuscinetto/2,copy.y];
							if(e.controlPoints[2] == undefined){
								e.controlPoints[2] = [e.target.x,e.target.y];
								e.controlPoints[3] = [e.target.x,e.target.y];
							}
						} else{
							e.target = copy;
							e.controlPoints[2] = [copy.x - dimensioneCuscinetto/2,copy.y];
							e.controlPoints[3] = [copy.x,copy.y];
							if(e.controlPoints[0] == undefined){
								e.controlPoints[0] = [e.source.x,e.source.y];
								e.controlPoints[1] = [e.source.x,e.source.y];
							}
						}
					}else if(side == "right"){
						copy = d.matrixCopyNodes.right.find(n => cluster[n.number] == node.id);
						if(d.nodes.indexOf(e.source)+1){
							e.source = copy;
							e.controlPoints[0] = [copy.x,copy.y];
							e.controlPoints[1] = [copy.x + dimensioneCuscinetto/2,copy.y];
							if(e.controlPoints[2] == undefined){
								e.controlPoints[2] = [e.target.x,e.target.y];
								e.controlPoints[3] = [e.target.x,e.target.y];
							}
						} else{
							e.target = copy;
							e.controlPoints[2] = [copy.x + dimensioneCuscinetto/2,copy.y];
							e.controlPoints[3] = [copy.x,copy.y];
							if(e.controlPoints[0] == undefined){
								e.controlPoints[0] = [e.source.x,e.source.y];
								e.controlPoints[1] = [e.source.x,e.source.y];
							}
						}
					}else if(side == "top"){
						copy = d.matrixCopyNodes.top.find(n => cluster[n.number] == node.id);
						if(d.nodes.indexOf(e.source)+1){
							e.source = copy;
							e.controlPoints[0] = [copy.x,copy.y];
							e.controlPoints[1] = [copy.x,copy.y - dimensioneCuscinetto/2];
							if(e.controlPoints[2] == undefined){
								e.controlPoints[2] = [e.target.x,e.target.y];
								e.controlPoints[3] = [e.target.x,e.target.y];
							}
						} else{
							e.target = copy;
							e.controlPoints[2] = [copy.x,copy.y - dimensioneCuscinetto/2];
							e.controlPoints[3] = [copy.x,copy.y];
							if(e.controlPoints[0] == undefined){
								e.controlPoints[0] = [e.source.x,e.source.y];
								e.controlPoints[1] = [e.source.x,e.source.y];
							}
						}
					}else if(side == "bottom"){
						copy = d.matrixCopyNodes.bottom.find(n => cluster[n.number] == node.id);
						if(d.nodes.indexOf(e.source)+1){
							e.source = copy;
							e.controlPoints[0] = [copy.x,copy.y];
							e.controlPoints[1] = [copy.x,copy.y + dimensioneCuscinetto/2];
							if(e.controlPoints[2] == undefined){
								e.controlPoints[2] = [e.target.x,e.target.y];
								e.controlPoints[3] = [e.target.x,e.target.y];
							}
						} else{
							e.target = copy;
							e.controlPoints[2] = [copy.x,copy.y + dimensioneCuscinetto/2];
							e.controlPoints[3] = [copy.x,copy.y];
							if(e.controlPoints[0] == undefined){
								e.controlPoints[0] = [e.source.x,e.source.y];
								e.controlPoints[1] = [e.source.x,e.source.y];
							}
						}
					}

				});




/*
	creare nuova struttura dati con nodes, edges e spline, dove le spline conterranno i dati degli edge che rappresentano
	ed in più hanno l'attributo controlPoints con la lista di coordinate x,y per costruire la spline graficamente.
*/


/*				var index = 0;
				d.copyEdges = copyNodes.map(function(n){
					var copyEdge = {'index': index,'source': n, 'size': externalEd.find(e => e.source == n || e.target == n).size, 'label':externalEd.find(e => e.source == n || e.target == n).label },

					index++;
					if(n.x == minX + newMinX){
						copyEdge.target = d.matrixCopyNodes.left.find(l => cluster[l.number]==cluster[n.number]);
					}else if(n.x == minX + config.cellSize*matrixData.length + dimensioneCuscinetto/2){
						copyEdge.target = d.matrixCopyNodes.right.find(l => cluster[l.number]==cluster[n.number]);
					}else if(n.y == minY + newMinY){
						copyEdge.target = d.matrixCopyNodes.top.find(l => cluster[l.number]==cluster[n.number]);
					}else if(n.y == minY + config.cellSize*matrixData.length + dimensioneCuscinetto/2){
						copyEdge.target = d.matrixCopyNodes.bottom.find(l => cluster[l.number]==cluster[n.number]);
					}
					return copyEdge;
				})*/

				createMatrix(d, matrixData, minX, minY, maxX, maxY, newMinX, newMinY, newMaxX, newMaxY, sideSize, dimensioneCuscinetto);

				//qui aggiorno gli externalEdges dei matrix adiacenti in modo tale che non puntino più al cluster collassato ma ai nodi copia
				//creati per costruire il chord AGGIORNAMENTO EXTERNEDGES DEI MATRIX

				/*chordg.selectAll('g.diagram')
						.each(function(d){
							print(d);
							var edges = externalEd.filter(e => (e.source.cluster == d.cluster && e.source.copy) || (e.target.cluster == d.cluster && e.target.copy));
							if(edges){
								d.externEdges.map(function(e){
									edges.map(function(l){
										e.source == l.source && e.target.cluster == l.target.cluster ? e.target = l.target : {};
										e.target == l.target && e.source.cluster == l.source.cluster ? e.source = l.source : {};
									});//forse anche qui devi modificare la size degli archi
								});
							}
						});*/


					//AGGIORNAMENTO EXTERNEDGES DEI NODI DELLA NET
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
					/*		edges.map(function(l){//edges può avere archi di size > 1 verso il cluster cli
								var i = l.size;
								print("expandCluster 257, current edge:");
								print(l);
								while(i != 0){*/
										//e = arco cluster esterno 			l = arco cluster considerato															forse ci va anche nodesAdjacency[e.target.id].indexOf(cluster[l.source.number])+1)
									/*var cledge = cl.externEdges.find(e => ((e.source.cluster == d.cluster && !(e.source.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.target.id)+1)) ||
																			(e.source.cluster == d.cluster && !(e.source.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.target.id)+1)) ||
																			(e.target.cluster == d.cluster && !(e.target.copy) && l.source.cluster == cl.cluster && (nodesAdjacency[cluster[l.target.number]].indexOf(e.source.id)+1)) ||
																			(e.target.cluster == d.cluster && !(e.target.copy) && l.target.cluster == cl.cluster && (nodesAdjacency[cluster[l.source.number]].indexOf(e.source.id)+1))));*/
							/*		var cledge = cl.externEdges.find(e => ((e.source.cluster == d.cluster && !(e.source.copy) && l.target.cluster == cl.cluster) ||
																			(e.source.cluster == d.cluster && !(e.source.copy) && l.source.cluster == cl.cluster) ||
																			(e.target.cluster == d.cluster && !(e.target.copy) && l.source.cluster == cl.cluster) ||
																			(e.target.cluster == d.cluster && !(e.target.copy) && l.target.cluster == cl.cluster)));
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
									cledge.label = l.label;//24/05/2019
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
						console.log(err);
						print('errore');
				}

				//sintesi delle repliche dello stesso arco esterno in un solo arco di size = somma delle size delle repliche
				externalEd.map(function(e){
					var edge = {},
						size = e.size;
					e.size = 0;
					
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


				d.externEdges.map(function(e){
					if (d.externEdges.indexOf(e)) {
							for (var j = 0; j < d.externEdges.length; j++) {
								if ((e.source.copy && e.target.copy && d.externEdges[j].target.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].source.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
								 || (e.source.copy && e.target.copy && d.externEdges[j].source.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].target.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])
								 || (e.source.copy && e.target.copy && d.externEdges[j].target.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].source.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
								 || (e.source.copy && e.target.copy && d.externEdges[j].source.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].target.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])){

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


				//aggiornamento externEdges collegati a matrici
				matrixg.selectAll("g.matrix").each(function (dm, i) {
					splineEdges = dm.externEdges.filter(e => (e.source.cluster == d.cluster || e.target.cluster == d.cluster) && d != dm);
					if(splineEdges.length > 0){
						externalEd.map(function(ed){
							splineEdges.map(function(sp){
								if(ed.target == sp.target){
									// console.log(sp.controlPoints);
									// ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[2][0] = sp.controlPoints[2][0];
									ed.controlPoints[2][1] = sp.controlPoints[2][1];
									ed.controlPoints[3][0] = sp.controlPoints[3][0];
									ed.controlPoints[3][1] = sp.controlPoints[3][1];
									// ed.splineData = sp.splineData;
								}
								if(ed.source == sp.source){
									// console.log(sp.controlPoints);
									// ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[0][0];
									ed.controlPoints[0][1] = sp.controlPoints[0][1];
									ed.controlPoints[1][0] = sp.controlPoints[1][0];
									ed.controlPoints[1][1] = sp.controlPoints[1][1];
									// ed.splineData = sp.splineData;
								}
								if(ed.target == sp.source){
									// console.log(sp.controlPoints);
									// ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[2][0] = sp.controlPoints[1][0];
									ed.controlPoints[2][1] = sp.controlPoints[1][1];
									ed.controlPoints[3][0] = sp.controlPoints[0][0];
									ed.controlPoints[3][1] = sp.controlPoints[0][1];
									// ed.splineData = sp.splineData;
								}
								if(ed.source == sp.target){
									// console.log(sp.controlPoints);
									// ed.controlPoints = Array(4).fill(0).map(()=>Array(2).fill(0));
									ed.controlPoints[0][0] = sp.controlPoints[3][0];
									ed.controlPoints[0][1] = sp.controlPoints[3][1];
									ed.controlPoints[1][0] = sp.controlPoints[2][0];
									ed.controlPoints[1][1] = sp.controlPoints[2][1];
									// ed.splineData = sp.splineData;
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

				updateNodes();//funzione presente nel file listeners
				updateEdges();//funzione presente nel file listeners
				updateEdges();//funzione presente nel file listeners
				updateHulls();
	}
} // END EXPANDMATRIX

function deleteMatrix(d){
	var clusterNode = d,
			clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster)),
			splines = [];
	//on click sulla matrice mette d.x e d.y nella posizione data dalla traslazione, quindi va aggiustata.
	d.x += config.cellSize*d.nodes.length/2;
	d.y += config.cellSize*d.nodes.length/2;

	d.nodes.map(function(n){
		n.x += config.cellSize*d.nodes.length/2;
		n.y += config.cellSize*d.nodes.length/2;
	});

	splines = net.edges.filter(s => s.source.cluster == d.cluster || s.target.cluster == d.cluster);
	//aggiorno controlPoints delle spline
	splines.map(function(s){
		if(s.source.cluster == d.cluster){
			if(s.controlPoints[2][0] == s.controlPoints[3][0] && s.controlPoints[2][1] == s.controlPoints[3][1]){
				delete s.controlPoints;
				delete s.splineData;
			}else{
				s.controlPoints[0][0] = d.x;
				s.controlPoints[0][1] = d.y;
				s.controlPoints[1][0] = d.x;
				s.controlPoints[1][1] = d.y;
			}
		}else{
			if(s.controlPoints[0][0] == s.controlPoints[1][0] && s.controlPoints[0][1] == s.controlPoints[1][1]){
				delete s.controlPoints;
				delete s.splineData;
			}else{
				s.controlPoints[2][0] = d.x;
				s.controlPoints[2][1] = d.y;
				s.controlPoints[3][0] = d.x;
				s.controlPoints[3][1] = d.y;
			}
		}
	});

	net.nodes.push(clusterNode);
	d.copies = [];
	d.externEdges = [];




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


 net.edges.map(function(e){
	 if (d.externEdges.indexOf(e)) {
			 for (var j = 0; j < d.externEdges.length; j++) {
				 if ( (e.target.copy && d.externEdges[j].target.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].source.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										|| (e.target.copy && d.externEdges[j].source.copy && e.source.cluster == d.cluster && e.source.cluster == d.externEdges[j].target.cluster && copymap[e.target.cluster][e.target.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])
										|| (e.source.copy && d.externEdges[j].target.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].source.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].target.cluster][d.externEdges[j].target.number])
										|| (e.source.copy && d.externEdges[j].source.copy && e.target.cluster == d.cluster && e.target.cluster == d.externEdges[j].target.cluster && copymap[e.source.cluster][e.source.number] == copymap[d.externEdges[j].source.cluster][d.externEdges[j].source.number])){

						 if (e.source.cluster == d && !chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].target.copy && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
								 d.externEdges[j].target = e.target;
						 if (e.source.cluster == d && !chordg.select("g.diagram."+e.target.cluster).empty() && e.target.copy && d.externEdges[j].source.copy && getIndexOf(chordg.select("g.diagram."+e.target.cluster).datum().map, e.target.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
								 d.externEdges[j].source = e.target;
						 if (e.target.cluster == d && !chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].target.copy && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].target.cluster).datum().map, d.externEdges[j].target.number)[0])
								 d.externEdges[j].target = e.source;
						 if (e.target.cluster == d && !chordg.select("g.diagram."+e.source.cluster).empty() && e.source.copy && d.externEdges[j].source.copy && getIndexOf(chordg.select("g.diagram."+e.source.cluster).datum().map, e.source.number)[0] == getIndexOf(chordg.select("g.diagram."+d.externEdges[j].source.cluster).datum().map, d.externEdges[j].source.number)[0])
								 d.externEdges[j].source = e.source;

						 // e.size += d.externEdges[j].size;
						 // e.label = concatenateStrings(e.label,d.externEdges[j].label);
					 }
			 }
	 }
 });


	net.edges = net.edges.filter(e => e.size > 0);

	translateBackInternalNodes(d.cluster);


	updateNodes();
	updateEdges();//devo raggruppare gli archi multipli verso cluster in un unico arco con peso dato dalla somma delle copie


	//AGGIORNAMENTO EXTERNEDGES DEI CHORDS
	matrixg.select("g."+d.cluster).remove();
	chordg.selectAll('g.diagram')
			.each(function(d){
				print(d);
				d.externEdges.map(function(e){
					var edge = {},
						size = e.size;
					e.size = 0;
					e.source.cluster == clusterNode.cluster && e.source.copy ? e.source = clusterNode : {};
					e.target.cluster == clusterNode.cluster && e.target.copy ? e.target = clusterNode : {};
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

			//AGGIORNAMENTO EXTERNEDGES DELLE MATRICI
			matrixg.selectAll('g.matrix')
					.each(function(d){
						print(d);
						d.externEdges.map(function(e){
							var edge = {},
								size = e.size;
							e.size = 0;
							e.source.cluster == clusterNode.cluster && e.source.copy ? e.source = clusterNode : {};
							e.target.cluster == clusterNode.cluster && e.target.copy ? e.target = clusterNode : {};
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
						});
					});

	//AGGIORNAMENTO EXTERNEDGES DEI NODI CLUSTER DELLA NET
	clusters.map(function(cl){
		cl.externEdges.map(function(e){
			var edge = {},
				size = e.size;
			e.size = 0;
			e.source.cluster == d.cluster ? e.source = clusterNode : {};
			e.target.cluster == d.cluster ? e.target = clusterNode : {};

			delete e.splineData;
			delete e.controlPoints;


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

} // END DELETEMATRIX

function removeMatrixNode(d, n, mouseX, mouseY){//un problema da considerare può essere che d è legato al diagram ma non al nodo collassato: controllare che vado ad espandere il nodo collassato
	var oldExternEdges = [],
		newExternEdges = [];

	/* gli internEdges che elimino diventano i nuovi externEdges (nodo interno, n), gli externEdges che elimino
	 * (n, nodo esterno) diventano archi normali (net.edges)
	 */

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
//	d.x = (d.x*(d.size+1) - n.x)/d.size //update centroid
//	d.y = (d.y*(d.size+1) - n.y)/d.size //update centroid
if(!d.dragged)
	d.nodes.map(function(n){
		n.x -= config.cellSize*d.nodes.length/2;
		n.y -= config.cellSize*d.nodes.length/2;
	});

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

// 		// l = net.edges.find(function(l){return (l.source == netE.source && l.target == netE.target && l.size > 0)});//controllare
// 		l = net.edges.find(function(l){return ((l.source == netE.source && l.target == netE.target && l.size > 0) || (l.target == netE.source && l.source == netE.target && l.size > 0))});//controllo presenza di copie
//
// 		if(l)
// 			l.size -= size;
// 		else
// 			e.size = size;

		net.edges.push(e);//lo devo pushare alla fine
	}, n);

	//aggiornamento externEdges cluster collassati
	clusters = net.nodes.filter(n => n.cluster && !(n.cluster == d.cluster)),
	clusters.map(function(cl){
			var clnodes = cl.nodes,
					originalEdges = data.edges.filter(e =>	(e.source == n && clnodes.includes(e.target)) || (e.target == n && clnodes.includes(e.source)));
					originalEdges.map(function(o){cl.externEdges.push({'source': o.source, 'target': o.target, 'size': o.value, 'label': o.label});});
	});

	net.edges = net.edges.filter(e => e.size > 0);
//	net.nodes.push(d);

	//rimarrebbe da posizionare il nodo in maniera radiale rispetto al cluster
	positionNodeMatrix(n, d);

	updateNodes();
	updateEdges();
	updateEdges();
	expandMatrix(d);

} // END REMOVEMATRIXNODE

function positionNodeMatrix(n, diagData){
	var cx = diagData.x,
			cy = diagData.y,
			r = diagData.nodes.length*config.cellSize*Math.sqrt(2)/2;

	n.x = cx + 0.7*r*Math.cos(atan2(cx, cy, n.x, n.y));
	n.y = cy + 0.7*r*Math.sin(atan2(cx, cy, n.x, n.y));
}

function sideAssignment(cx, cy, src, trg, minX, maxX, minY, maxY, d){
  var ex = d.nodes.find(n => n == src) ? trg : src,
			x1 = cx,
			y1 = cy,
			x2 = ex.x,
			y2 = ex.y,
			m = (y2-y1)/(x2-x1),
      q = (x2*y1-x1*y2)/(x2-x1),
			side = "";

  if (m*maxX + q <= maxY && m*maxX + q >= minY && x1 >= maxX) {
    side = "right";
  }
  else if (m*minX + q <= maxY && m*minX + q >= minY && x1 <= minX) {
    side = "left";
  }
  else if ((maxY-q)/m <= maxX && (maxY-q)/m >= minX && y1 >= maxY) {
		side = "bottom";
  }
  else if ((minY-q)/m <= maxX && (minY-q)/m >= minX && y1 <= minY) {
		side = "top";
  }
	else if (m*maxX + q <= maxY && m*maxX + q >= minY && x2 >= maxX) {
		side = "right";
	}
	else if (m*minX + q <= maxY && m*minX + q >= minY && x2 <= minX) {
		side = "left";
	}
	else if ((maxY-q)/m <= maxX && (maxY-q)/m >= minX && y2 >= maxY) {
		side = "bottom";
	}
	else if ((minY-q)/m <= maxX && (minY-q)/m >= minX && y2 <= minY) {
		side = "top";
	}
	else{
		side = "top";
	}

return side;
}

//PER EVENTUALE CUSCINETTO
/*function intersect(cX, cY, r, x1, y1, x2, y2, src, trg, minX, maxX, minY, maxY){//(x1,y1) sono le coordinate del nodo nel cluster, (x2,y2) quelle del nodo esterno collegato
  var m = (y2-y1)/(x2-x1),
      q = (x2*y1-x1*y2)/(x2-x1);
      // a = 1+Math.pow(m,2),
      // b = m*q-cX-cY*m,
      // c = Math.pow(cX,2) + Math.pow(q,2) - 2*cY*q + Math.pow(cY,2) - Math.pow(r,2),
      // xsol1 = (-b + Math.sqrt(Math.pow(b,2)-a*c))/a,
      // xsol2 = (-b - Math.sqrt(Math.pow(b,2)-a*c))/a,
      // ysol1 = m*xsol1 + q,
      // ysol2 = m*xsol2 + q;

  if (m*maxX + q <= maxY && m*maxX + q >= minY && x1 > maxX) {
    xsol = maxX;
    ysol = m*maxX + q;
  }
  if (m*minX + q <= maxY && m*minX + q >= minY && x1 < minX) {
    xsol = minX;
    ysol = m*minX + q;
  }
  if ((maxY-q)/m <= maxX && (maxY-q)/m >= minX && y1 > maxY) {
    xsol = (maxY-q)/m;
    ysol = maxY;
  }
  if ((minY-q)/m <= maxX && (minY-q)/m >= minX && y1 < minY) {
    xsol = (minY-q)/m;
    ysol = minY;
  }

	if (m*maxX + q <= maxY && m*maxX + q >= minY && x2 > maxX) {
		xsol = maxX;
		ysol = m*maxX + q;
	}
	if (m*minX + q <= maxY && m*minX + q >= minY && x2 < minX) {
		xsol = minX;
		ysol = m*minX + q;
	}
	if ((maxY-q)/m <= maxX && (maxY-q)/m >= minX && y2 > maxY) {
		xsol = (maxY-q)/m;
		ysol = maxY;
	}
	if ((minY-q)/m <= maxX && (minY-q)/m >= minX && y2 < minY) {
		xsol = (minY-q)/m;
		ysol = minY;
	}



	// var dist;
  // if(Math.sqrt(Math.pow(x2-cX,2) + Math.pow(y2-cY,2)) > r){
  //     dist = Math.sqrt(Math.pow(x2-xsol,2) + Math.pow(y2-ysol,2));
  // }else{
	//   dist = Math.sqrt(Math.pow(x1-xsol,2) + Math.pow(y1-ysol,2));
  // }

  return {x: xsol, y: ysol, source: src, target: trg};
}*/

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
}

function getIndexOf(arr, n) {
  for (var i = 0; i < arr.length; i++) {
    var index = arr[i].indexOf(n);
    if (index > -1) {
      return [i, index];
    }
  }
}

function deleteRectangle(d){//d in questo caso sono i dati legati all'oggetto chord diagram
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
		l ? l.size += size : e.size = size;
		el = d.externEdges.find(function(l){return ((l.source == edge.source && l.target == edge.target))});
		//non fa la sommare 			(l.target == edge.source && l.source == edge.target)
		el ? el.size += edge.size : (edge.size ? d.externEdges.push(edge) : print("deleteCluster 369: !el && edge.size = 0"));
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
	updateEdges();//devo raggruppare gli archi multipli verso cluster in un unico arco con peso dato dalla somma delle copie


	//AGGIORNAMENTO EXTERNEDGES DEI CHORDS
	chordg.select("g."+d.cluster).remove();
	chordg.selectAll('g.rectangle')
			.each(function(d){
				print(d);
				d.externEdges.map(function(e){
					var edge = {},
						size = e.size;
					e.size = 0;
					e.source.cluster == clusterNode.cluster && e.source.copy ? e.source = clusterNode : {};
					e.target.cluster == clusterNode.cluster && e.target.copy ? e.target = clusterNode : {};
					edge = d.externEdges.find(function(l){return l.source == e.source && l.target == e.target && l.size > 0});
					edge ? edge.size += size : e.size = size;
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
			edge = cl.externEdges.find(function(l){return l.source == e.source && l.target == e.target && l.size > 0});
			edge ? edge.size += size : e.size = size;
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
}

function addNodeMatrix(d, n){
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

	//compenso aggiustamento del centro da deleteMatrix
	//d.x -= config.cellSize*d.nodes.length/2;
	//d.y -= config.cellSize*d.nodes.length/2;
	if(!d.dragged)
		d.nodes.map(function(n){
			n.x -= config.cellSize*d.nodes.length/2;
			n.y -= config.cellSize*d.nodes.length/2;
		});

	n.cluster = d.cluster;//19/05/2019
	n.group_data = d;
	d.nodes.push(n);//aggiungo il nodo al cluster
	d.size ++;
//	d.x = (d.x*(d.size-1) + n.x)/d.size; //update centroid
//	d.y = (d.y*(d.size-1) + n.y)/d.size; //update centroid
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
	expandMatrix(d);
} // END ADDNODEMATRIX

function createDataMatrix(nodes, internalEdges){
	//	obj = this --> nodeMatrix cioè la matrice
	var data = [];
		nodes.forEach(function(d, i) {
			 data[i] = d3.range(nodes.length).map(function(j) {
					return { x: j, y: i, z: 0, parent: d }; //sostiuire con l'oggetto matrice
				});
			data[i][i].z = 1;
			data[i][i].node = nodes[i];
		});

//qui ci andrà l'ordinamento interno della matrice che usano su nodetrix

		//decidere se il peso degi archi va indicato o meno dentro la matrice
		internalEdges.forEach(function(link) {
				var source = nodes.indexOf(link.source),
						target = nodes.indexOf(link.target);
				if (source < 0 || target < 0)
					throw "Linking error: from "+source+" to "+target;
				data[source][target].z += link.size;//controllare struttura archi, forse per noi è data[source][target].z = link.value
				data[target][source].z += link.size;
				data[target][source].label = link.label;
				data[source][target].label = link.label;
		});

		return data;
}

function getMatrixValues(data){
	var adj = Array(data.length).fill(0).map(()=>Array(data.length).fill(0));

	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data.length; j++) {
			adj[i][j] = data[i][j].z;
			console.log(data[i][j]);
		}
	}
	return adj;
}

function switchNodes(nodes, order){
	newNodes = [];

	for (var i = 0; i < nodes.length; i++) {
		newNodes.push(nodes[order[i]]);
	}
	return newNodes;
}

function convertRGBtoHex(color){
	var rgbColor=[],
			hexColor;
	rgbColor = color.split("(")[1].split(")")[0].split(", ");
	hexColor = fullColorHex(rgbColor[0],rgbColor[1],rgbColor[2]);

	return "#"+hexColor;
}
