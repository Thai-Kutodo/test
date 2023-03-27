import { Controller } from '@hotwired/stimulus'
import AirDatepicker, { AirDatepickerButton, AirDatepickerDate, AirDatepickerLocale } from 'air-datepicker'
import { transitionDurationLeave } from '../utils'
const localeJa: AirDatepickerLocale = {
  days: ['日', '月', '火', '水', '木', '金', '土'],
  daysShort: ['日', '月', '火', '水', '木', '金', '土'],
  daysMin: ['日', '月', '火', '水', '木', '金', '土'],
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  today: '今日',
  clear: 'クリア',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'hh:mm aa',
  firstDay: 0,
}
export default class extends Controller {
  minDateValue: string
  maxDateValue: string
  defaultSelectedDateValue: string
  multipleDatesValue: boolean
  hasDefaultSelectedDateValue: boolean
  static values = {
    minDate: String,
    maxDate: String,
    defaultSelectedDate: String,
    multipleDates: Boolean,
  }

  async initialize() {
    const _this = this;
    const ddsAttribute = await this.callApiDDS();

    const disabledDatePicker = setInterval(function(){
      if (_this.element.querySelector('.air-datepicker')) {
        clearInterval(disabledDatePicker);
        _this.disabledDates(ddsAttribute, _this.element);
      }
    }, 300);

    this.callLibDatePicker(ddsAttribute);
  }

  async callLibDatePicker(ddsAttribute) {
    const _this = this;
    const minDate = ddsAttribute['dds_widget_attributes']['deliverable_dates_range']['min'];
    const isExtraDay = document.querySelector('.js-extraDay') ? document.querySelector<HTMLDivElement>('.js-extraDay').dataset.extra_day : 'false';

    let maxDate = ddsAttribute['dds_widget_attributes']['deliverable_dates_range']['max'];
    let buttons: AirDatepickerButton[] | undefined = undefined;

    if (isExtraDay === 'true') {
      const extra12Day = 11*24*60*60*1000;
      const convertDate =  new Date(new Date(`${minDate} 23:59`).getTime() + extra12Day);
      maxDate = `${convertDate.getFullYear()}-${(+convertDate.getMonth()+1).toString().padStart(2, '0')}-${convertDate.getDate()}`;
    }

    if (this.multipleDatesValue) {
      buttons = [
        {
          content(dp) {
            return 'リセット'
          },
          onClick(dp) {
            dp.clear()
          },
        },
        {
          content(dp) {
            return 'OK'
          },
          onClick(dp) {
            if (document.getElementById('selected-dates')) {
              const inputEl = document.getElementById('selected-dates') as HTMLInputElement
              let value = dp.selectedDates.map((date) => dp.formatDate(date, 'yyyy/MM/dd')).join(',')
              inputEl.value = value
              if (inputEl.nextElementSibling instanceof HTMLButtonElement) {
                inputEl.nextElementSibling.innerText = value !== '' ? value : 'すべて'
              }
            }
            // モーダルを閉じる
            const modalContainerEl = document.getElementById('modal-container')
            if (modalContainerEl.children.length > 0) {
              const modalEl = modalContainerEl.children[0]
              modalEl.classList.remove('show')
              modalEl.addEventListener('transitionend', (ev) => {
                modalEl.remove()
              })
              document.body.classList.remove('is-presenting-modal')
            }
          },
        },
      ]
    }

    let defaultSelectedDates: AirDatepickerDate[] = [
      minDate ? minDate : new Date(),
    ]

    if (document.getElementById('selected-dates')) {
      const inputEl = document.getElementById('selected-dates') as HTMLInputElement
      if (inputEl.value) {
        const values = inputEl.value.split(',');

        defaultSelectedDates = values
      }
    }

    const datePicker = await new AirDatepicker(this.element.querySelector('input') as HTMLElement, {
      inline: true,
      locale: localeJa,
      minDate: minDate,
      maxDate: maxDate,
      isMobile: false,
      multipleDates: this.multipleDatesValue,
      navTitles: {
        days: 'yyyy<span>年</span> M<span>月</span>',
      },
      prevHtml:
        '<button type="button"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 20L16.2929 19.2929L15.5858 20L16.2929 20.7071L17 20ZM23.7071 25.2929L17.7071 19.2929L16.2929 20.7071L22.2929 26.7071L23.7071 25.2929ZM17.7071 20.7071L23.7071 14.7071L22.2929 13.2929L16.2929 19.2929L17.7071 20.7071Z" fill="#555"/></svg></button>',
      nextHtml:
        '<button type="button"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 20L23.7071 19.2929L24.4142 20L23.7071 20.7071L23 20ZM16.2929 25.2929L22.2929 19.2929L23.7071 20.7071L17.7071 26.7071L16.2929 25.2929ZM22.2929 20.7071L16.2929 14.7071L17.7071 13.2929L23.7071 19.2929L22.2929 20.7071Z" fill="#555"/></svg></button>',
      buttons,
      async onSelect({formattedDate, datepicker}) {
        const selectedDay = datepicker['selectedDates'][0] ? datepicker['selectedDates'][0].getDay() :  '';
        let dayName = '';

        if (selectedDay !== '') {
          switch (selectedDay) {
            case 0:
              dayName = "日";
              break;
            case 1:
              dayName = "月";
              break;
            case 2:
              dayName = "火";
              break;
            case 3:
              dayName = "水";
              break;
            case 4:
              dayName = "木";
              break;
            case 5:
              dayName = "金";
              break;
            case 6:
              dayName = "土";
          }
        }

        await document.querySelector('.checkout__footer .next-step').classList.add('disabled');
        sessionStorage.deliveryDay = await dayName;
        sessionStorage.deliveryDate = await formattedDate || '指定なし';

        setTimeout(() => {
          document.querySelector('.checkout__footer .next-step').classList.remove('disabled');
        }, 500);
      }
    })

    document.querySelector('.checkout__footer .next-step').classList.remove('disabled');

    const mutationObserver = new MutationObserver(() => {
      this.disabledDates(ddsAttribute, datePicker['$datepicker']);
    });

    if (_this.element) {
      mutationObserver.observe(_this.element, {characterData: true, attributes: false, childList: true, subtree: true});
    }

    if (sessionStorage.deliveryDate && sessionStorage.deliveryDate != 'null' && sessionStorage.deliveryDate != '指定なし') {
      datePicker.selectDate(sessionStorage.deliveryDate);
    }
  }

