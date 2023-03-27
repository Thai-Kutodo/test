import { Controller } from '@hotwired/stimulus'
import { slideDown, slideUp } from '../utils'

export default class extends Controller {
  triggerTargets: HTMLElement[]

  static targets = ['trigger']

  connect(): void {
    this.triggerTargets.forEach((triggerTarget) => {
      if (triggerTarget.nextElementSibling instanceof HTMLElement && triggerTarget.querySelector('input').checked) {
        triggerTarget.nextElementSibling.style.setProperty('display', 'flex')
      }
    })
  }

  toggle(e: Event) {
    if (e.target instanceof HTMLElement) {
      const el = e.target.parentElement

      if (el.nextElementSibling instanceof HTMLElement) {
        slideDown(el.nextElementSibling)
      } else {
        this.triggerTargets.forEach((triggerTarget) => {
          if (triggerTarget.nextElementSibling instanceof HTMLElement) {
            slideUp(triggerTarget.nextElementSibling)
          }
        })
      }
    }
  }
}
