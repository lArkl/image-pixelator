import { imageParams, initializeCanvas, onLoadImage, onChangeImage, image, resetPixelData } from "./js/canvas.js";
import { kmeansClustering, pixelate } from "./js/clustering.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('image-input');
const pixelSizeLabel = document.querySelector("label[for='pixel-size']");
const pixelSizeInput = document.getElementById("pixel-size");
const radioMethod = document.querySelector('input[name="method"]:checked');
const processBtn = document.getElementById("process-button");
const uploadBtn = document.getElementById("upload-button");
const resetBtn = document.getElementById("reset-button");


initializeCanvas(canvas, ctx);

image.addEventListener('load', () => onLoadImage(canvas, ctx));
imageInput.addEventListener('change', onChangeImage);
uploadBtn.addEventListener('click', () => {
	imageInput.click();
});


processBtn.addEventListener('click', () => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	resetPixelData(imageData.data);
    // // grayScale(data);
    const size = parseInt(imageParams.pixelSize);
    pixelate(canvas, imageData.data, size);
    
    console.log(radioMethod.value)
    // if (radioMethod.value == 1) {
	   //  binaryQuantization(imageData.data, 5);
    // }

	// binaryQuantization(imageData.data, 5);
	kmeansClustering(canvas, imageData.data, size, 5);
    ctx.putImageData(imageData, 0, 0);
});

pixelSizeInput.addEventListener('change', (ev) => {
	imageParams.pixelSize = ev.target.value;
	pixelSizeLabel.innerText = imageParams.pixelSize;
});

resetBtn.addEventListener('click', () => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	resetPixelData(imageData.data);
	ctx.putImageData(imageData, 0, 0);
	pixelSizeInput.value = 1;
	pixelSizeLabel.innerText = "1";
});

