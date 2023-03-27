import { ActionEvent, Controller } from '@hotwired/stimulus'

// @ts-ignore
import PhotoSwipe from 'photoswipe'

export default class extends Controller {
  srcValue: string

  static values = {
    src: String,
  }

  zoom() {
    this.initPhotoSwipe()
  }

  initPhotoSwipe() {
    const pswp = new PhotoSwipe({
      closeSVG: closeSvg,
      allowPanToNext: false,
      bgOpacity: 1,
      closeOnVerticalDrag: false,
      counter: false,
      loop: false,
      zoom: false,
      dataSource: [
        {
          src: this.srcValue,
          width: 2400,
          height: 2400,
        },
      ],
    })

    pswp.init()
  }
}

const closeSvg =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 17L9 9M9 9L17 1M9 9L1 17M9 9L1 1" stroke="#555555" stroke-opacity="0.5" stroke-width="2"/></svg>'
