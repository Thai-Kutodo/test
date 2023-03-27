import { isPc } from './../utils/index'
import { ActionEvent, Controller } from '@hotwired/stimulus'

import Swiper, { Navigation, Pagination } from 'swiper'

// @ts-ignore
import PhotoSwipe from 'photoswipe'
import { subscribe } from 'subscribe-ui-event'

export default class extends Controller {
  swiper: Swiper | null = null
  dataSource = []

  imageListTarget: HTMLUListElement

  static targets = ['imageList']

  currentIndexValue: number

  static values = {
    currentIndex: Number,
  }

  initialize(): void {
    subscribe(
      'resize',
      () => {
        if (isPc() && this.swiper !== null) {
          this.swiper.destroy(true, true)
          this.swiper = null
        } else if (!isPc() && this.swiper === null) {
          this.initSwiper()
        }
      },
      {
        useRAF: true,
      }
    )

    for (let child of this.imageListTarget.children) {
      if (child instanceof HTMLElement) {
        this.dataSource.push({
          src: child.dataset.pswpSrc,
          width: child.dataset.pswpWidth,
          height: child.dataset.pswpHeight,
        })
      }
    }
  }

  connect(): void {
    if (!isPc()) this.initSwiper()
  }

  disconnect(): void {
    if (!this.swiper) this.swiper.destroy(true, true)
  }

  initSwiper() {
    this.swiper = new Swiper(this.element as HTMLElement, {
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      on: {
        slideChange: (swiper) => {
          this.currentIndexValue = swiper.activeIndex
        },
      },
    })
  }

  initPhotoSwipe(index: number) {
    const pswp = new PhotoSwipe({
      arrowNextSVG: arrowNextSvg,
      arrowPrevSVG: arrowPrevSvg,
      closeSVG: closeSvg,
      bgOpacity: 1,
      closeOnVerticalDrag: false,
      counter: false,
      loop: false,
      zoom: false,
      dataSource: this.dataSource,
      index,
      // showAnimationDuration: 500,
      // hideAnimationDuration: 500,
      closeTitle: '閉じる',
      zoomTitle: '拡大する',
      arrowPrevTitle: '前に戻る',
      arrowNextTitle: '次に進む',
    })

    // pswp.addFilter('thumbEl', (thumbEl) => {
    //   const el = this.imageListTarget.querySelector(`li:nth-of-type(${index + 1})`)
    //   if (el) return el
    //   return thumbEl
    // })

    // pswp.addFilter('placeholderSrc', (placeholderSrc) => {
    //   const el = this.imageListTarget.querySelector<HTMLImageElement>(`li:nth-of-type(${index + 1}) img`)
    //   if (el) return el.src
    //   return placeholderSrc
    // })

    pswp.init()

    // https://photoswipe.com/adding-ui-elements/#adding-navigation-indicator-bullets
    pswp.ui.registerElement({
      name: 'bulletsIndicator',
      className: 'pswp__bullets-indicator',
      appendTo: 'wrapper',
      onInit: (el, pswp) => {
        const bullets = []
        let bullet
        let prevIndex = index

        for (let i = 0; i < pswp.getNumItems(); i++) {
          bullet = document.createElement('div')
          bullet.className = i === index ? 'pswp__bullet pswp__bullet--active' : 'pswp__bullet'
          bullet.onclick = (e) => {
            pswp.goTo(bullets.indexOf(e.target))
          }
          el.appendChild(bullet)
          bullets.push(bullet)
        }

        pswp.on('change', (a) => {
          if (prevIndex >= 0) {
            bullets[prevIndex].classList.remove('pswp__bullet--active')
          }
          bullets[pswp.currIndex].classList.add('pswp__bullet--active')
          prevIndex = pswp.currIndex

          this.currentIndexValue = pswp.currIndex
        })
      },
    })
  }

  // ignoring on sp
  onClickImage(ev: ActionEvent) {
    if (!isPc()) return

    if (ev.currentTarget instanceof HTMLElement && this.dataSource.length > 0) {
      const dataSrc = ev.currentTarget.dataset.pswpSrc
      const i = this.dataSource.findIndex((data) => data.src === dataSrc)
      if (i >= 0) this.initPhotoSwipe(i)
    }
  }

  // ignoring on pc
  onClickZoomButton() {
    if (isPc()) return
    this.initPhotoSwipe(this.currentIndexValue)
  }

  currentIndexValueChanged() {
    if (this.swiper !== null) {
      this.swiper.slideTo(this.currentIndexValue, 0)
    }
  }
}

const closeSvg =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 17L9 9M9 9L17 1M9 9L1 17M9 9L1 1" stroke="#555555" stroke-opacity="0.5" stroke-width="2"/></svg>'

const arrowPrevSvg =
  '<svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9L1.29289 9.70711L0.585787 9L1.29289 8.29289L2 9ZM10.7071 1.70711L2.70711 9.70711L1.29289 8.29289L9.29289 0.292893L10.7071 1.70711ZM2.70711 8.29289L10.7071 16.2929L9.29289 17.7071L1.29289 9.70711L2.70711 8.29289Z" fill="#555555" fill-opacity="0.5"/></svg>'

const arrowNextSvg =
  '<svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9L9.70711 9.70711L10.4142 9L9.70711 8.29289L9 9ZM0.292893 1.70711L8.29289 9.70711L9.70711 8.29289L1.70711 0.292893L0.292893 1.70711ZM8.29289 8.29289L0.292893 16.2929L1.70711 17.7071L9.70711 9.70711L8.29289 8.29289Z" fill="#555555" fill-opacity="0.5"/></svg>'
