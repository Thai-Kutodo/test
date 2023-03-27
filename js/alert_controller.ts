import { Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'

export default class extends Controller {
  closeModalValue: boolean

  static values = {
    closeModal: Boolean,
  }

  connect(): void {
    // TODO: dispatch
    setTimeout(() => {
      if (!this.element.classList.contains('js-alert-message') && !this.element.classList.contains('hide-alert')) {
        this.element.classList.add('show')
      }
    })
  }

  close() {
    this.element.classList.remove('show')
    this.element.addEventListener('transitionend', (ev) => {
      if (!this.element.classList.contains('js-alert-message') && !this.element.classList.contains('hide-alert')) {
        if (ev.target === this.element) this.element.remove()
      }
    })
    document.body.classList.remove('is-presenting-alert')

    if (document.querySelector('#cart')) {
      if (document.querySelector('#cart').classList.contains('show')) {
        document.querySelector<HTMLButtonElement>('#cart button[data-action="cart#close"]').click();
      }
    }

    // modal を開いている場合、同時に閉じる
    if (this.closeModalValue) {
      const modalContainerEl = document.getElementById('modal-container')
      if (modalContainerEl.children.length > 0) {
        for (let i = 0; i < modalContainerEl.children.length; i++) {
          const modalEl = modalContainerEl.children[i]
          modalEl.classList.remove('show')
          modalEl.addEventListener('transitionend', (ev) => {
            modalEl.remove()
          })
          document.body.classList.remove('is-presenting-modal')
        }
      }
    }
  }

  reloadPage() {
    location.reload();
  }

  backToCart() {
    location.href = '/cart';
  }
}
