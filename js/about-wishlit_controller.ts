import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
	contentWishlistTarget: HTMLElement
    loadMoreWishlistTarget: HTMLElement

	static targets = ['contentWishlist', 'loadMoreWishlist']

	initialize(): void {
		this.loadMore();
	}

	loadMore(){
		const listBlogs = this.contentWishlistTarget.querySelectorAll<HTMLElement>('.about__card-list .about__card');
		let x = 6;
	
		this.showOnly(listBlogs, x);
		if(x >= listBlogs.length){
		  this.loadMoreWishlistTarget.style.display = 'none'      
		}else{
		  this.loadMoreWishlistTarget.style.display = 'block'
		}
		
		this.loadMoreWishlistTarget.querySelector<HTMLButtonElement>('.button').addEventListener('click', () => {
		  x = (x + 3 <= listBlogs.length) ? x + 3 : listBlogs.length;
		  this.showOnly(listBlogs, x);
		  if(x === listBlogs.length){
			this.loadMoreWishlistTarget.style.display = 'none'      
		  }else{
			this.loadMoreWishlistTarget.style.display = 'block'
		  }
		})
	  }
	
	 showOnly(nodeList: any, index: Number){
		for (let i = 0; i < nodeList.length; i++ ) {
		  i < index ? nodeList[i].setAttribute('data-loadmore', 'true') : nodeList[i].setAttribute('data-loadmore', 'false')
		}
	 }

}