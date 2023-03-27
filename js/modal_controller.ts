import { Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'
import { numberWithCommas } from "../helpers/currencyHelper";

export default class extends Controller {
  sizeSelectorTarget: HTMLDivElement
  colorSelectorTarget: HTMLDivElement
  specialSelectorTargets: HTMLDivElement[]
  hasSpecialSelectorTarget: boolean
  priceSelectorTargets: HTMLDivElement[]

  static targets = ['sizeSelector', 'colorSelector', 'specialSelector', 'priceSelector']

  connect(): void {
    // TODO: dispatch
    setTimeout(() => {
      if (this.element instanceof HTMLElement) {
        this.element.classList.add('show');
      }
    })
  }

  close(ev) {
    this.element.classList.remove('show');
    this.element.addEventListener('transitionend', (ev) => {
      if (ev.target === this.element) this.element.remove()
    })

    if (!ev.params.retainBackdrop) {
      document.body.classList.remove('is-presenting-modal')
    }
  }

  closeModalPDP(ev) {
    this.element.classList.remove('show');
    this.element.addEventListener('transitionend', (ev) => {
      if (ev.target === this.element) this.element.remove()
    })

    if (!ev.params.retainBackdrop) {
      document.body.classList.remove('is-presenting-modal')
    }

    if (document.querySelector('.product .js-optionColor')) {
      const index = sessionStorage.colorSelected ? sessionStorage.colorSelected : 0;
      document.querySelectorAll<HTMLInputElement>('.product .js-optionColor')[index].checked = true;
    }
  }

  checkVariantAvailable(e){
    let stringBtnATC = 'カートに入れる';
    let valueSelected = [];
    const staffAccount = document.querySelector<HTMLInputElement>('#customer').dataset.staff_account;
    const arrayProduct = window.arrayProduct;
    const valueVariant = e.currentTarget.value;
    const productType = arrayProduct['type'];
    const salesStartDate = new Date(document.querySelector<HTMLElement>('.js-time-sale').dataset.start_time);
    const salesEndDate = new Date(document.querySelector<HTMLElement>('.js-time-sale').dataset.end_time);
    const currentDate = new Date();
    const variantSizeHidden = this.sizeSelectorTarget.classList.contains('hidden');
    const variantColorHidden = this.colorSelectorTarget.classList.contains('hidden');
    const specialSelector = this.hasSpecialSelectorTarget;

    if (variantSizeHidden && variantColorHidden && specialSelector) {
      this.specialSelectorTargets.forEach(selector => {
        if (selector.querySelector('input:checked')) {
          valueSelected.push(selector.querySelector<HTMLInputElement>('input:checked').value);
        }
      });
    }

    const arrayVariant = arrayProduct['variants'].filter(item => {
      if (variantSizeHidden && variantColorHidden && specialSelector) {
        return(
          item['option1'] == valueSelected[0]
          && item['option2'] == (valueSelected[1] || null)
          && item['option3'] == (valueSelected[2] || null)
        )
      } else if(variantSizeHidden) {
        return item['option1'] == valueVariant; //without variant size
      } else {
        return item['option2'] == valueVariant; //have variant size and color
      }
    });

    if (productType === '予約品') {
      if ((currentDate > salesStartDate && currentDate < salesEndDate) || document.querySelector<HTMLElement>('.js-time-sale').dataset.start_time == '') {
        stringBtnATC = '予約注文';
      }
    }

    arrayVariant.forEach((element, index) => {
      const buttonATC: HTMLButtonElement = !variantSizeHidden ? document.querySelector(`.button-atc-modal .button[data-size="${element['option1']}"]`) : document.querySelector('.button-atc-modal button');
      const optionSize = element['option1'];
      const arrayQtyVariant = JSON.parse(e.target.dataset.qty_variant);
      const qtyVariant = arrayQtyVariant[`${optionSize}`];

      if (!variantSizeHidden && !variantColorHidden) {
        const price = staffAccount === 'true' ? Math.round((element['price']/100)*0.65) : element['price']/100;
        const optionSizePDP = this.priceSelectorTargets[index].dataset.size;

        this.priceSelectorTargets.forEach(option => {
          if (optionSize == option.dataset.size) {
            option.innerHTML = `￥${numberWithCommas(price)} <span class="product-size-selector__tax-in">税込</span>`;
          }
        });
      }

      if (!element['available']) {
        buttonATC.classList.remove("button--cta", "button--has-icon-cart");
        buttonATC.setAttribute('disabled', '');
        buttonATC.innerHTML = 'SOLD OUT';
      } else {
        buttonATC.classList.add("button--cta", "button--has-icon-cart");
        buttonATC.removeAttribute('disabled');
        buttonATC.innerHTML = qtyVariant < 10 ? `<label>${stringBtnATC}<br><span>在庫わずか</span></label>` : `<label>${stringBtnATC}</label>`;
      }
    });
  }
}
