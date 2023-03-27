import { Controller } from '@hotwired/stimulus'
import { debounce } from "debounce";
import { numberWithCommas } from "../helpers/currencyHelper";

export default class extends Controller {
  stepperTargets: HTMLUListElement[]
  shippingButtonTarget: HTMLInputElement
  hasShippingButtonTarget: boolean
  pickupButtonTarget: HTMLInputElement
  shippingContentTarget: HTMLDivElement
  hasShippingContentTarget: boolean
  pointTargets: HTMLElement[]
  withWrappingButtonTarget: HTMLInputElement
  // pickupContentTarget: HTMLDivElement
  withoutWrappingButtonTarget: HTMLInputElement
  // hasPickupContentTarget: boolean
  hasStepperTarget: boolean
  WrappingButtonTargets: HTMLInputElement[]
  itemOrderTargets: HTMLElement[]
  incrementTarget: HTMLButtonElement
  decrementTarget: HTMLButtonElement
  valueTarget: HTMLInputElement
  hasValueTarget: boolean
  shoppingBagTarget: HTMLSpanElement
  hasShoppingBagTarget: boolean
  contactInformationTarget: HTMLDivElement

  static targets = [
    'shippingButton',
    'pickupButton',
    'shippingContent',
    // 'pickupContent',
    'point',
    'withoutWrappingButton',
    'withWrappingButton',
    'stepper',
    'wrappingButton',
    'itemOrder',
    'decrement',
    'increment',
    'value',
    'shoppingBag',
    'contactInformation'
  ]

  initialize(): void {
    history.scrollRestoration = 'manual';

    if (document.querySelector('.js-customerId')) {
      localStorage.removeItem("addressNotLogIn");
    }

    if (localStorage.qtyShoppingBag && document.querySelector('.counter__value')) {
      document.querySelector<HTMLInputElement>('.counter__value').value = localStorage.qtyShoppingBag;
      this.decrementTarget.classList.remove('disabled');
    }

    if (localStorage.addressNotLogIn && this.hasShippingContentTarget) {
      this.renderInfoAddress();
    }

    this.updateUIGiftWrapping();
    this.checkButtonStatus();
    this.updateQtyShoppingBag();
    this.showQtyShoppingBag();
  }

  toggleShipping(e) {
    const methodShipping = e.currentTarget.value;
    const shippingFee = +e.currentTarget.dataset.shipping_fee;
    const totalPrice = +e.currentTarget.dataset.total_price;
    const totalTax = +e.currentTarget.dataset.total_tax;

    this.updateUI(methodShipping, shippingFee, totalPrice, totalTax);
    this.updateStepper(methodShipping);
  }

  updateUI(methodShipping, shippingFee, totalPrice, totalTax) {
    const packaging = this.shippingContentTarget.querySelector<HTMLInputElement>('input[name="wrapping"]:checked').value;
    const isSupportShipping = this.contactInformationTarget.dataset.support_shipping;
    let linkNextStep = '';

    if (this.hasShippingButtonTarget) {
      if (methodShipping === 'shipping') {
        this.shippingButtonTarget.checked = true
        this.shippingContentTarget.style.display = 'flex'
        // this.pickupContentTarget.style.display = 'none'
        this.pointTargets.forEach((target) => {
          target.style.display = 'inherit'
        })
      } else {
        this.pickupButtonTarget.checked = true
        this.shippingContentTarget.style.display = 'none'
        // this.pickupContentTarget.style.display = 'flex'
        this.pointTargets.forEach((target) => {
          target.style.display = 'none'
        })
      }
    }

    if (methodShipping === 'pickup') {
      linkNextStep = `/cart?view=pickup`;
      document.querySelector('.shipping-fee').innerHTML = '￥0 <span class="checkout-price__tax-in">税込</span>';
      document.querySelector('.checkout__footer a').classList.remove('disabled');

      if (shippingFee !== 0) {
        document.querySelectorAll('.checkout-price').forEach(item => {
          item.innerHTML = `￥${numberWithCommas(totalPrice)} <span class="checkout-price__tax-in">税込</span>`;
        });

        document.querySelector('.detail-list__price').innerHTML = `￥${numberWithCommas(totalPrice)}`;

        if (shippingFee == 770) {
          document.querySelector('.total-tax').innerHTML = `(￥${numberWithCommas(totalTax)})`;
        }
      }
    } else {
      linkNextStep = `/cart?view=delivery_date&method=shipping&packaging=${packaging}`;
      document.querySelector('.shipping-fee').innerHTML = `￥${numberWithCommas(shippingFee)} <span class="checkout-price__tax-in">税込</span>`;

      if (isSupportShipping === 'false') {
        document.querySelector('.checkout__footer a').classList.add('disabled');
      }

      if (shippingFee !== 0) {
        document.querySelectorAll('.checkout-price').forEach(item => {
          item.innerHTML = `￥${numberWithCommas(totalPrice + shippingFee)} <span class="checkout-price__tax-in">税込</span>`;
        });

        document.querySelector('.detail-list__price').innerHTML = `￥${numberWithCommas(totalPrice + shippingFee)}`;

        if (shippingFee == 770) {
          document.querySelector('.total-tax').innerHTML = `(￥${numberWithCommas(totalTax + 70)})`;
        }
      }
    }

    document.querySelector('.checkout__footer a').setAttribute('href', linkNextStep);
  }

  updateStepper(methodShipping) {
    document.querySelectorAll('.stepper').forEach(item => {
      item.classList.add('hidden');
    });

    this.stepperTargets.forEach(stepper => {
      if (methodShipping === 'pickup') {
        stepper.querySelector('.step-pickup').classList.remove('hidden')
      } else {
        stepper.querySelector('.step-shipping').classList.remove('hidden')
      }
    });
  }

