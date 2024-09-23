
function createMatrix(d, data, minX, minY, maxX, maxY, newMinX, newMinY, newMaxX, newMaxY, sideSize, dimensioneCuscinetto){

  var wrapper = matrixg.append("g") //definire matrixg globale
                        .datum(d)
                        .attr("class", "matrix "+d.cluster)
                        .attr("transform", "translate(" + minX + "," + minY + ")"),//partiamo dall'alto a sinistra usando il rect
      //cellScale = d3.scale.ordinal().rangeBands([0, config.cellSize*data.length]);
      cellScale = d3.scaleBand().domain(d3.range(data.length)).range([0, config.cellSize*data.length]),
      copyEdges = d.copyEdges,
      labels = [],
      spline = d3.line().curve(d3.curveBasis),
      horizontalLabels,
      verticalLabels;
      //d3.scaleOrdinal(palette)
      data.forEach(function(d,i) { labels.push(d[i].node.label); });

      //Draw the Rectangle
    /*  wrapper.append("rect")
            // .attr("class", "cuscinetto")
             .attr("x", newMinX)//-dimensioneCuscinetto/2
             .attr("y", newMinY)//-dimensioneCuscinetto/2
             .attr("width", config.cellSize*data.length + dimensioneCuscinetto)
             .attr("height", config.cellSize*data.length + dimensioneCuscinetto)
             .attr("style", "fill:transparent;stroke-width:1;stroke:rgb(0,0,0);z-index:0");*/



      /*d.copies.forEach(function(copy) {
        copy.size = 1;
        wrapper.append("circle")
              .attr("class", function(d){return "rectNode copy"+copy.number;})//calimeroNode
              .attr("r", "3" )
              .attr("cx", copy.x-minX)
              .attr("cy", copy.y-minY)
              .attr("stroke-width", 1)
              .attr("stroke-color","#000000")
              .attr("stroke", "#000000")
              .attr("stroke-opacity", 0.6)
              .attr("fill", function(d) { return "#000000"; })
      });*/

  wrapper.selectAll(".cell").remove();
  wrapper.selectAll(".row").remove();
  wrapper.selectAll(".column").remove();
  wrapper.selectAll(".cuscinetto").remove();
  wrapper.selectAll(".copyEdge").remove();

  wrapper.selectAll(".row").data(data)//aggiorno e creo le righe e contestualmente le celle
                      		 .enter()
                      		 .append("g")
                      		 .attr("class", "row")
                      		 .attr("transform", function(d, i) { return "translate("+(0)+","+(cellScale(i))+")"; })
                      		 .each(function(row) {
                      								d3.select(this)
                      									.selectAll(".cell").data(row)
                      									.enter()
                      									.append("rect")
                      									.attr("class", "cell")
                      									.attr("x", function(d) { return (cellScale(d.x)); })
                      									.attr("width", cellScale.bandwidth())
                      									.attr("height", cellScale.bandwidth())
                      							});

  wrapper.selectAll(".column")
         .data(data)
         .enter()
         .append("g")
         .attr("class", "column")
         .attr("transform", function(d, i) { return "translate("+(cellScale(i))+","+(0)+")rotate(-90)"; });


/*
codice che crea gli archi tra cuscinetto e matrice: non abbiamo bisogno di aggiornarli, questi vengono creati
o distrutti quando apro o chiudo il cluster, quindi li associo al wrapper.
*/

//copyEdge.controlPoints = [] può avere dimensione 3-4, cioè endpoints più 1 o due controlPoint collegati alle relative matrici
//cambiare copyEdges
d.externEdges.map(function(e){
e.splineData = spline(e.controlPoints);
/*  splineg.append("path")
        .attr("d", function(d){return e.splineData;})
        .attr("stroke-width", function(d) { return linkUpperBuond(e.size)})
        .attr("stroke", "black")
        .attr("stroke-color", "black")
        .attr("stroke-opacity", 0.6)
        .attr("fill", "transparent");*/
})

/*splineg.selectAll("path")
       .data(d.externEdges)
       .enter()
       .append("path")
       .attr("d", function(d){return d.splineData;})
       .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
       .attr("stroke", "black")
       .attr("stroke-color", "black")
       .attr("stroke-opacity", 0.6)
       .attr("fill", "transparent");*/


  /*wrapper.selectAll(".copyEdge")//a volte durante le interazioni è capitato di vedere archi non associati ai copyEdges ma al cluster d.
         .data(copyEdges)
         .enter()
         .append("line")
         .attr("class", function(d){return "copyEdge link"+d.index;})
         .attr("x1", function(d) { return d.source.x-minX; })//coordinate relative
         .attr("y1", function(d) { return d.source.y-minY; })
         .attr("x2", function(d) { return d.target.x-minX; })
         .attr("y2", function(d) { return d.target.y-minY; })
         .attr("stroke-width", function(d) { return linkUpperBuond(d.size); })
         .attr("stroke", "black")
         .attr("stroke-color", "black")
           //	.attr("stroke", "lightgrey")
            //	.attr("stroke-color", "lightgrey")
         .attr("stroke-opacity", 0.6)
         .on("mouseenter", mouseEnterCopyEdge)
         .on("mouseleave", mouseLeaveCopyEdge);*/



  horizontalLabels = wrapper.selectAll(".label.horizontal")
         .data(labels)
         .enter()
         .append('g')
         .attr("class", "label horizontal");

  var mx = 0;

  horizontalLabels.append("text")
  				.text(function(d, i) { return d; })
  				.attr("text-anchor", "end")
  				.attr("dy", function (d,i) { mx = mx < this.getBBox().width ? this.getBBox().width : mx; //centrare le label rispetto alle celle
                                       console.log(cellScale(i)+cellScale.bandwidth()-1/2*(cellScale.bandwidth()-this.getBBox().height));
                                       return cellScale(i)+cellScale.bandwidth()-4;//ci alziamo dalla base della cella di 3
                                     })
  				.attr("dx", function (d) { return - 5; })
          .attr("z-index", "-1")
          .attr("position", "relative")
  				//.attr("width", function(d) { return mx; }).attr("height", function (d) { return this.getBBox().height; })
  				.style("stroke", function(d) { return "white"; })
          .style("stroke-width", 0)
          .style("font-family", "sans-serif") // Ale
    	    .style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");

  verticalLabels = wrapper.selectAll(".label.vertical")
          .data(labels)
          .enter()
          .append('g')
          .attr("class", "label vertical");

  mx = 0;
  verticalLabels.append("text")
            .text(function(d, i) { return d; })
            .attr("text-anchor", "start")
            .attr("transform", function(d,i) {
               return "rotate(" + 270 + ")";
            })
            .attr("dx", function (d) { return + 5; })
            .attr("dy", function (d,i) { mx = mx < this.getBBox().width ? this.getBBox().width : mx; //centrare le label rispetto alle celle
                                         console.log(cellScale(i)+cellScale.bandwidth()-1/2*(cellScale.bandwidth()-this.getBBox().height));
                                         return cellScale(i)+cellScale.bandwidth()-4;
                                       })
            .attr("z-index", "-1")
            .attr("position", "relative")
            .style("stroke", function(d) { return "white"; })
            .style("stroke-width", 0)
            .style("font-family", "sans-serif") // Ale
            .style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");


            if (!showVertical) {
              horizontalMatrixLabels();
            }
            if (showVertical) {
              bothMatrixLabels();
            }


   renderMatrix(wrapper);
   wrapper//.on("click",deleteMatrix)
          .call(d3.drag()
          .on("start", matrixDragStarted)
          .on("drag", matrixDragged)
          .on("end", matrixDragEnded))
          .on("click",deleteMatrix);

   /*wrapper
      .attr("transform", "translate(" + (minX + 1)+ "," + (minY + 1) + ")");*/
}

