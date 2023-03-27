import { ActionEvent, Controller } from '@hotwired/stimulus'
import {numberWithCommas} from "../helpers/currencyHelper.js";

export default class extends Controller {
  valueTarget: HTMLInputElement
  incrementTarget: HTMLButtonElement
  decrementTarget: HTMLButtonElement

  static targets = ['value', 'increment', 'decrement']

  initialize(): void {
    this.checkButtonStatus()
  }

  increment(e) {
    const FAMILIAR = window.FAMILIAR;
    const EasyPointsCore = window['EasyPointsCore'];
    const loyalProductId = e.target.dataset.loyal_product_id;

    if (EasyPointsCore.PointExchangeProducts && loyalProductId) {
      if (!EasyPointsCore.PointExchangeProducts.addToCart(loyalProductId)) {
        this.openPopupMessageError(document.querySelector('.js-alert-points'));
        return;
      }
    }

    this.valueTarget.stepUp();

    const qty = +this.valueTarget.value;
    const key = this.incrementTarget.getAttribute("data-key");

    this.updateItem(qty, key);
    this.checkButtonStatus();
  }

  decrement(e) {
    const FAMILIAR = window.FAMILIAR;
    const EasyPointsCore = window['EasyPointsCore'];
    const loyalProductId = e.target.dataset.loyal_product_id;

    this.valueTarget.stepDown();

    const qty = this.valueTarget.value;
    const key = this.incrementTarget.getAttribute("data-key");

    if (EasyPointsCore.PointExchangeProducts && loyalProductId) {
      EasyPointsCore.PointExchangeProducts.removeFromCart(loyalProductId, 1);
    }

    this.incrementTarget.classList.remove('disabled');

    this.updateItem(qty, key);
    this.checkButtonStatus()
  }

  updateItem(qty, keyProduct){
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

  openPopupMessageError(popup){
    if (!popup) return;

    popup.classList.add('show');
    document.body.classList.add('is-presenting-alert');
  }

  removeItem(e){
    e.preventDefault();

    const EasyPointsCore = window['EasyPointsCore'];
    const keyProduct = e.currentTarget.getAttribute("data-key");
    const formData = {
      'id': keyProduct,
      'quantity': 0,
       sections: "mini-cart-body,mini-cart-footer,info-cart"
    };

    if (EasyPointsCore.PointExchangeProducts) {
      EasyPointsCore.PointExchangeProducts.removeFromCart(e.currentTarget.dataset.loyal_product_id, +e.currentTarget.dataset.qty)
    }

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

      if (htmlCartBody.querySelector('.cart__header')) {
        htmlCartBody.querySelector('.cart__header').classList.add('hidden');
      }

      miniCart.querySelector('.cart-body').innerHTML = htmlCartBody.innerHTML;
      miniCart.querySelector('.cart-footer').innerHTML = htmlCartFooter.innerHTML;

      if (miniCart.querySelector('.info-cart')) {
        miniCart.querySelector('.info-cart').innerHTML = infoCart.innerHTML;
      }
    });
  }

  checkButtonStatus() {
    const maxQty = +this.incrementTarget.dataset.inventory;
    const qty = +this.valueTarget.value;

    if (this.valueTarget.value === this.valueTarget.min) this.decrementTarget.classList.add('disabled')
    else this.decrementTarget.classList.remove('disabled')

    if (this.valueTarget.value === this.valueTarget.max || qty >= maxQty) this.incrementTarget.classList.add('disabled')
    else this.incrementTarget.classList.remove('disabled')
  }
}
