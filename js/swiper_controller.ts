import { isPc } from './../utils/index'
import { ActionEvent, Controller } from '@hotwired/stimulus'

import Swiper, { Navigation, Pagination } from 'swiper'

import { subscribe } from 'subscribe-ui-event'

export default class extends Controller {
  swiper: Swiper | null = null
  carouselTarget: HTMLDivElement
  responsiveValue: boolean

  static targets = ['carousel']

  static values = {
    responsive: {
      type: Boolean,
      default: true,
    },
  }

  initialize(): void {
    subscribe(
      'resize',
      () => {
        if (this.responsiveValue && !isPc() && this.swiper !== null) {
          this.swiper.destroy(true, true)
          this.swiper = null
        } else if (isPc() && this.swiper === null) {
          this.initSwiper()
        }
      },
      {
        useRAF: true,
      }
    )
  }

  connect(): void {
    if (!this.responsiveValue || isPc()) this.initSwiper()
  }

  disconnect(): void {
    if (!this.swiper) this.swiper.destroy(true, true)
  }

  initSwiper() {
    this.swiper = new Swiper(this.carouselTarget, {
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      spaceBetween: 12,
    })
  }
}
