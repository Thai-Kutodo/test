import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  globalNavTarget: HTMLDivElement
  hamburgerButtonTarget: HTMLButtonElement

  static targets = ['globalNav', 'hamburgerButton']

  open() {
    this.hamburgerButtonTarget.setAttribute('aria-expanded', 'true')
    this.globalNavTarget.classList.add('show')
    this.globalNavTarget.scrollTop = 0
    document.body.classList.add('is-presenting-modal')
  }

  close() {
    this.hamburgerButtonTarget.setAttribute('aria-expanded', 'false')
    this.globalNavTarget.classList.remove('show')
    document.body.classList.remove('is-presenting-modal')
  }
}
