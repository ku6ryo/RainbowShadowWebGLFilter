import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

export class Segmentor {

  #segmentor: SelfieSegmentation
  #results: Results | null = null
  #processing = false

  constructor() {
    this.#segmentor = new SelfieSegmentation({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
    }})
    this.#segmentor.setOptions({
      selfieMode: true,
      modelSelection: 1,
    })
    this.#segmentor.onResults(results => {
      this.#results = results
      this.#processing = false
    })
  }

  getMask() {
    return this.#results?.segmentationMask
  }

  processing() {
    return this.#processing
  }

  async process(image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement) {
    this.#processing = true
    await this.#segmentor.send({
      image
    })
  }
}