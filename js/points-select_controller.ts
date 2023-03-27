import { Controller } from '@hotwired/stimulus'
import CartApiService from '../services/cartApiService';
import { numberWithCommas } from "../helpers/currencyHelper.js";

const BUTTON_SELECTOR = ".button--cta" as string;
const SELECTED_POINT_LS_KEY = "selectedPoints" as string;
export default class extends Controller {
  pointsTarget: HTMLInputElement;
  radioTargets: HTMLInputElement[];
  hmac: string;
  customerId: string;
  cartService: CartApiService;
  static targets = ['points', "radio"]
  connect() {
    const containerData = (this.element as HTMLElement).dataset;
    this.cartService = new CartApiService(containerData.customer, containerData.hash, containerData.checkout );

    document.addEventListener("page:change",()=>{
        const usedPointsContainer = document.querySelector(".total-line--reduction [data-checkout-applied-gift-card-amount-target]");
        let usedPoints = usedPointsContainer?usedPointsContainer.innerHTML.replace(/[^0-9]/g,""):"0";
        const originPoint = Math.round(+usedPoints/1.1)+"";
        const taxPoints = (+usedPoints) - (+originPoint);

        if(this.points===originPoint) {
            document.querySelectorAll(".js-points-value").forEach(c=>c.innerHTML = numberWithCommas(originPoint));
            try {
                const paymentDue = document.querySelector(".total-line__price.payment-due [data-checkout-payment-due-target]").innerHTML.replace(/[^0-9,￥円]/g,"") || "0";
                const lineItemPrice = document.querySelector(".total-line--subtotal [data-checkout-subtotal-price-target]").innerHTML.replace(/[^0-9]/g,"");
                const taxPrice = document.querySelector(".total-line-table__footer [data-checkout-taxes]") ? +document.querySelector(".total-line-table__footer [data-checkout-taxes] span").innerHTML.replace(/[^0-9]/g,"") : 0;
                const shoppingBagPrice = document.querySelector('.shopping-bag-price') ? document.querySelector('.shopping-bag-price').innerHTML.replace(/[^0-9]/g,"") : 0;
                const giftWrappingPrice = document.querySelector('.gift-wrapping-price') ? document.querySelector('.gift-wrapping-price').innerHTML.replace(/[^0-9]/g,"") : 0;
                const subTotalPrice = (+lineItemPrice) - (+usedPoints) - (+shoppingBagPrice) - (+giftWrappingPrice);

                document.querySelectorAll(".js-payment-due").forEach(c=>c.innerHTML = paymentDue);
                document.querySelectorAll(".js-payment-subtotal").forEach(c=>c.innerHTML = `￥${numberWithCommas(subTotalPrice)}`);

                if (taxPrice != 0) {
                  document.querySelectorAll(".js-taxOrder").forEach(c=>c.innerHTML = `￥${numberWithCommas(taxPrice - taxPoints)}`);
                }

            } catch(e) {
            }
            document.querySelector(BUTTON_SELECTOR).classList.remove("disabled");
            this.enableInputs();
        }
        })
    this.initLsPoints();
    }
  async initLsPoints() {
      const lsPoints = localStorage.getItem(SELECTED_POINT_LS_KEY);
      if (lsPoints && +lsPoints > 0) {
         if(this.pointsTarget.querySelector(`[value="${lsPoints}"]`) ) {
             console.log(`${this.points} !== ${lsPoints}`)
             if (this.points !== lsPoints) {

                const yesRadio = this.radioTargets.find(r=>r.value=="yes");
                if (yesRadio) {
                    this.radioTargets[1].click();
                    this.points = lsPoints;
                    await this.changePoints();
                }
             }
             else {
                 // Points are already applied
             }
         }
         else {
             localStorage.removeItem(SELECTED_POINT_LS_KEY);
                // Previously selected quantity is not available
         }

      }
  }

  async changePoints() {
        document.querySelector(BUTTON_SELECTOR).classList.add("disabled");
        this.disableInputs();
        let cancelCouponButton = document.querySelector(".order-summary__section--discount .tags-list form button") as any;
        if (cancelCouponButton) {
            cancelCouponButton.click();
        }
        if (+this.points > 0) {
            let giftCard = {} as any;
            try {
                giftCard = await this.cartService.createGiftCard(+this.points) as any;
            } catch (e) {
                alert("システムエラーが発生しました。時間をおいて再度試してください。");
                (window as any).location = "/cart?view=confirm";
            }

            if (giftCard.id) {
                const codeInput = document.querySelector(".order-summary__section--discount #checkout_reduction_code") as any;
                const codeButton = document.querySelector(".order-summary__section--discount #checkout_submit") as any;
                codeInput.value = giftCard.code;
                codeButton.disabled = false;
                codeButton.click();
            }
        }
        localStorage.setItem(SELECTED_POINT_LS_KEY, this.points);
  }

   selectRadio(el) {
        const value = el.target.value;
        if (value=="no" && this.points!=="0") {
            this.disableInputs();
            document.querySelector(BUTTON_SELECTOR).classList.add("disabled");
            this.points = "0";
            this.cancelPoints();

        }
  }

  disableInputs () {
      this.pointsTarget.setAttribute("disabled", "disabled");
      this.radioTargets.forEach(rt=>rt.setAttribute("disabled", "disabled"));
       document.querySelector(".loader-container").classList.add("loader-container--display");
  }


   enableInputs () {
      this.pointsTarget.removeAttribute("disabled");
      this.radioTargets.forEach(rt=>rt.removeAttribute("disabled"));
      document.querySelector(".loader-container").classList.remove("loader-container--display");
  }

  cancelPoints() {
      let cancelCouponButton = document.querySelector(".order-summary__section--discount .tags-list form button") as any;
      if (cancelCouponButton) {
          cancelCouponButton.click();
      }
  }

  get points() {
    return this.pointsTarget.value;
  }

  set points(value) {
      this.pointsTarget.value = value;
  }

}
