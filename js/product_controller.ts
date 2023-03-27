import { isPc, transitionDurationEnter, transitionDurationLeave } from '../utils'
import { Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'
import { subscribe } from 'subscribe-ui-event'
import { updateFavButtons } from '../account/favorites'
import { numberWithCommas } from "../helpers/currencyHelper";

export default class extends Controller {
  beginSpTarget: HTMLElement
  beginPcTarget: HTMLElement
  footerTarget: HTMLElement
  contentTarget: HTMLElement
  sizeSelectorTarget: HTMLDivElement
  colorSelectorTarget: HTMLDivElement
  specialSelectorTargets: HTMLDivElement[]
  hasSpecialSelectorTarget: boolean
  priceSelectorTargets: HTMLDivElement[]

  static targets = [
    'beginSp',
    'beginPc',
    'footer',
    'content',
    'sizeSelector',
    'colorSelector',
    'specialSelector',
    'priceSelector'
  ]

  connect(): void {
    subscribe(
      'scroll',
      () => {
        const beginY = isPc() ? this.beginPcTarget.offsetTop : this.beginSpTarget.offsetTop

        const inArea =
          window.scrollY + window.innerHeight >= beginY &&
          window.scrollY + window.innerHeight <=
          (this.element as HTMLElement).offsetTop + (this.element as HTMLElement).offsetHeight

        if (inArea && this.footerTarget.getAttribute('aria-hidden') === 'true') {
          this.footerTarget.setAttribute('aria-hidden', 'false')

          gsap.killTweensOf(this.footerTarget, { height: true })

          this.footerTarget.style.setProperty('display', 'block')

          gsap.to(this.footerTarget, {
            translateY: 0,
            duration: transitionDurationEnter,
            ease: Expo.easeOut,
          })
        } else if (!inArea && this.footerTarget.getAttribute('aria-hidden') === 'false') {
          this.footerTarget.setAttribute('aria-hidden', 'true')

          gsap.killTweensOf(this.footerTarget, { height: true })

          gsap.to(this.footerTarget, {
            translateY: '100%',
            duration: transitionDurationLeave,
            ease: Expo.easeOut,
            onComplete: () => {
              this.footerTarget.style.setProperty('display', 'none')
            },
          })
        }
      },
      {
        useRAF: true,
      }
    )
  }

  checkVariantAvailable(e) {
    let stringBtnATC = 'カートに入れる';
    let valueSelected = [];
    const staffAccount = document.querySelector<HTMLInputElement>('#customer').dataset.staff_account;
    const discountNumber = +document.querySelector<HTMLInputElement>('#customer').dataset.staff_discount;
    const arrayProduct: any = window.arrayProduct;
    const valueVariant: HTMLInputElement = e.currentTarget.value;
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

    document.querySelectorAll<HTMLInputElement>('.product .js-optionColor').forEach((element, index) => {
      if (element.checked) {
        sessionStorage.colorSelected = index;
      }
    });

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

    document.querySelector<HTMLElement>('.product-footer button').innerText = `${stringBtnATC}`;
    arrayVariant.forEach((element, index) => {
      const buttonATC: HTMLButtonElement = !variantSizeHidden ? document.querySelector(`.addtocart-pdp .button[data-size="${element['option1']}"]`) : document.querySelector('.addtocart-pdp button');
      const optionSize = element['option1'];
      const arrayQtyVariant = JSON.parse(e.target.dataset.qty_variant);
      const qtyVariant = arrayQtyVariant[`${optionSize}`];

      if (!variantSizeHidden && !variantColorHidden) {
        const price = staffAccount === 'true' ? Math.round((element['price']/100)*discountNumber) : element['price']/100;
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

      const favInput: HTMLInputElement = document.querySelector(`.favorite[data-index="${buttonATC.dataset.index}"]`);
      favInput.dataset.variant = element.id;
      favInput.dataset.product = arrayProduct.id;
      favInput.dataset.handle = arrayProduct.handle;
      favInput.dataset.price = staffAccount === 'true' ? Math.round(element['price']*0.65) : element.price;
      updateFavButtons('product');
    });
  }

}
