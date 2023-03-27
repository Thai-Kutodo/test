import { Controller } from '@hotwired/stimulus'
import LazyLoad from 'vanilla-lazyload'

const toAnimate = []

let loaded = false

function addToAnimate(el: HTMLElement) {
  toAnimate.push(el.parentElement)
}

const interval = setInterval(function () {
  const el = toAnimate.shift()
  if (!el) {
    if (loaded) clearInterval(interval)
    return
  }
  el.classList.add('show')
}, 100)

export default class extends Controller {
  connect(): void {
    new LazyLoad({
      elements_selector: '.gallery__image img',
      callback_loaded: addToAnimate,
      callback_error: addToAnimate,
      callback_finish: function () {
        loaded = true
      },
    })
   }
}
