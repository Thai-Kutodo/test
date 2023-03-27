import { Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'

export default class extends Controller {
  deltaValue: number

  static values = {
    delta: Number,
  }

  goBack() {
    // setTimeout(() => {
    //   history.back()
    // }, transitionDurationLeave * 1000)
    // document.body.classList.remove('is-animated')

    this.deltaValue ? history.go(this.deltaValue) : history.back()
  }
}
