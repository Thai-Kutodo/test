import { ActionEvent, Controller } from '@hotwired/stimulus'
import { numberWithCommas } from "../helpers/currencyHelper.js";

export default class extends Controller {
  valueTarget: HTMLInputElement
  incrementTarget: HTMLButtonElement
  decrementTarget: HTMLButtonElement

  static targets = ['value', 'increment', 'decrement']

  initialize(): void {
    this.checkButtonStatus()
  }

  increment(ev: ActionEvent) {
    const FAMILIAR = window.FAMILIAR;
    this.valueTarget.stepUp();

    if (FAMILIAR['templateSuffix'] === '' && FAMILIAR['templateName'] === 'cart') {
      const qty = this.valueTarget.value;
      const key = this.incrementTarget.getAttribute("data-key");

      this.updateItem(qty, key);
    }
    this.checkButtonStatus()
  }

  decrement(ev: ActionEvent) {
    const FAMILIAR = window.FAMILIAR;
    this.valueTarget.stepDown();

    if (FAMILIAR['templateSuffix'] === '' && FAMILIAR['templateName'] === 'cart') {
      const qty = this.valueTarget.value;
      const key = this.incrementTarget.getAttribute("data-key");

      this.updateItem(qty, key);
    }

    this.checkButtonStatus()
  }

  updateItem(qty, keyProduct) {
    const formData = {
      'id': keyProduct,
      'quantity': qty,
      sections: "mini-cart-footer"
    };

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        const miniCart = this.element.closest('.cart');
        const htmlCartFooter = new DOMParser().parseFromString(data.sections['mini-cart-footer'], 'text/html').querySelector('.cart-footer');

        miniCart.querySelector('.cart-footer').innerHTML = htmlCartFooter.innerHTML;
      });
  }

  removeItem(e) {
    e.preventDefault();

    const keyProduct = e.currentTarget.getAttribute("data-key");
    const formData = {
      'id': keyProduct,
      'quantity': 0,
      sections: "mini-cart-body,mini-cart-footer,info-cart"
    };

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        const miniCart = this.element.closest('.cart');
        const htmlCartBody = new DOMParser().parseFromString(data.sections['mini-cart-body'], 'text/html').querySelector('.cart-body');
        const htmlCartFooter = new DOMParser().parseFromString(data.sections['mini-cart-footer'], 'text/html').querySelector('.cart-footer');
        const infoCart = new DOMParser().parseFromString(data.sections['info-cart'], 'text/html').querySelector('.info-cart');
        const countItem = +infoCart.querySelector<HTMLElement>('.js-arrayInfoCart').dataset.total_cart;

        if (countItem == 0) {
          document.querySelector('#cart-button').classList.remove('cart-button--has-item');
        }

        miniCart.querySelector('.cart-body').innerHTML = htmlCartBody.innerHTML;
        miniCart.querySelector('.cart-footer').innerHTML = htmlCartFooter.innerHTML;

        if (miniCart.querySelector('.info-cart')) {
          miniCart.querySelector('.info-cart').innerHTML = infoCart.innerHTML;
        }
      });
  }

  checkButtonStatus() {
    if (this.valueTarget.value === this.valueTarget.min) this.decrementTarget.classList.add('disabled')
    else this.decrementTarget.classList.remove('disabled')

    if (this.valueTarget.value === this.valueTarget.max) this.incrementTarget.classList.add('disabled')
    else this.incrementTarget.classList.remove('disabled')
  }
}