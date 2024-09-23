//labelling strategy pattern

var Labelling = function() {
    this.type = "";
};

Labelling.prototype = {
    setStrategy: function(type) {
        this.type = type;
    },

    rightClick: function(d) {
        return this.type.rightClick(d);
    },

    handleText: function(k) {
        return this.type.handleText(k);
    }
};

var NoLabels = function() {
    this.rightClick = function(d) {
        d3.event.preventDefault();
           // react on right-clicking
        var text = vis.select('g.nodes').selectAll('text').select(function(t){return t.label == d.label ? this : null});
        d.clicked = !d.clicked;
        text.style("font-size") == "0px" ? text.style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px").attr("opacity", 1) : text.style("font-size", 0);
        console.log("NoLabels");
        console.log("right-clicked "+d.label+" value: "+d.clicked);
    },

    this.handleText = function(k) {
        vis.select('g.nodes').selectAll('text')
			     .style("font-size", function(d){
				if(d.clicked)
		      		return k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px";
			    else{return 0;}
		      	});
  	    chordg.selectAll('g.group').selectAll("text")
  	    	.style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
        matrixg.selectAll('g.label').selectAll("text")
    	   	.style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
    }
};

var LabellingWithZooming = function() {//controllare qui, bisogna discriminare il caso libero, fisso, vuoto
    this.rightClick = function(d) {
        d3.event.preventDefault();
           // react on right-clicking
        var text = vis.select('g.nodes').selectAll('text').select(function(t){return t.label == d.label ? this : null});
        d.clicked = !d.clicked;
        /*if(d.clicked)*/
        text.style("font-size") == "0px" ? text.style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px").attr("opacity", 1) : text.style("font-size", 0);
	         // text.attr("opacity") == 0 ?  text.style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px").attr("opacity", 1) : text.style("font-size", 0).attr("opacity", 0);
        console.log("LabellingWithZooming");
        console.log("right-clicked "+d.label+" value: "+d.clicked);
    },

    this.handleText = function(k) {

    	var texts = vis.select('g.nodes').selectAll('text');
        vis.select('g.nodes').selectAll('text')
			.style("font-size", function(d){
				if(!d.clicked) {
					if (k >= d.kThreshold)
			      		return k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px";
			      	else
			      		return 0+"px";//se non è ancora visibile
		      	}
		      	else {
		      		console.log("handle text LabellingWithZooming: ELSE");
		      		return d3.select(this).attr("opacity") == 0 ? 0+"px" : (k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
		      	}
			})
		    .attr('opacity', function(d) {
		    	if(!d.clicked){
			      if (k >= d.kThreshold)
			      //	console.log(d3.event.scale);
			        return d.opacityScale(k);
			      else
			      	return 0;
			    }
			    else
			      	return d3.select(this).attr("opacity");
		    //return 1;
	    });
	    chordg.selectAll('g.group').selectAll("text")
	    	  .style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
      matrixg.selectAll('g.matrix').selectAll("text")
	    	  .style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
    }
};

var AllLabelsShown = function() {
    this.rightClick = function(d) {
        d3.event.preventDefault();
           // react on right-clicking
        var text = vis.select('g.nodes').selectAll('text').select(function(t){return t.label == d.label ? this : null});
        d.clicked = !d.clicked;
        text.style("font-size") != "0px" ?  text.style("font-size", 0) : text.style("font-size",  k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
        console.log("AllLabelsShown");
        console.log("right-clicked "+d.label+" value: "+d.clicked);
    },

    this.handleText = function(k) {
        vis.select('g.nodes').selectAll('text')
			.style("font-size", function(d){
				if(!d.clicked)
		      		return k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px";
			    else{return 0;}
		      	});
	    chordg.selectAll('g.group').selectAll("text")
	    	.style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
      matrixg.selectAll('g.matrix').selectAll("text")
	    	.style("font-size", k > 1 ? labelSize/Math.sqrt(k)+"px" : labelSize+"px");
	 	}
};
