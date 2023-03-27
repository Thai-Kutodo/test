import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  confirmDeleteTarget: HTMLButtonElement
  contentShippingTarget: HTMLDivElement
  formTarget: HTMLDivElement
  messageErrorTarget: HTMLDivElement
  hasMessageErrorTarget: boolean
  itemZipcodeTarget: HTMLDivElement
  hasItemZipcodeTarget: boolean
  shippingContentTarget: HTMLDivElement

  static targets = [
    'confirmDelete',
    'contentShipping',
    'form',
    'messageError',
    'itemZipcode',
    'shippingContent'
  ]

  connect(): void {
    const inputRadioDefault = document.querySelector('input[value="address_default"]');
    const isCartNull = (this.element as HTMLDivElement).dataset.cart_null;
    const isProductTypeDifferent = (this.element as HTMLDivElement).dataset.product_type_different;

    if (isProductTypeDifferent === "true") {
      this.element.querySelector('.checkout__footer a.button').classList.add('disabled');
      if (document.querySelector('.js-alert-message')) {
        document.querySelector('.js-alert-message').classList.add('show');
        document.body.classList.add('is-presenting-alert');
      }
      return;
    }

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

    if (inputRadioDefault) {
      // localStorage.removeItem("addressLoggedIn");
      this.getInfoAddress(inputRadioDefault);
    }
  }

  getInfoAddress(e) {
    let address = {};
    const inputRadio = e.currentTarget ? e.currentTarget : e;

    address['customerId'] = inputRadio.dataset.customer_id
    address['firstName'] = inputRadio.dataset.first_name;
    address['lastName'] = inputRadio.dataset.last_name;
    address['zipCode'] = inputRadio.dataset.zip;
    address['province'] = inputRadio.dataset.province;
    address['provinceCode'] = inputRadio.dataset.province_code;
    address['city'] = inputRadio.dataset.city;
    address['address1'] = inputRadio.dataset.address1;
    address['address2'] = inputRadio.dataset.address2;
    address['phone'] = inputRadio.dataset.phone;

    localStorage.addressLoggedIn = JSON.stringify(address);
  }

  passParamToBtn(e) {
    if (e.currentTarget.classList.contains('is-delete')) {
      document.querySelector('.confirm-delete').setAttribute('data-address_id', e.currentTarget.dataset.address_id);
    }

    if (e.currentTarget.classList.contains('is-update')) {
      document.querySelector('.confirm-update').setAttribute('data-address_id', e.currentTarget.dataset.address_id);
    }
  }

  deleteAddress(e) {
    const urlAPI = window.API_URL['deleteAddress'];
    const customerId = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.customer_id : 111111;
    const hmac = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.hash : 111111;
    const formData = {
      "customer_id": customerId,
      "address_id": e.currentTarget.dataset.address_id
    }
    const buttonConfirm = e.currentTarget;

    buttonConfirm.classList.add('disabled');

    fetch(`${urlAPI}?hmac=${hmac}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      buttonConfirm.closest('.content-popup').querySelector('.popup-success').click();
      buttonConfirm.classList.remove('disabled');
    })
    .catch((error) => {
      buttonConfirm.classList.remove('disabled');
    });
  }

  async updateAddress(e) {
    let infoAddress = {};
    const buttonConfirm = e.currentTarget;
    const urlAPI = window.API_URL['updateAddress'];
    const hmac = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.hash : 111111;
    const form = e.currentTarget.closest('.mypage');
    const customerId = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.customer_id : 111111;

    this.messageErrorTarget.querySelectorAll('div').forEach((item) => {
      item.classList.add('hidden');
    });

    const isFieldsNull = await this.hasMessageErrorTarget ? this.checkFormNull() : false;
    const validKatakanaName = this.hasMessageErrorTarget ? this.checkKatakanaName(isFieldsNull) : true;
    const validName = this.hasMessageErrorTarget ? this.checkName(isFieldsNull) : true;
    const validAddress = this.hasMessageErrorTarget ? this.checkAddress(isFieldsNull) : true;
    const validZipCode = this.hasMessageErrorTarget ? await this.checkZipCode() : true;
    const validPrefecture = this.hasMessageErrorTarget ? await this.checkPrefecture() : true;
    const validPhoneNumber = this.hasMessageErrorTarget ? this.checkPhoneNumber(isFieldsNull) : true;

    if (isFieldsNull || !validKatakanaName || !validName || !validAddress || !validZipCode || !validPhoneNumber || !validPrefecture) return;

    buttonConfirm.classList.add('disabled');
    infoAddress['customer_id'] = customerId;
    infoAddress['id'] = buttonConfirm.dataset.address_id;

    infoAddress['address'] = {
      "first_name": form.querySelector('input[name="given-name"]').value,
      "last_name": form.querySelector('input[name="family-name"]').value,
      "zip": form.querySelector('input[name="postal-code"]').value,
      "province": form.querySelector('select[name="prefecture"]').value,
      "city": form.querySelector('input[name="address-line1"]').value,
      "address1": form.querySelector('input[name="address-line2"]').value,
      "address2": form.querySelector('input[name="building"]').value,
      "phone": form.querySelector('input[name="tel"]').value,
      "default": false
    }

    infoAddress['kana'] = {
      "kana_first_name": form.querySelector('input[name="given-name-kana"]').value,
      "kana_last_name": form.querySelector('input[name="family-name-kana"]').value
    }

    this.callAPIAddress(`${urlAPI}?hmac=${hmac}`, infoAddress, buttonConfirm, 'PUT');
  }

  async addNewAddress(e) {
    let infoAddress = {};
    const buttonConfirm = e.currentTarget;
    const urlAPI = window.API_URL['createAddress'];
    const form = e.currentTarget.closest('.mypage');
    const customerId = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.customer_id : 111111;
    const hmac = document.querySelector('.js-customerId') ? document.querySelector<HTMLDivElement>('.js-customerId').dataset.hash : 111111;

    this.messageErrorTarget.querySelectorAll('div').forEach((item) => {
      item.classList.add('hidden');
    });

    const isFieldsNull = await this.hasMessageErrorTarget ? this.checkFormNull() : false;
    const validKatakanaName = this.hasMessageErrorTarget ? this.checkKatakanaName(isFieldsNull) : true;
    const validName = this.hasMessageErrorTarget ? this.checkName(isFieldsNull) : true;
    const validAddress = this.hasMessageErrorTarget ? this.checkAddress(isFieldsNull) : true;
    const validZipCode = this.hasMessageErrorTarget ? await this.checkZipCode() : true;
    const validPrefecture = this.hasMessageErrorTarget ? await this.checkPrefecture() : true;
    const validPhoneNumber = this.hasMessageErrorTarget ? this.checkPhoneNumber(isFieldsNull) : true;

    if (isFieldsNull || !validKatakanaName || !validName || !validAddress || !validZipCode || !validPhoneNumber || !validPrefecture) return;

    buttonConfirm.classList.add('disabled');

    infoAddress['customer_id'] = customerId;
    infoAddress['last_name'] = form.querySelector('input[name="family-name"]').value;
    infoAddress['first_name'] = form.querySelector('input[name="given-name"]').value;
    infoAddress['name'] = form.querySelector('input[name="given-name"]').value +' '+ form.querySelector('input[name="family-name"]').value;
    infoAddress['kana_last_name'] = form.querySelector('input[name="family-name-kana"]').value;
    infoAddress['kana_first_name'] = form.querySelector('input[name="given-name-kana"]').value;
    infoAddress['zip'] = form.querySelector('input[name="postal-code"]').value;
    infoAddress['country'] = 'Japan';
    infoAddress['country_code'] = 'JA';
    infoAddress['province'] = form.querySelector('select[name="prefecture"]').value;
    infoAddress['city'] = form.querySelector('input[name="address-line1"]').value;
    infoAddress['address1'] = form.querySelector('input[name="address-line2"]').value;
    infoAddress['address2'] = form.querySelector('input[name="building"]').value;
    infoAddress['phone'] = form.querySelector('input[name="tel"]').value;
    infoAddress['default'] = false;

    this.callAPIAddress(`${urlAPI}?hmac=${hmac}`, infoAddress, buttonConfirm);
  }

  callAPIAddress(urlAPI, formData, buttonConfirm, type='POST') {
    fetch(urlAPI, {
      method: type,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      buttonConfirm.closest('.mypage__footer').querySelector('.popup-success').click();
      buttonConfirm.classList.remove('disabled');
    })
    .catch((error) => {
      buttonConfirm.classList.remove('disabled');
    });
  }

  supportShipping(e) {
    const province = e.currentTarget.dataset.province || e.currentTarget.value;
    const zipCode = +(e.currentTarget.dataset.zip?.replace('-','')) || +(e.currentTarget.parentElement.querySelector('input[name="postal-code"]')?.value);
    const shipping = this.contentShippingTarget;
    const itemZipcode = this.hasItemZipcodeTarget ? JSON.parse(this.itemZipcodeTarget.dataset.zipcode) : '';

    if (this.hasItemZipcodeTarget && zipCode) {
      if (province === "沖縄県" || (itemZipcode !== '' && itemZipcode.includes(zipCode))) {
        shipping.querySelector('.list-shipping').classList.add('hidden');
        document.querySelector('.checkout__footer .button--cta').classList.add('disabled');
        shipping.querySelector('.not-support-shipping').classList.remove('hidden');
        this.element.setAttribute('data-support_shipping', 'false');
      } else {
        shipping.querySelector('.list-shipping').classList.remove('hidden');
        document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
        shipping.querySelector('.not-support-shipping').classList.add('hidden');
        this.element.setAttribute('data-support_shipping', 'true');
      }
    }
  }

  async saveInfoNewAddress(e) {
    e.preventDefault();

    const linkNextStep = e.currentTarget.href;
    const form = this.shippingContentTarget.querySelector('.input-form');
    const lastName = form.querySelector<HTMLInputElement>('input[name="family-name"]').value;
    const firstName = form.querySelector<HTMLInputElement>('input[name="given-name"]').value;
    const lastNameFurigana = form.querySelector<HTMLInputElement>('input[name="family-name-kana"]').value;
    const firstNameFurigana = form.querySelector<HTMLInputElement>('input[name="given-name-kana"]').value;
    const zipCode = form.querySelector<HTMLInputElement>('input[name="postal-code"]').value;
    const province = form.querySelector<HTMLSelectElement>('select[name="prefecture"]').value;
    const city = form.querySelector<HTMLInputElement>('input[name="address-line1"]').value;
    const address1 = form.querySelector<HTMLInputElement>('input[name="address-line2"]').value;
    const address2 = form.querySelector<HTMLInputElement>('input[name="building"]').value;
    const phone = form.querySelector<HTMLInputElement>('input[name="tel"]').value;
    const email = form.querySelector<HTMLInputElement>('input[name="email"]').value;

    let infoAddress = {};

    infoAddress['lastName'] = lastName;
    infoAddress['firstName'] = firstName;
    infoAddress['lastNameFurigana'] = lastNameFurigana;
    infoAddress['firstNameFurigana'] = firstNameFurigana;
    infoAddress['zipCode'] = zipCode;
    infoAddress['province'] = province;
    infoAddress['city'] = city;
    infoAddress['address1'] = address1;
    infoAddress['address2'] = address2;
    infoAddress['phone'] = phone;
    infoAddress['email'] = email;

    localStorage.addressNotLogIn = await JSON.stringify(infoAddress);
  }

  checkFormNull() {
    const regNull = /[^\s]|^[^]$/;
    let isNull = false;

    this.formTarget.querySelectorAll('.field[required]').forEach(item => {
      const field = item as HTMLInputElement;

      if (!regNull.test(field.value)) {
        isNull = true;
        field.classList.add('field--error');
      } else {
        field.classList.remove('field--error');
      }
    });

    if (isNull) {
      this.messageErrorTarget.querySelector('.error-null').classList.remove('hidden');
    }

    return isNull;
  }

  checkKatakanaName(isFieldsNull) {
    const regKatakana = /^[ァ-ヶー・ヽヾ]+$/;
    const lastKatakanaName = this.element.querySelector<HTMLInputElement>('.field[name="family-name-kana"]');
    const firstKatakanaName = this.element.querySelector<HTMLInputElement>('.field[name="given-name-kana"]');
    let validKatakanaName = true;

    if (!isFieldsNull) {
      lastKatakanaName.classList.remove('field--error');
      firstKatakanaName.classList.remove('field--error');
    }

    if (!regKatakana.test(lastKatakanaName.value) && !isFieldsNull) {
      validKatakanaName = false;
      this.messageErrorTarget.querySelector('.error-katakana-name').classList.remove('hidden');
      lastKatakanaName.classList.add('field--error');
    }

    if (!regKatakana.test(firstKatakanaName.value) && !isFieldsNull) {
      validKatakanaName = false;
      this.messageErrorTarget.querySelector('.error-katakana-name').classList.remove('hidden');
      firstKatakanaName.classList.add('field--error');
    }

    return validKatakanaName;
  }

  checkName(isFieldsNull) {
   const regName = /^[ぁ-んァ-ヶー一-龥a-zA-Z々\d\s]+$/;
   const lastName = this.element.querySelector<HTMLInputElement>('.field[name="family-name"]');
   const firstName = this.element.querySelector<HTMLInputElement>('.field[name="given-name"]');
   let validName = true;

   if (!isFieldsNull) {
     lastName.classList.remove('field--error');
     firstName.classList.remove('field--error');
   }

   if (!regName.test(lastName.value) && !isFieldsNull) {
     validName = false;
     this.messageErrorTarget.querySelector('.error-format').classList.remove('hidden');
     lastName.classList.add('field--error');
   }

   if (!regName.test(firstName.value) && !isFieldsNull) {
     validName = false;
     this.messageErrorTarget.querySelector('.error-format').classList.remove('hidden');
     firstName.classList.add('field--error');
   }

   return validName;
  }

  checkAddress(isFieldsNull) {
    const regAddress = /^[ぁ-んァ-ヶー一-龥a-zA-Zｧ-ﾝﾞﾟＡ-Ｚａ-ｚ\d\s\-\ー０-９々]+$/;
    const regAddress2 = /^[^?*#¥_'%？＃＊＿％’|｜""、､，]+$/;
    const regTab = /[^\s]/;
    const regEmoji = /[\ud000-\udfff]/gi;

    const address1 = this.element.querySelector<HTMLInputElement>('.field[name="address-line2"]');
    const address2 = this.element.querySelector<HTMLInputElement>('.field[name="building"]');
    let validAddress = true;

    if (!isFieldsNull) {
      address1.classList.remove('field--error');
      address2.classList.remove('field--error');
    }

    if (!regAddress.test(address1.value) && !isFieldsNull) {
      validAddress = false;
      this.messageErrorTarget.querySelector('.error-format').classList.remove('hidden');
      address1.classList.add('field--error');
    }

    if ((!regAddress2.test(address2.value) || regEmoji.test(address2.value) || !regTab.test(address2.value)) && address2.value.length > 0 ) {
      validAddress = false;
      this.messageErrorTarget.querySelector('.error-format').classList.remove('hidden');
      address2.classList.add('field--error');
    }

    return validAddress;
  }

  checkPhoneNumber(isFieldsNull) {
    const regPhone = /^[\d]+$/;
    const phoneNumber = this.element.querySelector<HTMLInputElement>('.field[name="tel"]');
    let validPhoneNumber = true;

    if (!isFieldsNull) {
      phoneNumber.classList.remove('field--error');
    }

    if (!regPhone.test(phoneNumber.value) && !isFieldsNull) {
      validPhoneNumber = false;
      this.messageErrorTarget.querySelector('.error-phone-number').classList.remove('hidden');
      phoneNumber.classList.add('field--error');
    }

    if (phoneNumber.value.length < 10 && !isFieldsNull) {
      validPhoneNumber = false;
      this.messageErrorTarget.querySelector('.error-format-phone').classList.remove('hidden');
      phoneNumber.classList.add('field--error');
    }

    return validPhoneNumber;
  }

  async checkPrefecture() {
    let validPrefecture = true;
    const postalCode = this.element.querySelector<HTMLInputElement>('.field[name="postal-code"]');
    const prefecture = this.element.querySelector<HTMLInputElement>('.field[name="prefecture"]');
    const { code, data } = await (
      await fetch(`https://api.zipaddress.net/?zipcode=${postalCode.value}`)
    ).json();

    postalCode.classList.remove('field--error');

    if (code == 400) {
      validPrefecture = false;
      this.messageErrorTarget.querySelector('.error-postcode').classList.remove('hidden');
      postalCode.classList.add('field--error');
    } else {
      if (prefecture.value !== data.pref) {
        validPrefecture = false;
        this.messageErrorTarget.querySelector('.error-prefecture').classList.remove('hidden');
        prefecture.classList.add('field--error');
      }
    }

    return validPrefecture;
  }

  async checkZipCode() {
    let validZipcode = true;
    const postalCode = this.element.querySelector<HTMLInputElement>('.field[name="postal-code"]');
    const city = this.element.querySelector<HTMLInputElement>('.field[name="address-line1"]');
    const { code, data } = await (
      await fetch(`https://api.zipaddress.net/?zipcode=${postalCode.value}`)
    ).json();

    postalCode.classList.remove('field--error');

    if (code == 400) {
      validZipcode = false;
      this.messageErrorTarget.querySelector('.error-postcode').classList.remove('hidden');
      postalCode.classList.add('field--error');
    } else {
      if (!city.value.includes(data.city)) {
        validZipcode = false;
        this.messageErrorTarget.querySelector('.error-city').classList.remove('hidden');
        city.classList.add('field--error');
      }
    }

    return validZipcode;
  }
}
