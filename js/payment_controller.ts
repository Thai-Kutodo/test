import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  addressUserTarget: HTMLDivElement
  deliveryDateTarget: HTMLDivElement
  deliveryTimeTarget: HTMLDivElement
  hasAddressUserTarget: boolean
  hasDeliveryDateTarget: boolean
  hasDeliveryTimeTarget: boolean
  messageErrorTarget: HTMLDivElement
  hasMessageErrorTarget: boolean

  static targets = [
    'addressUser',
    'deliveryDate',
    'deliveryTime',
    'messageError'
  ]

  initialize(): void {
    setTimeout(() => {
      this.limitCharactersFields();
    }, 300);
  }

  async submitForm(e) {
    e.preventDefault();

    const btnSubmit = document.querySelector<HTMLButtonElement>('#continue_button');
    const btnBack = document.querySelector('.checkout__footer .button--has-icon-arrow-left');

    this.messageErrorTarget.querySelectorAll('div').forEach((item) => {
      item.classList.add('hidden');
    });

    if (document.querySelector<HTMLInputElement>('#checkout_different_billing_address_true').checked) {
      const isFieldsNull = await this.hasMessageErrorTarget ? this.checkFormNull() : false;
      const validKatakanaName = this.hasMessageErrorTarget ? this.checkKatakanaName(isFieldsNull) : true;
      const validName = this.hasMessageErrorTarget ? this.checkName(isFieldsNull) : true;
      const validAddress = this.hasMessageErrorTarget ? this.checkAddress(isFieldsNull) : true;
      const validZipCode = this.hasMessageErrorTarget ? await this.checkZipCode(isFieldsNull) : true;
      const validphoneNumber = this.hasMessageErrorTarget ? this.phoneNumber(isFieldsNull) : true;
      const validPrefecture = this.hasMessageErrorTarget ? await this.checkPrefecture() : true;

      if (isFieldsNull || !validKatakanaName || !validName || !validAddress || !validZipCode || !validphoneNumber || !validPrefecture) return;
    }

    e.target.classList.add('disabled');
    btnBack.classList.add('disabled');
    btnSubmit.click();
  }

  limitCharactersFields() {
    const lastName = document.querySelector('div[data-address-field="last_name"] input');
    const firstName = document.querySelector('div[data-address-field="first_name"] input');
    const zipCode = document.querySelector('div[data-address-field="zip"] input');
    const city = document.querySelector('div[data-address-field="city"] input');
    const address1 = document.querySelector('div[data-address-field="address1"] input');
    const address2 = document.querySelector('div[data-address-field="address2"] input');
    const phoneNumber = document.querySelector('div[data-address-field="phone"] input');

    if (lastName) lastName.setAttribute('maxlength', '5');
    if (firstName) firstName.setAttribute('maxlength', '10');
    if (zipCode) zipCode.setAttribute('maxlength', '7');
    if (city) city.setAttribute('maxlength', '16');
    if (address1) address1.setAttribute('maxlength', '16');
    if (address2) address2.setAttribute('maxlength', '16');
    if (phoneNumber) phoneNumber.setAttribute('maxlength', '14');
  }

  checkFormNull() {
    const regNull = /[^\s]|^[^]$/;
    let isNull = false;

    document.querySelectorAll('.field--required input').forEach(item => {
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
    const lastKatakanaName = this.element.querySelector<HTMLInputElement>('.last-name-kana input');
    const firstKatakanaName = this.element.querySelector<HTMLInputElement>('.first-name-kana input');
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
   const regName = /^[ぁ-んァ-ヶー一-龥a-zA-Z\d\s々]+$/;
   const lastName = this.element.querySelector<HTMLInputElement>('.field[data-address-field="last_name"] input');
   const firstName = this.element.querySelector<HTMLInputElement>('.field[data-address-field="first_name"] input');
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
    const address1 = this.element.querySelector<HTMLInputElement>('.field[data-address-field="address1"] input');
    const address2 = this.element.querySelector<HTMLInputElement>('.field[data-address-field="address2"] input');
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

  async checkPrefecture() {
    let validPrefecture = true;
    const arrayProvince = [{name: "北海道", value: "JP-01"}, {name: "青森県", value: "JP-02"}, {name: "岩手県", value: "JP-03"}, {name: "宮城県", value: "JP-04"}, {name: "秋田県", value: "JP-05"}, {name: "山形県", value: "JP-06"}, {name: "福島県", value: "JP-07"}, {name: "茨城県", value: "JP-08"}, {name: "栃木県", value: "JP-09"}, {name: "群馬県", value: "JP-10"}, {name: "埼玉県", value: "JP-11"}, {name: "千葉県", value: "JP-12"}, {name: "東京都", value: "JP-13"}, {name: "神奈川県", value: "JP-14"}, {name: "新潟県", value: "JP-15"}, {name: "富山県", value: "JP-16"}, {name: "石川県", value: "JP-17"}, {name: "福井県", value: "JP-18"}, {name: "山梨県", value: "JP-19"}, {name: "長野県", value: "JP-20"}, {name: "岐阜県", value: "JP-21"}, {name: "静岡県", value: "JP-22"}, {name: "愛知県", value: "JP-23"}, {name: "三重県", value: "JP-24"}, {name: "滋賀県", value: "JP-25"}, {name: "京都府", value: "JP-26"}, {name: "大阪府", value: "JP-27"}, {name: "兵庫県", value: "JP-28"}, {name: "奈良県", value: "JP-29"}, {name: "和歌山県", value: "JP-30"}, {name: "鳥取県", value: "JP-31"}, {name: "島根県", value: "JP-32"}, {name: "岡山県", value: "JP-33"}, {name: "広島県", value: "JP-34"}, {name: "山口県", value: "JP-35"}, {name: "徳島県", value: "JP-36"}, {name: "香川県", value: "JP-37"}, {name: "愛媛県", value: "JP-38"}, {name: "高知県", value: "JP-39"}, {name: "福岡県", value: "JP-40"}, {name: "佐賀県", value: "JP-41"}, {name: "長崎県", value: "JP-42"}, {name: "熊本県", value: "JP-43"}, {name: "大分県", value: "JP-44"}, {name: "宮崎県", value: "JP-45"}, {name: "鹿児島県", value: "JP-46"}, {name: "沖縄県", value: "JP-47"}]
    const postalCode = this.element.querySelector<HTMLInputElement>('.field[data-address-field="zip"] input');
    const prefecture = this.element.querySelector<HTMLInputElement>('.field[data-address-field="province"] select');
    const valuePrefecture = arrayProvince.find(item => item.value === prefecture.value)
    const { code, data } = await (
      await fetch(`https://api.zipaddress.net/?zipcode=${postalCode.value}`)
    ).json();

    postalCode.classList.remove('field--error');
    prefecture.classList.remove('field--error');

    if (code == 400) {
      validPrefecture = false;
      this.messageErrorTarget.querySelector('.error-postcode').classList.remove('hidden');
      postalCode.classList.add('field--error');
    } else {
      if (valuePrefecture.name !== data.pref) {
        validPrefecture = false;
        this.messageErrorTarget.querySelector('.error-prefecture').classList.remove('hidden');
        prefecture.classList.add('field--error');
      }
    }

    return validPrefecture;
  }

  async checkZipCode(isFieldsNull) {
    let validZipcode = true;
    const postalCode = this.element.querySelector<HTMLInputElement>('.field[data-address-field="zip"] input');
    const city = this.element.querySelector<HTMLInputElement>('.field[data-address-field="city"] input');

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

  phoneNumber(isFieldsNull) {
    const regPhoneNumber = /^[\d]+$/;
    const phoneNumber = this.element.querySelector<HTMLInputElement>('.field[data-address-field="phone"] input');
    let validPhoneNumber = true;

    if (!isFieldsNull) {
      phoneNumber.classList.remove('field--error');
    }

    if (!regPhoneNumber.test(phoneNumber.value) && !isFieldsNull) {
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
}
