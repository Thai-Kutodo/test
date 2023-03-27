import { ActionEvent, Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'
import { initLazyload } from '../libs/lazyload'
export default class extends Controller {
  tabTargets: HTMLInputElement[]
  contentTargets: HTMLElement[]
  hashEnabledValue: boolean
  static targets = ['tab', 'content']
  currentIndex = 0

  static values = {
    hashEnabled: {
      type: Boolean,
      default: true,
    },
  }
  
  initialize(): void {
    let currentLocation = window.location;
    let getTag = new URL(currentLocation.toString()).searchParams;
    let tagSearch = getTag.get('view');
    let getKeySearch = getTag.get('q');
    let getKeyGift = getTag.getAll('filter.p.m.custom.gift_product');
    let getKeyItem = getTag.getAll('filter.p.m.custom.item');
    let getKeyGender = getTag.getAll('filter.p.m.custom.gender');
    let getKeyStock = getTag.getAll('filter.v.availability');
    let getKeyCateGory = getTag.getAll('filter.p.m.custom.category');
    let getKeySize = getTag.getAll('filter.v.option.サイズ');
    let getKeyPriceMin = getTag.getAll('filter.v.price.gte');
    let getKeyPriceMax = getTag.getAll('filter.v.price.lte');
    let queryKeySearch = '';
    let getKeySizeConvert = [];
    getKeySize.forEach((val) => {
      if (val.charAt(0) == '0'){
        val =  val.substring(1,3);
      }
      getKeySizeConvert.push(val);
    });
    if(getKeyGift.length > 0){
      queryKeySearch = '#GIFT/¥' + getKeyPriceMin + '~¥' + getKeyPriceMax;
      if(getKeyCateGory.length > 0){
        queryKeySearch = queryKeySearch + '/' + getKeyCateGory
      }
      const inputElement = document.querySelector('.search-form-input') as HTMLInputElement;
      inputElement.value = queryKeySearch;
    }else{
      if(getKeyItem.length > 0){
        queryKeySearch = getKeyItem + ',';
      }
      if(getKeySearch != '*'){
        queryKeySearch = queryKeySearch + getKeySearch;
      }
      if(getKeyCateGory.length > 0){
        queryKeySearch = queryKeySearch + ',' + getKeyCateGory
      }
      if(getKeySizeConvert.length > 0){
        queryKeySearch = queryKeySearch + ',' + getKeySizeConvert
      }
      if(queryKeySearch.charAt(0) == ','){
        queryKeySearch = queryKeySearch.substring(1);
      }
      if( queryKeySearch.substring(queryKeySearch.length - 1) == ','){
        queryKeySearch = queryKeySearch.substring(0, queryKeySearch.length - 1);
      }

      if(tagSearch != 'filter-content' && queryKeySearch != 'null'){
        const inputElement = document.querySelector('.search-form-input') as HTMLInputElement;
        inputElement.value = queryKeySearch.replace(',,', ',');
      }
    }
    if(tagSearch !== null){
      if (window.location.hash && this.hashEnabledValue) {
        const hash = window.location.hash.split('#')[1].toUpperCase()
        const index = this.tabTargets.findIndex((target) => target.value === hash)
  
        if (index >= 0) {
          this.contentTargets[index].style.display = 'block'
          this.tabTargets[index].checked = true
          this.currentIndex = index
        }
      } else {
        this.contentTargets[0].style.display = 'block'
        this.tabTargets[0].checked = true
  
        window.addEventListener('unload', () => {
          this.tabTargets[0].checked = true
        })
      }
    }else{
      if(getKeyGender !== null){
        const getValListGender = document.querySelectorAll<HTMLInputElement>(".name-gender");
        for(let i = 0; i < getValListGender.length; i++) {
          if(getValListGender[i].value === getKeyGender.toString()){
            getValListGender[i].checked = true; 
          }
        }
      }
      if(getKeyStock !== null && getKeyStock.toString() == '1'){
        const getValInputStock = document.querySelector<HTMLInputElement>(".name-stock");
        getValInputStock.checked = true;
      }
    }

    if (tagSearch == 'filter-content') {
      
      const queryFilterTopic = `/search?view=topic&q=${getKeySearch.replace('#','hashtag_')}&type=article`;
      console.log(queryFilterTopic);
      fetch(queryFilterTopic, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const dataHtml = parser.parseFromString(data, "text/html");
        const checkEmpty = dataHtml.querySelector('.article-empty');
        if(checkEmpty){
          document.getElementById('item-topic--result').innerHTML = checkEmpty.innerHTML;
        }else{
          document.getElementById('item-topic--result').innerHTML = data;
        }
        initLazyload(); 
      });

      const queryFilterNews = `/search?view=news&q=${getKeySearch.replace('#','hashtag_')}&type=article`;
      console.log(queryFilterNews);
      fetch(queryFilterNews, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const dataHtml = parser.parseFromString(data, "text/html");
        const checkEmpty = dataHtml.querySelector('.article-empty');
        if(checkEmpty){
          document.getElementById('item-news--result').innerHTML = checkEmpty.innerHTML;
        }else{
          document.getElementById('item-news--result').innerHTML = data;
        }
      });
    }  
  }

  switch(ev: ActionEvent) {
    let toShowTarget
    let toHideTarget
    let currentHandle = new URLSearchParams(window.location.search);
    this.currentIndex = ev.params.index

    const tl = gsap.timeline()

    tl.to(toHideTarget, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
      onComplete: () => {
        toHideTarget.style.setProperty('display', 'none')
      },
    }).to(toShowTarget, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
      onStart: () => {
        toShowTarget.style.setProperty('display', 'block')
      },
    })
    if(this.currentIndex != 0){
      currentHandle.set('type','article');
      currentHandle.delete('page');
      const updateHandle = 'search?' + currentHandle;
      if(this.currentIndex === 1){
        history.pushState(null, null, updateHandle.toString() + '#topic');
      }else{
        history.pushState(null, null, updateHandle.toString() + '#news');
      }
      location.reload();
    }else{
      currentHandle.set('type','product');
      currentHandle.delete('page');
      const updateHandle = 'search?' + currentHandle;
      window.location.href = updateHandle.toString();
    }
  }

}
