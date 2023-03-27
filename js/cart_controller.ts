import { ActionEvent, Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'
import {numberWithCommas} from "../helpers/currencyHelper.js";

export default class extends Controller {
  cartTarget: HTMLDivElement
  cartButtonTarget: HTMLButtonElement
  cartHeaderTarget: HTMLDivElement
  hasCartHeaderTarget: boolean
  cartFooterTarget: HTMLElement
  hasCartFooterTarget: boolean
  colorSelectorTarget: HTMLDivElement
  sizeSelectorTarget: HTMLDivElement
  hasSpecialSelectorTarget: boolean
  optionInputTargets: HTMLInputElement[]
  optionDropdownTargets: HTMLSelectElement[]
  beforeCheckoutTarget: HTMLElement
  captionLoginTarget: HTMLElement
  noteProductPickupTarget: HTMLElement

  static targets = [
    'cart',
    'cartButton',
    'cartHeader',
    'cartFooter',
    'colorSelector',
    'sizeSelector',
    'specialSelector',
    'optionInput',
    'optionDropdown',
    'beforeCheckout',
    'captionLogin',
    'noteProductPickup'
  ]

  connect(): void {
    if (this.hasCartHeaderTarget) {
      // this.cartHeaderTarget.style.display = 'none';
    }
  }

  open() {
    this.cartButtonTarget.setAttribute('aria-expanded', 'true')
    this.cartTarget.classList.add('show')
    this.cartTarget.scrollTop = 0
    this.element.classList.add('is-presenting-alert')
    this.cartHeaderTarget.style.display = 'none';
  }

  close() {
    this.cartButtonTarget.setAttribute('aria-expanded', 'false')
    this.cartTarget.classList.remove('show')
    this.element.classList.remove('is-presenting-alert')

    // modal を開いている場合、同時に閉じる
    const modalContainerEl = document.getElementById('modal-container')
    if (modalContainerEl.children.length > 0) {
      const modalEl = modalContainerEl.children[0]
      modalEl.classList.remove('show')
      modalEl.addEventListener('transitionend', (ev) => {
        modalEl.remove()
      })
      document.body.classList.remove('is-presenting-modal')
    }
  }

  async addToCart(e) {
    const arrayProduct = window.arrayProduct;
    const EasyPointsCore = window['EasyPointsCore'];
    const optionsColor = document.querySelectorAll<HTMLInputElement>('.js-optionColor:checked');
    const totalCart = +this.cartTarget.querySelector('.js-arrayInfoCart').getAttribute('data-total_cart');
    const isLoggedIn = e.currentTarget.dataset.login;
    const productTypeInCart = this.cartTarget.querySelector('.js-arrayInfoCart') ? this.cartTarget.querySelector('.js-arrayInfoCart').getAttribute('data-product_type') : '';
    const currentProductType = e.currentTarget.getAttribute('data-product_type');
    const hasTagPickupInCart = this.cartTarget.querySelector('.js-arrayInfoCart') ? this.cartTarget.querySelector('.js-arrayInfoCart').getAttribute('data-tag_pickup') : false;
    const productHasTagPickup = e.currentTarget.getAttribute('data-tag_pickup');
    const tagStoreProduct = JSON.parse(e.currentTarget.dataset.store);
    const tagStoreItemCart = this.cartTarget.querySelector('.js-arrayInfoCart') ? JSON.parse(this.cartTarget.querySelector('.js-arrayInfoCart').getAttribute('data-store')) : [];

    let availableAddProductWithTagStore = true;
    let arrayVariants = [];
    let variantId;
    let isPickedUpAtStore = false;
    let isNotPickedUpAtStore = false;

    if (tagStoreItemCart.length > 0 && tagStoreProduct.length > 0) {
      availableAddProductWithTagStore = tagStoreProduct.some(item => tagStoreItemCart.includes(item));
    } else if (tagStoreItemCart.length === 0 && tagStoreProduct.length === 0) {
      availableAddProductWithTagStore = true;
    } else {
      availableAddProductWithTagStore = false;
    }

    if (document.querySelectorAll('.error-out-of-stock')) {
      document.querySelectorAll('.error-out-of-stock').forEach(item => {
        item.classList.add('hidden');
      });
    }

    if (!this.sizeSelectorTarget.classList.contains('hidden')) {
      arrayVariants.push(e.currentTarget.getAttribute("data-size"));
    }

    if (!this.colorSelectorTarget.classList.contains('hidden')) {
      optionsColor.forEach((item, i) => {
        arrayVariants.push(item.value);
      });
    }

    if (this.colorSelectorTarget.classList.contains('hidden') && this.sizeSelectorTarget.classList.contains('hidden') && this.hasSpecialSelectorTarget) {
      document.querySelectorAll<HTMLInputElement>('.js-optionSpecial:checked').forEach(item => {
        arrayVariants.push(item.value);
      });
    }

    if (arrayVariants.length > 0) {
      variantId = arrayProduct['variants'].find(function(variant, index){
        return (
          variant["option1"] == arrayVariants[0]
          && variant["option2"] == (arrayVariants[1] || null)
          && variant["option3"] == (arrayVariants[2] || null)
        )
      });
    } else {
      variantId = {
        "id": e.currentTarget.dataset.default_variant
      }
    }

    let formData = {
     'items': [
        {
          'id': variantId["id"],
          'quantity': 1
        }
      ],
      sections: "mini-cart-body,mini-cart-footer,info-cart"
    };

    formData = await this.processPropeties(formData);

    const validateForm = await this.validateForm();
    const invalidDOB = await this.processDateTime();
    const infoCart = await this.getInfoCart();
    const maxQty = e.target.tagName === 'BUTTON' ? +e.target.dataset.max_qty : +e.target.closest('button.button--cta').dataset.max_qty;
    const getInfoProduct = infoCart['items'].find(item => item.id == variantId["id"]) || [];

    if (productHasTagPickup === 'true' && isLoggedIn === 'false') {
      this.noteProductPickupTarget.classList.remove('hidden');

      if (document.querySelector('.modal-cart .modal__close-button')) {
        await document.querySelector<HTMLButtonElement>('.modal-cart .modal__close-button').click();
      }

      if (document.querySelector('.header__menu .btn-login')) {
        document.querySelector<HTMLButtonElement>('.header__menu .btn-login').click();
      }

      return;
    }

    if (hasTagPickupInCart !== productHasTagPickup && totalCart !== 0) {
      this.openPopupMessageError(document.querySelector('.js-alert-cannot-buy-product'));
      return;
    }

    if (!availableAddProductWithTagStore && totalCart !== 0) {
      this.openPopupMessageError(document.querySelector('.js-alert-product-tag-store'));
      return;
    }

    if (EasyPointsCore.PointExchangeProducts) {
      if (!EasyPointsCore.PointExchangeProducts.addToCart(e.target.dataset.loyal_product_id)) {
        this.openPopupMessageError(document.querySelector('.js-alert-points'));
        return;
      }
    }

    if (!validateForm || invalidDOB) return;

    if (getInfoProduct['quantity'] === maxQty) {
      if (document.querySelectorAll('.error-out-of-stock')) {
        document.querySelectorAll('.error-out-of-stock').forEach(item => {
          item.classList.remove('hidden');
        });
      }

      return;
    }

    if (totalCart == 0) {
      this.callApiAddToCart(formData);
    } else {
      //check 2 products have different product types can't ATC at the same time
      if (productTypeInCart !== currentProductType) {
        this.openPopupMessageError(document.querySelector('.js-alert-message'));
        return;
      }

      this.callApiAddToCart(formData);
    }
  }

  openPopupMessageError(popup){
    if (!popup) return;

    popup.classList.add('show');
    document.body.classList.add('is-presenting-alert');
  }

  processPropeties(formData){
    const firstName = document.querySelector<HTMLInputElement>('.first-name');
    const lastName = document.querySelector<HTMLInputElement>('.last-name');
    const fullName = document.querySelector<HTMLInputElement>('.full-name');
    const liningFabric = document.querySelector<HTMLInputElement>('.lining-fabric');
    const motif = document.querySelector<HTMLInputElement>('.motif');
    const innerFabric = document.querySelector<HTMLInputElement>('.inner-fabric');
    const year = document.querySelector<HTMLSelectElement>('.year');
    const month = document.querySelector<HTMLSelectElement>('.month');
    const date = document.querySelector<HTMLSelectElement>('.date');

    formData["items"][0]["properties"] = {};

    if (lastName?.value !== '' && lastName) {
      formData["items"][0]["properties"][`${lastName.dataset.property}`] = lastName.value;
    }

    if (firstName?.value !== '' && lastName) {
      formData["items"][0]["properties"][`${firstName.dataset.property}`] = firstName.value;
    }

    if (fullName?.value !== '' && fullName) {
      formData["items"][0]["properties"][`${fullName.dataset.property}`] = fullName.value;
    }

    if (liningFabric?.value !== '' && liningFabric) {
      formData["items"][0]["properties"][`${liningFabric.dataset.property}`] = liningFabric.value;
    }

    if (motif?.value !== '' && motif) {
      formData["items"][0]["properties"][`${motif.dataset.property}`] = motif.value;
    }

    if (innerFabric?.value !== '' && innerFabric) {
      formData["items"][0]["properties"][`${innerFabric.dataset.property}`] = innerFabric.value;
    }

    if (year?.value !== '' && month?.value !== '' && date?.value !== '' && year && month && date) {
      formData["items"][0]["properties"][`${year.dataset.property}`] = `${year.value}年${month.value}月${date.value}日`;
    }

    if (this.optionInputTargets.length > 0) {
      this.optionInputTargets.forEach(inputItem => {
        if (inputItem.value !== '') {
          const attribute = inputItem.dataset.name_property;

          formData["items"][0]["properties"][attribute] = inputItem.value;
        }
      });
    }

    if (this.optionDropdownTargets.length > 0) {
      this.optionDropdownTargets.forEach(dropdownItem => {
        if (dropdownItem.value !== '') {
          const attribute = dropdownItem.dataset.name_property;

          formData["items"][0]["properties"][attribute] = dropdownItem.value;
        }
      });
    }

    return formData;
  }

  callApiAddToCart(formData){
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data['status'] == 422) {
        if (document.querySelectorAll('.error-out-of-stock')) {
          document.querySelectorAll('.error-out-of-stock').forEach(item => {
            item.classList.remove('hidden');
          });
        }
        return;
      }

      const htmlCartBody = new DOMParser().parseFromString(data.sections['mini-cart-body'], 'text/html').querySelector('.cart-body');
      const htmlCartFooter = new DOMParser().parseFromString(data.sections['mini-cart-footer'], 'text/html').querySelector('.cart-footer');
      const infoCart = new DOMParser().parseFromString(data.sections['info-cart'], 'text/html').querySelector('.info-cart');

      if (!this.cartButtonTarget.classList.contains('cart-button--has-item')) {
        this.cartButtonTarget.classList.add('cart-button--has-item');
      }

      this.cartTarget.querySelector('.cart-body').innerHTML = htmlCartBody.innerHTML;
      this.cartTarget.querySelector('.cart-footer').innerHTML = htmlCartFooter.innerHTML;
      this.cartTarget.querySelector('.info-cart').innerHTML = infoCart.innerHTML;
      this.open();
      this.cartHeaderTarget.style.display = 'block';
    })
  }

  getInfoCart() {
    return fetch('/cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
  }

  validateForm(){
    const fieldName = document.querySelectorAll<HTMLInputElement>('.js-validateName');
    const regexName = /^[a-zA-Zぁ-んァ-ヶーｧ-ﾝﾞﾟ]+$/;
    let isValidName = true;

    if (fieldName) {
      fieldName.forEach(element => {
        if (!regexName.test(element.value) && element.value !== '') {
          isValidName = false;
          element.classList.add('border-red');
        } else {
          element.classList.remove('border-red');
        }
      });
    }

    return isValidName;
  }

  processDateTime(){
    const year = document.querySelector('.year') ? +document.querySelector<HTMLSelectElement>('.year').value : '';
    const month = document.querySelector('.month') ? +document.querySelector<HTMLSelectElement>('.month').value : '';
    const date = document.querySelector('.date') ? +document.querySelector<HTMLSelectElement>('.date').value : '';
    let invalidDOB = false;

    if (year != '' && month != '' && date != '') {
      if (month === 2 && date > 29) {
        invalidDOB = true;
        document.querySelector('.year').classList.add('border-red');
        document.querySelector('.month').classList.add('border-red');
        document.querySelector('.date').classList.add('border-red');
      } else if ((month === 4 || month === 6 || month === 9 || month === 11) && date > 30) {
        invalidDOB = true;
        document.querySelector('.year').classList.add('border-red');
        document.querySelector('.month').classList.add('border-red');
        document.querySelector('.date').classList.add('border-red');
      } else {
        document.querySelector('.year').classList.remove('border-red');
        document.querySelector('.month').classList.remove('border-red');
        document.querySelector('.date').classList.remove('border-red');
      }
    }

    return invalidDOB;
  }

  async showPopupLogin(e) {
    e.preventDefault();

    const hideGuestCheckout = e.currentTarget.dataset.hide_guest_checkout;

    await this.cartTarget.querySelector<HTMLButtonElement>('.cart__close-button button').click();
    if (hideGuestCheckout === 'false') {
      await this.beforeCheckoutTarget.classList.remove('hidden');
    }
    await this.captionLoginTarget.classList.remove('hidden');
    await document.querySelector<HTMLButtonElement>('.btn-login').click();
  }
}
