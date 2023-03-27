import { Controller } from '@hotwired/stimulus'
import gsap, { Power1, Power2, Power3, Power4, Expo } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isPc } from '../utils'

export default class extends Controller {
  rulerTarget: HTMLElement
  lastHeight = 0

  static targets = ['ruler']

  initialize(): void {
    gsap.set('.timeline__container:not(:first-of-type)', {
      autoAlpha: 0,
    })

    const lastEl = this.element.querySelector('.timeline__container:last-child')
    ScrollTrigger.batch('.timeline__container:not(:first-of-type)', {
      onEnter: (batch) => {
        const currEl = batch[batch.length - 1]
        if (currEl instanceof HTMLElement) {
          gsap.to(this.rulerTarget, {
            height: lastEl !== currEl ? currEl.offsetTop + 6 : this.element.getBoundingClientRect().height,
            ease: Power3.easeOut,
            duration: 0.8,
          })
          gsap.to(batch, {
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.4,
          })
        }
      },
      start: 'top bottom-=25%',
    })
  }
}
