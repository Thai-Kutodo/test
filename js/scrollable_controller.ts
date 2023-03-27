import { subscribe } from 'subscribe-ui-event'
import { Controller } from '@hotwired/stimulus'
import { transitionDurationEnter } from '../utils'
import gsap, { Expo } from 'gsap'

export default class extends Controller {
  contentTarget: HTMLDivElement
  leftButtonTarget: HTMLButtonElement
  rightButtonTarget: HTMLButtonElement

  static targets = ['content', 'leftButton', 'rightButton']

  connect(): void {
    this.leftButtonTarget.style.opacity = '0'

    this.contentTarget.addEventListener('scroll', () => {
      this.contentTarget.scrollLeft === 0 ? this.hide(this.leftButtonTarget) : this.show(this.leftButtonTarget)

      this.contentTarget.scrollLeft + this.contentTarget.offsetWidth >= this.contentTarget.scrollWidth
        ? this.hide(this.rightButtonTarget)
        : this.show(this.rightButtonTarget)
    })
  }

  show(el: HTMLElement) {
    if (gsap.isTweening(el)) return
    gsap.to(el, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
    })
  }

  hide(el: HTMLElement) {
    gsap.to(el, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
    })
  }

  scrollLeft() {
    gsap.killTweensOf(this.contentTarget, { scrollLeft: true })

    gsap.to(this.contentTarget, {
      scrollLeft: this.contentTarget.scrollLeft - 600,
      duration: transitionDurationEnter,
      ease: Expo.easeOut,
    })
  }

  scrollRight() {
    gsap.killTweensOf(this.contentTarget, { scrollLeft: true })

    gsap.to(this.contentTarget, {
      scrollLeft: this.contentTarget.scrollLeft + 600,
      duration: transitionDurationEnter,
      ease: Expo.easeOut,
    })
  }
}
