import { ActionEvent, Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'

export default class extends Controller {
  contentTargets: HTMLElement[]

  static targets = ['content']

  currentIndex = 0

  switch(ev: ActionEvent) {
    let toShowTarget
    let toHideTarget

    this.contentTargets.forEach((target, i) => {
      if (i === ev.params.target) toShowTarget = target
      else if (i === this.currentIndex) toHideTarget = target
    })

    this.currentIndex = ev.params.target

    const tl = gsap.timeline()

    const parent = toShowTarget.parentElement.parentElement.parentElement
    tl.to(toHideTarget, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
      onComplete: () => {
        toHideTarget.style.setProperty('display', 'none')
      },
    }).to(toShowTarget, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
      onStart: () => {
        toShowTarget.style.setProperty('display', 'block')
        parent.scrollTop = 0
      },
    })
  }

  validateRadio() {
    const inputs = this.contentTargets[this.currentIndex].querySelectorAll<HTMLInputElement>('input[type="radio"]')
    const button = this.contentTargets[this.currentIndex].querySelector<HTMLButtonElement>('.next-button')
    let isValid = true

    inputs.forEach((input) => {
      if (input.type === 'radio' && input.checked) {
        button.disabled = false
      }
    })
  }

  validateText() {
    const inputs =
      this.contentTargets[this.currentIndex].querySelectorAll<HTMLInputElement>('input[type="text"]:required')
    const button = this.contentTargets[this.currentIndex].querySelector<HTMLButtonElement>('.next-button')
    let isValid = true

    inputs.forEach((input) => {
      if (input.type === 'text' && input.value === '' && !input.closest(".child-input-section").classList.contains("hide") && !input.closest("div").classList.contains("hide")) {
        isValid = false
      }
    })

    button.disabled = !isValid
  }

  validateCheck() {
    const input = this.contentTargets[this.currentIndex].querySelector<HTMLInputElement>('input[type="checkbox"]')
    const button = this.contentTargets[this.currentIndex].querySelector<HTMLButtonElement>('.next-button')

    button.disabled = !input.checked
  }
}
