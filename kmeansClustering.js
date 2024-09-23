/*
* KMeans
* @constructor
* @desc KMeans constructor
* @param {object} options - options object
* @param {object} options.svg - svg element
* @param {array} options.data - data array with points
* @param {number} options.k - number of cluster centroids
* @return array with arrays of points
*/
function KMeans(opts) {
  // Create new instance if `new` keyword was not used.
  if (!(this instanceof KMeans)) {
    return new KMeans(opts);
  }

  opts = opts || {};
  this.svg = opts.svg;
  this.width = this.svg.attr("width");
  this.height = this.svg.attr("height");

  // Number of cluster centroids.
  this.k = opts.k;

  // Points to cluster.
  this.data = opts.data;

  // Keeps track of which cluster centroid index each data point belongs to.
  this.assignments = [];

  // Get the extents (min,max) for the dimensions.
  this.extents = this.dataDimensionExtents();

  // Get the range of the dimensions.
  this.ranges = this.dataExtentRanges();

  // Generate random cluster centroid points.
  this.means = this.seeds();

  // Generate cluster colors.
  this.clusterColors = this.clusterColors();

  // Keep track of number of times centroids move.
  this.iterations = 0;

  // Delay for each draw iteration.
  this.drawDelay = 20;

  //Treshold for each cluster
 // this.tresholds = this.calculateTresholds();

  // Perform work.
  this.run();
}

/**
* dataDimensionExtents
* @desc Returns the the minimum and maximum values for each dimention in the data array.
* @param {array} kdata - data containing points
* @return {array} extents - extents for each dimenion
* @example
* kmeans.data = [
*   [2,5],
*   [4,7],
*   [3,1]
* ];
* var extents = kmeans.dataDimensionExtents();
* console.log(extents); // [{min: 2, max: 4}, {min: 1, max: 7}]
*/
KMeans.prototype.dataDimensionExtents = function() {
  var kdata = kdata || this.data;
  var extents = [];

  for (var i = 0; i < kdata.length; i++) {
    var point = kdata[i];

    for (var j = 0; j < point.length; j++) {
      if (!extents[j]) {
        extents[j] = {min: 1000, max: 0};
      }

      if (point[j] < extents[j].min) {
        extents[j].min = point[j];
      }

      if (point[j] > extents[j].max) {
        extents[j].max = point[j];
      }
    }
  }

  return extents;
};

/**
* dataExtentRanges
* @desc Returns the range for each extent
* @return {array} ranges
* kmeans.extents = [{min: 2, max: 4}, {min: 1, max: 7}]
* var ranges = kmeans.dataExtentRanges(extents);
* console.log(ranges); // [2,6]
*/
KMeans.prototype.dataExtentRanges = function() {
  var ranges = [];

  for (var i = 0; i < this.extents.length; i++) {
    ranges[i] = this.extents[i].max - this.extents[i].min;
  }

  return ranges;
};

/**
* seeds
* @desc Returns an array of randomly generated cluster centroid points bounds based on the data dimension ranges.
* @return {array} cluster centroid points
* @example
* var means = kmeans.seeds();
* console.log(means); // [[2,3],[4,5],[5,2]]
*/

/*
NOTA BENE: il numero ottimale di k dipende molto, ad ogni volta che si applica il kmeans, da dove posiziono i vari centroidi nello spazio
di conseguenza, se applico l'algoritmo che cerca il k ottimo diverse volte, non viene trovato sempre lo stesso k. Questo porta a dire
che probabilmente l'algoritmo optKmeans non fa bene il suo lavoro, cioè l'indice kalinski-index su cui mi baso, è troppo ballerino.
*/
KMeans.prototype.seeds = function() {
  var means = [],
      numClusters = this.k;
  while (numClusters--) {
    var mean = [];

    for (var i = 0; i < this.extents.length; i++) {
      mean[i] = this.extents[i].min + (Math.random() * this.ranges[i]);
    }

    means.push(mean);
  }

  return means;
};

