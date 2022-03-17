function randomCentroids(features, inf=-2, sup=2) {
	return Array(features)
		.fill(0)
		.map(e => Math.random() * (sup - inf) + inf);
}

function calcDistance(pointA, pointB) {
	let distance = 0;
	for(let i=0; i < pointA.length; ++i) {
		distance += (pointA[i] - pointB[i]) ** 2
	}
	return distance;
}

function getNearestCentroid(centroids, point) {
	let minDist = 1e6;
	let minCentroid = -1;

	for(let c=0; c < centroids.length; ++c) {
		const distance = calcDistance(point, centroids[c].coords);
		if(distance < minDist) {
			minDist = distance;
			minCentroid = c;
		}
	}
	return minCentroid;
}

function kmeanIteration(dataset, centroids, features) {
	// const labels = [];
	for(let c=0; c < centroids.length; ++c) {
		centroids[c].accumPoints = Array(features).fill(0);
		centroids[c].nPoints = 0;
	}

	for(let i=0; i < dataset.length; ++i) {
		const point = dataset[i];
		const minCentroid = getNearestCentroid(centroids, point);
		const nearestCentroid = centroids[minCentroid];
		// labels.push(minCentroid);
		for(let j=0; j < features; ++j) {
			nearestCentroid.accumPoints[j] += point[j];
		}
		nearestCentroid.nPoints++;
	}

	for(let c = 0; c < centroids.length; ++c) {
		const nPoints = centroids[c].nPoints;
		centroids[c].coords = centroids[c].accumPoints.map(e => e / (nPoints? nPoints : 1));
	}
	// return labels;
}

function calcMeanCentroid(dataset, start, end) {
  const features = dataset[0].length;
  const n = end - start;
  let mean = [];
  for (let i = 0; i < features; i++) {
    mean.push(0);
  }
  for (let i = start; i < end; i++) {
    for (let j = 0; j < features; j++) {
      mean[j] = mean[j] + dataset[i][j] / n;
    }
  }
  return mean;
}

function naiveShardingCentroidInit(dataset, k) {
  // implementation of a variation of naive sharding centroid initialization method
  // (not using sums or sorting, just dividing into k shards and calc mean)
  // https://www.kdnuggets.com/2017/03/naive-sharding-centroid-initialization-method.html
  const numSamples = dataset.length;
  // Divide dataset into k shards:
  const step = Math.floor(numSamples / k);
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const start = step * i;
    let end = step * (i + 1);
    if (i + 1 === k) {
      end = numSamples;
    }
    centroids.push(calcMeanCentroid(dataset, start, end));
  }
  return centroids;
}

function initCentroids(dataset, nClusters, initType='naive') {
	let centroidCoords = [];
	if(initType === 'naive') {
		centroidCoords = naiveShardingCentroidInit(dataset, nClusters);
	} else {
		for(let c=0; c < nClusters; ++c) {
			centroidCoords.push(randomCentroids());
		}
	}
	const centroids = centroidCoords.map(coords => ({
		coords: coords,
		nPoints: 0,
	}));
	return centroids;
}

function centroidHasChanged(prevC, currC, eps=1e-3) {
	let diff = 0;
	for(let i = 0; i < prevC.length; ++i) {
		diff += (prevC[i] - currC[i]) ** 2;
	}
	return diff > eps;
}

function kmeans(dataset, nClusters=3, maxIter=100) {
	const centroids = initCentroids(dataset, nClusters);
	let iter = 0;
	// let labels = [];
	const features = dataset[0].length;
	let noCentroidChanged = false
	while (iter < maxIter && !noCentroidChanged) {
		const prevCentroidsCoords = centroids.map(centroid => [...centroid.coords]);
		kmeanIteration(dataset, centroids, features);
		const currCentroidsCoords = centroids.map(centroid => centroid.coords);
		noCentroidChanged = prevCentroidsCoords.every((prevCentroidCoord, idx) => !centroidHasChanged(prevCentroidCoord, currCentroidsCoords[idx]));
		iter++;
	}
	const centroidCoords = centroids.map(e => e.coords.map(c => Math.floor(c)));
	return {
		labels: dataset.map(point => getNearestCentroid(centroids, point)),
		centroids: centroidCoords,
		iterations: iter,
		converged: iter < maxIter
	}
}

export default kmeans;





// const data = [];
// for(let i=0; i < 150000; ++i) {
// 	const row = []
// 	for(let j=0; j < 3; ++j) {
// 		row.push(Math.floor(Math.random() * 255));
// 	}
// 	data.push(row);
// }

// function calcTime(callback, data, nClusters) {
// 	const start = new Date();
// 	const result = callback(data, nClusters);
// 	console.log(result);
// 	return new Date() - start;
// }


// console.log('own kmeans mseconds:', calcTime(kmeans, data, 3));