function renderMatrix(wrapper){

		wrapper.selectAll(".row")
           .each(function(row) {
                      d3.select(this)
                        .selectAll(".cell")
                        .style("stroke", function(d) { return cellStroke(d); })
                  			.style("stroke-width", function(d) { return cellStrokeWidth(d); })
                        .style("stroke-opacity", function(d) { return cellStrokeOpacity(d); })
                  			.style("fill", function(d) { return cellFill(d, wrapper.datum()); })
                  			.style("opacity", function(d) { return cellOpacity(d); })
                        .on("mouseenter", mouseEnterCell)
         		  	        .on("mouseleave", mouseLeaveCell)
                        .on("contextmenu", rightClickCell);
                    });

	}


  /**
	 * This method returns the size of the nodes
	 */
	function cellSize(d) { return config.cellSize; };

	/**
	 * This method returns the color of the nodes
	 */
	function cellFill(d, datum) { return d.x == d.y ? datum.color : d.z ?  config.cellColorLink : config.cellColor; };

	/**
	 * This method returns the stroke of the nodes
	 */
	function cellStroke(d) { return config.cellStroke; };

	/**
	 * This method returns the stroke-width of the links
	 */
   function cellStrokeWidth(d) { return config.cellStrokeWidth; };

   function cellStrokeOpacity(d) { return config.cellStrokeOpacity; };
	/**
	 * This method returns the stroke-width of the links
	 */
	function cellOpacity(d) { return 1.0; };
