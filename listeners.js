//EVENT LISTENERS

function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}



function ctrlClick(node,nodes) {
  if (event.ctrlKey && node.community!=-1) {
    d3.event.preventDefault();
    node.community=-1;
    updateHulls();
  }
  else if (event.ctrlKey && node.community==-1) {
    var closest = getClosestNode(node,nodes);
    if (getClosestNode(closest, nodes).community==closest.community && getClosestNode(closest, nodes)!=node)
      node.community=closest.community;
    else closest.community=-1;
    updateHulls();
  }
}

function getClosestNode(node,nodes) {
  var minDist = Math.sqrt(Math.pow(nodes[0].x-node.x,2)+Math.pow(nodes[0].y-node.y,2));
  var closest = nodes[0];
  var dist;
  for (var i=0; i<nodes.length;i++) {
    if (nodes[i].community!=-1) {
      dist = Math.sqrt(Math.pow(nodes[i].x-node.x,2)+Math.pow(nodes[i].y-node.y,2));
      if (dist<minDist && nodes[i]!=node) {
        minDist = dist;
        closest = nodes[i];
      }
    }
  }
  return closest;
}

   //{  d3.event.preventDefault();
   // // react on right-clicking
   // var text = vis.select('g.nodes').selectAll('text').select(function(t){return t.label == d.label ? this : null});
   // d.clicked = !d.clicked;
   //
   // d.clicked ? text.style("font-size", 0) : text.style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
   // print("right-clicked "+d.label+" value: "+d.clicked); }


/*
 * d3.event.pageX : The pageX read-only property of the MouseEvent interface returns the X (horizontal) coordinate
 * (in pixels) at which the mouse was clicked, relative to the left edge of the entire document. This includes any
 * portion of the document not currently visible.
 * Being based on the edge of the document as it is, this property takes into account any horizontal scrolling of the
 * page. For example, if the page is scrolled such that 200 pixels of the left side of the document are scrolled out
 * of view, and the mouse is clicked 100 pixels inward from the left edge of the view, the value returned by pageX
 * will be 300. The same for d3.event.pageY.
*/

function mousedown(){
    if (simulation) simulation.stop();
	startX = d3.event.pageX;//d3.event.clientX;
	startY = d3.event.pageY;//d3.event.clientY;
  print("mousedown "+startX+" "+startY);
  print('k: '+k);
	vis.append("rect")
		.attr("class", "selector")
		.attr("x", startX)
		.attr("y",startY)
		.attr("width", 0)
		.attr("height", 0)
		.attr("fill", "lightsteelblue")
		.attr("opacity", 0.3);
	e=window.event;
	pauseEvent(e);

}

function mousemove(){
	vis.select("rect.selector")
		.attr("x", d3.event.pageX > startX ? startX : d3.event.pageX)
		.attr("y", d3.event.pageY > startY ? startY : d3.event.pageY)
		.attr("width", Math.abs(d3.event.pageX - startX))
		.attr("height", Math.abs(d3.event.pageY - startY));
	e= window.event;
	pauseEvent(e);
}

function mouseup(clusterType){
	endX = d3.event.pageX;
	endY = d3.event.pageY;
	endX > startX ? {} : (endX = startX) && (startX = d3.event.pageX)
	endY > startY ? {} : (endY = startY) && (startY = d3.event.pageY)
  print("mouseup "+endX+" "+endY);

	/*fatta la selezione, i nodi che ne fanno parte appartegono allo stesso cluster, quindi gli associo un attributo cluster con un numero, inloltre per loro expand = false; a questo punto nella funzione network, sostituisco getGroup con getCluster e vedo come mi si ricalcola i nodi e gli archi.*/
	net ? cluster(startX , startY , endX , endY, clusterType) : {};
	vis.selectAll("rect.selector").remove();/*qui richiamo la funzione per costruire il cluster, prima di rimuovere il rect?*/
}

function ribbonLabel(src,trg,internEdges){
	for (var i in internEdges) {
		if ((internEdges[i]["source"]["id"]==src && internEdges[i]["target"]["id"]==trg) || (internEdges[i]["source"]["id"]==trg && internEdges[i]["target"]["id"]==src)){
			var label = internEdges[i]["label"];
		}
	}
	return label;
}


function mouseEnterRectangle(d){
	var rectangle = d3.select(this.parentNode),
		srcText = rectangle.selectAll("g.group"+d.source.index).select("text").text(),
		trgText = rectangle.selectAll("g.group"+d.target.index).select("text").text(),
		cl = rectangle.datum().cluster,
		map = rectangle.datum().map,
		src = rectangle.datum().nodes.find(function(n){return n.id == copymap[cl][map[d.source.index][0]];}),
		trg = rectangle.datum().nodes.find(function(n){return n.id == copymap[cl][map[d.target.index][0]];}),
		text = 	ribbonLabel(src["id"],trg["id"],rectangle.datum().internEdges);

	    rectangle.selectAll("g.group"+d.source.index).select("path")
	    									.attr("stroke-width","2")
							        		.attr("stroke-color","black")
							       			.attr("stroke","black")
							       			.attr("stroke-opacity", 0.6);

		rectangle.selectAll("g.group"+d.target.index).select("path")
    									.attr("stroke-width","2")
						        		.attr("stroke-color","black")
						       			.attr("stroke","black")
						       			.attr("stroke-opacity", 0.6);

	d3.select(this)
				   .attr("stroke-width","2")
        		   .attr("stroke-color","black")
       			   .attr("stroke","black")
       			   .attr("stroke-opacity", 0.6);

//devo selezionare tutti i groups che corrispondono ad un dato nodo di partenza.
	//diagram.selectAll()

    div.transition()
       .duration(200)
       .style("opacity", .9);
    div.html(text)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}
function mouseLeaveRectangle(d){
	var rectangle = d3.select(this.parentNode);

	d3.select(this).attr("stroke-width",null)
        		   .attr("stroke-color",null)
       			   .attr("stroke",null)
       			   .attr("stroke-opacity", null);

    rectangle.selectAll("g.group"+d.source.index).select("path")
    									.attr("stroke-width",null)
						        		.attr("stroke-color",null)
						       			.attr("stroke",null)
						       			.attr("stroke-opacity", null);

	rectangle.selectAll("g.group"+d.target.index).select("path")
    									.attr("stroke-width",null)
						        		.attr("stroke-color",null)
						       			.attr("stroke",null)
						       			.attr("stroke-opacity", null);
    div.transition()
       .duration(200)
       .style("opacity", 0);
}





function mouseEnterChord(d){
	var diagram = d3.select(this.parentNode),
		srcText = diagram.selectAll("g.group"+d.source.index).select("text").text(),
		trgText = diagram.selectAll("g.group"+d.target.index).select("text").text(),
		cl = diagram.datum().cluster,
		map = diagram.datum().map,
		src = diagram.datum().nodes.find(function(n){return n.id == copymap[cl][map[d.source.index][0]];}),
		trg = diagram.datum().nodes.find(function(n){return n.id == copymap[cl][map[d.target.index][0]];}),

    cl = diagram.datum().cluster,
    map = diagram.datum().map,
    groupsSource = diagram.selectAll("g.group").filter(function(d){
      return copymap[cl][map[d.index][0]] == src.id;
    }),
    groupsTarget = diagram.selectAll("g.group").filter(function(d){
      return copymap[cl][map[d.index][0]] == trg.id;
    }),

		text = 	ribbonLabel(src["id"],trg["id"],diagram.datum().internEdges);

//		text = getLabel(src) +" "+ getLabel(trg); // LORENZO

    diagram.selectAll("g.group").selectAll("path").style('opacity',0.3);
    diagram.selectAll("path").attr('opacity',0.3);


  	groupsSource.selectAll("path")
         			   .attr("stroke-opacity", 0.6)
         			   .style('opacity',1);

     groupsTarget.selectAll("path")
          		  .attr("stroke-opacity", 0.6)
          			.style('opacity',1);


	  //   diagram.selectAll("g.group"+d.source.index).select("path")
	  //   								/*	.attr("stroke-width","2")
		// 					        		.attr("stroke-color","black")
		// 					       			.attr("stroke","black")*/
		// 					       			.attr("stroke-opacity", 0.6)
    //                       .style('opacity',1);
    //
		// diagram.selectAll("g.group"+d.target.index).select("path")
    // 									/*.attr("stroke-width","2")
		// 				        		.attr("stroke-color","black")
		// 				       			.attr("stroke","black")*/
		// 				       			.attr("stroke-opacity", 0.6)
    //                     .style('opacity',1);

	d3.select(this)
				  /* .attr("stroke-width","2")
        		   .attr("stroke-color","black")
       			   .attr("stroke","black")*/
       			   .attr("stroke-opacity", 0.6)
               .attr('opacity',1);


//devo selezionare tutti i groups che corrispondono ad un dato nodo di partenza.
	//diagram.selectAll()

    div.transition()
       .duration(200)
       .style("opacity", .9);
    div.html(text)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}