  callApiDDS() {
    const elementController = this.element as HTMLDivElement;
    const isLargeFurniture = elementController.dataset.large_furniture;
    const isLoggedIn = elementController.dataset.is_loggedin;
    const hostname = window.location.hostname;
    const address = isLoggedIn === 'true' ? JSON.parse(localStorage.addressLoggedIn) : JSON.parse(localStorage.addressNotLogIn);
    const urlAPI = window.API_URL['DDS'];

    const formData = {
      "shopify_domain": hostname,
      "city": address['city'],
      "province": address['province'],
      "street": `${address['address1']}, ${address['address2']}`,
      "zip": address['zipCode'],
      "shipping_lead_time": 3
    };

    let urlFetchData = `${urlAPI}?shopify_domain=${formData['shopify_domain']}&city=${formData['city']}&province=${formData['province']}&street=${formData['street']}&zip=${formData['zip']}`;

    if (isLargeFurniture === "true") {
      urlFetchData += `&products[0][tags]=["大型家具"]&products[0][shipping_lead_time]=${formData['shipping_lead_time']}`
    }

    return fetch(urlFetchData, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
  }

  disabledDates(ddsAttribute, calendar) {
    const blockedHolidays = ddsAttribute['dds_widget_attributes']['blocked_holiday_dates'];
    const blockedDelivery = ddsAttribute['dds_widget_attributes']['blocked_delivery_dates'];

    if (blockedHolidays.length > 0) {
      calendar.querySelectorAll('.air-datepicker-cell.-day-:not(.-disabled-)').forEach(el => {
        const date = `${el.getAttribute('data-year')}-${((+el.getAttribute('data-month') + 1).toString()).padStart(2, '0')}-${el.getAttribute('data-date').padStart(2, '0')}`;

        if (blockedHolidays.includes(date)) {
          el.classList.add('-disabled-');
        }
      });
    }

    if (blockedDelivery.length > 0) {
      calendar.querySelectorAll('.air-datepicker-cell.-day-:not(.-disabled-)').forEach(el => {
        const date = `${el.getAttribute('data-year')}-${((+el.getAttribute('data-month') + 1).toString()).padStart(2, '0')}-${el.getAttribute('data-date').padStart(2, '0')}`;

        if (blockedDelivery.includes(date)) {
          el.classList.add('-disabled-');
        }
      });
    }
  }
}
