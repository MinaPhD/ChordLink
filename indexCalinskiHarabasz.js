/*funzioni per il calcolo del valore k di clusterizzazione ottimo per applicare il kmeans clustering su un dataset, utilizzando il 
CalinskiHarabasz index*/

/*KMeans object example:

assignments: (43) [0, 1, 1, 1, 2, 1, 1, 0, 3, 2, 1, 0, 2, 2, 2, 1, 1, 3, 1, 1, 1, 1, 3, 3, 2, 3, 1, 3, 0, 2, 2, 2, 1, 0, 2, 2, 3, 3, 0, 0, 0, 0, 2]
clusterColors: (43) ["#a81803", "#d3ca21", "#a35905", "#31c6e0", "#ff6e8a", "#dfeb8a", "#9bafa3", "#a992df", "#9e2fff", "#9e6d4", "#19d93f", "#134eaa", "#6be406", "#d3a7ad", "#357249", "#3c55d7", "#1e6912", "#4db55e", "#82530f", "#eb049c", "#4dc82a", "#eda51a", "#4e4c45", "#6efef7", "#d7dfe1", "#951a78", "#28dd7a", "#cfd19a", "#6dd145", "#da5d8c", "#8c9272", "#e54149", "#42eb6a", "#7c3919", "#69f2a6", "#e91fbb", "#c1c9a8", "#e1ab01", "#10ab2c", "#84b97e", "#1ac21", "#657419", "#eaaa13"]
data: (43) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)]
drawDelay: 20
extents: (2) [{…}, {…}]
height: "540"
iterations: 87
k: -1
means: (4) [Array(2), Array(2), Array(2), Array(2)]
ranges: (2) [522.7909682817381, 490.7640508740916]
svg: Selection {_groups: Array(1), _parents: Array(1)}
width: "1320"*/

/*
N=kmeans.data.length
k = means.length
*/
function calculateCHIndex(kmeans){

	var betweenClusterVariance = calculateBetweenClusterVariance(kmeans),
		withinClusterVariance = calculateWithinClusterVariance(kmeans),
		N = kmeans.data.length,
		k = kmeans.means.length;
	console.log('N');
	console.log(N);
	console.log('k');
	console.log(k);
	console.log('betweenClusterVariance');
	console.log(betweenClusterVariance);
	console.log('withinClusterVariance');
	console.log(withinClusterVariance);
	console.log('VRC');
	console.log((betweenClusterVariance/withinClusterVariance));
	
	return (betweenClusterVariance/withinClusterVariance);//*((N-k)/(k-1));
}

function calculateBetweenClusterVariance(kmeans){
	var ssb = 0,
		data = kmeans.data,
		assignments = kmeans.assignments,
		m = [],//mean value of overall data
		mi = [],
		ni = 0,
		k = kmeans.means.length;

	m[0] = sumValues(data, 0)/data.length;
	m[1] = sumValues(data, 1)/data.length;
	console.log('m[0]');
	console.log(m[0]);
	console.log('m[1]');
	console.log(m[1]);
	for (var i = 0; i < kmeans.means.length; i++) {
		ni = assignments.filter(item => item == i).length;
		mi = kmeans.means[i];
		ssb += ni*(Math.sqrt(Math.pow(mi[0]-m[0],2)+Math.pow(mi[1]-m[1],2)));
	}

	return ssb/(k-1);
}

function calculateWithinClusterVariance(kmeans){//la within-cluster-variance corrisponde anche allo squared-distance-error
	var ssv = 0,
		ci = [],//punti appartenenti al cluster i-esimo
		x = [],//j-esimo punto del cluster i-esimo
		mi = [],//centroide cluster i-esimo
		N = kmeans.data.length,
		k = kmeans.means.length;
	for (var i = 0; i < kmeans.means.length; i++) {
		mask = kmeans.assignments.map(item => item == i);
		ci = kmeans.data.filter((item, i) => mask[i]);
		mi = kmeans.means[i];
		for (var j = 0; j < ci.length; j++) {
			x = ci[j];
			ssv += Math.sqrt(Math.pow(x[0]-mi[0],2)+Math.pow(x[1]-mi[1],2));
		}
	}

	return ssv/(N-k);
}

function sumValues(array, k){
	var sum = 0;
	for (var i = 0; i < array.length; i++) {
		sum += array[i][k];
	}
	return sum;
}