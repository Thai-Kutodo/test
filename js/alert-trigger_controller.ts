import { ActionEvent, Controller } from '@hotwired/stimulus'

const containerElement = document.querySelector('#alert-container')

export default class extends Controller {
  templateTarget: HTMLTemplateElement

  static targets = ['template']

  open(ev: ActionEvent) {
    const node = this.templateTarget.content.cloneNode(true)
    if (ev.params.title) {
      ;(node as HTMLElement).querySelector('.alert__title').innerHTML = ev.params.title.replace(/\\n/g, '<br>')
    }
    containerElement.append(node)
    document.body.classList.add('is-presenting-alert')
  }
}
