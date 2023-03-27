import { Controller } from '@hotwired/stimulus'
import { transitionDurationLeave } from '../utils'
import { numberWithCommas } from "../helpers/currencyHelper";

export default class extends Controller {

  connect() {
    let arrayProduct = localStorage.recentlyViewed ? JSON.parse(localStorage.recentlyViewed) : [];
    const handleProduct = document.querySelector<HTMLInputElement>('.js-productRecently').value;
    const defineRecentlyOnProduct = document.getElementsByClassName('js-renderRecentlyViewed').length > 0;
    const handleCurrentProd = window.location.pathname;

    if (handleProduct != '') {
      if (!arrayProduct.includes(handleProduct)) {
        arrayProduct.unshift(handleProduct);
        localStorage.recentlyViewed = JSON.stringify(arrayProduct);
      }
    }

    if (arrayProduct.length > 1) {
      let newArrayProd = arrayProduct.slice(0, 11);
      const requests = newArrayProd.map(handleProducts => fetch(`/products/${handleProducts}.js`));

      Promise.all(requests)
        .then((responses) => responses)
        .then(responses => Promise.all(responses.map(r => {
          if (r.status == 200) {
            return r.json();
          }
        })))
        .then((data) => {
          let htmlProd = '';

          if (newArrayProd.length > 4) {
            document.querySelectorAll('.section-recently-viewed .scroll-item-list__button').forEach(element => {
              element.classList.remove('hidden');
            });
          }

          data.forEach((val, index) => {
            const vipCompanySale = val ? val['tags'].some(tag => tag.includes('社販セール品') || tag.includes('VIP')) : true;

            if (val && val.available && !vipCompanySale) {
              if (handleCurrentProd !== val['url'] && val['url'] !== '/products/998002' && val['url'] !== '/products/998001') {
                let htmlPrice = '';

                if (val.price_min == val.price_max) {
                  htmlPrice = `￥${numberWithCommas(val.price / 100)}`;
                } else {
                  htmlPrice = `￥${numberWithCommas(val.price_min / 100)} - ￥${numberWithCommas(val.price_max / 100)}`;
                }

                htmlProd += `<li ${data.length < 6 ? 'class="max-width"' : ''}>
                  <a href="${val.url}" data-id="${val.id}">
                    <figure class="product-item ${val.available ? '' : 'product-item--soldout'}">
                      <div class="product-item__image">
                        <div class="product-item__tags">
                          ${val.tags.includes('NEW') ? '<span class="product-item__tag">NEW</span>' : ''}
                          ${val.tags.includes('予約商品') ? '<span class="product-item__tag">予約商品</span>' : ''}
                        </div>
                        <img alt="${val.title}" src="${val.featured_image}">
                      </div>

                      <figcaption>
                        <p class="product-item__name">${val.title}</p>
                        <p class="product-item__price">
                          ${htmlPrice}
                          <span class="product-item__tax-in">税込</span>
                        </p>
                      </figcaption>
                    </figure>
                  </a>
                </li>`;
              }
            }
          });
          if (defineRecentlyOnProduct) {
            document.querySelector('.js-renderRecentlyViewed').innerHTML = htmlProd;
          }
          document.querySelector('.js-renderRecentlyViewed-searchbar').innerHTML = htmlProd;
        });
    } else {
      const recentlyContainer = document.querySelector('.section-recently-viewed') as HTMLDivElement;
      recentlyContainer.style.display = "none";
    }
  }
}
