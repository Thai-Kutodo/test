import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  itemsCartTarget: HTMLDivElement
  infoCheckoutTarget: HTMLDivElement
  messageCardTargets: HTMLDivElement[]
  hasMessageCardTarget: boolean
  messageErrorTarget: HTMLDivElement
  messageErrorOrderTarget: HTMLDivElement
  messageErrorOutOfStockTarget: HTMLDivElement

  static targets = [
    'itemsCart',
    'infoCheckout',
    'messageCard',
    'messageError',
    'messageErrorOrder',
    'messageErrorOutOfStock'
  ]

  connect(): void {
    const isCartNull = (this.element as HTMLDivElement).dataset.cart_null;

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

    if (!localStorage.secondStep || localStorage.secondStep !== "done" || !localStorage.firstStep || localStorage.firstStep !== "done") {
      location.href = "/cart?view=contact_information";
      return;
    }

    this.showDeliveryDate();
    this.showDeliveryTime();
  }

  async createDraftOrder(e) {
    e.preventDefault();
    const urlAPI = window.API_URL['createDraftOrder'];
    const isLoggedIn = this.infoCheckoutTarget.dataset.logged_in;
    const infoAddress = isLoggedIn === 'true' ? JSON.parse(localStorage.addressLoggedIn) : JSON.parse(localStorage.addressNotLogIn);
    const priceShipping = this.infoCheckoutTarget.dataset.shipping_price;
    const qtyGiftWrap = this.infoCheckoutTarget.dataset.count_gift_wrap;
    const note = this.infoCheckoutTarget.dataset.note;
    const total = +this.infoCheckoutTarget.dataset.total;
    const subTotal = +this.infoCheckoutTarget.dataset.subtotal;
    const itemCart = JSON.parse(this.itemsCartTarget.dataset.items);
    const noteAttributes = await this.processNoteAttributes();
    const qtyShoppingBag = localStorage.qtyShoppingBag ? +localStorage.qtyShoppingBag : 0;
    const cart = await this.getInfoCart();

    let formData = {};

    if (isLoggedIn === 'true') {
      formData['customer_id'] = infoAddress.customerId;
    } else {
      formData['email'] = infoAddress.email;
    }

    formData['token'] = cart['token'];
    formData['line_items'] = itemCart;
    formData['gift_groups'] = +qtyGiftWrap;
    formData['shopping_bags'] = qtyShoppingBag;
    formData['note'] = note;
    formData['total'] = total;
    formData['subtotal'] = subTotal;
    formData['note_attributes'] = noteAttributes;

    formData['shipping_address'] = {
      "last_name": infoAddress["lastName"],
      "first_name": infoAddress["firstName"],
      "company": "",
      "country": "Japan",
      "country_code": "JP",
      "zip": infoAddress["zipCode"],
      "province": infoAddress["province"],
      "province_code": "",
      "city": infoAddress["city"],
      "address1": infoAddress["address1"],
      "address2": infoAddress["address2"],
      "phone": infoAddress["phone"]
    };

    formData['billing_address'] = {
      "last_name": infoAddress["lastName"],
      "first_name": infoAddress["firstName"],
      "company": "",
      "country": "Japan",
      "country_code": "JP",
      "zip": infoAddress["zipCode"],
      "province": infoAddress["province"],
      "province_code": "",
      "city": infoAddress["city"],
      "address1": infoAddress["address1"],
      "address2": infoAddress["address2"],
      "phone": infoAddress["phone"]
    };

    formData['shipping_line'] = {
      "price": priceShipping,
      "title": "通常配送"
    };

    if (typeof noteAttributes === 'boolean') {
      window.scrollTo({ top: document.querySelector<HTMLSpanElement>('.error-field').offsetTop - 160, behavior: 'smooth' });
      return;
    }

    document.querySelector('.checkout__footer .button--cta').classList.add('disabled');

    fetch(urlAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(async (data) => {
      if (data.invoice_url) {
        location.href = data.invoice_url;
      } else if (data.error === 'duplicated order') {
        this.messageErrorOrderTarget.click();
        document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
        console.log(data);
      } else if (data[0] && data[0].error_type === 'out_of_stock') {
        const elementShowNameProduct = (this.messageErrorOutOfStockTarget.nextElementSibling as HTMLTemplateElement).content.querySelector('.product-name');
        let productName = '';

        data.forEach(el => {
          const variantId = +el.variant_id;
          const getInfoItem = cart.items.find(item => item.variant_id === variantId);

          productName += `${getInfoItem.title},\n `
        });

        elementShowNameProduct.innerHTML = productName.substring(0, productName.length - 3);
        this.messageErrorOutOfStockTarget.click();
        document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
      } else {
        this.messageErrorTarget.click();
        document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
        console.error(data);
      }
    })
    .catch((error) => {
      this.messageErrorTarget.click();
      document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
      console.error(error);
    });
  }

  async processNoteAttributes() {
    const listSku = this.infoCheckoutTarget.dataset.list_sku;
    const keyAttributeSku = this.infoCheckoutTarget.dataset.key_attritbute;
    const regexValue = /^[^?*#¥_'%|""、，]+$/;
    const qtyGiftWrap = +this.infoCheckoutTarget.dataset.count_gift_wrap;
    const gwp = this.infoCheckoutTarget.dataset.gwp;

    let giftGroupChange = [];
    let deleteGiftGroup = [];
    let stopProcess = false;
    let isHasMessageCard = false;

    let noteAttributes = [{
      "name": "注文店舗",
      "value": "ONLINE SHOP (099990)"
    }];

    if (this.hasMessageCardTarget) {
      this.messageCardTargets.forEach(item => {
        if (item.classList.contains('active')){
          const indexGift = item.dataset.index;
          const typeMessage = item.querySelector<HTMLSelectElement>('.type-message').value;
          const contentMessage = item.querySelector<HTMLSelectElement>('.content-message');
          const nameMessage = item.querySelector<HTMLSelectElement>('.name-message');

          const messageLineText = contentMessage.value.split('\n');
          const isMessageNull = messageLineText.every(e => e.length === 0);
          const invalidMessageLine = isMessageNull ? false : messageLineText.some(e => e.length > 12);
          const verticalLineText = contentMessage.value.match(/\n/g) !== null && !isMessageNull ? contentMessage.value.match(/\n/g).length : 0;

          item.querySelector('.error-card-format').classList.add('hidden');
          item.querySelector('.error-invalid-message').classList.add('hidden');
          contentMessage.classList.remove('error-field');
          nameMessage.classList.remove('error-field');

          if (isMessageNull) {
            contentMessage.value = '';
          }

          if (!regexValue.test(contentMessage.value) && contentMessage.value.length > 0) {
            stopProcess = true;
            contentMessage.classList.add('error-field');
            item.querySelector('.error-card-format').classList.remove('hidden');
          }

          if (verticalLineText > 4 || invalidMessageLine) {
            stopProcess = true;
            contentMessage.classList.add('error-field');
            item.querySelector('.error-invalid-message').classList.remove('hidden');
          }

          if (!regexValue.test(nameMessage.value) && nameMessage.value.length > 0) {
            stopProcess = true;
            nameMessage.classList.add('error-field');
            item.querySelector('.error-card-format').classList.remove('hidden');
          }

          if (contentMessage.value !== '' || nameMessage.value !== '' || typeMessage !== '') {
            isHasMessageCard = true;
            giftGroupChange.push(indexGift);

            noteAttributes.push(
              {
                "name": `種類_${indexGift}`,
                "value": typeMessage
              },
              {
                "name": `メッセージ_${indexGift}`,
                "value": contentMessage.value
              },
              {
                "name": `送り主_${indexGift}`,
                "value": nameMessage.value
              }
            )
          }
        }
      });
    }

    if (stopProcess) return false;

    const currentGiftGroup = this.infoCheckoutTarget.dataset.number_packaging !== '' ? this.infoCheckoutTarget.dataset.number_packaging.split(',') : [];
    const packagePrev = localStorage.messageCard && qtyGiftWrap > 0 ? JSON.parse(localStorage.messageCard) : [];

    let giftGroupPrev = [];
    let noteAttr = []

    if (packagePrev.length > 0) {
      packagePrev.splice(0,1);

      packagePrev.forEach((item, index) => {
        if (item['name'].search('種類_') != -1) {
          giftGroupPrev.push(item['name'].split('_')[1]);
        }
      });

      giftGroupPrev.forEach(number => {
        const filterObjectPackaging = packagePrev.filter(item => {
          return item['name'] == `種類_${number}` || item['name'] == `メッセージ_${number}` || item['name'] == `送り主_${number}`;
        });

        noteAttr[`packaging_${number}`] = filterObjectPackaging;
      });
    }

    if (currentGiftGroup.length > 0 && giftGroupPrev.length > 0) {
      giftGroupPrev.forEach(number => {
        if (!currentGiftGroup.includes(number)) {
          deleteGiftGroup.push(number);
        }
      });
    }

    if (!isHasMessageCard && localStorage.messageCard && localStorage.messageCard != 'null') {
      if (qtyGiftWrap > 0) {
        noteAttributes = JSON.parse(localStorage.messageCard);
      }
    } else {
      localStorage.messageCard = JSON.stringify(noteAttributes);
    }

    if (deleteGiftGroup.length > 0) {
      let indexItem = [];

      deleteGiftGroup.forEach(number => {
        delete noteAttr[`packaging_${number}`];
      });

      if (!isHasMessageCard) {
        let newNoteAttr = [{
          "name": "注文店舗",
          "value": "ONLINE SHOP (099990)"
        }];

        for (const key in noteAttr) {
          noteAttr[key].forEach(item => {
            newNoteAttr.push(item);
          });
        }

        noteAttributes = await newNoteAttr;
      }
    }

    if (isHasMessageCard) {
      const currentPackaging = [...noteAttributes];

      currentPackaging.splice(0,1);

      giftGroupChange.forEach(number => {
        let arrayItem = [];

        currentPackaging.forEach(item => {
          if (item['name'] == `種類_${number}` || item['name'] == `メッセージ_${number}` || item['name'] == `送り主_${number}`) {
            arrayItem.push(item);
          }
        });

        noteAttr[`packaging_${number}`] = arrayItem;
      });

      let newNoteAttr = [{
        "name": "注文店舗",
        "value": "ONLINE SHOP (099990)"
      }];

      for (const key in noteAttr) {
        noteAttr[key].forEach(item => {
          newNoteAttr.push(item);
        });
      }

      noteAttributes = await newNoteAttr;
      localStorage.messageCard = await JSON.stringify(newNoteAttr);
    }

    if (sessionStorage.deliveryDate && sessionStorage.deliveryDate != 'null') {
      noteAttributes.push(
        {
          "name": "お届け希望日",
          "value": sessionStorage.deliveryDate.replaceAll('-','/')
        }
      )
    }

    if (sessionStorage.deliveryTime && sessionStorage.deliveryTime != 'null') {
      noteAttributes.push(
        {
          "name": "お届け希望時間",
          "value": sessionStorage.deliveryTime
        }
      )
    }

    if (listSku !== '' && keyAttributeSku !== '') {
      noteAttributes.push(
        {
          "name": keyAttributeSku,
          "value": listSku
        }
      )
    }

    if (gwp !== '') {
      noteAttributes.push(
        {
          "name": 'GWP_OFFER',
          "value": gwp
        }
      )
    }

    return noteAttributes;
  }

  showDeliveryDate() {
    const isHideDateTime = this.infoCheckoutTarget.dataset.hide_datetime;
    const isHideDate = this.infoCheckoutTarget.dataset.hide_date;

    if (!sessionStorage.deliveryDate || sessionStorage.deliveryDate == 'null') {
      if (isHideDateTime === "true") {
        sessionStorage.deliveryDate = '指定不可';
      } else {
        sessionStorage.deliveryDate = '指定なし';
      }

      setTimeout(() => {
        document.querySelector('.js-deliveryDate').innerHTML = sessionStorage.deliveryDate;
      }, 500);
    } else {
      if (isHideDateTime === "true") {
        sessionStorage.deliveryDate = '指定不可'
        document.querySelector('.js-deliveryDate').innerHTML = '指定不可';
      } else {
        if (isHideDate === "true" || !sessionStorage.deliveryDate.includes('-')) {
          sessionStorage.deliveryDate = '指定なし';
        }

        const deliveryDate = sessionStorage.deliveryDate.includes('-') ? `${sessionStorage.deliveryDate.split('-')[0]}年 ${sessionStorage.deliveryDate.split('-')[1]}月 ${sessionStorage.deliveryDate.split('-')[2]}日(${sessionStorage.deliveryDay})` : sessionStorage.deliveryDate;

        document.querySelector('.js-deliveryDate').innerHTML = deliveryDate;
      }
    }
  }

  showDeliveryTime() {
    const isHideDateTime = this.infoCheckoutTarget.dataset.hide_datetime;
    const isLargeFurniture = this.infoCheckoutTarget.dataset.large_furniture

    if (!sessionStorage.deliveryTime || sessionStorage.deliveryTime == 'null') {
      if (isHideDateTime === "true") {
        sessionStorage.deliveryTime = '指定不可';
      } else {
        sessionStorage.deliveryTime = '指定なし';
      }

      setTimeout(() => {
        document.querySelector('.js-deliveryTime').innerHTML = sessionStorage.deliveryTime;
      }, 500);
    } else {
      if (isHideDateTime === "true") {
        sessionStorage.deliveryTime = '指定不可';
        document.querySelector('.js-deliveryTime').innerHTML = '指定不可';
      } else {
        if (sessionStorage.deliveryTime == '指定不可') {
          sessionStorage.deliveryTime = '指定なし';
        }

        document.querySelector('.js-deliveryTime').innerHTML = sessionStorage.deliveryTime;
      }
    }
  }

  getInfoCart() {
    return fetch('/cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
  }
}
