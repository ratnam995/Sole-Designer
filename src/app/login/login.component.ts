import { Component, OnInit } from '@angular/core';
// import { HttpService } from '../shared/services/http-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  public lEmail:string="";
  public lPass:string="";
  public lDisable:boolean= false;
  
  public sFullName:string="";
  public sEmail:string="";
  public sPass:string="";
  public sDisable:boolean= false;
  public signup:boolean= false;

  constructor(
    // private httpService :HttpService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onLoginButtonClick(){
    console.log("HERE====> (LOGIN)", this.lEmail, this.lPass);
    this.router.navigate(['editor']);
  }

  onRouteToSignUp(){
    this.signup=true;
  }

  onSignupButtonClick(){
    console.log("HERE====> (SIGNUP)", this.sFullName, this.sEmail, this.sPass);
  }

  onBackToLoginClick(){
    this.signup=false;
  }

}
