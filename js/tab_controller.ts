import { ActionEvent, Controller } from '@hotwired/stimulus'

export default class extends Controller {
  tabTargets: HTMLElement[]
  contentTargets: HTMLElement[]

  static targets = ['tab', 'content']

  switch(ev: ActionEvent) {
    let checkboxList = document.querySelectorAll<HTMLInputElement>(".js-input-size");
    let checkboxListCategory = document.querySelectorAll<HTMLInputElement>(".checkbox-category");
    let getValListSize = document.querySelectorAll<HTMLInputElement>(".filter-category-item");
    for(let i = 0; i < checkboxList.length; i++) {
      checkboxList[i].checked = false; 
    } 
    for(let i = 0; i < checkboxListCategory.length; i++) {
      checkboxListCategory[i].checked = false; 
      getValListSize[i].classList.remove("no-active")
    }
    this.tabTargets.forEach((tab, i) => {
      if (i === ev.params.index) {
        tab.classList.add('tab__item--active')
      } else {
        tab.classList.remove('tab__item--active')
      }
    })

    this.contentTargets.forEach((target, i) => {
      if (i === ev.params.index) {
        target.classList.add('tab__content--active')
      } else {
        target.classList.remove('tab__content--active')
      }
    })
  }
}
