var cos = Math.cos;
var sin = Math.sin;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = pi * 2;
var max = Math.max;

function compareValue(compare) {
  return function(a, b) {
    return compare(
      a.source.value + a.target.value,
      b.source.value + b.target.value
    );
  };
}

//funzione sostitutiva di d3.range(n)
function range(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

//lefts and rights splitting functions(to be used as callbacks in filter function)
function split1(value) {
  return value.position > this;
  }
function split2(value) {
  return value.position < this;
  }

//association by value of index and position in orderedEdges
function pushByValue(list){

  var arr = [];
  s = -1; while (++s < list.length){
    arr.push({index:list[s].index, position:list[s].position});
  }
  print("pushByValue result: "+arr);
  return arr;
}

//build array with ordered IDs by position
function match(arr1,arr2){
  print('ordergroups');
  print(arr1);
  print('range(n)');
  print(arr2);
  var arr3 = [],
      n = arr2.length;
  i = -1; while(++i < n){
    if(arr1.indexOf(arr2[0])==-1)
      arr3.push(arr2[0]);
    arr2.shift();
  }
  return arr1.concat(arr3);
}

/*function byIndex(item){
  return item.index==this.position;
}*/

function setAngles(angles, group, point, pad, un){
  var x0 = point,
      obj = angles.find(function (item) {return item.index==group.index;});
    if(typeof obj == "undefined"){
      group.startAngle = point + pad/2;
      group.endAngle = point + un*group.value - pad/2;
      point += un*group.value;
    }
    else{
      group.startAngle = obj.startAngle + pad/2;
      group.endAngle = obj.endAngle - pad/2;
      point = group.endAngle + pad/2;
    }
    print("setAngles "+group.index+":\nstart  "+group.startAngle+"\nend   "+group.endAngle+"\nx   "+point);

    return point;

}


//chords calculating function
var mychord = (function() {
  var padAngle = 0,
        thickness = 0,//edge's thickness percentage
        orderGroups = [],//vertices order list specified by vertex ID
        listAngles = [];//vertices radian angles list, composed of vertex ID, startAngle, endAngle

  function mychord(matrix) {
    var n = matrix.length,
        groupSums = [],
        groupIndex = d3.range(n),
        subgroupIndex = [],
        chords = [],
        groups = chords.groups = new Array(n),
        subgroups = new Array(n * n),
        orderedEdges = [],
        min = Infinity,
        vmin = Infinity,
        halfWidth,
        minGroupWidth = [],
        groupVmin,
        k,
        sum,
        x,
        x0,
        dx,
        i,
        j;


    // Compute the sum.
    k = 0, i = -1; while (++i < n) {
      x = 0, j = -1; while (++j < n) {
        x += matrix[i][j];//forse non reinizializzo x
        if(vmin > matrix[i][j] && matrix[i][j]!=0)
           vmin = matrix[i][j];
      }
      groupSums.push(x);
      subgroupIndex.push(range(n));
      k += x;
    }
    sum = k; //matrix elements sum
    print('groupSums');
    print(groupSums);
    // Convert the sum to scaling factor for [0, 2pi].
    // TODO Allow start and end angle to be specified?
    // TODO Allow padding to be specified as percentage?
    k = max(0, tau - padAngle * n) / k;
    //ricalcolo k togliendo il pad_angle moltiplicato per il numero di nodi: in radianti sarà tau=2*pi
    //a cui tolgo un pad_angle*n, poi a tutto divido k per ottenere la frazione in radianti corrispondente
    //ad una unità di peso, quindi per distribuire il peso della matrice sulla circonferenza tolgliendo il
    //pad_angle.
    dx = k ? padAngle : tau / n;
    // k è diverso da 0? se si allora dx è pari all'angolo di padding, altrimenti è pari a un valore
    //fissato tau/n (dove tau corrisponde a 2*pi diviso il numero di nodi)


    //define edge's thickness (rad)

   // halfWidth = min*k*thickness/2;
  //  print("SEMIAMPIEZZA:\n"+halfWidth);

    orderGroups = match(orderGroups,range(n));
    print("orderGroups:\n"+orderGroups);


    var sumAngles = 0;
    print('sum before '+sum);
    i = -1; while (++i < listAngles.length){
      sumAngles += listAngles[i].endAngle - listAngles[i].startAngle;
      sum -= groupSums[listAngles[i].index];
    }
    sum == 0 ? sum = 1 : {};
    var unit = (2*pi - sumAngles)/sum; //like k, considering only vertices weights without angles association in listAngles
    print(" unit:\n"+unit+"\nsum:\n"+sum+"\nsumAngles:\n"+sumAngles);

    //define groups(position,index,value,angles)
    x = 0, i = -1; while (++i < n) {
      var di = groupIndex[i];
      groups[di] = {
        position: di,
        index: orderGroups[di],
        value: groupSums[orderGroups[di]]
      };
      x = setAngles(listAngles, groups[di], x, padAngle, unit);
      print("ANGOLI NODO:\n"+groups[di].index+"   startAngle:"+groups[di].startAngle+"   endAngle:"+groups[di].endAngle);
      //(halfWidth > (groups[di].endAngle - groups[di].startAngle)/2) && (groups[di].value > 0) ? halfWidth = (groups[di].endAngle - groups[di].startAngle)/(2*groups[di].value) : {};
      //if(groups[di].value > 0)
        //halfWidth > (groups[di].endAngle - groups[di].startAngle)/2*groups[di].value ? halfWidth = (groups[di].endAngle - groups[di].startAngle)/2*groups[di].value : {};
    }
    print("groupSums: "+groupSums);

    //calculate minimum edge width

    i = -1; while (++i < n) {
      var interval = groups[i].endAngle - groups[i].startAngle,
          val;
      minGroupWidth[i] = Infinity;
      j = -1; while (++j < n){
        print(groups[i]);
        print(matrix[groups[i].index]);
        if(matrix[groups[i].index][j] != 0){
          val = (matrix[groups[i].index][j]/groups[i].value)*interval;
          if(val < minGroupWidth[i]){
            minGroupWidth[i] = val;
            groupVmin = matrix[groups[i].index][j];
          }
        }
      }
      if(minGroupWidth[i]/groupVmin < min/vmin){
        min = minGroupWidth[i];
        vmin = groupVmin;
      }
    }

    halfWidth = min*thickness/2;
    halfWidth < 0.0075 ? halfWidth = 0.0075 : {};
    print("chord thickness: " + halfWidth*2);

  //groups ordering function
    groups.sort(function (a, b) {
      return a.startAngle - b.startAngle;
    });

    for(i = 0; i<groups.length; i++){
      groups[i].position = i;
    }
print("GROUPS");
print(groups);

  //associazione degli angoli ai groups
   /* x = 0, x0 = x, i = -1; while (++i < n) {
      x0 = x;
      x += groupSums[groups[i].index] * k;
      groups[i].startAngle = x0;
      groups[i].endAngle = x;
      x += dx;
    }*/

  //compute edges ordering in every group

    orderedEdges = orderEdges(groups);

  //define subgroups(index,subindex,angles,value,adjacent)

    mean = 0, node = {}, i = -1; while (++i < n){
      node = groups[i];
      var di = node.index,
          x = node.startAngle;
          newk = (node.endAngle - node.startAngle)/node.value;
      j = -1; while (++j < n){
        var dj = subgroupIndex[di][orderedEdges[di][j].index],
            v = matrix[di][dj],
            a0 = x,
            a1 = x += v * newk;
            mean = (a0+a1)/2;
            subgroups[dj * n + di] = {
              index: di,
              subindex: dj,
              startAngle: mean-(v/vmin)*halfWidth,//prima era cosi: mean-halfWidth
              endAngle: mean+(v/vmin)*halfWidth,
              value: v,
              adjacent: 0
            };
            if(j == 0 || j == n-1)
              subgroups[dj * n + di].adjacent = 1;
      }
    }
    print("SUBGROUPS:\n");
    print(subgroups);

    // Generate chords for each (non-empty) subgroup-subgroup link.
    i = -1; while (++i < n) {
      j = i - 1; while (++j < n) {
        var source = subgroups[j * n + i],
            target = subgroups[i * n + j];
        if (source.value || target.value) {
          chords.push(source.value < target.value
              ? {source: target, target: source}
              : {source: source, target: target});
        }
      }
    }
    groups.sort(function (a, b) {
      return a.position - b.position;
    });


    return chords;
  }

  //parameters setting functions

  mychord.padAngle = function(_) {
  return arguments.length ? (padAngle = max(0, _), mychord) : padAngle;
  };

  mychord.thickness = function(_) {
    return arguments.length ? (thickness = max(0, _), mychord) : thickness;
  };

  mychord.orderGroups = function(_) {
      return arguments.length ? ((orderGroups = _ == null ? [] : _), mychord) : orderGroups;
    };
  mychord.listAngles = function(_) {
      return arguments.length ? ((listAngles = _ == null ? [] : _), mychord) : listAngles;
    };
  return mychord;
});

//edges ordering function using source.position and target.position

function orderEdges(groups){

  var semi = pi,
      lefts = [],
      rights = [],
      parts1 = [],
      parts2 = [],
      parts = [],
      n = groups.length,
      orderedEdges = new Array(n);
      print("n: "+n);

  A = {}, middle = 0, central = {}, i = -1; while (++i < n){
      print("ITERAZIONE: "+i);
      A = groups[i];
      middle = (A.startAngle + A.endAngle)/2 + semi;
        if(middle > 2*pi)
            middle -= 2*pi;
        print("middle: "+middle);
      lastRight= 0, node = {}, j = -1; while (++j < n){
      node = groups[j];
            //print("NODE: "+node.index);
            //print("startAngle: "+node.startAngle);
            //print("endAngle: "+node.endAngle);

        if(node.startAngle < middle && node.endAngle > middle){
          //print("sono entrato nell'f del central");
          central = {
                position: node.position,
                index: node.index,
                startAngle: node.startAngle,
                endAngle: node.endAngle,
                value: node.value
          };
        }
        if(node.endAngle < middle){
          lastRight = node.position;
          //print("lastRight: "+lastRight);

        }
      }
     // print("lastRight: "+lastRight);
      //print("tipeof central: "+typeof central.index);

      if(typeof central.index == "undefined") //in case middle fall inside a padAngle
        central = groups[lastRight];

      print("NODO: "+A.index+"  central: "+central.index);

      if(central.position < A.position){   //second circumference's half
        B = {}, j = -1; while (++j < n){
          B = groups[j];
          if(B.position > A.position || B.position < central.position)
            lefts.push({index:B.index, position:B.position});
          else if(B.position != A.position)
            rights.push({index:B.index, position:B.position}) //insert central in rights
          }

            lefts.sort(function(a, b) {
          return b.position - a.position;
      });
        parts1 = lefts.filter(split1, A.position);
        parts2 = lefts.filter(split2, A.position);
        parts = parts2.concat(parts1);
        lefts = parts;

            rights.sort(function(a, b) {//descending ordering
          return b.position - a.position;
      });
            rights.push({index:A.index, position:A.position});//insert self loop at the end of rigths


        }

      else{      //first circumference's half
        B = {}, j = -1; while (++j < n){
          B = groups[j];
          if(B.position > A.position && B.position<central.position)
            lefts.push({index:B.index, position:B.position});
          else if(B.position != A.position)
            rights.push({index:B.index, position:B.position}) //insert central in rights
          }

        rights.sort(function(a, b) {//descending ordering
          return b.position - a.position;
      });
        parts1 = rights.filter(split1,A.position);
        print("parts1\n");
        print(parts1);
        parts2 = rights.filter(split2,A.position);
        print("parts2\n");
        print(parts2);
        parts = parts2.concat(parts1);
        rights = parts;
        print("rights\n");
        print(rights);
            rights.push({index:A.index, position:A.position});//insert self loop at the end of rigths

            lefts.sort(function(a, b) {//descending ordering
                  return b.position - a.position;
            });

            print("lefts\n");
            print(lefts);
          }
            orderedEdges[A.index] = [];
            orderedEdges[A.index] = pushByValue(rights.concat(lefts));
            print("ORDINAMENTO "+A.index+":\n");
            print(rights.concat(lefts));
            lefts = [];
            rights = [];
      }

        print(orderedEdges);


        return orderedEdges;
}

var slice = Array.prototype.slice;
var constant = function(x) {
  return function() {
    return x;
  };
};
function defaultSource(d) {
  return d.source;
}
function defaultTarget(d) {
  return d.target;
}
function defaultLabel(d) { // ALESSANDRA
	  return d.label;
	}
function defaultRadius(d) {
  return d.radius;
}
function defaultStartAngle(d) {
  return d.startAngle;
}
function defaultEndAngle(d) {
  return d.endAngle;
}
var myribbon = (function() {
  var source = defaultSource,
      target = defaultTarget,
      label = defaultLabel, // ALESSANDRA
      radius = defaultRadius,
      startAngle = defaultStartAngle,
      endAngle = defaultEndAngle,
      context = null;
  function ribbon() {
    var buffer,
        argv = slice.call(arguments),
        s = source.apply(this, argv),
        t = target.apply(this, argv),
        sr = +radius.apply(this, (argv[0] = s, argv)),
        sa0 = startAngle.apply(this, argv) - halfPi,
        sa1 = endAngle.apply(this, argv) - halfPi,
        sx0 = sr * cos(sa0),
        sy0 = sr * sin(sa0),
        tr = +radius.apply(this, (argv[0] = t, argv)),
        ta0 = startAngle.apply(this, argv) - halfPi,
        ta1 = endAngle.apply(this, argv) - halfPi,
        cx = 0,
        cy = 0,
        bis = (sa0+ta1)/2;

    /*mi metto nella posizione (sx0, sy0) corrispondente ad sa0, poi traccio un arco da sa0 ad sa1
     *  lungo la circonferenza a raggio sr; a questo punto da sa1 traccio una curva quadratica
     *  verso ta0; successivamente traccio un arco verso ta1 lungo la circonferenza ed infine
     *  ancora una curva quadratica da ta1 verso (sx0, sy0) cioè verso sa0 e chiudo il percorso.*/
    if(((sa0 > ta1 && bis < sa0 && bis > ta1) || (sa0 < ta1 && bis > sa0 && bis < ta1)) && Math.abs(sa0-ta1)>5)
      bis += pi;
    if (!context) context = buffer = d3.path();
    context.moveTo(sx0, sy0);
    context.arc(0, 0, sr, sa0, sa1);
    if (sa0 !== ta0 || sa1 !== ta1) { // TODO sr !== tr?
      if(s.adjacent || t.adjacent){
        cx = tr * cos(bis)/2;
        cy = tr * sin(bis)/2;
      }
      context.quadraticCurveTo(cx, cy, tr * cos(ta0), tr * sin(ta0));
      context.arc(0, 0, tr, ta0, ta1);
    }
    context.quadraticCurveTo(cx, cy, sx0, sy0);
    context.closePath();
    if (buffer) return context = null, buffer + "" || null;
  }
  ribbon.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), ribbon) : radius;
  };
  ribbon.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), ribbon) : startAngle;
  };
  ribbon.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), ribbon) : endAngle;
  };
  ribbon.source = function(_) {
    return arguments.length ? (source = _, ribbon) : source;
  };
  ribbon.target = function(_) {
    return arguments.length ? (target = _, ribbon) : target;
  };

  ribbon.label = function(_) { // ALESSANDRA
	    return arguments.length ? (label = _, ribbon) : label;
	  };

  ribbon.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), ribbon) : context;
  };
  return ribbon;
});

//export {mychord, ribbon};