/**
* assignClusterToDataPoints
* @desc Calculate Euclidean distance between each point and the cluster center.
* Assigns each point to closest mean point.
*
* The distance between two points is the length of the path connecting them.
* The distance between points P(p1,p2) and Q(q1,q2) is given by the Pythagorean theorem.
*
* distance = square root of ((p1 - q1)^2 + (p2 - q2)^2)
*
* For n dimensions, ie P(p1,p2,pn) and Q(q1,q2,qn).
* d(p,q) = square root of ((p1 - q1)^2 + (p2 - q2)^2 + ... + (pn - qn)^2)
*
* http://en.wikipedia.org/wiki/Euclidean_distance
*/
KMeans.prototype.assignClusterToDataPoints = function() {
  var assignments = [];

  for (var i = 0; i < this.data.length; i++) {
    var point = this.data[i];
    var distances = [];

    for (var j = 0; j < this.means.length; j++) {
      var mean = this.means[j];
      var sum = 0;

      /* We calculate the Euclidean distance.
       * √((pi-qi)^2+...+(pn-qn)^2)
       */

      for (var dim = 0; dim < point.length; dim++) {
        // dif = (pn - qn)
        var difference = point[dim] - mean[dim];

        // dif = (dif)^2
        difference = Math.pow(difference, 2);

        // sum = (difi) + ... + (difn)
        sum += difference;
      }

      // √sum
      distances[j] = Math.sqrt(sum);
    }

    // After calculating all the distances from the data point to each cluster centroid,
    // we pick the closest (smallest) distances.
    assignments[i] = distances.indexOf(Math.min.apply(null, distances));
  }

  return assignments;
};

/**
 * moveMeans
 * @desc Update the positions of the the cluster centroids (means) to the average positions
 * of all data points that belong to that mean.
 */
KMeans.prototype.moveMeans = function() {
  var sums = fillArray(this.means.length, 0);
  var counts = fillArray(this.means.length, 0);
  var moved = false;
  var i;
  var meanIndex;
  var dim;

  // Clear location sums for each dimension.
  for (i = 0; i < this.means.length; i++) {
    sums[i] = fillArray(this.means[i].length, 0);
  }

  // For each cluster, get sum of point coordinates in every dimension.
  for (var pointIndex = 0; pointIndex < this.assignments.length; pointIndex++) {
    meanIndex = this.assignments[pointIndex];
    var point = this.data[pointIndex];
    var mean = this.means[meanIndex];

    counts[meanIndex]++;

    for (dim = 0; dim < mean.length; dim++) {
      sums[meanIndex][dim] += point[dim];
    }
  }

  /* If cluster centroid (mean) is not longer assigned to any points,
   * move it somewhere else randomly within range of points.
   */
  for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
    if (0 === counts[meanIndex]) {
      sums[meanIndex] = this.means[meanIndex];

      for (dim = 0; dim < this.extents.length; dim++) {
        sums[meanIndex][dim] = this.extents[dim].min + (Math.random() * this.ranges[dim]);
      }
      continue;
    }

    for (dim = 0; dim < sums[meanIndex].length; dim++) {
      sums[meanIndex][dim] /= counts[meanIndex];
      sums[meanIndex][dim] = Math.round(100*sums[meanIndex][dim])/100;
    }
  }

  /* If current means does not equal to new means, then
   * move cluster centroid closer to average point.
   */
  if (this.means.toString() !== sums.toString()) {
    var diff;
    moved = true;

    // Nudge means 1/nth of the way toward average point.
    for (meanIndex = 0; meanIndex < sums.length; meanIndex++) {
      for (dim = 0; dim < sums[meanIndex].length; dim++) {
        diff = (sums[meanIndex][dim] - this.means[meanIndex][dim]);
        if (Math.abs(diff) > 0.1) {
          var stepsPerIteration = 10;
          this.means[meanIndex][dim] += diff / stepsPerIteration;
          this.means[meanIndex][dim] = Math.round(100*this.means[meanIndex][dim])/100;
        } else {
          this.means[meanIndex][dim] = sums[meanIndex][dim];
        }
      }
    }
  }

  return moved;
};

