import { Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'

export default class extends Controller {
  selectTarget: HTMLSelectElement
  inputTargets: HTMLInputElement[]

  static targets = ['select', 'input']

  reset() {
    setTimeout(() => {
      this.selectTarget.selectedIndex = 0

      this.inputTargets.forEach((target) => {
        target.value = ''
      })
    }, transitionDurationLeave * 1000)
  }
}
