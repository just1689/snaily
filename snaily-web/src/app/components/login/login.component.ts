import {Component, OnInit} from '@angular/core';
import {UserState} from '../../model/state/userState';
import {Router} from '@angular/router';
import {RegisterService} from '../../services/register.service';
import {MessageRegisterRequestV1} from '../../model/register-request-v1';
import {MessageLoginRequestV1} from '../../model/login-request-v1';
import {LoginService} from '../../services/login.service';
import {WS} from '../../util/ws';

declare var Swal: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private registerReq: MessageRegisterRequestV1;
  private loginReq: MessageLoginRequestV1;

  private themeRegister = 'animated fadeIn';
  private themeLogin = 'animated fadeIn';

  constructor(private router: Router, private registerService: RegisterService, private loginService: LoginService) {
    this.registerReq = new MessageRegisterRequestV1();
    this.loginReq = new MessageLoginRequestV1();
  }

  ngOnInit() {
    this.amILoggedIn();
  }

  private amILoggedIn(): void {
    if (UserState.isLoggedIn()) {
      this.router.navigate(['./home']);
    }
  }

  public register() {
    this.themeRegister = 'animated fadeOut';

    this.registerService.post(this.registerReq
      , (result) => {

        if (result.ok === false) {
          Swal.fire({
            position: 'middle-end',
            type: 'error',
            title: 'Could not register',
            showConfirmButton: true,
          });
          this.flyIn();
          return;
        }

        Swal.fire({
          position: 'middle-end',
          type: 'success',
          title: 'Registered',
          showConfirmButton: false,
          timer: 1300
        });

      }, (error) => {
        Swal.fire({
          position: 'middle-end',
          type: 'error',
          title: 'System problem: Could not register',
          showConfirmButton: true,
        });
      });

  }

  public login() {

    this.flyOut();
    this.loginService.post(this.loginReq, (result) => {
      if (result.ok === true) {
        UserState.login();
        UserState.setMyKey(result.key);
        UserState.setMyID(result.id);

        WS.SetupFromScratch();


        Swal.fire({
          position: 'middle-end',
          type: 'success',
          title: 'Welcome',
          showConfirmButton: false,
          timer: 1300
        });


      } else {
        setTimeout(() => {
          this.flyIn();
        }, 1000);

        Swal.fire({
          position: 'middle-end',
          type: 'error',
          title: 'Incorrect email or password',
          showConfirmButton: true,
        });
      }

    }, (error) => {
      alert(error);
    });


    setTimeout(() => {
      this.amILoggedIn();
    }, 1000);

  }

  private flyOut() {
    this.themeRegister = 'animated fadeOut';
    this.themeLogin = 'animated fadeOut';

  }

  private flyIn() {
    this.themeRegister = 'animated fadeIn';
    this.themeLogin = 'animated fadeIn';

  }

}
