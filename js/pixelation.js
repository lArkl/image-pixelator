import kmeans from "./kmeans.js";

export function grayScale(data) {
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
}

export function pixelate(canvas, data, size) {
  for (let x = 0; x < canvas.width; x += size) {
    for (let y = 0; y < canvas.height; y += size) {
      const avg = [0, 0, 0];
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const idx = ((y + j) * canvas.width + (x + i)) * 4;
          for (let c = 0; c < 3; c++) {
            avg[c] += data[idx + c];
          }
        }
      }

      for (let c = 0; c < 3; c++) {
        avg[c] /= size * size;
      }
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const idx = ((y + j) * canvas.width + (x + i)) * 4;
          for (let c = 0; c < 3; c++) {
            data[idx + c] = avg[c];
          }
        }
      }
    }
  }
}

export function binaryQuantization(canvas, data, lostBits = 3) {
  const binary = 2 ** 8 - 2 ** lostBits;
  for (let x = 0; x < canvas.width; ++x) {
    for (let y = 0; y < canvas.height; ++y) {
      const idx = (y * canvas.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        data[idx + c] = (data[idx + c] + Math.random() * 2 - 1) & binary;
      }
    }
  }
}

function createDataset([width, w, h], data, size) {
  const dataset = [];
  for (let x = 0; x < w; x += size) {
    for (let y = 0; y < h; y += size) {
      const idx = (y * width + x) * 4;
      const point = [];
      for (let c = 0; c < 3; ++c) {
        point.push(data[idx + c]);
      }
      dataset.push(point);
    }
  }
  return dataset;
}

export function kmeansClustering(canvas, data, size, nCluster = 3) {
  const [w, h] = [
    canvas.width - (canvas.width % size),
    canvas.height - (canvas.height % size),
  ];
  const dataset = createDataset([canvas.width, w, h], data, size);
  const result = kmeans(dataset, nCluster);
  const convertedDataset = dataset.map((_, idx) => {
    const centroidIdx = result.labels[idx];
    return result.centroids[centroidIdx];
  });

  const datasetYSize = Math.floor(canvas.height / size);
  for (let x = 0; x < w; ++x) {
    for (let y = 0; y < h; ++y) {
      const dataIdx = (y * canvas.width + x) * 4;
      const datasetIdx =
        Math.floor(y / size) + Math.floor(x / size) * datasetYSize;
      if (datasetIdx < convertedDataset.length) {
        const centroidPoint = convertedDataset[datasetIdx];
        for (let c = 0; c < 3; c++) {
          data[dataIdx + c] = centroidPoint[c];
        }
      }
    }
  }
}

export function quantize(canvas, data, size) {
  for (let x = 0; x < canvas.width; x += size) {
    for (let y = 0; y < canvas.height; x += size) {
      const idx = (y * canvas.width + x ) * 4;
      const dx = Math.floor(x / size);
      const dy = Math.floor(y / size);
      for (let c = 0; c < 4; c++) {
        distances[dx][dy] += (clusters[n][c] - data[idx + c]) ** 2;
      }
      distances[dx][dy] = Math.sqrt(distances[dx][dy]);
    }
  }
}
