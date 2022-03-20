import {
  imageParams,
  initializeCanvas,
  onLoadImage,
  onChangeImage,
  image,
  resetPixelData,
} from "./js/canvas.js";
import {
  kmeansClustering,
  pixelate,
  binaryQuantization,
} from "./js/clustering.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("image-input");
const pixelSizeLabel = document.querySelector("label[for='pixel-size']");
const pixelSizeInput = document.getElementById("pixel-size");
const extraCtrl = document.getElementById("extra-control");
const extraLabel = document.querySelector("#extra-control>div>strong");
const processBtn = document.getElementById("process-button");
const uploadBtn = document.getElementById("upload-button");
const resetBtn = document.getElementById("reset-button");
const methodSel = document.getElementById("method-select");
let extraSlider = null;
let extraValue = null;

const methodOptions = {
  NONE: { name: "None", value: 0 },
  CLUSTER: { name: "Clusterization", value: 1 },
  QUANT: { name: "Quantization", value: 2 },
};

Object.values(methodOptions).forEach((opt) => {
  const optionElem = document.createElement("option");
  optionElem.value = opt.value;
  optionElem.label = opt.name;
  methodSel.appendChild(optionElem);
});

function addExtraControl(label, minVal, maxVal, value) {
  extraLabel.textContent = label;
  extraSlider = document.createElement("input");
  document.delete;
  extraSlider.type = "range";
  extraSlider.id = "extra-range";
  extraSlider.value = value;
  extraSlider.min = minVal;
  extraSlider.max = maxVal;
  extraCtrl.appendChild(extraSlider);

  extraValue = document.createElement("label");
  extraValue.htmlFor = "extra-range";
  extraValue.textContent = value;
  extraSlider.addEventListener(
    "change",
    (ev) => (extraValue.textContent = ev.target.value)
  );
  extraCtrl.appendChild(extraValue);
}

methodSel.addEventListener("change", (ev) => {
  const idx = parseInt(ev.target.value);
  if (extraSlider) {
    extraLabel.textContent = "";
    extraSlider.remove();
    extraValue.remove();
  }

  switch (idx) {
    case methodOptions.CLUSTER.value: {
      addExtraControl("N° cluster", 2, 10, 2);
      break;
    }
    case methodOptions.QUANT.value: {
      addExtraControl("N° bits", 1, 7, 3);
      break;
    }
  }
});

initializeCanvas(canvas, ctx);

image.addEventListener("load", () => onLoadImage(canvas, ctx));
imageInput.addEventListener("change", onChangeImage);
uploadBtn.addEventListener("click", () => {
  imageInput.click();
});

processBtn.addEventListener("click", () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  resetPixelData(imageData.data);
  // // grayScale(data);
  const size = parseInt(imageParams.pixelSize);
  pixelate(canvas, imageData.data, size);

  switch (parseInt(methodSel.value)) {
    case methodOptions.CLUSTER.value: {
      const nClusters = parseInt(extraSlider.value);
      kmeansClustering(canvas, imageData.data, size, nClusters);
      break;
    }
    case methodOptions.QUANT.value: {
      const nBits = parseInt(extraSlider.value);
      binaryQuantization(canvas, imageData.data, nBits);
      break;
    }
  }
  ctx.putImageData(imageData, 0, 0);
});

pixelSizeInput.addEventListener("change", (ev) => {
  imageParams.pixelSize = ev.target.value;
  pixelSizeLabel.innerText = imageParams.pixelSize;
});

resetBtn.addEventListener("click", () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  resetPixelData(imageData.data);
  ctx.putImageData(imageData, 0, 0);
  pixelSizeInput.value = 1;
  pixelSizeLabel.innerText = "1";
});