/**
 * run
 * @desc Reassigns nearest cluster centroids (means) to data points,
 * and checks if cluster centroids (means) have moved, otherwise
 * end program.
 */
KMeans.prototype.run = function() {
  ++this.iterations;

  // Reassign points to nearest cluster centroids.
  this.assignments = this.assignClusterToDataPoints();

  // Returns true if the cluster centroids have moved location since the last iteration.
  var meansMoved = this.moveMeans();

  /* If cluster centroids moved then
   *rerun to reassign points to new cluster centroid (means) positions.
   */
  if (meansMoved) {
    this.run();
  } else {
    // Otherwise task has completed.
    console.log('Iteration took for completion: ' + this.iterations);
    //this.tresholds = calculateTresholds(this.means);
  }
};

/**
* clusterColors
* @desc Generate a random colors for clusters.
* @return random colors
*/
KMeans.prototype.clusterColors = function() {
  var colors = [];

  // Generate point color for each cluster.
  for (var i = 0; i < this.data.length; i++) {
    colors.push('#'+((Math.random()*(1<<24))|0).toString(16));
  }

  return colors;
};

/**
* clusterColor
* @desc Get color for cluster.
* @param {number} index - cluster (mean) index
* @return color for cluster
*/
KMeans.prototype.clusterColor = function(n) {
  return this.clusterColors[n];
};

/**
* fillArray
* @desc Returns a prefilled array.
* @param {number} length - length of array
* @param {*} value - value to prefill with.
* @return array with prefilled values.
*/
function fillArray(length, val) {
  return Array.apply(null, Array(length)).map(function() { return val; });
}

/*
------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------------------------
Da qui in poi funzioni di estrazione coordinate dai dati e rimappaggio dei cluster assegnati ai nodi
------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------------------------
*/

function extractDataPositions(nodes){
  var datapos = [];
  for (var i = 0; i < nodes.length; i++) {
    datapos.push([nodes[i].x, nodes[i].y])
  }
  console.log("kmeans datapos input:");
  console.log(datapos);
  return datapos;
}

function assignCluster(assignments, nodes){
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].community = assignments[i];
    }
}

/*
 *filtra i nodi che possono appartenere ad un cluster in base alla loro distanza dai centroidi; se sono ad una distanza maggiore
 * una certa soglia, allora non faranno parte della partizione. La soglia di vicinanza va tarata empiricamente: a livello di design
 * si può aggiungere alla classe KMeans un parametro treshold che viene calcolato da una funzione setTreshold, che in base ai punti
 * a disposizione calcola qual'è la soglia rispetto a cui filtrare (magari basandosi sulla withinClusterVariance).
 */
function filterNodesByDistance(nodes, means, treshold){
  var d = 0;
  for (var i = 0; i < nodes.length; i++) {
    d = Math.sqrt(Math.pow(nodes[i].x-means[nodes[i].community][0],2)+Math.pow(nodes[i].y-means[nodes[i].community][1],2));
    if(d > treshold)
      nodes[i].community = -1;
  }
}

function filterNodesByTresholds(nodes, means, tresholds){
  var d = 0;
  for (var i = 0; i < nodes.length; i++) {
    d = Math.sqrt(Math.pow(nodes[i].x-means[nodes[i].community][0],2)+Math.pow(nodes[i].y-means[nodes[i].community][1],2));
    if(d > tresholds[nodes[i].community])
      nodes[i].community = -1;
  }
}


function random(start, end) {
  var dif = end - start;
  return (Math.random() * dif + start + 1)|0;
}

/*function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}*/

/*
 * il calinski-harabasz index ha un andamento monotono decrescente in funzione di k, di conseguenza assocerò il k ottimo
 * sempre al valore minimo in krange. bisognerebbe trovare un'alternativa.
*/

