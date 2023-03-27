import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  cartItemTarget: HTMLDivElement
  formTarget: HTMLDivElement
  messageErrorTarget: HTMLDivElement
  hasMessageErrorTarget: boolean
  messageErrorLoginTarget: HTMLDivElement
  hasMessageErrorLoginTarget: boolean

  static targets = [
    'cartItem',
    'form',
    'messageError',
    'messageErrorLogin'
  ]

  connect(): void {

  }

  async processGiftWrapping(e) {
    e.preventDefault();

    let selectedGiftWrapping = document.querySelector('.checkout-toggle-buttons input[value="gift"]') ? document.querySelector<HTMLInputElement>('.checkout-toggle-buttons input[value="gift"]').checked : true;
    console.log(this.cartItemTarget.innerText);

    const arrayCart = JSON.parse(this.cartItemTarget.innerText);
    const linkNextStep = e.currentTarget.href;

    if (e.currentTarget.classList.contains('merge-lineItem')) selectedGiftWrapping = false;

    if(this.hasMessageErrorTarget) {
      this.messageErrorTarget.querySelectorAll('div').forEach((item) => {
        item.classList.add('hidden');
      });
    }

    const isFieldsNull = await this.hasMessageErrorTarget ? this.checkFormNull() : false;
    const validKatakanaName = this.hasMessageErrorTarget ? this.checkKatakanaName(isFieldsNull) : true;
    const validName = this.hasMessageErrorTarget ? this.checkName(isFieldsNull) : true;
    const validAddress =  this.hasMessageErrorTarget ? this.checkAddress(isFieldsNull) : true;
    const validZipCode = this.hasMessageErrorTarget ? await this.checkZipCode(isFieldsNull) : true;
    const validPhoneNumber = this.hasMessageErrorTarget ? this.checkPhoneNumber(isFieldsNull) : true;
    const validEmail =  this.hasMessageErrorTarget ? this.checkEmail() : true;
    const validPrefecture = this.hasMessageErrorTarget ? await this.checkPrefecture() : true;
    const validFieldAddress = this.validateAddress();

    if (isFieldsNull || !validKatakanaName || !validName || !validAddress || !validZipCode || !validEmail || !validPhoneNumber || !validFieldAddress || !validPrefecture) return;

    localStorage.firstStep = "done";
    document.querySelector('.checkout__footer .button--cta').classList.add('disabled');

    if (document.querySelector('.change-to-gift-wrapping .button')) {
      document.querySelector('.change-to-gift-wrapping .button').classList.add('disabled');
    }

    if (!selectedGiftWrapping) {
      this.mergeLineItem(arrayCart, linkNextStep);
    } else if (selectedGiftWrapping) {
      this.separateLineItem(arrayCart, linkNextStep);
    }
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
   const regName = /^[ぁ-んァ-ヶー一-龥a-zA-Z\d\s０-９々]+$/;
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

  validateAddress() {
    if (!this.hasMessageErrorLoginTarget) return true;

    let isValidAddress = true;
    const address = this.element.querySelector<HTMLInputElement>('.checkout-address input:checked').dataset;

    this.messageErrorLoginTarget.classList.add('hidden');

    this.messageErrorLoginTarget.querySelectorAll('.message').forEach(element => {
      element.classList.add('hidden');
    });

    if (address['last_name'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.last-name').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['first_name'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.first-name').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['zip'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.zipcode').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['province'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.prefecture').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['city'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.city').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['address1'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.address').classList.remove('hidden');
      isValidAddress = false;
    }

    if (address['phone'] === '') {
      this.messageErrorLoginTarget.classList.remove('hidden');
      this.messageErrorLoginTarget.querySelector('.phone').classList.remove('hidden');
      isValidAddress = false;
    }

    return isValidAddress
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

  async checkZipCode(isFieldsNull) {
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

  checkEmail() {
    let validEmail = true;
    const regNull = /[^\s]|^[^]$/;
    const regEmail = /^[a-z\-+_.\d]+@[a-z\d\-+_.]{1,}(\.[a-z\d\-+_]{1,}){1,5}$/;
    const email = this.element.querySelector<HTMLInputElement>('.field[name="email"]');

    email.classList.remove('field--error');

    if (!regNull.test(email.value)) {
      validEmail = false;
      this.messageErrorTarget.querySelector('.error-null-email').classList.remove('hidden');
      email.classList.add('field--error');
    } else if (!regEmail.test(email.value)) {
      validEmail = false;
      this.messageErrorTarget.querySelector('.error-format-email').classList.remove('hidden');
      email.classList.add('field--error');
    }

    return validEmail;
  }

  async separateLineItem(arrayCart, link) {
    let count = 0;
    let formData = {
      'items': []
    };

    arrayCart.forEach((item) => {
      const variantId = item['variant_id'];
      const qtyProduct = item['quantity'];
      let propertiesItem = {};

      if (item['properties'] !== null) {
        if (Object.keys(item['properties']).length > 0) {
          //get all properties of item and add to object propertiesItem except _line_item
          for (const property in item['properties']) {
            if (property !== '_line_item') {
              propertiesItem[property] = item['properties'][property];
            }
          }
        }
      }

      if (item['handle'] !== "998002") {
        if (item['properties'] !== null) {
          if (item['properties'].hasOwnProperty('_line_item')) {
            //use the case for product customize with gift wrapping (included not chosen gift yet)
            for (let i = 1; i <= qtyProduct; i++) {
              count += 1;
              let properties = {};

              if (Object.keys(propertiesItem).length > 0) {
                properties = {
                  ...propertiesItem
                }
              }

              properties['_line_item'] = `${item.variant_id}_${count}`;

              formData['items'].push({
                'quantity': 1,
                'id': variantId,
                'properties': properties
              });
            }
          } else {
            //use for separate product from normal to gift wrapping (included product customize)
            for (let i = 1; i <= qtyProduct; i++) {
              count += 1;
              let properties = {};

              if (item['properties'] !== null) {
                if (Object.keys(item['properties']).length > 0) {
                  properties = {
                    ...propertiesItem
                  }
                }
              }

              properties['_line_item'] = `${item.variant_id}_${count}`;

              formData['items'].push({
                'quantity': 1,
                'id': variantId,
                'properties': properties
              })
            }
          }
        } else {
          //use for separate product from normal to gift wrapping (not include customize product)
          for (let i = 1; i <= qtyProduct; i++) {
            count += 1;

            formData['items'].push({
              'quantity': 1,
              'id': variantId,
              'properties': {
                '_line_item': `${item.variant_id}_${count}`
              }
            })
          }
        }
      } else {
        //use for add item shopping bag
        formData['items'].push({
          'quantity': item['quantity'],
          'id': variantId
        })
      }
    });

    await this.clearCart();
    await this.apiAddToCart(formData, link);

    setTimeout(() => {
      if (document.querySelector('.change-to-gift-wrapping .button')) {
        document.querySelector('.change-to-gift-wrapping .button').classList.remove('disabled');
      }
    }, 3000);
  }

  async mergeLineItem(arrayCart, link) {
    let formData = {
      'items': []
    };

    arrayCart.forEach((line_item) => {
      let propertiesItem = {};

      if (line_item['properties'] !== null) {
        if (line_item['properties']['_line_item']) {
          delete line_item['properties']['_line_item'];
        }

        if (line_item['properties']['梱包区分']) {
          delete line_item['properties']['梱包区分'];
        }

        if (Object.keys(line_item['properties']).length > 0) {
          //get all properties of item and add to object propertiesItem
          for (const property in line_item['properties']) {
            propertiesItem[property] = line_item['properties'][property];
          }
        }
      }

      const hasOnArray = formData["items"].find(item => {
        const itemProperties = JSON.stringify(item["properties"]) === 'null' || JSON.stringify(item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(item["properties"]);
        const lineItemProperties =  JSON.stringify(line_item["properties"]) === 'null' || JSON.stringify(line_item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(line_item["properties"]);

        return item["id"] == line_item["variant_id"] && itemProperties == lineItemProperties;
      });

      if (hasOnArray) {
        //if already on array will inscrease qty
        formData["items"].map(item =>{
          const itemProperties = JSON.stringify(item["properties"]) === 'null' || JSON.stringify(item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(item["properties"]);
          const lineItemProperties =  JSON.stringify(line_item["properties"]) === 'null' || JSON.stringify(line_item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(line_item["properties"]);

          if (item["id"] == line_item["variant_id"] && itemProperties == lineItemProperties) {
            item["quantity"] += line_item["quantity"];
          }
        });
      } else {
        //if not exist on array will add new item to array
        formData["items"].push({
          "id": line_item['variant_id'],
          "quantity": line_item['quantity'],
          "properties": propertiesItem
        })
      }
    });

    await this.clearCart();
    await this.apiAddToCart(formData, link);
  }

  async mergeProductNormal(e) {
    e.preventDefault();

    const arrayCart = await this.getCartItems();
    const cartItems = arrayCart['items'];
    const linkNextStep = e.target.href;

    let formData = {
      'items': []
    };

    cartItems.forEach(line_item => {
      let propertiesItem = {};

      if (line_item['properties'] !== null) {
        if (line_item['properties']['_line_item']) {
          delete line_item['properties']['_line_item'];
        }

        if (line_item['properties']['梱包区分'] == 0 && line_item['properties']['梱包区分']) {
          delete line_item['properties']['梱包区分'];
        }

        if (Object.keys(line_item['properties']).length > 0) {
          //get all properties of item and add to object propertiesItem
          for (const property in line_item['properties']) {
            propertiesItem[property] = line_item['properties'][property];
          }
        }
      }

      const hasOnArray = formData["items"].find(item => {
        const itemProperties = JSON.stringify(item["properties"]) === 'null' || JSON.stringify(item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(item["properties"]);
        const lineItemProperties =  JSON.stringify(line_item["properties"]) === 'null' || JSON.stringify(line_item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(line_item["properties"]);

        return item["id"] == line_item["variant_id"] && itemProperties == lineItemProperties;
      });

      if (hasOnArray) {
        //if already on array will inscrease qty
        formData["items"].map(item =>{
          const itemProperties = JSON.stringify(item["properties"]) === 'null' || JSON.stringify(item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(item["properties"]);
          const lineItemProperties =  JSON.stringify(line_item["properties"]) === 'null' || JSON.stringify(line_item["properties"]) === '{}' ? JSON.stringify({}) : JSON.stringify(line_item["properties"]);

          if (item["id"] == line_item["variant_id"] && itemProperties == lineItemProperties) {
            item["quantity"] += line_item["quantity"];
          }
        });
      } else {
        //if not exist on array will add new item to array
        formData["items"].push({
          "id": line_item['variant_id'],
          "quantity": line_item['quantity'],
          "properties": propertiesItem
        })
      }
    });

    await this.clearCart();
    await this.apiAddToCart(formData, linkNextStep);
  }

  apiAddToCart(formData, link) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('add success');
      setTimeout(() => {
        location.href = link;
        document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
      }, 3000);
    });
  }

  clearCart() {
    return fetch('/cart/clear.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then(() => console.log('cleared all item'))
  }

  getCartItems() {
    return fetch('/cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => response.json())
  }
}
