import { Controller } from '@hotwired/stimulus'
import { fadeIn, fadeOut, slideDown, slideUp } from '../utils'

export default class extends Controller {
  content1Target: HTMLElement
  content2Target: HTMLElement

  isContent1Visible: boolean = true

  static targets = ['content1', 'content2']

  toggle(e) {
    const parent = e.currentTarget.closest('.expander');

    if (this.isContent1Visible) {
      if (parent) parent.classList.add('active');
      fadeOut(this.content1Target)
      fadeIn(this.content2Target)
      slideDown(this.content2Target)
    } else {
      if (parent) parent.classList.remove('active');
      fadeIn(this.content1Target)
      fadeOut(this.content2Target)
      slideUp(this.content2Target)
    }
    this.isContent1Visible = !this.isContent1Visible
  }
}