function optKMeans(nodes, param, param2){
  var dataCoordinates = extractDataPositions(nodes),
      n = dataCoordinates.length,
      ruleOfThumb = Math.round(param*Math.sqrt(n/2)),
      krange = range(ruleOfThumb > 2 ? ruleOfThumb-2 : 1, ruleOfThumb+2, 1)
      kmeans = [],//array di oggetti kmeans che contiene l'applicazione del kmeans per ogni k in krange
      kmeansSQE = [],
      indexCH = [],
      maxCH = 0;
/*console.log('krange');
console.log(krange);
console.log('ruleOfThumb');
console.log(ruleOfThumb);*/

    for (var i = 0; i < krange.length; i++) {
      kmeans[i] = [];
      for (var j = 0; j < 5; j++) {
        kmeans[i][j] = new KMeans({
          svg: vis,
          data: dataCoordinates,
          k: krange[i]
        });
        kmeans[i][j].SQE = squaredDistanceError(kmeans[i][j]);
        /*console.log('kmeans[i][j].SQE');
        console.log(kmeans[i][j].SQE);*/

      }
      kmeansSQE[i] = kmeans[i].reduce(function(prev, current) {    return (prev.SQE < current.SQE) ? prev : current }) //iterazione del kmeans che minimizza lo SQE
        /*kmeans[i] = new KMeans({
          svg: vis,
          data: dataCoordinates,
          k: krange[i]
        });*/
      /*console.log('kmeansSQE '+i+' SQE: '+kmeansSQE[i].SQE);
      console.log(kmeansSQE[i]);*/
      indexCH[i] = calculateCHIndex(kmeansSQE[i]);
      }
    /*console.log('n');
    console.log(n);
    console.log('ruleOfThumb');
    console.log(ruleOfThumb);
    console.log('krange');
    console.log(krange);
    console.log('kmeans');
    console.log(kmeans);*/
    /*console.log('indexCH');
    console.log(indexCH);*/
    maxCH = Math.max.apply(null, indexCH);
    /*console.log('maxCH');
    console.log(maxCH);*/

    //calcolo delle soglie rispetto alle quali tagliare i punti al di fuori di una certa soglia dai cluster
    kmeansSQE[indexCH.indexOf(maxCH)].tresholds = calculateTresholds(kmeansSQE[indexCH.indexOf(maxCH)], param2);

    return kmeansSQE[indexCH.indexOf(maxCH)];
}

/*delta(i,k) = ||p(i)-c(h)||^2
p(i) = punto i-esimo cluster h
c(h) = centroide cluster h
*/
function squaredDistanceError(kmeans){
  return calculateWithinClusterVariance(kmeans);
}


/*
 * calculate treshold for each cluster, based on Euclidean distance's within-cluster-variance.
 */
function calculateTresholds(kmeans, param2){
  var distances = [],
      ci = [],
      mi = [],
      x = [],
      mask = [],
      meanD = [],
      tresholds = [],
      means = kmeans.means;

  for (var i = 0; i < means.length; i++) {
    mask = kmeans.assignments.map(item => item == i);
    ci = kmeans.data.filter((item, i) => mask[i]);
    mi = means[i];
    distances[i] = [];
    meanD[i]=0;
    for (var j = 0; j < ci.length; j++) {
      x = ci[j];
      distances[i][j] = Math.sqrt(Math.pow(x[0]-mi[0],2)+Math.pow(x[1]-mi[1],2));
      meanD[i] += distances[i][j];
    }
    meanD[i] = meanD[i]/ci.length;
  }
  console.log('distances');
  console.log(distances);
  console.log('meanD');
  console.log(meanD);

  for (var i = 0; i < means.length; i++) {
    tresholds[i] = 0;
    for (var j = 0; j < distances[i].length; j++) {
      tresholds[i] += Math.abs(distances[i][j] - meanD[i]);
    }
    tresholds[i] = param2*tresholds[i]/(distances[i].length - 1); //quin va tarato empiricamente
  }

  return tresholds;
}
