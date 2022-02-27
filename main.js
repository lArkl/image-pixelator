import kmeans from "./scripts/kmeans.js";

const MAXFILESIZE = 1;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('image-input');
const pixelSizeLabel = document.querySelector("label[for='pixel-size']");
const pixelSizeInput = document.getElementById("pixel-size");
const radioMethod = document.querySelector('input[name="method"]:checked');
const processBtn = document.getElementById("process-button");
const uploadBtn = document.getElementById("upload-button");
const resetBtn = document.getElementById("reset-button");


const RATIO = window.devicePixelRatio;

const imageParams = {
	pixelSize: 1,
	origPixelData: []
}

function setCanvasMessage() {
	const text = "Upload your image";
	ctx.font = "1rem Arial";
	ctx.fillText(text, canvas.width * 0.5 - 5 * REM, canvas.height / 2);
}


function drawDashedLines(w, h) {
	const offset = Math.floor(REM);
	ctx.beginPath();
	ctx.setLineDash([5, 5]);
	ctx.moveTo(offset, offset);
	ctx.lineTo(w - offset, offset);
	ctx.lineTo(w - offset, h - offset);
	ctx.lineTo(offset, h - offset);
	ctx.closePath();
	ctx.stroke();
}

function initializeCanvas() {
	const w = REM * 30;
	const h = w;
	canvas.width = w * RATIO;
	canvas.height = h * RATIO;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	ctx.scale(RATIO, RATIO);
	setCanvasMessage();
	drawDashedLines(w, h);
}

initializeCanvas();

function redraw(image) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 0, 0, image.width, image.height,
		0, 0, canvas.width, canvas.height);
}

// Set image and properties
const image = new Image();
image.addEventListener('load', () => {
	// Resize canvas to image ratio
	canvas.width = canvas.clientWidth;
	canvas.height = image.height * canvas.width / image.width;
	// canvas.style.width = canvas.clientWidth;
	// canvas.style.height = canvas.height;
	redraw(image);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	imageParams.origPixelData = [...imageData.data];
});

imageInput.addEventListener('change', (ev) => {	
	const file = ev.target.files[0];
	if(!file){
		return;
	}
	if(MIME_TYPES.indexOf(file.type) < 0){
		alert("Tipo de archivo incorrecto!");
		return;
	}

	if(file.size > MAXFILESIZE * 1024 * 1024){
		alert("La imagen no debe pesar mas de " + MAXFILESIZE +"MB!");
		return;
	}
	image.src = URL.createObjectURL(file);
});


uploadBtn.addEventListener('click', () => {
	imageInput.click();
});


processBtn.addEventListener('click', () => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	resetPixelData(imageData.data);
    // // grayScale(data);
    const size = parseInt(imageParams.pixelSize);
    pixelate(imageData.data, size);
    
    console.log(radioMethod.value)
    // if (radioMethod.value == 1) {
	   //  binaryQuantization(imageData.data, 5);
    // }

	// binaryQuantization(imageData.data, 5);
	kmeansClustering(imageData.data, size, 5);
    ctx.putImageData(imageData, 0, 0);
});


function resetPixelData(data) {
	if(!imageParams.origPixelData) return;

	for(let i = 0; i < data.length; ++i) {
		data[i] = imageParams.origPixelData[i];
	}
}

function grayScale(data) {
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
}


function pixelate(data, size) {
	for(let x = 0; x < canvas.width; x += size) {
		for(let y = 0; y < canvas.height; y += size) {
		    const avg = [0, 0, 0];
			for(let i = 0; i < size; i++) {
				for(let j = 0; j < size; j++) {
					const idx = (y + j) * canvas.width * 4 + (x + i)* 4;
					for(let c = 0; c < 3; c++) {
				        avg[c] += data[idx + c];
					}
				}
			}

			for(let c = 0; c < 3; c++) {
		        avg[c] /= (size * size);
			}
			for(let i = 0; i < size; i++) {
				for(let j = 0; j < size; j++) {
					const idx = (y + j) * canvas.width * 4 + (x + i)* 4;
					for(let c = 0; c < 3; c++) {
				        data[idx + c] = avg[c];
					}
				}
			}
		}		
	}

}

function binaryQuantization(data, lostBits=3) {
	const binary = 2 ** 8 - 2 ** lostBits;
	for(let x = 0; x < canvas.width; ++x) {
		for(let y = 0; y < canvas.height; ++y) {
			const idx = y * canvas.width * 4 + x * 4;
			for(let c = 0; c < 3; c++) {
		        data[idx + c] = (data[idx + c] + Math.random() * 2 - 1) & binary;
			}
		}
	}
}


function kmeansClustering(data, size, nCluster=3) {
	const dataset = [];
	for(let x = 0; x < canvas.width; x += size) {
		for(let y = 0; y < canvas.height; y += size) {
			const idx = y * canvas.width * 4 + x * 4;
			const point = [];
			for(let c = 0; c < 3; ++c) {
				point.push(data[idx + c]);
			}
			dataset.push(point);
		}
	}
	const result = kmeans(dataset, nCluster);
	const convertedDataset = dataset.map((point, idx) => {
		const centroidIdx = result.labels[idx];
		return result.centroids[centroidIdx]
	});

	const datasetYSize = Math.floor(canvas.height / size);
	for(let x = 0; x < canvas.width - canvas.width % size; ++x) {
		for(let y = 0; y < canvas.height - canvas.height % size; ++y) {
			const dataIdx = y * canvas.width * 4 + x * 4;
			const datasetIdx = Math.floor(y / size) + Math.floor(x / size) * datasetYSize;
			if (datasetIdx < convertedDataset.length) {
				const centroidPoint = convertedDataset[datasetIdx];
				for(let c = 0; c < 3; c++) {
			        data[dataIdx + c] = centroidPoint[c];
				}
			}
		}
	}

}


function quantize(data, size) {
	for(let x = 0; x < canvas.width; x += size) {
		for(let y = 0; y < canvas.height; x += size) {
			const idx = y * canvas.width * 4 + x * 4;
			const dx = Math.floor(x / size)
			const dy = Math.floor(y / size)
			for(let c = 0; c < 4; c++) {
		        distances[dx][dy] += (clusters[n][c] - data[idx + c]) ** 2;
			}
			distances[dx][dy] = Math.sqrt(distances[dx][dy]);
		}
	}
}


pixelSizeInput.addEventListener('change', (ev) => {
	imageParams.pixelSize = ev.target.value;
	pixelSizeLabel.innerText = imageParams.pixelSize;
});

resetBtn.addEventListener('click', () => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	resetPixelData(imageData.data);
    ctx.putImageData(imageData, 0, 0);
});
