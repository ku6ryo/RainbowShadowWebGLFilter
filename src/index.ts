import { SelfieSegmentation } from "@mediapipe/selfie_segmentation"
import Stats from "stats.js"
import { Effector } from "./Effector/Effector"

const stats = new Stats()
document.body.appendChild(stats.dom)

main()

function main() {

  const seg = new SelfieSegmentation({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
  }})
  seg.setOptions({
    selfieMode: true,
    modelSelection: 1,
  })

  seg.onResults(results => {
    cameraContext.filter = "grayscale(100%)"
    cameraContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height)
    cameraContext.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height)

    maskContext.filter = "blur(15px)"
    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    maskContext.globalAlpha = 0.95
    maskContext.drawImage(prevMaskCanvas, 0, 0, maskCanvas.width, maskCanvas.height)
    maskContext.globalAlpha = 0.4
    maskContext.drawImage(results.segmentationMask, 0, 0, maskCanvas.width, maskCanvas.height)

    prevMaskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    prevMaskContext.globalAlpha = 1
    prevMaskContext.drawImage(maskCanvas, 0, 0, prevMaskCanvas.width, prevMaskCanvas.height)
  })

  const mainCanvas = document.createElement("canvas")
  const mainContext = mainCanvas.getContext("2d")!
  mainCanvas.style.height = "100vh"
  mainCanvas.style.width = "100vw"
  document.querySelector(".container")!.appendChild(mainCanvas)

  const cameraVideo = document.createElement("video");
  cameraVideo.addEventListener("playing", () => {
    const vw = cameraVideo.videoWidth
    const vh = cameraVideo.videoHeight
    mainCanvas.width = vw
    mainCanvas.height = vh
    mainCanvas.style.maxHeight = `calc(100vw * ${vh / vw})`
    mainCanvas.style.maxWidth = `calc(100vh * ${vw / vh})`
    cameraCanvas.width = vw
    cameraCanvas.height = vh
    maskCanvas.width = vw
    maskCanvas.height = vh
    prevMaskCanvas.width = vw
    prevMaskCanvas.height = vh
    cropper.setSize(vw, vh)
    requestAnimationFrame(process)
  })
  const cameraCanvas = document.createElement("canvas")
  const cameraContext = cameraCanvas.getContext("2d")!
  document.body.appendChild(cameraCanvas)

  const maskCanvas = document.createElement("canvas")
  const maskContext = maskCanvas.getContext("2d")!
  document.body.appendChild(maskCanvas)

  const prevMaskCanvas = document.createElement("canvas")
  const prevMaskContext = prevMaskCanvas.getContext("2d")!
  document.body.appendChild(prevMaskCanvas)

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        }
      },
    })
    .then(function (stream) {
      cameraVideo.srcObject = stream;
      cameraVideo.play();
      requestAnimationFrame(process)
    })
    .catch(function (e) {
      console.log(e)
      console.log("Something went wrong!");
    });
  } else {
    alert("getUserMedia not supported on your browser!");
  }

  const cropper = new Effector()

  let detectedTime = performance.now()
  async function process () {
    stats.begin()
    if (detectedTime + 10 < performance.now()) {
      await seg.send({ image: cameraVideo })
      detectedTime = performance.now()
    }
    cropper.process(cameraCanvas, maskCanvas)
    mainContext.drawImage(cropper.getCanvas(), 0, 0, mainCanvas.width, mainCanvas.height)

    stats.end()
    requestAnimationFrame(process)
  }
}