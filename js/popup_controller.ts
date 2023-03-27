import { Controller } from '@hotwired/stimulus'
import { fadeIn, fadeOut } from '../utils'

export default class extends Controller {
  buttonTarget: HTMLButtonElement
  popupTarget: HTMLElement

  static targets = ['button', 'popup']

  toggle() {
    this.expanded = !this.expanded
  }

  get expanded() {
    return this.buttonTarget.getAttribute('aria-expanded') === 'true'
  }

  set expanded(expanded: boolean) {
    this.buttonTarget.setAttribute('aria-expanded', String(expanded))

    expanded ? fadeIn(this.popupTarget, 0.4) : fadeOut(this.popupTarget, 0.2)
  }
}