  toggleGiftWrapping(e) {
    const packaging = e.currentTarget.value;
    const linkNextStep = `/cart?view=delivery_date&method=shipping&packaging=${packaging}`;

    document.querySelector('.checkout__footer a').setAttribute('href', linkNextStep);
  }

  renderInfoAddress() {
    const infoAddress = JSON.parse(localStorage.addressNotLogIn);
    const form = this.shippingContentTarget.querySelector('.input-form');

    form.querySelector<HTMLInputElement>('input[name="family-name"]').value = infoAddress.lastName;
    form.querySelector<HTMLInputElement>('input[name="given-name"]').value = infoAddress.firstName;
    form.querySelector<HTMLInputElement>('input[name="family-name-kana"]').value = infoAddress.lastNameFurigana;
    form.querySelector<HTMLInputElement>('input[name="given-name-kana"]').value = infoAddress.firstNameFurigana;
    form.querySelector<HTMLInputElement>('input[name="postal-code"]').value = infoAddress.zipCode;
    form.querySelector<HTMLSelectElement>('select[name="prefecture"]').value = infoAddress.province;
    form.querySelector<HTMLInputElement>('input[name="address-line1"]').value = infoAddress.city;
    form.querySelector<HTMLInputElement>('input[name="address-line2"]').value = infoAddress.address1;
    form.querySelector<HTMLInputElement>('input[name="building"]').value = infoAddress.address2;
    form.querySelector<HTMLInputElement>('input[name="tel"]').value = infoAddress.phone;
    form.querySelector<HTMLInputElement>('input[name="email"]').value = infoAddress.email;
  }

  updateUIGiftWrapping() {
    if (location.search.indexOf('gift') == -1) return;

    this.showBannerGift();
    this.showDropdownChoosePackaging();
  }

  showBannerGift() {
    const isPackagingGift = location.search.split('&')[2];

    if (isPackagingGift.includes('gift')) {
      document.querySelector('.banner-gift-wrapping').classList.remove('hidden');
    }
  }

  showDropdownChoosePackaging() {
    document.querySelectorAll('.select-type-packaging').forEach(element => {
      element.classList.remove('hidden');
    });

    document.querySelectorAll('.checkout-order-item-list > .order-item').forEach(element => {
      element.classList.add('checkout-order-item-list__item--gift-wrapping');
    });

    document.querySelector('.change-to-gift-wrapping').classList.add('hidden');
  }

  addGiftWrapping(e) {
    const parent = e.currentTarget.closest('.order-item');
    const lineItem = e.currentTarget.getAttribute('data-line_item');
    const valueSelect = e.currentTarget.value;
    const qty = e.currentTarget.dataset.qty;
    let propertiesProduct = parent.dataset.properties != '' ? JSON.parse(parent.dataset.properties) : {}

    document.querySelector('.next-step').classList.add('disabled');

    propertiesProduct['梱包区分'] = valueSelect;

    const formData = {
      'line': lineItem,
      'quantity': qty,
      'properties': propertiesProduct
    }

    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      setTimeout(() => {
        document.querySelector('.next-step').classList.remove('disabled');
      }, 200);
    });

    this.updateQtyShoppingBag();
  }

  updateQtyShoppingBag() {
    if (!this.hasValueTarget) return;

    const arrayGiftNumber = [];
    const qtyShoppingBag = +this.valueTarget.value;

    this.itemOrderTargets.forEach(item => {
      const selectTag = item.querySelector('select');

      if (!selectTag) return;

      if (+selectTag.value !== 0 && !arrayGiftNumber.includes(selectTag.value)) {
        arrayGiftNumber.push(selectTag.value);
      }
    });

    const maximumShoppingBag = arrayGiftNumber.length > 0 ? arrayGiftNumber.length + 1 : 1;

    if (maximumShoppingBag == 0) return;

    this.valueTarget.setAttribute('max', `${maximumShoppingBag == 0 ? '1' : maximumShoppingBag}`);

    if (qtyShoppingBag > maximumShoppingBag) {
      this.valueTarget.value = `${maximumShoppingBag}`;
      this.incrementTarget.classList.add('disabled');
    } else if (qtyShoppingBag > 0 && qtyShoppingBag < maximumShoppingBag){
      this.incrementTarget.classList.remove('disabled');
      this.decrementTarget.classList.remove('disabled');
    } else if(qtyShoppingBag < maximumShoppingBag) {
      this.incrementTarget.classList.remove('disabled');
    } else if(qtyShoppingBag == maximumShoppingBag) {
      this.incrementTarget.classList.add('disabled');
    }
  }

  showQtyShoppingBag() {
    if (!this.hasShoppingBagTarget) return;
    const qtyShoppingBag = localStorage.qtyShoppingBag ? localStorage.qtyShoppingBag : 0;

    this.shoppingBagTarget.innerHTML = `${qtyShoppingBag}枚`;
  }

  decrementItem(e) {
    this.valueTarget.stepDown();
    this.checkButtonStatus();
  }

  incrementItem(e) {
    this.valueTarget.stepUp();
    this.checkButtonStatus();
  }

  checkButtonStatus() {
    if (!this.hasValueTarget) return;

    if (this.valueTarget.value === this.valueTarget.min) this.decrementTarget.classList.add('disabled')
    else this.decrementTarget.classList.remove('disabled')

    if (this.valueTarget.value === this.valueTarget.max) this.incrementTarget.classList.add('disabled')
    else this.incrementTarget.classList.remove('disabled')
  }
}
