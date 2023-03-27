import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  deliveryDateTarget: HTMLDivElement

  static targets = [
    'deliveryDate'
  ]

  connect(): void {
    const isCartNull = (this.element as HTMLDivElement).dataset.cart_null;
    const isLargeFurniture = document.querySelector('.js-extraDay') ? document.querySelector<HTMLDivElement>('.js-extraDay').dataset.extra_day : 'false';

    if (isCartNull == "true") {
      localStorage.removeItem("firstStep");
      localStorage.removeItem("secondStep");
      sessionStorage.removeItem("deliveryDate");
      sessionStorage.removeItem("deliveryTime");
      localStorage.removeItem("addressLoggedIn");
      localStorage.removeItem("addressNotLogIn");
      localStorage.removeItem("storeLocator");
      localStorage.removeItem("qtyShoppingBag");
      localStorage.removeItem("messageCard");
      location.href = "/cart";
      return;
    }

    if (!localStorage.firstStep || localStorage.firstStep !== "done") {
      location.href = "/cart?view=contact_information";
      return
    }

    if (sessionStorage.deliveryTime && sessionStorage.deliveryTime != "null") {
      const shippingSchedule = document.querySelector<HTMLSelectElement>('.checkout-date select[name="shipping-schedule"]');

      shippingSchedule.value = sessionStorage.deliveryTime;

      //Set default first option if the value on localStorage didn't exist in option
      if (shippingSchedule.value === '') {
        sessionStorage.deliveryTime = "指定なし";
        shippingSchedule.value = "指定なし";
      }
    }
  }

  async changeDeliveryTime(e) {
    sessionStorage.deliveryTime = await e.currentTarget.value;

    document.querySelector('.checkout__footer .next-step').classList.add('disabled');

    setTimeout(() => {
      document.querySelector('.checkout__footer .next-step').classList.remove('disabled');
    }, 500);
  }

  async addNote(e) {
    e.preventDefault();

    const note = document.querySelector<HTMLTextAreaElement>('.note-customer');
    const regexNote = /^[^?*#¥_'%|""、，]+$/;
    const regNull = /[^\s]|^[^]$/;

    document.querySelector('.error-note-format').classList.add('hidden');
    note.classList.remove('error-field');
    localStorage.secondStep = "done";
    localStorage.qtyShoppingBag = await document.querySelector<HTMLInputElement>('.counter__value').value;

    if (!regNull.test(note.value)){
      location.href = '/cart?view=confirm';
      return;
    } else {
      if (!regexNote.test(note.value)) {
        document.querySelector('.error-note-format').classList.remove('hidden');
        note.classList.add('error-field');
        return;
      }
    }

    const formData = {
      note: note.value
    }

    fetch('/cart/update.js', {
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
      location.href = '/cart?view=confirm';
    });
  }
}
