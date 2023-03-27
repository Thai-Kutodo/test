import { Controller } from '@hotwired/stimulus';
import { buildValueAfterSearch } from '../libs/build-value-search'
const containerElement = document.querySelector('#modal-container')

export default class extends Controller {
  templateTarget: HTMLTemplateElement
  templateAccountTargets: HTMLTemplateElement[]
  showDefaultValue: boolean

  static targets = ['template', 'templateAccount']

  static values = {
   showDefault: {
     type: Boolean,
     default: false,
   },
 }

 connect(): void {
    if (this.showDefaultValue) {
      this.open()
    }
  }

  open() {
    const node = this.templateTarget.content.cloneNode(true)
    containerElement.append(node)
    document.body.classList.add('is-presenting-modal')
    buildValueAfterSearch('.modal-search');
  }

  openFormEditAccount(e) {
    const index = e.currentTarget.getAttribute('data-index');
    const node = this.templateAccountTargets[index].content.cloneNode(true);

    containerElement.append(node)
    document.body.classList.add('is-presenting-modal')
  }
}
