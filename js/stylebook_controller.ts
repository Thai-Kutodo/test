import { ActionEvent, Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'

export default class extends Controller {
  defaultContentTarget: HTMLDivElement
  taggedContentTarget: HTMLDivElement

  static targets = ['defaultContent', 'taggedContent']

  initialize(): void {
    const tabs = this.element.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    const checkboxes = this.element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const isAllTabSelected =
          this.element.querySelector<HTMLInputElement>('input[type="radio"]:checked').value === 'すべて'
        const isTagChecked =
          this.element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').length !== 0

        if (isAllTabSelected && !isTagChecked) {
          this.switch(this.defaultContentTarget, this.taggedContentTarget)
        } else {
          this.switch(this.taggedContentTarget, this.defaultContentTarget)
        }
      })
    })

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('click', () => {
        const isAllTabSelected =
          this.element.querySelector<HTMLInputElement>('input[type="radio"]:checked').value === 'すべて'
        const isTagChecked =
          this.element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').length !== 0

        if (isAllTabSelected && !isTagChecked) {
          this.switch(this.defaultContentTarget, this.taggedContentTarget)
        } else {
          this.switch(this.taggedContentTarget, this.defaultContentTarget)
        }
      })
    })
  }

  switch(toShowTarget: HTMLElement, toHideTarget: HTMLElement) {
    const tl = gsap.timeline()

    tl.to(toHideTarget, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
      onComplete: () => {},
    }).to(toShowTarget, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
      onStart: () => {
        toShowTarget.style.setProperty('display', 'block')
      },
      onComplete: () => {
        toHideTarget.style.setProperty('display', 'none')
      },
    })
  }
}
