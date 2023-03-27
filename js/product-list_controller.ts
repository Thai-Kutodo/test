import { Controller } from '@hotwired/stimulus'

let current = 0

export default class extends Controller {
  connect(): void {
    const images = this.element.querySelectorAll<HTMLImageElement>('img')

    const interval = setInterval(() => {
      if (current >= images.length) {
        clearInterval(interval)
      } else if (images[current].complete) {
        images[current].parentElement.parentElement.classList.add('show')
        current++
      }
    }, 100)
  }
}
