import { subscribe } from 'subscribe-ui-event'
import { Controller, del } from '@hotwired/stimulus'
import { transitionDurationEnter } from '../utils'
import gsap, { Expo, Power0, Power1, Power2, Power4 } from 'gsap'

export default class extends Controller {
  barTarget: HTMLDivElement
  bgTarget: HTMLDivElement
  progressTarget: HTMLDivElement
  stepperTarget: HTMLDivElement

  static targets = ['bar', 'bg', 'progress', 'stepper']

  static values = {
    animate: Boolean,
  }

  initialize(): void {
    const itemLength = this.stepperTarget.children.length

    this.barTarget.style.left = `${100 / (itemLength * 2)}%`
    this.barTarget.style.width = `${100 - (2 * 100) / (itemLength * 2)}%`

    window.addEventListener('load', () => {
      let currentIndex = 1
      this.stepperTarget.querySelectorAll('li').forEach((el, i) => {
        if (el.classList.contains('stepper__item--current')) currentIndex = i + 1
      })

      const duration = currentIndex - 1

      const scaleX = Math.min(1, (1 / ((itemLength - 1) * 2)) * (2 * currentIndex - 1))

      gsap.to(this.progressTarget, {
        scaleX,
        duration,
        ease: Power1.easeOut,
      })

      for (let i = 0; i < currentIndex; i++) {
        const progress = i * (1 / (itemLength - 1))

        const map = (x, a, b, c, d) => {
          return c + (d - c) * ((x - a) / (b - a)) || 0
        }

        const delay = Math.max(0, map(progress, 0, 1, 0, duration) - 0.3)

        gsap.to(this.stepperTarget.querySelector(`li:nth-of-type(${i + 1}) > .stepper__circle`), {
          backgroundColor: '#518fcc',
          duration: 0.3,
          delay,
        })

        gsap.to(this.stepperTarget.querySelector(`li:nth-of-type(${i + 1}) > .stepper__title`), {
          color: '#518fcc',
          duration: 0.3,
          delay,
        })
      }
    })
  }
}
