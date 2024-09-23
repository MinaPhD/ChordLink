//SCRIPT PER LA CREAZIONE DI CHORD DIAGRAMS DEI CLUSTERS

function createChord(angles, matrix, r, cx, cy, d, map){

    print(matrix);
    print(angles);

    d.map = map;
    d.r = r;

	var cluster = d.cluster,
		nodes = d.nodes,
    nodeIds = nodes.map(function(n){return n.id}),
		wrapper = chordg.append("g") // il wrapper contiene tutto il chord diagram
						.datum(d)
						.attr("class", "diagram "+cluster)
                 	 	.attr("transform", "translate(" + cx + "," + cy + ")"),
        outerRadius = r/* - (0.3*r)*/,
		innerRadius = r - (0.1*r)/*- (0.4*r)*/,
		chordGenerator = mychord()
			        	        .padAngle(padAngle)//in radianti
			                  .thickness(0.9)
			                  .listAngles(angles),
		chord = chordGenerator(matrix),
		arcs = d3.arc()
	             .innerRadius(innerRadius)
	             .outerRadius(outerRadius),
	    ribbon = myribbon()
               		 .radius(innerRadius),
        opacities = d3.scaleOrdinal()
	                  .domain(d3.range(nodes.length))
	                  .range(0.67),
      palette = getPalette(nodes.length),
	    color = d3.scaleOrdinal()
	              .domain(nodeIds)
	              .range(palette),
	              //.range(d3.schemePaired),

		grads = wrapper.append("defs") //questo forse va messo in force_cluster2 quando dichiaro i componenti grafici
	               .selectAll("linearGradient")
	               .data(chord)
	               .enter()
	               .append("linearGradient")
	               .attr("id", getGradID)
	               .attr("gradientUnits", "userSpaceOnUse")
	               .attr("x1", function(d, i){ return innerRadius * Math.cos((d.source.endAngle-d.source.startAngle) / 2 + d.source.startAngle - Math.PI/2); })
	               .attr("y1", function(d, i){ return innerRadius * Math.sin((d.source.endAngle-d.source.startAngle) / 2 + d.source.startAngle - Math.PI/2); })
	               .attr("x2", function(d,i){ return innerRadius * Math.cos((d.target.endAngle-d.target.startAngle) / 2 + d.target.startAngle - Math.PI/2); })
	               .attr("y2", function(d,i){ return innerRadius * Math.sin((d.target.endAngle-d.target.startAngle) / 2 + d.target.startAngle - Math.PI/2); });
	// set the starting color (at 0%)
	grads.append("stop")
	     .attr("offset", "0%")
	     .attr("stop-color", function(d){ return color(copymap[cluster][map[d.source.index][0]])})

	//set the ending color (at 100%)
	grads.append("stop")
	     .attr("offset", "100%")
	     .attr("stop-color", function(d){ return color(copymap[cluster][map[d.target.index][0]])})

	// making the ribbons
	wrapper.selectAll("path")
		  .data(chord)
		  .enter()
		  .append("path")
		  .attr("class", function(d) {
		    return "chord chord-" + d.source.index + " chord-" + d.target.index // The first chord allows us to select all of them. The second chord allows us to select each individual one.
		    })
		  .style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
		  .attr("d", ribbon)
		  .attr("opacity", function(d){ return 1})
		  .on("mouseenter", mouseEnterChord)
		  .on("mouseleave", mouseLeaveChord);

	var g = wrapper.selectAll("g") //gruppi
               .data(chord.groups)
               .enter()
               .append("g")
               .attr("class", function(d){return "group "+"group"+d.index;})
               .on("mouseenter", mouseEnterArc)
		  	   .on("mouseleave", mouseLeaveArc)
		  	   .on("contextmenu", rightClickArc);

    g.append("path")
  	 .attr("fill", function(d){ return color(copymap[cluster][map[d.index][0]])})
  	 // .style("stroke", function(d){ return d3.rgb(color(d.index)).darker(); })
  	 .attr("d", arcs)
  	 .style("opacity", 1)

	 g.append("text")
	 	.each(function(d){ d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "label")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
           return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
           + "translate(" + (outerRadius + 2) + ")"
           + (d.angle > Math.PI ? "rotate(180)" : "");
        })
    	.text(function(d) { //funziona, ora c'è un problema nelle label onmouseEnterArc
    		var angleWidth = [],
	    		thisWidth = d.endAngle > d.startAngle ? d.endAngle - d.startAngle : d.startAngle - d.endAngle,
 		    	n = nodes.find(function(n) {return n.id == copymap[cluster][map[d.index][0]]}),
	    		groups = g.select(function(g){return copymap[cluster][map[g.index][0]] == copymap[cluster][map[d.index][0]] ? this : null});
	    	/*print('groups');
	    	print(groups);*/
	    	thisWidth < 0 ? thisWidth = thisWidth + 2*Math.PI : {};
	    	groups.each(function(dg){
	    		var diff = dg.endAngle > dg.startAngle ? dg.endAngle - dg.startAngle : dg.startAngle - dg.endAngle;
	    		//getLabel(n) == "MmeHucheloup" || "Prouvaire" ? print("end "+dg.endAngle+" start "+dg.startAngle) : {};
	    		diff < 0 ? diff = diff + 2*Math.PI : {};
	    		angleWidth.push(diff);
	    	});
	    	angleWidth.sort(function(a,b){return b-a;})
	    	/*print('angleWidth');
	    	print(angleWidth);*/
	    	thisWidth == angleWidth[0] ? print(getLabel(n)+" "+thisWidth) : {};
	    	return thisWidth == angleWidth[0] ? getLabel(n) : null;
	     })
	    .attr('opacity', function(d) { return 1; })
	    .style("font-family", "sans-serif") // Ale
	    .style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");

	wrapper.on("click",deleteChord)
		   .call(d3.drag()
			    .on("start", chordDragStarted)
		        .on("drag", chordDragged)
		        .on("end", chordDragEnded));


	// creating the fill gradient
	function getGradID(d){ return cluster + "-linkGrad-" + d.source.index + "-" + d.target.index; }
}

//color list
/*
"#A52A2A", "#0000FF", "#008000", "#FF00FF", "#FFFF00", "#FF0000"

MEDIUMORCHID, limegreen, DEEPSKYBLUE, DARKGOLDENROD, ORANGE, CRIMSON
#BA55D3, #32CD32, #00BFFF, #B8860B, #FFA500, #DC143C

LIGHTGREEN, AQUA, BURLYWOOD, KHAKI, PLUM, SALMON
#90EE90, #00FFFF, #DEB887, #F0E68C, #DDA0DD, #FA8072

LIGHTSALMON, FIREBRICK, DARKKHAKI, MEDIUMPURPLE, YELLOWGREEN, DARKCYAN
#FFA07A, #B22222, #BDB76B, #9370DB, #9ACD32, #008B8B

NAVY, CHOCOLATE, SILVER, MEDIUMSEAGREEN, PALEVIOLETRED, DARKRED
#000080, #D2691E, #C0C0C0, #3CB371, #DB7093, #8B0000

STEELBLUE, GOLD, CHARTREUSE, CYAN, SANDYBROWN, ORANGERED
#4682B4, #FFD700, #7FFF00, #00FFFF, #F4A460, #FF4500

DARKSLATEGRAY, MAROON, LIGHTSTEELBLUE, DARKGREEN, INDIGO, SPRINGGREEN
#2F4F4F, #800000, #B0C4DE, #006400, #4B0082, #00FF7F
*/