function mouseLeaveChord(d){
	var diagram = d3.select(this.parentNode);

	d3.select(this)//.attr("stroke-width",null)
        		   .attr("stroke-color",null)
       			   .attr("stroke",null)
       			   .attr("stroke-opacity", null);

    diagram.selectAll("g.group"+d.source.index).select("path")
    							//		.attr("stroke-width",null)
						        		.attr("stroke-color",null)
						       			.attr("stroke",null)
						       			.attr("stroke-opacity", null);

	diagram.selectAll("g.group"+d.target.index).select("path")
    								//	.attr("stroke-width",null)
						        		.attr("stroke-color",null)
						       			.attr("stroke",null)
						       			.attr("stroke-opacity", null);

  diagram.selectAll("g.group").selectAll("path").style('opacity',1);
  diagram.selectAll("path").attr('opacity',1);

    div.transition()
       .duration(200)
       .style("opacity", 0);
}

function mouseEnterCell(d){
	var row = d3.select(this.parentNode),
      matrix = d3.select(row._groups[0][0].parentNode),
      text = d.x == d.y ? d.parent.label : d.label,
      cellData = d;

  matrix.selectAll(".row")
             .each(function(r) {
                        d3.select(this)
                          .selectAll(".cell")
                          .style("stroke-opacity", function(dc) { return dc.y === cellData.y || dc.x == cellData.x ? cellStrokeOpacity(dc) : 0.3; })
                          .style("opacity", function(dc) { return dc.y === cellData.y || dc.x == cellData.x ? cellOpacity(dc) : 0.3; })
                      });

       splineg.selectAll("path").select(function(dc){return ( (cellData.y  == cellData.x) && ((copymap[matrix.datum().cluster][dc.source.number] == cellData.node.id && matrix.datum().cluster == dc.source.cluster) || (copymap[matrix.datum().cluster][dc.target.number] == cellData.node.id && matrix.datum().cluster == dc.target.cluster)) ) ? this : null})
              //  .attr("stroke-width","2")
                    .attr("stroke-color",matrix.datum().color)
                    .attr("stroke",matrix.datum().color)
                  .attr("stroke-opacity", 0.6);


if(typeof text != 'undefined'){
    div.transition()
       .duration(200)
       .style("opacity", .9);
    div.html(text)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
     }
}

function mouseLeaveCell(d){
	var row = d3.select(this.parentNode),
      matrix = d3.select(row._groups[0][0].parentNode);

      matrix.selectAll(".row")
             .each(function(r) {
                        d3.select(this)
                          .selectAll(".cell")
                          .style("stroke-opacity", function(dc) { return cellStrokeOpacity(dc); })
                          .style("opacity", function(dc) { return cellOpacity(dc); })
                      });

      splineg.selectAll("path").select(function(dc){return (copymap[matrix.datum().cluster][dc.source.number] == d.parent.id || copymap[matrix.datum().cluster][dc.target.number] == d.parent.id) ? this : null})
          //  .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
                  .attr("stroke-color","black")
                  .attr("stroke","black")
                  .attr("stroke-opacity", 0.6);

  div.transition()
     .duration(200)
     .style("opacity", 0);
}

function clusterLabel(d){
	d.nodes.sort(function(a,b){
		return b.degree - a.degree;
	});
	var label = "";
	d.nodes.map(function(n){
		label += n.label+"\n";
	});
	return label;
}

