import { Controller } from '@hotwired/stimulus'
import { initLazyload } from '../libs/lazyload'
import { subscribe } from 'subscribe-ui-event'
let url_type_search = '';
export default class extends Controller {
  initialize(): void {
    const tags = this.element.querySelectorAll('li')
    let tagWidth = 0
    tags.forEach((tag) => (tagWidth += tag.scrollWidth))
    tagWidth += (tags.length - 1) * 4 // gap

    if (tagWidth > Math.min(1425, window.innerWidth * 0.79166667)) {
      this.element.classList.add('is-overflow')
    }

    subscribe(
      'resize',
      () => {
        if (tagWidth > Math.min(1425, window.innerWidth * 0.79166667)) {
          this.element.classList.add('is-overflow')
        } else {
          this.element.classList.remove('is-overflow')
        }
      },
      {
        useRAF: true,
      }
    )
  }
  renderDataItem(string,type){
    if(string.charAt(0) == '&' || string.charAt(0) == '?'){
      string = string.substring(1);
    }
    let defineHrefPage  = type + '?' + string;
    history.pushState(null, null, defineHrefPage);
    fetch(defineHrefPage, {
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
    })
  }

  clickSubcategory(event){
    let currentHandle = new URLSearchParams(window.location.search);
    currentHandle.delete('page');
    let currentHandleTxt = currentHandle.toString();
    let getType = event.target.getAttribute('data-type');

    let url_filter = '';
    let checkSizeChecked = document.querySelectorAll<HTMLInputElement>('.js-input-subcategory:checked');
    let getValArray = [...checkSizeChecked].map(e => e.value);  
    let getValSize = checkSizeChecked.length;
    let connectChar = '';
      for(var i = 0;i<getValSize;i++) {
        if(getValSize > 1 && i > 0){
          connectChar = '&';
        }
        url_filter += connectChar + 'filter.p.tag=' + getValArray[i];
     }     
     currentHandle.delete('filter.p.tag');
     currentHandleTxt = currentHandle.toString();
     if(currentHandleTxt.includes("filter")){
       url_filter = currentHandleTxt + '&' +  url_filter;
     }
    if(getType.includes("collections")){
      url_type_search = getType;
    }
    this.renderDataItem(url_filter,url_type_search);
  }
}
