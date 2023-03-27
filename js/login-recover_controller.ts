import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  loginRecoverTarget: HTMLFormElement

  static targets = ['loginRecover']

  initialize(): void {
      let email = this.loginRecoverTarget.querySelector<HTMLInputElement>("#RecoverEmail");

      email.addEventListener('change', (e) => {
          let value = this.loginRecoverTarget.querySelector<HTMLInputElement>("#RecoverEmail").value;
          let emailAlphanumeric: RegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
          if(!emailAlphanumeric.test(value)){
            this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-match').style.display = 'inline-block';
            this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-empty').style.display = 'none';
            this.loginRecoverTarget.getAttribute('id') != '' ? this.loginRecoverTarget.setAttribute('id', "") : '';
          }else{
            this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-match').style.display = 'none';
            this.loginRecoverTarget.getAttribute('id') == '' ? this.loginRecoverTarget.setAttribute('id', 'recover_customer_password') : '';
          }
      })
     
      this.loginRecoverTarget.querySelector<HTMLButtonElement>('#btn-recover-success').addEventListener('click', (e) => {
         e.preventDefault();
         if(email.value == ''){
          this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-empty').style.display = 'inline-block';
          if(this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-error')) { 
            this.loginRecoverTarget.querySelector<HTMLElement>('#RecoverEmail-email-error').style.display = 'none'
          }
         }
      })
  }
  
}
