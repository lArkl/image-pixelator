const MAXFILESIZE = 1;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

const RATIO = window.devicePixelRatio;

export const imageParams = {
	pixelSize: 1,
	origPixelData: []
}

function setCanvasMessage(ctx) {
	const text = "Upload your image";
	ctx.font = "1rem Arial";
	ctx.fillText(text, canvas.width * 0.5 - 5 * REM, canvas.height / 2);
}


function drawDashedLines(ctx, w, h) {
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

export function initializeCanvas(canvas, ctx) {
	const w = REM * 30;
	const h = w;
	canvas.width = w * RATIO;
	canvas.height = h * RATIO;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	ctx.scale(RATIO, RATIO);
	setCanvasMessage(ctx);
	drawDashedLines(ctx, w, h);
}

function redraw(ctx, canvas, image) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 0, 0, image.width, image.height,
		0, 0, canvas.width, canvas.height);
}

// Set image and properties
export const image = new Image();
export function onLoadImage(canvas, ctx) {
	// Resize canvas to image ratio
	canvas.width = canvas.clientWidth;
	canvas.height = image.height * canvas.width / image.width;
	// canvas.style.width = canvas.clientWidth;
	// canvas.style.height = canvas.height;
	redraw(ctx, canvas, image);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	imageParams.origPixelData = [...imageData.data];
}

export function onChangeImage(ev) {	
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
}


export function resetPixelData(data) {
	if(!imageParams.origPixelData) return;

	for(let i = 0; i < data.length; ++i) {
		data[i] = imageParams.origPixelData[i];
	}
}
