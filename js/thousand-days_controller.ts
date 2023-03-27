import { Controller } from '@hotwired/stimulus'
import { transitionDurationEnter } from '../utils'
import gsap, { Power3, Expo } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default class extends Controller {
  rulerTarget: HTMLElement
  yearSelectTarget: HTMLSelectElement
  monthSelectTarget: HTMLSelectElement
  daySelectTarget: HTMLSelectElement
  counterTarget: HTMLElement
  date730DaysAgo: Date = new Date(new Date().getTime() - 730 * 24 * 60 * 60 * 1000)
  date270DaysLater: Date = new Date(new Date().getTime() + 270 * 24 * 60 * 60 * 1000)
  dayPositions: { days: number; y: number }[] = []
  lastHeight = 0

  static targets = ['ruler', 'yearSelect', 'monthSelect', 'daySelect', 'counter']

  initialize(): void {
    this.setupScrollTrigger()

    this.setupYears()
    this.setupMonths()
    this.setupDays()

    this.element.querySelectorAll('[data-days]').forEach((el: HTMLElement) => {
      this.dayPositions.push({
        days: parseInt(el.dataset.days),
        y: el.getBoundingClientRect().top + window.pageYOffset - 60,
      })
    })
  }

  setupScrollTrigger() {
    gsap.set('.thousand-days-timeline__container:not(:first-of-type)', {
      autoAlpha: 0,
    })
    gsap.set('.thousand-days-timeline__image-column .thousand-days-timeline__image', {
      autoAlpha: 0,
    })

    ScrollTrigger.batch('.thousand-days-timeline__container:not(:first-of-type)', {
      onEnter: (batch) => {
        const currEl = batch[batch.length - 1]
        if (currEl instanceof HTMLElement) {
          const bodyContainerEl = currEl.querySelector('.thousand-days-timeline__body-container') as HTMLElement
          gsap.to(this.rulerTarget, {
            height: bodyContainerEl.offsetTop + 4,
            ease: Power3.easeOut,
            duration: 0.8,
          })
          gsap.to(batch, {
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.4,
          })
        }
      },
      start: 'top bottom-=25%',
    })

    ScrollTrigger.batch('.thousand-days-timeline__image-column .thousand-days-timeline__image', {
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          duration: 0.6,
          delay: 0.4,
        })
      },
      start: 'top bottom-=25%',
    })
  }

  onChangeYearSelect() {
    this.setupMonths()
    this.setupDays()
  }

  onChangeMonthSelect() {
    this.setupDays()
  }

  setupYears(): void {
    for (let year = this.date730DaysAgo.getFullYear(); year <= this.date270DaysLater.getFullYear(); year++) {
      const opt = document.createElement('option')
      opt.value = year.toString()
      opt.text = year.toString()
      if (year === new Date().getFullYear()) {
        opt.selected = true
      }
      this.yearSelectTarget.add(opt, null)
    }
  }

  setupMonths() {
    // reset
    this.monthSelectTarget.innerHTML = ''

    const selectedYear = this.yearSelectTarget.value
    let startMonth = 1
    let endMonth = 12

    if (selectedYear === this.date730DaysAgo.getFullYear().toString()) {
      startMonth = this.date730DaysAgo.getMonth() + 1
    } else if (selectedYear === this.date270DaysLater.getFullYear().toString()) {
      endMonth = this.date270DaysLater.getMonth() + 1
    }

    for (let month = startMonth; month <= endMonth; month++) {
      const opt = document.createElement('option')
      opt.value = month.toString()
      opt.text = month.toString()
      this.monthSelectTarget.add(opt, null)
    }
  }

  setupDays() {
    // reset
    this.daySelectTarget.innerHTML = ''

    const selectedYear = this.yearSelectTarget.value
    const selectedMonth = this.monthSelectTarget.value
    let startDay = 1
    let endDay = this.days(selectedYear, selectedMonth)

    if (
      selectedYear === this.date730DaysAgo.getFullYear().toString() &&
      selectedMonth === (this.date730DaysAgo.getMonth() + 1).toString()
    ) {
      startDay = this.date730DaysAgo.getDate()
    } else if (
      selectedYear === this.date270DaysLater.getFullYear().toString() &&
      selectedMonth === (this.date270DaysLater.getMonth() + 1).toString()
    ) {
      endDay = this.date270DaysLater.getDate()
    }

    for (let day = startDay; day <= endDay; day++) {
      const opt = document.createElement('option')
      opt.value = day.toString()
      opt.text = day.toString()
      this.daySelectTarget.add(opt, null)
    }
  }

  count() {
    const selectedDate = new Date(
      parseInt(this.yearSelectTarget.value),
      parseInt(this.monthSelectTarget.value) - 1,
      parseInt(this.daySelectTarget.value)
    )
    const current = new Date()
    const today = new Date(current.getFullYear(), current.getMonth(), current.getDate())
    const diff = Math.floor((selectedDate.getTime() - today.getTime()) / 86400000)
    this.counterTarget.textContent = (270 - diff).toString()
  }

  scroll() {
    if (this.counterTarget.textContent === '___') return
    const count = parseInt(this.counterTarget.textContent)
    for (let i = 0; i < this.dayPositions.length - 1; i++) {
      const el1 = this.dayPositions[i]
      const el2 = this.dayPositions[i + 1]
      const offset = window.innerHeight / 2 - document.querySelector('.header').clientHeight

      if (el1.days <= count && el2.days >= count) {
        const percent = (count - el1.days) / (el2.days - el1.days)
        gsap.to(window, {
          duration: 2,
          ease: Power3.easeOut,
          scrollTo: el1.y + (el2.y - el1.y) * percent - offset,
        })
        return
      }
    }
  }

  days(year, month) {
    return new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate()
  }
}
