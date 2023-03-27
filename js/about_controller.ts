import { transitionDurationEnter, transitionDurationLeave } from '../utils/index'
import { Controller } from '@hotwired/stimulus'
import { slideDown, slideUp } from '../utils'
import gsap, { Power1, Power2, Power3, Power4, Expo } from 'gsap'

export default class extends Controller {
  contentATarget: HTMLDivElement
  contentBTarget: HTMLDivElement
  currentTarget: HTMLDivElement
  filterTagTarget: HTMLElement
  buttonFilterTarget: HTMLElement

  static targets = ['contentA', 'contentB', 'filterTag', 'buttonFilter']

  initialize(): void {
    this.currentTarget = this.contentATarget
    this.loadMore()
  }

  check() {
    const toShowTarget = this.currentTarget === this.contentATarget ? this.contentBTarget : this.contentATarget
    const toHideTarget = this.currentTarget === this.contentATarget ? this.contentATarget : this.contentBTarget
    this.switch(toShowTarget, toHideTarget)
    this.currentTarget = toShowTarget
    this.filter()
    this.loadMore()
  }

  filter(){
    const listBogs = this.currentTarget.querySelectorAll<HTMLElement>('.about__card-list .about__card');
    const tags = this.filterTagTarget.querySelectorAll<HTMLInputElement>('.filter-item input[type="checkbox"]');

    let valueFilters = [];
    
     // get value category
    for (const tagItem of tags) {
      if (tagItem.checked) {
        valueFilters['any'] = valueFilters.push(tagItem.value);
        valueFilters = valueFilters.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
      }else{
        let index = valueFilters.indexOf(tagItem.value);
        if (index !== -1) {
          valueFilters.splice(index,1);
        }
      }
    }

    //Filter the tag of blog
    if(valueFilters.length > 0) {
      for(const blog of listBogs){
        if(blog.dataset.tag){
            blog.setAttribute('data-show','true')
            let tagsItem = blog.dataset.tag.split(',');
            tagsItem = tagsItem.map(function (el) {
              return el.trim();
            });
            let status = valueFilters.some(ele => tagsItem.includes(ele));
            if(!status) {
                blog.setAttribute('data-show','false')
            }
        }else{
          blog.setAttribute('data-show','true')
        }
      }
    }else{
      for(const blog of listBogs){
        blog.setAttribute('data-show','true')
      }
    }

  }

  loadMore(){
    const listBlogs = this.currentTarget.querySelectorAll<HTMLElement>('.about__card-list .about__card[data-show="true"]');
    let x = 6;

    this.showOnly(listBlogs, x);
    if(x >= listBlogs.length){
      this.buttonFilterTarget.style.display = 'none'      
    }else{
      this.buttonFilterTarget.style.display = 'block'
    }
    
    this.buttonFilterTarget.querySelector<HTMLButtonElement>('.button').addEventListener('click', () => {
      x = (x + 3 <= listBlogs.length) ? x + 3 : listBlogs.length;
      this.showOnly(listBlogs, x);
      if(x === listBlogs.length){
        this.buttonFilterTarget.style.display = 'none'      
      }else{
        this.buttonFilterTarget.style.display = 'block'
      }
    })
  }

 showOnly(nodeList: any, index: Number){
    for (let i = 0; i < nodeList.length; i++ ) {
      i < index ? nodeList[i].setAttribute('data-loadmore', 'true') : nodeList[i].setAttribute('data-loadmore', 'false')
    }
 }

  switch(toShowTarget: HTMLElement, toHideTarget: HTMLElement) {
    const tl = gsap.timeline()

    tl.to(toHideTarget, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
      onComplete: () => {},
    }).to(toShowTarget, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
      onStart: () => {
        toShowTarget.style.setProperty('display', 'block')
      },
      onComplete: () => {
        toHideTarget.style.setProperty('display', 'none')
      },
    })
  }
}
