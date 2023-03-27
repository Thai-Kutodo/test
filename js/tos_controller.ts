import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  checkboxTarget: HTMLInputElement
  buttonTarget: HTMLButtonElement

  static targets = ['checkbox', 'button']

  initialize(): void {
    window.addEventListener('load', () => {
      this.toggle()
    })
  }

  toggle() {
    this.buttonTarget.disabled = !this.checkboxTarget.checked
  }
}
