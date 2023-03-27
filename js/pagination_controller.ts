import { ActionEvent, Controller } from '@hotwired/stimulus'
import { initLazyload } from '../libs/lazyload'
export default class extends Controller {
  numberTargets: HTMLElement[]
  nextTarget: HTMLElement
  previousTarget: HTMLElement

  static targets = ['number', 'next', 'previous']

  initialize() {

  }

  processPagination(ev: ActionEvent) {
    ev.preventDefault();
    const itemPerPage = +this.element.getAttribute("data-item_per_page");
    const currentIndex = ev.params.index;
    const startItem = itemPerPage * (currentIndex - 1);
    const endItem = itemPerPage * currentIndex;

    this.displayItems(startItem, endItem, currentIndex);
    this.showNumberPage(currentIndex);
  }

  displayItems(startItem, endItem, index) {
    const parent = this.element.closest(".container");

    if (parent.querySelectorAll(".item-list > li")) {
      parent.querySelectorAll(".item-list > li").forEach((element, index) => {
        if (index >= startItem && index < endItem) {
          element.classList.remove("hidden");
        } else {
          element.classList.add("hidden");
        }
      });
    }
  }

  showNumberPage(index) {
    const totalPage = +this.element.getAttribute("data-total_page");
    const paginationDotFirst = this.element.querySelector('.pagination-dots-first');
    const paginationDotLast = this.element.querySelector('.pagination-dots-last');
    const nearEnd = totalPage - 3;
    const nearTop = 3;
    const parent = this.element.closest(".container");

    if (parent.querySelectorAll(".pagination__item")) {
      parent.querySelectorAll(".pagination__item").forEach(element => {
        element.classList.remove("pagination__item--active");
      });
    }

    this.numberTargets[index - 1].closest('.pagination__item').classList.add("pagination__item--active");

    this.numberTargets.forEach((element, index) => {
      if (!element.closest(".pagination__item").classList.contains("show-default") && !element.closest(".pagination__item").classList.contains("pagination__item--active")) {
        element.closest(".pagination__item").classList.add("hidden");
      }
    });

    if (paginationDotLast) {
      paginationDotLast.classList.add("hidden");
    }

    if (paginationDotFirst) {
      paginationDotFirst.classList.add("hidden");
    }

    if (index == 1) {
      //this is the case first page
      if (paginationDotLast) {
        paginationDotLast.classList.remove("hidden");
      }

      this.nextTarget.classList.remove("pagination__item--disabled");
      this.previousTarget.classList.add("pagination__item--disabled");
      this.hideItemsNumber(index, true)
    } else if (index == totalPage) {
      //this is the case last page
      if (paginationDotFirst) {
        paginationDotFirst.classList.remove("hidden");
      }

      this.previousTarget.classList.remove("pagination__item--disabled");
      this.nextTarget.classList.add("pagination__item--disabled");
      this.hideItemsNumber(index)
    } else if (index >= nearEnd) {
      //this is the case near the end
      if (paginationDotFirst && index > nearTop) {
        paginationDotFirst.classList.remove("hidden");
      }

      this.previousTarget.classList.remove("pagination__item--disabled");
      this.nextTarget.classList.remove("pagination__item--disabled");
      this.hideItemsNumber(totalPage);
      this.numberTargets[index - 2].closest('.pagination__item').classList.remove("hidden");
    } else if (index > 3 && index < nearEnd) {
      //this is the case on the middle
      if (paginationDotLast) {
        paginationDotLast.classList.remove("hidden");
      }

      if (paginationDotFirst) {
        paginationDotFirst.classList.remove("hidden");
      }

      this.previousTarget.classList.remove("pagination__item--disabled");
      this.nextTarget.classList.remove("pagination__item--disabled");
      this.numberTargets[index - 2].closest('.pagination__item').classList.remove("hidden");
      this.numberTargets[index].closest('.pagination__item').classList.remove("hidden");
    } else {
      //this is case near the top (index <= 3)
      if (paginationDotLast) {
        paginationDotLast.classList.remove("hidden");
      }

      this.numberTargets[1].closest('.pagination__item').classList.remove("hidden");
      this.numberTargets[2].closest('.pagination__item').classList.remove("hidden");
      this.numberTargets[3].closest('.pagination__item').classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hideItemsNumber(currentIndex, decrease = false) {
    const length = !decrease ? currentIndex : currentIndex + 3;
    const index = !decrease ? currentIndex - 4 : currentIndex;

    for (let i = index; i < length; i++) {
      if (this.numberTargets[i]) {
        this.numberTargets[i].closest('.pagination__item').classList.remove("hidden");
      }
    }
  }

  nextPagination(e) {
    e.preventDefault();

    const currentIndex = +this.element.querySelector(".pagination__item--active a").getAttribute("data-pagination-index-param") + 1;
    const itemPerPage = +this.element.getAttribute("data-item_per_page");
    const startItem = itemPerPage * (currentIndex - 1);
    const endItem = itemPerPage * currentIndex;
    const totalPage = +this.element.getAttribute("data-total_page");

    if (currentIndex == totalPage) {
      this.nextTarget.classList.add("pagination__item--disabled");
      this.previousTarget.classList.remove("pagination__item--disabled");
    } else {
      this.nextTarget.classList.remove("pagination__item--disabled");
      this.previousTarget.classList.remove("pagination__item--disabled");
    }

    this.displayItems(startItem, endItem, currentIndex);
    this.showNumberPage(currentIndex);
  }

  prevPagination(e) {
    e.preventDefault();
    const currentIndex = +this.element.querySelector(".pagination__item--active a").getAttribute("data-pagination-index-param") - 1;
    const itemPerPage = +this.element.getAttribute("data-item_per_page");
    const startItem = itemPerPage * (currentIndex - 1);
    const endItem = itemPerPage * currentIndex;

    if (currentIndex == 1) {
      this.nextTarget.classList.remove("pagination__item--disabled");
      this.previousTarget.classList.add("pagination__item--disabled");
    } else {
      this.nextTarget.classList.remove("pagination__item--disabled");
      this.previousTarget.classList.remove("pagination__item--disabled");
    }
    this.displayItems(startItem, endItem, currentIndex);
    this.showNumberPage(currentIndex);
  }
  clickPaginationAjax(e) {
    e.preventDefault();
    let defineHrefPage = e.currentTarget.getAttribute("href").replace('/search','');
    let defineParam = new URLSearchParams(defineHrefPage);
    let defineViewPageNumber = defineParam.get('page');
    let currentHandle = new URLSearchParams(window.location.search);
    let currentViewPage = currentHandle.get('view');
    let currentHandleNew;
    if(currentViewPage == 'filter-content'){
      currentHandle.set('page', defineViewPageNumber)
      currentHandleNew =  '/search?' + currentHandle.toString();
      history.pushState(null, null, currentHandleNew);
    }else{
      history.pushState(null, null, defineHrefPage );
      currentHandleNew = defineHrefPage;
    }
    fetch(currentHandleNew, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html'
      }
    })
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const dataHtml = parser.parseFromString(data, "text/html");
      const countItemText = dataHtml.getElementById('ProductCount').innerHTML;
      const dataListItem = dataHtml.querySelector('.product-list-result').innerHTML;
      document.querySelector('.product-list-result').innerHTML = dataListItem;
      document.getElementById('ProductCount').innerHTML = countItemText;
      initLazyload();
      document.querySelector('.search-list-line').scrollIntoView({
        behavior: 'smooth'
      });
    })
  }
}
