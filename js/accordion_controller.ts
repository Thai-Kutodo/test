import { transitionDurationEnter, transitionDurationLeave } from './../utils/index'
import { Controller } from '@hotwired/stimulus'
import { slideDown, slideUp } from '../utils'
import gsap, { Power1, Power2, Power3, Power4, Expo } from 'gsap'

export default class extends Controller {
  triggerTarget: HTMLElement
  contentTarget: HTMLDivElement
  hasTriggerTarget: boolean


  static targets = ['trigger', 'content']

  initialize(): void {
    if (this.expanded) {
      this.contentTarget.style.display = 'flex'
    }
  }

  toggle() {
    this.expanded = !this.expanded
  }

  close() {
    gsap.killTweensOf(window)

    gsap.to(window, {
      duration: transitionDurationLeave,
      ease: Expo.easeOut,
      scrollTo: this.triggerTarget.offsetTop - this.triggerTarget.offsetHeight - 2,
    })

    this.triggerTarget.setAttribute('aria-expanded', String(false))
    slideUp(this.contentTarget, transitionDurationLeave + 0.2)
  }

  get expanded() {
    if (!this.hasTriggerTarget) return false;
    return this.triggerTarget.getAttribute('aria-expanded') === 'true'
  }

  set expanded(expanded: boolean) {
    this.triggerTarget.setAttribute('aria-expanded', String(expanded))
    if (expanded) {
      this.contentTarget.style.setProperty('display', 'flex')
      const slideDownDuration = Math.max(transitionDurationEnter, this.contentTarget.scrollHeight * 0.001)
      let easing: gsap.EaseFunction

      if (slideDownDuration <= 0.8) {
        easing = Power4.easeOut
      } else if (slideDownDuration > 0.8 && slideDownDuration <= 1.6) {
        easing = Power3.easeOut
      } else {
        easing = Power2.easeOut
      }

      slideDown(this.contentTarget, slideDownDuration, easing)
    } else {
      slideUp(this.contentTarget)
    }
  }
}
