import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  loginTarget: HTMLDivElement

  static targets = ['login']

  open() {
    this.loginTarget.classList.add('show')
    document.body.classList.add('is-presenting-modal')
    //clicking register sets page in local storage to return to after activating account
    document.getElementById("register-button").addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.setItem("previous_page", window.location.href);
      window.location.href = "/account/register?view=terms";
    })
  }

  close() {
    this.loginTarget.classList.remove('show')
    document.body.classList.remove('is-presenting-modal')
    this.loginTarget.querySelector('a[data-before-checkout]').classList.add('hidden');

    this.loginTarget.querySelectorAll('.modal__caption').forEach(element => {
      element.classList.add('hidden');
    });
  }
}
