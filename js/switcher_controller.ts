import { ActionEvent, Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'

export default class extends Controller {
  tabTargets: HTMLInputElement[]
  contentTargets: HTMLElement[]
  hashEnabledValue: boolean
  inputSearchTarget: HTMLInputElement
  static targets = ['tab', 'content', 'inputSearch']

  static values = {
    hashEnabled: {
      type: Boolean,
      default: true,
    },
  }

  currentIndex = 0

  initialize(): void {
    if (window.location.hash && this.hashEnabledValue) {
      const hash = window.location.hash.split('#')[1].toUpperCase()
      const index = this.tabTargets.findIndex((target) => target.value === hash)

      if (index >= 0) {
        this.contentTargets[index].style.display = 'block'
        this.tabTargets[index].checked = true
        this.currentIndex = index
      }
    } else {
      this.contentTargets[0].style.display = 'block'
      this.tabTargets[0].checked = true

      window.addEventListener('unload', () => {
        this.tabTargets[0].checked = true
      })
    }
  }

  switch(ev: ActionEvent) {
    let toShowTarget
    let toHideTarget

    this.contentTargets.forEach((target, i) => {
      if (i === ev.params.index) toShowTarget = target
      else if (i === this.currentIndex) toHideTarget = target
    })

    this.currentIndex = ev.params.index

    const tl = gsap.timeline()

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
      },
    })

    if (this.hashEnabledValue) {
      const hash = (ev.target as HTMLInputElement).value.toLowerCase()
      window.location.hash = hash
    }
  }

  submitFormSearch(e){
    e.preventDefault();
    const keySearch = this.inputSearchTarget.value;
    const url = `/search?view=article&q=${keySearch}*&type=article`;
    location.href = url;
  }
}
