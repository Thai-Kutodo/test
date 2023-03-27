import { Controller } from '@hotwired/stimulus'
import { subscribe } from 'subscribe-ui-event'

export default class extends Controller {
  columnLeftTarget: HTMLElement
  columnRightTarget: HTMLElement
  columnLeftOffsetValue: number
  columnRightOffsetValue: number

  currentTop = 0
  initialTopOffset = 0
  lastY = window.screenY

  static targets = ['columnLeft', 'columnRight']

  static values = {
    columnLeftOffset: Number,
    columnRightOffset: Number,
  }

  connect(): void {
    this.initialTopOffset = 90 // header height

    subscribe(
      'scroll',
      () => {
        // set content position
        if (this.columnLeftTarget.offsetHeight < this.columnRightTarget.offsetHeight) {
          this.columnLeftTarget.classList.add('stickable')
          this.checkPosition(this.columnLeftTarget, this.columnLeftOffsetValue)
        } else {
          this.columnRightTarget.classList.add('stickable')
          this.checkPosition(this.columnRightTarget, this.columnRightOffsetValue)
        }
      },
      {
        throttleRate: 0,
        useRAF: true,
      }
    )

    //Load More
    this.loadMoreTags();
  }

  checkPosition(el: HTMLElement, offset: number) {
    const maxTop = this.initialTopOffset
    const minTop = -1 * (el.offsetHeight - window.innerHeight + offset)

    if (window.scrollY < this.lastY) {
      this.currentTop -= window.scrollY - this.lastY
    } else {
      this.currentTop += this.lastY - window.scrollY
    }

    this.currentTop = Math.min(maxTop, Math.max(this.currentTop, minTop))
    this.lastY = window.scrollY

    el.classList.add('stickable')
    el.style.top = `${this.currentTop}px`
  }

  loadMoreTags = () => {
      console.log("This iss finction loadmore tags...");
      const loadmore = this.columnRightTarget.querySelector<HTMLInputElement>('#loadmore');

      let currentItems = 5;

      if (!loadmore) return;
      
      loadmore.addEventListener('click', (e) => {
          const elementList = this.columnRightTarget.querySelectorAll<HTMLInputElement>('.stylebook-detail__tag-list ul li');
          console.log(elementList);

          for (let i = currentItems; i < currentItems + 5; i++) {
              if (elementList[i]) {
                  elementList[i].style.display = 'block';
              }
          }
          currentItems += 5;

          // Load more button will be hidden after list fully loaded
          if (currentItems >= elementList.length) {
            loadmore.style.display = 'none';
          }
      })
  }

}