function mouseEnterNode(d){
	var text = d.cluster ? clusterLabel(d) : getLabel(d);

  d3.selectAll("circle.node").select(function(data){return (data == d) ? this : null})
                .attr("stroke-width","3")
                    .attr("stroke-color","red")
                    .attr("stroke","red");

  d3.selectAll("line.link").select(function(l){return (l.source == d || l.target == d) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color","red")
                  .attr("stroke","red")
                // .attr("stroke-opacity", 0.6);

  splineg.selectAll("path").select(function(l){return (l.source == d || l.target == d) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color","red")
                  .attr("stroke","red")
                // .attr("stroke-opacity", 0.6);

	div.transition()
       .duration(200)
       .style("opacity", .9);
    div.html(text)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}

function mouseLeaveNode(d){

  d3.selectAll("circle.node").select(function(data){return (data == d) ? this : null})
                .attr("stroke-width","3")
                    .attr("stroke-color","#666666")
                    .attr("stroke","#666666");

  d3.selectAll("line.link").select(function(l){return (l.source == d || l.target == d) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color", "black")
                  .attr("stroke", "black")
                // .attr("stroke-opacity", 0.6);

  splineg.selectAll("path").select(function(l){return (l.source == d || l.target == d) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color","black")
                  .attr("stroke","black")
                // .attr("stroke-opacity", 0.6);

	div.transition()
       .duration(200)
       .style("opacity", 0);
}

function mouseEnterEdge(d){
	var sourceLabel = d.source.copy ? "" : getLabel(d.source),
		targetLabel = d.target.copy ? "" : getLabel(d.target);
	if(d.source.copy){//highlight source group if any
    var diagramSrc = chordg.select("g.diagram."+d.source.cluster),
      dSrc = diagramSrc.datum(),
      groupSrc = [];
    groupSrc = diagramSrc.selectAll("g.group").filter(function(dg){
    return copymap[dSrc.cluster][dSrc.map[dg.index][0]] == copymap[dSrc.cluster][d.source.number];
    });
    highlightArc(d3.select(groupSrc._groups[0][0]));

	}
	if(d.target.copy){//highlight target group if any
    var diagramTrg = chordg.select("g.diagram."+d.target.cluster),
      dTrg = diagramTrg.datum(),
      groupTrg = [];

    groupTrg = diagramTrg.selectAll("g.group").filter(function(dg){
    return copymap[dTrg.cluster][dTrg.map[dg.index][0]] == copymap[dTrg.cluster][d.target.number];
    });
    highlightArc(d3.select(groupTrg._groups[0][0]));
   }


	//highlight edge
	d3.select(this)//.attr("stroke-width",function(d) { return linkUpperBuond(d.size)+1; })
        		   .attr("stroke-color","red")
       			   .attr("stroke","red");
 	//highlight source and target node if any
    d3.selectAll("circle.node").select(function(data){return (data == d.source || data == d.target) ? this : null})
    							.attr("stroke-width","3")
        		   				.attr("stroke-color","red")
       			   				.attr("stroke","red");

    div.transition()
       .duration(200)
       .style("opacity", .9);

    edgeData = d3.select(this).datum();

//    div.html(toString(e.value))
//    div.html(sourceLabel +" "+ targetLabel)
    div.html(edgeData.label)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}

function toString(list){
	var string = list[0];
	for (var i = 1; i < list.length; i++) {
		string = string + " - " + list[i];
	}
}

function mouseLeaveEdge(d){
    if(d.source.copy){//highlight source group if any
      var diagramSrc = chordg.select("g.diagram."+d.source.cluster),
        dSrc = diagramSrc.datum(),
        groupSrc = [];
      groupSrc = diagramSrc.selectAll("g.group").filter(function(dg){
      return copymap[dSrc.cluster][dSrc.map[dg.index][0]] == copymap[dSrc.cluster][d.source.number];
      });
      turnoffArc(d3.select(groupSrc._groups[0][0]));

	}
	if(d.target.copy){
    var diagramTrg = chordg.select("g.diagram."+d.target.cluster),
      dTrg = diagramTrg.datum(),
      groupTrg = [];

    groupTrg = diagramTrg.selectAll("g.group").filter(function(dg){
    return copymap[dTrg.cluster][dTrg.map[dg.index][0]] == copymap[dTrg.cluster][d.target.number];
    });
    turnoffArc(d3.select(groupTrg._groups[0][0]));

	}

	d3.select(this)//.attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
        		   .attr("stroke-color","black")
       			   .attr("stroke","black");
       			   //.attr("stroke", "lightgrey")
          		   //.attr("stroke-color", "lightgrey")

    d3.selectAll("circle.node").select(function(data){return (data == d.source || data == d.target) ? this : null})
    							.attr("stroke-width","3")
        		   				.attr("stroke-color","#666666")
       			   				.attr("stroke","#666666");
    div.transition()
       .duration(200)
       .style("opacity", 0);
}

function mouseEnterSpline(d){

	if(d.source.copy){//è un cluster espanso
    if(chordg.select("g.diagram."+d.source.cluster).empty()){//se è una matrice
    		var diagramSrc = matrixg.select("g.matrix."+d.source.cluster),
    			dSrc = diagramSrc.datum();
          cellNode = diagramSrc.selectAll(".cell").filter(function(dc){return typeof dc.node != 'undefined' ? dc.node.id == copymap[dSrc.cluster][d.source.number] : null });

          diagramSrc.selectAll(".row")
                 .each(function(row) {
                            d3.select(this)
                              .selectAll(".cell")
                              .style("stroke-opacity", function(dc) { return dc.y === cellNode.datum().y || dc.x == cellNode.datum().y ? cellStrokeOpacity(dc) : 0.3; })
                        			.style("opacity", function(dc) { return dc.y === cellNode.datum().y || dc.x == cellNode.datum().y ? cellOpacity(dc) : 0.3; })
                          });
          /*cross = diagramSrc.selectAll(".cell").filter(function(dc){
            return dc.parent.id == copymap[dSrc.cluster][d.source.number];
          });
    		cross.style("stroke", "red")
             .style("stroke-opacity", 0.6);*/

    }else{//è un chord-diagram
          var diagramSrc = chordg.select("g.diagram."+d.source.cluster),
      			dSrc = diagramSrc.datum(),
      			groupSrc = [];
          groupSrc = diagramSrc.selectAll("g.group").filter(function(dg){
  				return copymap[dSrc.cluster][dSrc.map[dg.index][0]] == copymap[dSrc.cluster][d.source.number];
  				});
          highlightArc(d3.select(groupSrc._groups[0][0]));

    }
  }else{//è un nodo
    d3.selectAll("circle.node").select(function(data){return (data == d.source) ? this : null})
                  .attr("stroke-width","3")
                  .attr("stroke-color","red")
                  .attr("stroke","red");
  }
  if(d.target.copy){//è un cluster espanso
    if(chordg.select("g.diagram."+d.target.cluster).empty()){//se è una matrice
    		var diagramTrg = matrixg.select("g.matrix."+d.target.cluster),
    			dTrg = diagramTrg.datum(),
          cellNode = diagramTrg.selectAll(".cell").filter(function(dc){return typeof dc.node != 'undefined' ? dc.node.id == copymap[dTrg.cluster][d.target.number] : null });

          diagramTrg.selectAll(".row")
                 .each(function(row) {
                            d3.select(this)
                              .selectAll(".cell")
                              .style("stroke-opacity", function(dc) { return dc.y === cellNode.datum().y || dc.x == cellNode.datum().y ? cellStrokeOpacity(dc) : 0.3; })
                        			.style("opacity", function(dc) { return dc.y === cellNode.datum().y || dc.x == cellNode.datum().y ? cellOpacity(dc) : 0.3; })
                          });
          /*cross = diagramTrg.selectAll(".cell").filter(function(dc){
            return dc.parent.id == copymap[dTrg.cluster][d.target.number];
          });

    		cross.style("stroke", "red")
             .style("stroke-opacity", 0.6);*/

    }else{//è un chord-diagram
          var diagramTrg = chordg.select("g.diagram."+d.target.cluster),
      			dTrg = diagramTrg.datum(),
            groupTrg = [];

          groupTrg = diagramTrg.selectAll("g.group").filter(function(dg){
  				return copymap[dTrg.cluster][dTrg.map[dg.index][0]] == copymap[dTrg.cluster][d.target.number];
  				});
          highlightArc(d3.select(groupTrg._groups[0][0]));


    }//end chord-diagram
  }//end cluster espanso
  else{//è un nodo
      d3.selectAll("circle.node").select(function(data){return (data == d.target) ? this : null})
                    .attr("stroke-width","3")
                    .attr("stroke-color","red")
                    .attr("stroke","red");
  }//end nodo



	//highlight edge
	d3.select(this)//.attr("stroke-width",function(d) { return linkUpperBuond(d.size)+1; })
        		   .attr("stroke-color","red")
       			   .attr("stroke","red");

    div.transition()
       .duration(200)
       .style("opacity", .9);

    edgeData = d3.select(this).datum();

//    div.html(toString(e.value))
//    div.html(sourceLabel +" "+ targetLabel)
    div.html(edgeData.label)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}

function mouseLeaveSpline(d){

	if(d.source.copy){//è un cluster espanso
    if(chordg.select("g.diagram."+d.source.cluster).empty()){//se è una matrice
    		var diagramSrc = matrixg.select("g.matrix."+d.source.cluster),
    			dSrc = diagramSrc.datum();

          diagramSrc.selectAll(".row")
                 .each(function(row) {
                            d3.select(this)
                              .selectAll(".cell")
                              .style("stroke-opacity", function(dc) { return cellStrokeOpacity(dc); })
                        			.style("opacity", function(dc) { return cellOpacity(dc); })
                          });
          /*cross = diagramSrc.selectAll(".cell").filter(function(dc){
            return dc.parent.id == copymap[dSrc.cluster][d.source.number];
          });
    		cross.style("stroke", "red")
             .style("stroke-opacity", 0.6);*/

    }else{//è un chord-diagram
          var diagramSrc = chordg.select("g.diagram."+d.source.cluster),
      			dSrc = diagramSrc.datum(),
      			groupSrc = [];
          groupSrc = diagramSrc.selectAll("g.group").filter(function(dg){
  				return copymap[dSrc.cluster][dSrc.map[dg.index][0]] == copymap[dSrc.cluster][d.source.number];
  				});
          turnoffArc(d3.select(groupSrc._groups[0][0]));

    }
  }else{//è un nodo
    d3.selectAll("circle.node").select(function(data){return (data == d.source) ? this : null})
                  .attr("stroke-width","3")
                  .attr("stroke-color","#666666")
                  .attr("stroke","#666666");
  }
  if(d.target.copy){//è un cluster espanso
    if(chordg.select("g.diagram."+d.target.cluster).empty()){//se è una matrice
    		var diagramTrg = matrixg.select("g.matrix."+d.target.cluster),
    			dTrg = diagramTrg.datum();

          diagramTrg.selectAll(".row")
                 .each(function(row) {
                            d3.select(this)
                              .selectAll(".cell")
                              .style("stroke-opacity", function(dc) { return cellStrokeOpacity(dc); })
                        			.style("opacity", function(dc) { return cellOpacity(dc); })
                          });
          /*cross = diagramTrg.selectAll(".cell").filter(function(dc){
            return dc.parent.id == copymap[dTrg.cluster][d.target.number];
          });

    		cross.style("stroke", "red")
             .style("stroke-opacity", 0.6);*/

    }else{//è un chord-diagram
          var diagramTrg = chordg.select("g.diagram."+d.target.cluster),
      			dTrg = diagramTrg.datum(),
            groupTrg = [];

          groupTrg = diagramTrg.selectAll("g.group").filter(function(dg){
  				return copymap[dTrg.cluster][dTrg.map[dg.index][0]] == copymap[dTrg.cluster][d.target.number];
  				});
          turnoffArc(d3.select(groupTrg._groups[0][0]));


    }//end chord-diagram
  }//end cluster espanso
  else{//è un nodo
      d3.selectAll("circle.node").select(function(data){return (data == d.target) ? this : null})
                    .attr("stroke-width","3")
                    .attr("stroke-color","#666666")
                    .attr("stroke","#666666");
  }//end nodo



	//highlight edge
	d3.select(this)//.attr("stroke-width",function(d) { return linkUpperBuond(d.size); })
        		   .attr("stroke-color","black")
       			   .attr("stroke","black");

    div.transition()
       .duration(200)
       .style("opacity", .9);

    edgeData = d3.select(this).datum();

//    div.html(toString(e.value))
//    div.html(sourceLabel +" "+ targetLabel)
    div.html(edgeData.label)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
}

function mouseEnterCopyEdge(d){
   var diagram = matrixg.select("g.matrix."+d.source.cluster)
       label = d.label;

  diagram.select("circle.rectNode.copy"+d.source.number)
            .attr("stroke-width", 1)
            .attr("stroke-color","red")
            .attr("stroke", "red")
            .attr("stroke-opacity", 0.6)
            .attr("fill", "red");


  d3.select(this)
    .attr("stroke-color","red")
    .attr("stroke","red");

   d3.selectAll("line.link").select(function(l){return l.source == d.source || l.target == d.source ? this : null})
        .attr("stroke-color","red")
        .attr("stroke","red");


  var extLink = d3.selectAll("line.link").select(function(l){return l.source == d.source || l.target == d.source ? this : null});
  var extNode = extLink.datum().source.label ? extLink.datum().source : extLink.datum().target;
      d3.selectAll("circle.node").select(function(d){return d.id ==extNode.id || d.id == extNode.id ? this : null})
        .attr("stroke-width","3")
        .attr("stroke-color","red")
        .attr("stroke","red");

  div.transition()
     .duration(200)
     .style("opacity", .9);

   div.html(label)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");

}
function mouseLeaveCopyEdge(d){
  var diagram = matrixg.select("g.matrix."+d.source.cluster);
  diagram.select("circle.rectNode.copy"+d.source.number)
          .attr("stroke-width", 1)
          .attr("stroke-color","#000000")
          .attr("stroke", "#000000")
          .attr("stroke-opacity", 0.6)
          .attr("fill", "black");


    d3.select(this)
      .attr("stroke-color","black")
      .attr("stroke","black");

   d3.selectAll("line.link").select(function(l){return l.source == d.source || l.target == d.source ? this : null})
     .attr("stroke-color","black")
     .attr("stroke","black");

 
   var extLink = d3.selectAll("line.link").select(function(l){return l.source == d.source || l.target == d.source ? this : null});
   var extNode = extLink.datum().source.label ? extLink.datum().source : extLink.datum().target;
       d3.selectAll("circle.node").select(function(d){return d.id ==extNode.id || d.id == extNode.id ? this : null})
         .attr("stroke-width","3")
         .attr("stroke-color","#666666")
         .attr("stroke","#666666");

  div.transition()
     .duration(200)
     .style("opacity", 0);
}

function mouseEnterArc(d){
  var diagram = d3.select(this.parentNode),
      data = d,
      cl = diagram.datum().cluster,
      map = diagram.datum().map,
      node = diagram.datum().nodes.find(function(n){return n.id == copymap[cl][map[data.index][0]];}),
  	  text = getLabel(node),
      groups = diagram.selectAll("g.group").filter(function(d){
  			return copymap[cl][map[d.index][0]] == copymap[cl][map[data.index][0]];
  		}),
      color = groups.select("path").attr("fill"),
  		groupData = groups.data(),
      indices = groupData.map(function(d){return d.index}),//original node group indices
      copies = [];//copynodes belonging to groups


    indices.map(function(i){copies = copies.concat(map[i]);});

  highlightArc(d3.select(this));

  indices.map(function(i){
    diagram.selectAll("path.chord-"+i)
            //	.attr("stroke-width","2")
                  // .attr("stroke-color",color)
                  // .attr("stroke",color)
                  // .attr("stroke-opacity", 0.6)
                  .attr('opacity',1);
  });

  d3.selectAll("line.link").select(function(d){return ((copies.indexOf(d.source.number)+1) && d.source.cluster == cl) || ((copies.indexOf(d.target.number)+1) && d.target.cluster == cl) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color",color)
                  .attr("stroke",color)
                // .attr("stroke-opacity", 0.6);

  splineg.selectAll("path").select(function(d){return ((copies.indexOf(d.source.number)+1) && d.source.cluster == cl) || ((copies.indexOf(d.target.number)+1) && d.target.cluster == cl) ? this : null})
          //    .attr("stroke-width","2")
                  .attr("stroke-color",color)
                  .attr("stroke",color)
                // .attr("stroke-opacity", 0.6);

    div.transition()
       .duration(200)
       .style("opacity", .9);
    div.html(text)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");

}

function highlightArc(arc){
  var diagram = d3.select(arc._groups[0][0].parentNode),
		data = arc.datum(),
		cl = diagram.datum().cluster,
		map = diagram.datum().map,
		groups = diagram.selectAll("g.group").filter(function(d){
			return copymap[cl][map[d.index][0]] == copymap[cl][map[data.index][0]];
		}),
		color = groups.select("path").attr("fill");

  diagram.selectAll("g.group").selectAll("path").style('opacity',0.3);
  diagram.selectAll("path").attr('opacity',0.3);

	groups.selectAll("path")
				  // .attr("stroke-width","2")
        		   // .attr("stroke-color",color)
       			   // .attr("stroke",color)
       			   // .attr("stroke-opacity", 0.6)
       			   .style('opacity',1);



}

function mouseLeaveArc(d){

  var diagram = d3.select(this.parentNode),
      cl = diagram.datum().cluster,
      map = diagram.datum().map,
      data = d,
      groups = diagram.selectAll("g.group").filter(function(d){
        return copymap[cl][map[d.index][0]] == copymap[cl][map[data.index][0]];
      }),
      groupData = groups.data(),
      indices = groupData.map(function(d){return d.index}),//original node group indices
      copies = [];//copynodes belonging to groups

  indices.map(function(i){copies = copies.concat(map[i]);});

  turnoffArc(d3.select(this));

  indices.map(function(i){
    diagram.selectAll("path.chord-"+i)
            //  .attr("stroke-width",null)
                  .attr("stroke-color",null)
                  .attr("stroke",null)
                  .attr("stroke-opacity", null);
  });

  d3.selectAll("line.link").select(function(d){return ((copies.indexOf(d.source.number)+1) && d.source.cluster == cl) || ((copies.indexOf(d.target.number)+1) && d.target.cluster == cl) ? this : null})
            //   .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
                   .attr("stroke-color","black")
                   .attr("stroke","black")
                   //.attr("stroke", "lightgrey")
                     //.attr("stroke-color", "lightgrey")
                   .attr("stroke-opacity", 0.6);

 splineg.selectAll("path").select(function(d){return ((copies.indexOf(d.source.number)+1) && d.source.cluster == cl) || ((copies.indexOf(d.target.number)+1) && d.target.cluster == cl) ? this : null})
        //      .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
                  .attr("stroke-color","black")
                  .attr("stroke","black")
                  //.attr("stroke", "lightgrey")
                    //.attr("stroke-color", "lightgrey")
                  .attr("stroke-opacity", 0.6);

    div.transition()
       .duration(500)
       .style("opacity", 0);
}

function turnoffArc(arc){
  var diagram = d3.select(arc._groups[0][0].parentNode),
		data = arc.datum(),
		cl = diagram.datum().cluster,
		map = diagram.datum().map,
		groups = diagram.selectAll("g.group").filter(function(d){
			return copymap[cl][map[d.index][0]] == copymap[cl][map[data.index][0]];
		});

  diagram.selectAll("g.group").selectAll("path").style('opacity',1);
    diagram.selectAll("path").attr('opacity',1);

  groups.selectAll("path")
				  // .attr("stroke-width",null)
        		   .attr("stroke-color",null)
       			   .attr("stroke",null)
       			   .attr("stroke-opacity", null);
}

function rightClickArc(d){
    d3.event.preventDefault();
	var diagram = d3.select(this.parentNode),
		data = d,
		cl = diagram.datum().cluster,
		map = diagram.datum().map,
		node = diagram.datum().nodes.find(function(n){return n.id == copymap[cl][map[data.index][0]];});
    //updateHulls();
    deleteChord(diagram.datum());
    diagram.datum().nodes.length > 2 ? removeNode(diagram.datum(), node, d) : releaseCluster(diagram.datum())
    //removeNode(diagram.datum(), node, d3.event.x, d3.event.y);
}

function rightClickCell(d){
  d3.event.preventDefault();
  if(d.x==d.y){
  	var matrix = d3.select(this.parentNode.parentNode),
  		data = d;

    deleteMatrix(matrix.datum());
    matrix.datum().nodes.length > 2 ? removeMatrixNode(matrix.datum(), data.parent, d3.event.x, d3.event.y) : releaseCluster(matrix.datum());
  }
}

function cluster(left, up, right, down, clusterType){

	print(left, up, right, down);
	print(net.nodes.filter(n =>( (n.x > left)&&(n.x < right)&&(n.y > up)&&(n.y < down)&&(!n.cluster))));//CONTROLLARE
	var clusterNodes = net.nodes.filter(n =>( (n.x * k + deltaX > left)&&(n.x * k + deltaX < right)&&(n.y * k + deltaY > up)&&(n.y * k + deltaY < down)&&(!n.cluster)));

	if(clusterNodes.length>1){
		net.nodes = net.nodes.filter(n =>(!( (n.x * k + deltaX > left)&&(n.x * k + deltaX < right)&&(n.y * k + deltaY > up)&&(n.y * k + deltaY < down)&&(!n.cluster))));

		var clNode = createClusterNode(clusterNodes);
    console.log(KeyboardEvent);
    console.log(d3.event.key);
  if(clusterType == 'chord-diagram')//c-->chord-diagram
  		expandCluster(clNode);
  if(clusterType == 'matrix')//m-->matrix
      expandMatrix(clNode);
	}

}
function createClusterNode(clusterNodes){
		clNum++;
		expand['cl'+clNum] = false;
		//-----------------------------------------------------------------
		//creo qui il cluster sulla base delle info della net
		var clNode = {/*'id': 'cl'+clNum, */'cluster': 'cl'+clNum, 'nodes': clusterNodes, 'size': clusterNodes.length, 'color': clusterNodes[0].community >=0 ? hullg.select("path.h"+clusterNodes[0].community)._groups[0][0].style.fill : assignClusterColor(), 'link_count': 0},
			externEdges = [],
			internEdges = [],
			clusters = net.nodes.filter(n => n.cluster),//individuo i nodi cluster collassati nella rete
			centroid = {x: 0, y: 0};

		clusterNodes.map(el => el.cluster = 'cl'+clNum);

		clusterNodes.map(function(n){
			centroid.x += n.x;
			centroid.y += n.y;
			n.group_data = clNode;
		});

		clNode.x = centroid.x/clNode.size;
		clNode.y = centroid.y/clNode.size;

		//manca externEdges, internEdges e link_count
		net.edges.map(function(e){
			var u = getCluster(e.source),  //definisco il cluster del nodo sorgente
        		v = getCluster(e.target),
        		size = e.size,
            edge = {'source': e.source, 'target': e.target, 'size': e.size, 'label' : e.label},
        		l = {};
      e.controlPoints ? edge.controlPoints = e.controlPoints : {};
      e.splineData ? edge.splineData = e.splineData : {};
			(u == clNode.cluster && v == clNode.cluster) ? internEdges.push(edge) : {};
			((u == clNode.cluster || v == clNode.cluster) && u != v) ? externEdges.push(edge) : {};
			u == clNode.cluster ? e.source = clNode : {};
			v == clNode.cluster ? e.target = clNode : {};
			e.size = 0;
      l = net.edges.find(function(l){return ((l.source == e.source && l.target == e.target && l.size > 0) || (l.target == e.source && l.source == e.target && l.size > 0))});//controllo presenza di copie
			// l = net.edges.find(function(l){return (l.source == e.source && l.target == e.target && l.size > 0)});//controllare
			if(l){
				l.size += size;
        // if (!(l.label.includes(e.label) || e.label.includes(l.label))){
        //   l.label = l.label+"\n"+e.label;
        // }
        l.label = concatenateStrings(l.label,e.label);
      }else
				e.size = size;
		});

		clNode.externEdges = externEdges;
		clNode.internEdges = internEdges;

		/*aggiornamento degli externEdges dei cluster collassati alla creazione di un nuovo cluster: devono essere associati al nuovo
		cluster tutti gli externEdges che puntavano ad un nodo che è stato integrato nel cluster*/
		clusters.map(function(cl){
			var edges = externEdges.filter(e => e.source.cluster == cl.cluster || e.target.cluster == cl.cluster);
			cl.externEdges.map(function(e){
				edges.map(function(l){
					cl.cluster == l.source.cluster && e.target.id == l.target.id ? e.target = clNode : {};
					cl.cluster == l.target.cluster && e.source.id == l.source.id ? e.source = clNode : {};

          cl.cluster == l.source.cluster && e.source.id == l.target.id ? e.source = clNode : {};
					cl.cluster == l.target.cluster && e.target.id == l.source.id ? e.target = clNode : {};
				});

			});

		});

		//aggiornamento degli elementi della rete
		net.edges = net.edges.filter(e => !(clNode.internEdges.find(function(l){return l == e;})) && e.size > 0);
		externEdges.map(function (e){clNode.link_count += e.size;});
		net.nodes.push(clNode);

		//-----------------------------------------------------------------
		print(net);
		updateNodes();
		updateEdges();
		//createHulls();
		return clNode;
} // END CREATECLUSTERNODE

function updateNodes(){

  if (!hull.empty()) {
     hull.data(convexHulls(net.nodes, getGroup, off))
         .attr("d", drawHull);
   }

	node = nodeg.selectAll("circle.node")
            .data(net.nodes, nodeid);

    node/*.transition()
		.duration(500)*/
		.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

	node.exit().remove();
    node.enter().append("circle")
            .attr("class", function(d) { return "node" + (d.size?" cluster":" leaf"); })
            .attr("r", function(d) { return d.size ? d.size + dr : dr+1; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("stroke-width", 3)
            .attr("stroke-color","#666666")
            .attr("stroke", "#666666")
            .attr("stroke-opacity", 0.6)
         //   .attr("fill", function(d) { return fill(d.cluster); })
			.merge(node);

	nodeg.selectAll("circle.node.cluster")
	      .attr("fill", function(d) { return d.color; })
		  .on("mouseenter", mouseEnterNode)
          .on("mouseleave", mouseLeaveNode)
          .on("click", expandCluster)
          // .on("contextmenu", releaseCluster)
          .on("contextmenu", expandMatrix)
          .call(d3.drag()
			    .on("start", cldragstarted)
		        .on("drag", dragged)
		        .on("end", cldragended));

    nodeg.selectAll("circle.node.leaf")
		 .attr("fill", function(d) { return "#a6cee3"; })
	     .on("mouseenter", mouseEnterNode)
         .on("mouseleave", mouseLeaveNode)
         .on("mousedown", function(d){return ctrlClick(d,net.nodes);})
         .on("contextmenu", function(d){return labelling.rightClick(d);})
    	 .call(d3.drag()
			    .on("start", dragstarted)
		        .on("drag", dragged)
		        .on("end", dragended));


//aggiornamento testo
   text = nodeg.selectAll("text")
            .data(net.nodes, nodeid);
	text.exit().remove();
	text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  text.enter().append("text")
      .each(function(d) {
        // compute the scale threshold for this element. i.e. how big does the scale need to be before I should display
        d.kThreshold = kMap(degSortedList.indexOf(d.degree));
        d.opacityScale = d3.scaleLinear()
          .domain([d.kThreshold, d.kThreshold + 1])
          .range([0, 1]);
      })
      .attr("dy", ".35em")
      .attr("dx", ".90em")
      .text(function(d) { return getLabel(d); })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("font-family", "sans-serif");

  labelling.handleText(k);


	/*  nodeg.selectAll("text").remove();
  	text = nodeg.selectAll(".text")
    .data(net.nodes, nodeid)
    .enter().append("text")
    .each(function(d) {
      // compute the scale threshold for this element. i.e. how big does the scale need to be before I should display
      d.kThreshold = kMap(degSortedList.indexOf(d.degree));
      d.opacityScale = d3.scaleLinear()
        .domain([d.kThreshold, d.kThreshold + 1])
        .range([0, 1]);
    })
    .attr("dy", ".35em")
    .attr("dx", ".90em")
    .text(function(d) { return getLabel(d); })
    .attr('opacity', function(d) {
      if (d.kThreshold < 1) {
        return 1;
      }
      return 0;
    })
    .style("font-family", "sans-serif")
    .style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");

	text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });*/

}

function updateEdges(){
  var edges = net.edges.filter(e => !e.splineData);

	link = linkg.selectAll("line.link")
	          .data(edges)
	          /*.attr("x1", function(d) { return d.source.x; })
			    .attr("y1", function(d) { return d.source.y; })
			    .attr("x2", function(d) { return d.target.x; })
			    .attr("y2", function(d) { return d.target.y; })*/
	          .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
    		    .attr("stroke", "black")
            .attr("stroke-color", "black")
            //  .attr("stroke", "lightgrey")
            //  .attr("stroke-color", "lightgrey")
              .attr("stroke-opacity", 0.6);


	link/*.transition()
		.duration(600)*/
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.attr("stroke-opacity", 0.6);
	//	.attr("stroke-opacity", function(e){return (e.source.copy || e.target.copy) ? 0.2 : 0.6});

	link.exit().remove();
	link.enter().append("line")
    			.attr("class", "link")
				.attr("x1", function(d) { return d.source.x; })
			    .attr("y1", function(d) { return d.source.y; })
			    .attr("x2", function(d) { return d.target.x; })
			    .attr("y2", function(d) { return d.target.y; })
    			.attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
    			.attr("stroke", "black")
            	.attr("stroke-color", "black")
            //	.attr("stroke", "lightgrey")
             //	.attr("stroke-color", "lightgrey")
            	.attr("stroke-opacity", 0.6)
            	.on("mouseenter", mouseEnterEdge)
            	.on("mouseleave", mouseLeaveEdge)
				.merge(link);

	/*link.transition()
		.duration(600)
		.attr("stroke-opacity", function(e){return (e.source.copy || e.target.copy) ? 0.2 : 0.6});*/

	link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
      	.attr("x2", function(d) { return d.target.x; })
      	.attr("y2", function(d) { return d.target.y; })
      	.attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
    	.attr("stroke", "black")
        .attr("stroke-color", "black")
        //.attr("stroke", "lightgrey")
        //.attr("stroke-color", "lightgrey")
       	.attr("stroke-opacity", 0.6)
       	.on("mouseenter", mouseEnterEdge)
       	.on("mouseleave", mouseLeaveEdge);

  updateSplines();

}

function updateHulls(){
  	/*hull = hullg.selectAll("path.hull")
  		.data(convexHulls(net.nodes, getGroup, off), getHull)
  		.attr("class",function(d){return "hull "+d.group})
  		.attr("d", drawHull)
  		.style("fill", function(d) { return fill(d.group); })
  		.on("click", hullClick)
  		.exit().remove()

  		.enter().append("path")
			  .attr("class",function(d){return "hull "+d.group})
			  .attr("d", drawHull)
			  .style("fill", function(d) { return fill(d.group); })
			  .on("click", hullClick);*/

/*
hullg.selectAll("path.hull").remove();
  hull = hullg.selectAll("path.hull")
      .data(convexHulls(net.nodes, getGroup, off))
    .enter().append("path")
      .attr("class", "hull")
      .attr("d", drawCluster)
      .style("fill", function(d) { return fill(d.group); })
      .on("click", function(d) {
console.log("hull click", d, arguments, this, expand[d.group]);
      expand[d.group] = false; init();
    });
*/
  palette.map(function(p){
    p.element == "hull" ? p.used = false : {};
  });
	hullg.selectAll("path.hull").remove();
	hull = hullg.selectAll("path.hull")
				.data(convexHulls(net.nodes, getGroup, off), getHull)
				.enter().append("path")
			  	.attr("class",function(d){return "hull h"+d.group})
			 	.attr("d", drawHull)
			  	.style("fill", function(d) { return assignHullColor(d.group); })
        .on("contextmenu",hullRightClick)
				.on("click", hullClick);

	/*hull
		.transition().duration(500)
		.attr("d", drawHull);*/


}

function updateHull2(){
/*node.transition()
		.duration(500)
		.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });*/
        palette.map(function(p){
          p.element == "hull" ? p.used = false : {};
        });
  	hullg.selectAll("path.hull").remove();
  	hull = hullg.selectAll("path.hull")
  		.data(convexHulls(net.nodes, getGroup, off))
  		.enter().append("path")
  		.attr("class",function(d){return "hull h"+d.group})
  		.attr("d", drawHull)
  		.style("fill", function(d) { return assignHullColor(d.group); })
      .on("contextmenu",hullRightClick)
  		.on("click", hullClick);
}
function updateControlPoints(splineEdges){
  splineEdges.map(function(s){
    console.log(s);
    if(s.source.copy && !s.target.copy){
      pos = [s.target.x,s.target.y];
      if(!(s.controlPoints.indexOf(pos)+1)){//aggiorno lato nodo
        console.log(pos);
        s.controlPoints[2][0] = pos[0];
        s.controlPoints[2][1] = pos[1];
        s.controlPoints[3][0] = pos[0];
        s.controlPoints[3][1] = pos[1];
      }
      pos = [s.source.x,s.source.y];
      if(!(s.controlPoints.indexOf(pos)+1)){//aggiorno lato matrice
        deltaPos = [s.controlPoints[0][0] - s.controlPoints[1][0], s.controlPoints[0][1] - s.controlPoints[1][1]];
        s.controlPoints[0] = pos;
        s.controlPoints[1][0] = pos[0] - deltaPos[0];
        s.controlPoints[1][1] = pos[1] - deltaPos[1];
      }
    }else if(s.target.copy && !s.source.copy){
      pos = [s.source.x,s.source.y];
      if(!(s.controlPoints.indexOf(pos)+1)){//aggiorno lato nodo
        s.controlPoints[0] = pos;
        s.controlPoints[1] = pos;
      }
      pos = [s.target.x,s.target.y];
      if(!(s.controlPoints.indexOf(pos)+1)){//aggiorno lato matrice
        deltaPos = [s.controlPoints[3][0] - s.controlPoints[2][0], s.controlPoints[3][1] - s.controlPoints[2][1]];
        s.controlPoints[3] = pos;
        s.controlPoints[2][0] = pos[0] - deltaPos[0];
        s.controlPoints[2][1] = pos[1] - deltaPos[1];
      }
    }else if(s.target.copy && s.source.copy){
      sPos = [s.source.x,s.source.y];
      tPos = [s.target.x,s.target.y];
      if(!(s.controlPoints.indexOf(sPos)+1)){
        deltaPos = [s.controlPoints[0][0] - s.controlPoints[1][0], s.controlPoints[0][1] - s.controlPoints[1][1]];
        s.controlPoints[0] = sPos;
        s.controlPoints[1][0] = sPos[0] - deltaPos[0];
        s.controlPoints[1][1] = sPos[1] - deltaPos[1];
      }if(!(s.controlPoints.indexOf(tPos)+1)){
        deltaPos = [s.controlPoints[3][0] - s.controlPoints[2][0], s.controlPoints[3][1] - s.controlPoints[2][1]];
        s.controlPoints[3] = tPos;
        s.controlPoints[2][0] = tPos[0] - deltaPos[0];
        s.controlPoints[2][1] = tPos[1] - deltaPos[1];
      }

    }
  });
}
function updateSplines(){

  var splineEdges = net.edges.filter(e => e.splineData),
      splineGenerator = d3.line().curve(d3.curveBasis),
      spline;

  updateControlPoints(splineEdges);
  splineEdges.map(function(e){
    e.splineData = splineGenerator(e.controlPoints);
  })

  splineg.selectAll("path").remove();

  spline = splineg.selectAll("path")
                  .data(splineEdges);
  /*  node.transition()
		.duration(500)
		.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });*/

	  spline.exit().remove();
    spline.enter().append("path")
          .attr("d", function(d){return d.splineData;})
          .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
          .attr("stroke", "black")
          .attr("stroke-color", "black")
          .attr("stroke-opacity", 0.6)
          .attr("fill", "transparent")
          .on("mouseenter", mouseEnterSpline)
          .on("mouseleave", mouseLeaveSpline)
			    .merge(spline);

  spline.on("mouseenter", mouseEnterSpline)
        .on("mouseleave", mouseLeaveSpline);
}

function keydownfunction(e) {
  if(e.ctrlKey){
    vis.call(d3.zoom().on("zoom", zoom_actions));
    vis.on("mousedown", null)
       .on("mousemove", null)
       .on("mouseup", null);
  }
  if(e.key == "c"){
  vis.on(".zoom", null);
  vis.on("mousedown", mousedown)
     .on("mousemove", mousemove)
     .on("mouseup", function(){ mouseup("chord-diagram"); });
   }
   if(e.key == "m"){
   vis.on(".zoom", null);
   vis.on("mousedown", mousedown)
      .on("mousemove", mousemove)
      .on("mouseup", function(){ mouseup("matrix"); });
    }
}

function keyupfunction(e) {
    vis.on(".zoom", null);
    vis.on("mousedown", mousedown)
       .on("mousemove", mousemove)
       .on("mouseup", function(){ mouseup(""); });
}

//Zoom listener function
function zoom_actions(){
    vis.select('g.edges').attr("transform", d3.event.transform);
    vis.select('g.splines').attr("transform", d3.event.transform);
    vis.select('g.nodes').attr("transform", d3.event.transform);
    vis.select('g.diagrams').attr("transform", d3.event.transform);
    vis.select('g.rectangles').attr("transform", d3.event.transform);
    vis.select('g.hulls').attr("transform", d3.event.transform);
    vis.select('g.matrices').attr("transform", d3.event.transform);


    k = d3.event.transform.k;
    //vis.select('g.nodes').selectAll('text').style("font-size", k > 1 ? 12/Math.sqrt(k)+"px" : "12px");
    labelling.handleText(k);
    print('zoom transform');
    print(d3.event.transform);

    deltaX = d3.event.transform.x;
    deltaY = d3.event.transform.y;
}

//onclick button suggestClusters - Topological
function createHullsTopol(){
    //CLUSTERING TOPOLOGICO
    var nodes, edges;
    nodes = net.nodes.filter(n => !n.copy && n.id);
    edges = net.edges.filter(e => !e.source.copy && !e.target.copy && e.target.id && e.source.id);
    netClustering.cluster(nodes, edges, "community", "clustervalue");
    // netClustering.cluster(net.nodes, net.edges, "community", "clustervalue");





    palette.map(function(p){
      p.element == "hull" ? p.used = false : {};
    });

  	hullg.selectAll("path.hull").remove();

  	hull = hullg.selectAll("path.hull")
  			  .data(convexHulls(net.nodes, getGroup, off), getHull)
  			  .enter().append("path")
  			  .attr("class",function(d){return "hull h"+d.group})
  			  .attr("d", drawHull)
  			  .style("fill", function(d) { return assignHullColor(d.group); })
  			  .on("click", hullClick)
          .on("contextmenu",hullRightClick);


          var slider2 = document.getElementsByClassName('slidecontainer2');
          slider2.item(slider2).hidden = true;
          slider2.item(slider2).children.textInput2.value=2;
          slider2.item(slider2).children.Kvalue.value=2;
          var slider3 = document.getElementsByClassName('slidecontainer3');
          slider3.item(slider3).hidden = true;
          slider3.item(slider3).children.textInput3.value=4;
          slider3.item(slider3).children.Kthreshold.value=4;

  }



//onclick button suggestClusters - Geometric
var param = 2;
var param2 = 4;
function createHulls(){

    //KMEANS CLUSTERING
    var nodesToAssign = net.nodes.filter(function(n) {if(typeof(n.cluster)=="undefined") return n})
    var kmeans = optKMeans(nodesToAssign,param,param2);
    console.log(kmeans);
    console.log(calculateWithinClusterVariance(kmeans));
    assignCluster(kmeans.assignments, net.nodes);
    //filterNodesByDistance(net.nodes, kmeans.means, kmeans.treshold);//se la distanza dal centroide supera la soglia, allora n.community = -1
  	filterNodesByTresholds(nodesToAssign, kmeans.means, kmeans.tresholds);





    palette.map(function(p){
    p.element == "hull" ? p.used = false : {};
  });

	hullg.selectAll("path.hull").remove();

	hull = hullg.selectAll("path.hull")
			  .data(convexHulls(net.nodes, getGroup, off), getHull)
			  .enter().append("path")
			  .attr("class",function(d){return "hull h"+d.group})
			  .attr("d", drawHull)
			  .style("fill", function(d) { return assignHullColor(d.group); })
			  .on("click", hullClick)
        .on("contextmenu",hullRightClick);

        var slider2 = document.getElementsByClassName('slidecontainer2');
        slider2.item(slider2).hidden = false;
        var slider3 = document.getElementsByClassName('slidecontainer3');
        slider3.item(slider3).hidden = false;
}

function hullClick(d){
	var community = d.group,
		nodes = net.nodes.filter(n => n.community == community);
  if (nodes.length>1){
  		clNode = createClusterNode(nodes);
    	net.nodes = net.nodes.filter(n => n.community != community);
    	//updateHulls();
    	expandCluster(clNode);
  }
	//ticked();
}

function hullRightClick(d){
  d3.event.preventDefault();
	var community = d.group,
		nodes = net.nodes.filter(n => n.community == community);
  if (nodes.length>1){
  		clNode = createClusterNode(nodes);
    	net.nodes = net.nodes.filter(n => n.community != community);
    	//updateHulls();
    	expandMatrix(clNode);
  }
	//ticked();
}

function hideHulls(){
  /*hull.data(convexHulls(net.nodes, getGroup, off))
      .style("display", "none")*/
  hullg.selectAll("path.hull").remove();
  net.nodes.map(function(n){
    n.community = -1;
  });
  net.nodes.map(function(n){
    if (n.cluster){
      n.nodes.map(function (v){
        v.community = -1;
      });
    }
  });
  chordg.selectAll('g.diagram')
        .each(function(d){
          d.nodes.map(function (v){
            v.community = -1;
          });
        })
  matrixg.selectAll('g.matrix')
        .each(function(d){
          d.nodes.map(function (v){
            v.community = -1;
          });
        })
}


//Drag listener functions
function dragstarted(d) {
	  print("dragstarted");
      //if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      if(!d3.event.active){
      	d.x = d.x;
	    d.y = d.y;
      }else{
	      d.fx = d.x;
	      d.fy = d.y;
	  }
	 ticked();
    }

function dragged(d) {
	print("dragged "+nodeid(d));
    d.x = d3.event.x;
	d.y = d3.event.y;
	if(!d3.event.active){
      	d.fx = d3.event.x;
      	d.fy = d3.event.y;
      }
   	//ticked();
    updateNodes();
    updateEdges();
    }

function dragended(d) {
	print("draggended");
    if (d3.event.active){
    	d.fx = null;
      	d.fy = null;
    }
    if(d.id){
    	controlChordDiagramOverlapping(d);
      controlMatrixOverlapping(d);
    }
 	//ticked();
  updateNodes();
  updateEdges();
  }

//cluster dragging
function cldragstarted(d){
	startX = d3.event.x,//oppure uso d3.event.x NB d.x non mi dà l'effettiva posizione di partenza del cluster, quindi i calcoli vengono sbagliati
	startY = d3.event.y;
	print("d.x "+d.x+" d3.event.x "+d3.event.x+" startX "+startX);  //startX cambia da start a end
	dragstarted(d);
}

function cldragended(d){
	var dx = d3.event.x - startX,//lo startX che legge qui non è quello di cldragstarted
		dy = d3.event.y - startY;
		print("dragended startX "+startX);
		print("delta x,y "+dx+", "+dy);
	d.nodes.map(function(n){
		n.x += dx;
		n.y += dy;
	});
	dragended(d);
	startX = 0;
	startY = 0;
}

//chord diagram dragging
function chordDragStarted(d){//qunado inizia il drag il chord si sposta leggermente verso il basso
	startX = this.transform.baseVal.consolidate().matrix.e;
	startY = this.transform.baseVal.consolidate().matrix.f;
}

function chordDragged(d){
	var dx = d3.event.x - startX,
		dy = d3.event.y - startY;
	d3.select(this)
		.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
	d.copies.map(function(c){
		c.x += dx;
		c.y += dy;
	});
	updateEdges();
	startX = d3.event.x;
	startY = d3.event.y;
}

function chordDragEnded(d){
	var dx = d3.event.x - d.x, // il delta qui serve per calcolare lo spostamento dei d.nodes
		dy = d3.event.y - d.y;
	d3.select(this)
		.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
	d.x = d3.event.x;
	d.y = d3.event.y;
	d.nodes.map(function(n){//MI DA PROBLEMI CON IL LINEAR GRADIENT
		n.x += dx;
		n.y += dy;
	});
	startX = 0;
	startY = 0;
	updateEdges();
}

//matrix diagram dragging
function matrixDragStarted(d){
  startX = this.transform.baseVal.consolidate().matrix.e;
	startY = this.transform.baseVal.consolidate().matrix.f;
  deltaMatrixX = d3.event.x-startX;
  deltaMatrixY = d3.event.y-startY;
}
//-d.nodes.length*config.cellSize
function matrixDragged(d){
	var dx = d3.event.x - deltaMatrixX - startX,
		  dy = d3.event.y - deltaMatrixY - startY;
	d3.select(this)
		.attr("transform", "translate(" + (d3.event.x - deltaMatrixX)+ "," + (d3.event.y - deltaMatrixY) + ")");
	d.matrixCopyNodes.top.map(function(c){
		c.x += dx;
		c.y += dy;
	});
  d.matrixCopyNodes.right.map(function(c){
		c.x += dx;
		c.y += dy;
	});
  d.matrixCopyNodes.bottom.map(function(c){
		c.x += dx;
		c.y += dy;
	});
  d.matrixCopyNodes.left.map(function(c){
		c.x += dx;
		c.y += dy;
	});

	updateEdges();
	startX = d3.event.x - deltaMatrixX;
	startY = d3.event.y - deltaMatrixY;

}

function matrixDragEnded(d){
	var dx = d3.event.x - deltaMatrixX - d.x, // il delta qui serve per calcolare lo spostamento dei d.nodes
		dy = d3.event.y - deltaMatrixY - d.y;
	d3.select(this)
		.attr("transform", "translate(" + (d3.event.x - deltaMatrixX) + "," + (d3.event.y - deltaMatrixY)+ ")");
	d.x = d3.event.x - deltaMatrixX;
	d.y = d3.event.y - deltaMatrixY;
	d.nodes.map(function(n){//MI DA PROBLEMI CON IL LINEAR GRADIENT
		n.x += dx;
		n.y += dy;
	});
	startX = 0;
	startY = 0;
  deltaMatrixX = 0;
  deltaMatrixY = 0;
  d.dragged = true;
	updateEdges();
}

function controlMatrixOverlapping(n){
	var matrix = matrixg.selectAll("g.matrix").select(function(d){return matrixOverlapping(this, n.x, n.y) ? this : null});

	if(!matrix.empty()){
		deleteMatrix(matrix.datum());
		addNodeMatrix(matrix.datum(), n);
	}
}


function controlChordDiagramOverlapping(n){
	var diagram = chordg.selectAll("g.diagram").select(function(d){return chordDiagramOverlapping(d, n.x, n.y) ? this : null});
		//data = diagram.datum()

	print("diagram empty?");
	print(diagram.empty());
	if(!diagram.empty()){
		deleteChord(diagram.datum());
		addNode(diagram.datum(), n);
	}
}

function chordDiagramOverlapping(d, x, y){
	return Math.pow(d.x-x,2)+Math.pow(d.y-y,2) < Math.pow(d.r,2);
}

function matrixOverlapping(matrix, x, y){
  var minX = matrix.transform.baseVal.consolidate().matrix.e,
      minY = matrix.transform.baseVal.consolidate().matrix.f,
      maxX = minX + config.cellSize*d3.select(matrix).datum().size,
      maxY = minY + config.cellSize*d3.select(matrix).datum().size;
	return (minX<x && maxX>x)&&(minY<y && maxY>y);
}

//funzione per calcolo delle label degli archi: edge: {source: {…}, target: {…}, size: 1, VALUE:string..}
//DA QUI IN POI IL CODICE SI SPECIALIZZA PER LO USE CASE, QUINDI PERDE DI GENERALITà DI UTILIZZO PER TUTTI I GML

//funzione che dato una coppia source, target, calcola la lista di pubblicazioni da una struttura dati:
/*suppongo di disporre della seguente struttura dati:
publications:{
	[
		{
		authors:["author1", "author2", ..],
		article:"publication's name"
		},
		...
	]
}
*/
function edgePubs(src, trg){
	var pubs = [],
		author1 = [],
		author2 = [];

	src.cluster ? author1 = extractAuthors(src) : author.push(src.label)
	trg.cluster ? author2 = extractAuthors(trg) : author.push(trg.label)

	for (var i = 0; i < author1.length; i++) {
		for (var j = 0; j < author2.length; j++) {
			publications.map(function(p){
				p.authors.find(a => a.equals(author1[i])) && p.authors.find(a => a.equals(author2[j])) && !pubs.find(el => el.equals(p.article)) ? pubs.push(p.article) : {}
			});
		}
	}

	return pubs;
}


function concatenateStrings(s1,s2){
  var splitS1 = s1.split("\n"),
      splitS2 = s2.split("\n"),
      difference = [];
      if (typeof splitS1 =='undefined'){
          splitS1 = s1;
      }
      if (typeof splitS2 == 'undefined'){
          splitS2 = s2;
      }

      for (var i = 0; i < splitS1.length; i++) {
        var splitted = splitS1[i].split(": ");
        if (typeof splitted != 'undefined') {
          var isnum = /^\d+$/.test(splitted[0]);
          if (isnum) {
            splitS1[i] = splitted[1];
          }
        }
      }
      for (var i = 0; i < splitS2.length; i++) {
        var splitted = splitS2[i].split(": ");
        if (typeof splitted != 'undefined') {
          var isnum = /^\d+$/.test(splitted[0]);
          if (isnum) {
            splitS2[i] = splitted[1];
          }
        }
      }

      for (var i = 0; i < splitS2.length; i++){
        var included = false;
        for (var j = 0; j < splitS1.length; j++) {
          if (splitS1[j].includes(splitS2[i]) || splitS2[i].includes(splitS1[j])) {
            included = true;
          }
        }
        if (!included) {
          var splitted = splitS2[i].split(": ");
          if (typeof splitS2 != 'undefined') {
            var isnum = /^\d+$/.test(splitted[0]);
            if (!isnum) {
              difference.push(splitS2[i]);
            } else
            difference.push(splitted[1]);
          }else {
            difference.push(splitS2[i]);
          }
        }
      }
  var concatenation = [];
      concatenation += "1: " + splitS1[0];
      for (var i = 1; i < splitS1.length; i++) {
        concatenation += "\n"+ (i+1) + ": " + splitS1[i];
      }
      if (difference[0]) {
        concatenation += "\n" + (splitS1.length + 1) + ": " + difference[0];
        for (var j = 1; j < difference.length; j++) {
          concatenation += "\n"+ (splitS1.length + (j+1)) + ": " + difference[j];
        }
      }

      var spl = concatenation.split("\n");
      if (typeof spl == 'undefined' || spl.length == 1) {
        var sp = concatenation.split(": ");
        if (typeof sp != 'undefined') {
          var isnum = /^\d+$/.test(sp[0]);
          if (isnum) {
            concatenation = sp[1];
          }
        }
      }

       return concatenation;

}
