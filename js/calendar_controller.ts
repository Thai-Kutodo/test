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

  initialize() {
    let buttons: AirDatepickerButton[] | undefined = undefined
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
      this.hasDefaultSelectedDateValue ? this.defaultSelectedDateValue : new Date(),
    ]

    if (document.getElementById('selected-dates')) {
      const inputEl = document.getElementById('selected-dates') as HTMLInputElement
      if (inputEl.value) {
        const values = inputEl.value.split(',')
        defaultSelectedDates = values
      }
    }

    new AirDatepicker(this.element as HTMLElement, {
      inline: true,
      locale: localeJa,
      selectedDates: defaultSelectedDates,
      minDate: Date.parse(this.minDateValue),
      maxDate: Date.parse(this.maxDateValue),
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
    })
  }
}
