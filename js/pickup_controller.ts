import { Controller } from '@hotwired/stimulus'
import { initLazyload } from '../libs/lazyload'

export default class extends Controller {
  itemStoreTargets: HTMLElement[]
  storeNameTarget: HTMLDivElement
  hasStoreNameTarget: boolean
  itemsCartTarget: HTMLDivElement
  messageErrorTarget: HTMLDivElement
  messageErrorOrderTarget: HTMLDivElement
  messageErrorOutOfStockTarget: HTMLDivElement

  static targets = [
    'itemStore',
    'storeName',
    'itemsCart',
    'messageError',
    'messageErrorOrder',
    'messageErrorOutOfStock'
  ]

  connect(): void {
    const urlAPI = window.API_URL['storeLocator'];
    const isCartNull = (this.element as HTMLDivElement).dataset.cart_null;

    this.processStoreLocator(urlAPI);
    this.showNameStoreLocatorConfirm();

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
    }
  }

  async processStoreLocator(urlAPI) {
    if (!document.querySelector('.store-list')) return;

    const arrayRegionName = await this.getRegionName(urlAPI);
    const arrayPrefecture = await this.getPrefecture(urlAPI, arrayRegionName);
    const storeLocator = await this.getStoreLocator(urlAPI);

    this.renderLayout(arrayRegionName, arrayPrefecture, storeLocator);
  }

  async getRegionName(urlAPI) {
    const storeLocator = await this.getStoreLocator(urlAPI);
    let arrayRegionName = [];

    storeLocator.forEach(store => {
      if (!arrayRegionName.includes(store['region_name'])) {
        arrayRegionName.push(store['region_name']);
      }
    });

    return arrayRegionName;
  }

  async getPrefecture(urlAPI, arrayRegionName) {
    const storeLocator = await this.getStoreLocator(urlAPI);
    let storeAtRegion = [];
    let arrayPrefecture = [];

    arrayRegionName.forEach(regionName => {
      let arrayPrefecture = [];
      const obj = {};
      const prefecture = storeLocator.filter(el => el['region_name'] == regionName);

      prefecture.forEach(el => {
        if (!arrayPrefecture.includes(el['prefecture'])) {
          arrayPrefecture.push(el['prefecture']);
        }
      });


      obj[regionName] = arrayPrefecture;
      storeAtRegion.push(obj)
    });

    return storeAtRegion;
  }

  getStoreLocator(urlAPI) {
    return fetch(urlAPI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
  }

  renderLayout(arrayRegionName, arrayPrefecture, storeLocator) {
    let html = '';
    const prefixLinkImg = (this.element as HTMLDivElement).dataset.link_img_prefix;

    document.querySelector('.store-list').classList.remove('pt-30','center');

    arrayRegionName.forEach((regionName, i) => {
      const filterStoreLocator = storeLocator.filter(store => store.region_name == regionName);

      html += '<li class="accordion" data-controller="accordion">';
      html += `<button aria-expanded="false" class="accordion__button accordion__button--has-icon" data-accordion-target="trigger" data-action="accordion#toggle" type="button">
                  <span>${regionName}</span>
                </button>`;
      html += '<div class="accordion__content" data-accordion-target="content">'
      html += '<div class="container gap-30 lg:gap-40 mt-20 lg:mt-30 pb-20 lg:pb-50">'
      html += '<ul class="category-tab">'
      arrayPrefecture[i][regionName].forEach((prefecture,i) => {
        html += `<li class="category-tab__item">
                  <label>
                    <input name="prefecture-${regionName.replace('・', '-')}" data-action="click->pickup#filterLocator" type="radio" value="${prefecture}" ${i == 0 ? 'checked' : ''}>
                    <span>${prefecture}</span>
                  </label>
                </li>`
      });
      html += '</ul>'
      html += '<ul class="store-list__list">'
      filterStoreLocator.forEach((store, index) => {
        html += `<li class="store-list__item ${store['prefecture'] != filterStoreLocator[0]['prefecture'] ? 'hidden' : ''}" data-region_name="${store['prefecture']}" data-pickup-target="itemStore">
                  <label class="radio-button">
                    <input name="store" data-store_url="${store['store_url']}" data-phone="${store['phone']}" data-address="${store['address1']}" data-city="${store['city']}" data-zipcode="${store['zipcode']}" data-province="${store['prefecture']}" data-name="${store['name']}" data-action="click->pickup#chooseLocator" data-code="${store['new_code']}" type="radio" />
                    <span></span>
                  </label>

                  <div class="store-list__info">
                    <p class="store-list__name">${store['name']}</p>
                    <p class="store-list__address">〒${store['zipcode']}${store['address']}</p>
                  </div>

                  <div class="store-list__image">
                    <img alt="${store['name']}" class="lazy animated" data-src="${prefixLinkImg}${store['image']}?v=${index}&width=300" />
                  </div>
                </li>`
      });
      html += '</ul>'
      html += '</div>';
      html += '</div>';
      html += '</li>';
    });
    document.querySelector('.store-list').innerHTML = html;
    initLazyload();
  }

  filterLocator(e) {
    const valFilter = e.currentTarget.value;
    const parent = e.currentTarget.closest('.accordion__content');

    parent.querySelectorAll('.store-list__item').forEach(element => {
      if (element.dataset.region_name != valFilter) {
        element.classList.add('hidden');
      } else {
        element.classList.remove('hidden');
      }
    });
  }

  chooseLocator(e) {
    const valueInput = e.currentTarget.dataset;
    const nameStore = valueInput['name'];
    const codeStore = valueInput['code'];
    const storeUrl = valueInput['store_url'];
    const phoneNunber = valueInput['phone'];
    const zipCode = valueInput['zipcode'];
    const province = valueInput['province'];
    const city = valueInput['city'];
    const address = valueInput['address'];

    localStorage.storeLocator = `["${nameStore}", "${codeStore}", "${storeUrl}", "${phoneNunber}", "${zipCode}", "${province}", "${city}", "${address}"]`;
    document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
  }

  showNameStoreLocatorConfirm() {
    if (!this.hasStoreNameTarget) return;
    const convertSessionStorage = JSON.parse(localStorage.storeLocator);
    this.storeNameTarget.innerHTML = convertSessionStorage[0];
  }

  async createDraftOrder(e) {
    e.preventDefault();

    const urlAPI = window.API_URL['ccOrderCreate'];
    const convertSessionStorage = JSON.parse(localStorage.storeLocator);
    const storeName = convertSessionStorage[0];
    const storeCode = convertSessionStorage[1];
    const storeUrl = convertSessionStorage[2];
    const storePhoneNunber = convertSessionStorage[3];
    const storeZipCode = convertSessionStorage[4];
    const storeProvince = convertSessionStorage[5];
    const storeCity = convertSessionStorage[6];
    const storeAddress = convertSessionStorage[7];
    const infoAddress = document.querySelector<HTMLElement>('.js-addressCustomer');
    const itemCart = JSON.parse(this.itemsCartTarget.dataset.items);
    const total = +this.itemsCartTarget.dataset.total;
    const subtotal = +this.itemsCartTarget.dataset.subtotal;
    const listSku = this.itemsCartTarget.dataset.list_sku;
    const keyAttributeSku = this.itemsCartTarget.dataset.key_attritbute;
    const cart = await this.getInfoCart();

    let formData = {};
    formData['token'] = cart['token'];
    formData['customer_id'] = infoAddress.dataset.customer_id;
    formData['line_items'] = itemCart;
    formData['total'] = total;
    formData['subtotal'] = subtotal;

    formData['shipping_address'] = {
      "last_name": infoAddress.dataset.last_name,
      "first_name": infoAddress.dataset.first_name,
      "country": "Japan",
      "country_code": "JP",
      "zip": storeZipCode,
      "province": storeProvince,
      "province_code": "",
      "city": storeCity,
      "address1": storeAddress,
      "address2": "",
      "phone": storePhoneNunber
    };

    formData['billing_address'] = {
      "last_name": infoAddress.dataset.last_name,
      "first_name": infoAddress.dataset.first_name,
      "country": "Japan",
      "country_code": "JP",
      "zip": infoAddress.dataset.zip,
      "province": infoAddress.dataset.province,
      "province_code": infoAddress.dataset.province_code,
      "city": infoAddress.dataset.city,
      "address1": infoAddress.dataset.address1,
      "address2": infoAddress.dataset.address2,
      "phone": infoAddress.dataset.phone
    };

    formData['note_attributes'] = [
      {
        "name": "店舗受取",
        "value": `${storeName} (${storeCode})`
      },
      {
        "name": "店舗URL",
        "value": `${storeUrl}`
      },
      {
        "name": "電話番号",
        "value": `${storePhoneNunber}`
      },
      {
        "name": "注文店舗",
        "value": "ONLINE SHOP (099990)"
      }
    ];

    if (listSku !== '' && keyAttributeSku !== '') {
      formData['note_attributes'].push({
        "name": keyAttributeSku,
        "value": listSku
      })
    }

    formData['shipping_line'] = {
      "price": 0,
      "title": "店舗受取"
    };

    document.querySelector('.checkout__footer .button--cta').classList.add('disabled');
    fetch(urlAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status_url) {
        location.href = data.status_url;
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
        console.log(data);
      }
    })
    .catch((error) => {
      this.messageErrorTarget.click();
      document.querySelector('.checkout__footer .button--cta').classList.remove('disabled');
      console.log(error)
    });
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
