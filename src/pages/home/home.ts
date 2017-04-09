import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Chart } from 'chart.js';
import { AlertController } from 'ionic-angular';
import { ToastController, PopoverController, ViewController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Vibration } from '@ionic-native/vibration';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    //charting canvas
    @ViewChild('doughnutCanvas') doughnutCanvas;
    doughnutChart: any;

    feedbackCount:any;

    public toggledResult: boolean;

    excellentCount:any;       
    goodsCount:any;
    averageCount:any;
    badCount:any;

    authenticationKeyToRemoveFeedbacks:any = "reset@01"
    stringExcellent="excellent";
    stringGood="good"; 
    stringAverage="average";
    stringNotGood="notgood";

    feedbackResponses:any = [];
    initialData=["excellent","good","average","notgood"];

     _toast:any;
     _alert:any;

    constructor(public navCtrl: NavController, public storage:Storage, public alertCtrl:AlertController,
                public toastCtrl:ToastController, public popoverCtrl:PopoverController,
                public tts:TextToSpeech, public vibration: Vibration) {

    storage.ready().then(() => {  
          
          this.storage.get('feedback').then((data) => {
            if(data != null){
                this.storage.get('feedback').then((data) => {
                this.feedbackResponses = data;
                this.calculateValues(); 
             });
            }else{
                console.log("feedbacks not found, putting initials");
                 this.storage.set('feedback', this.initialData);
            }
          })
      });
    }

    refreshData(){
      this.storage.get('feedback').then((data) => {
              this.feedbackResponses = data;
      });

      this.calculateValues();
    }

    calculateValues():any{

            if(this.feedbackResponses === 0){
                console.log(this.feedbackResponses);
                alert('Please provide feedback first')
            }
            else{
              this.excellentCount=this.feedbackResponses.reduce(function(n, val){
                return n + (val === "excellent");
              },0)
              this.averageCount=this.feedbackResponses.reduce(function(n, val){
                  return n + (val === "average");
              },0)
              this.goodsCount=this.feedbackResponses.reduce(function(n, val){
                  return n + (val === "good");
              },0)
              this.badCount=this.feedbackResponses.reduce(function(n, val){
                  return n + (val === "notgood");
              },0)
        }
    }

  feedback(feed:any){

        this.tts.speak('Thank You Have A Great Time')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
        
        this._alert = this.alertCtrl.create({
            title: "You're awesome ^_^",
            subTitle: 'Thank you for the valuable feedback!!',
            buttons: ["It's ok"]
         });
         this.vibration.vibrate(1000);
        this._alert.present();
        this.storage.get('feedback').then((data) => {
          if(data != null)
          {
            data.push(feed);
            this.storage.set('feedback', data);
          }
          else
          {
            let anotherFeed= [];
            anotherFeed.push(feed);
            this.storage.set('feedback', anotherFeed);
          }
        })      
     }

    showResult(){ 
       // this.toggledResult = true; //= this.toggledResult? false : true;
        this.refreshData()
        this.ionViewDidLoad();
    } 

    resetFeedback(){
            this.vibration.vibrate(500);
            this.tts.speak('Are you sure')
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));

            this._alert = this.alertCtrl.create({
            title: 'Are you sure?',
            message: 'Provide the password to reset feedbacks',
            inputs: [
            {
                name: 'password',
                placeholder: 'Password',
                type:'password'
            }
            ],
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                  console.log('Cancelled');
                }
            },
            {
                text: 'Confirm',
                handler: data => {
                  if(data.password == this.authenticationKeyToRemoveFeedbacks){
                    this.storage.remove('feedback');
                    this.storage.set('feedback', this.initialData);
                    
                    this.tts.speak('Thank You')
                    .then(() => console.log('Success'))
                    .catch((reason: any) => console.log(reason));
                        this._alert = this.alertCtrl.create({
                        title: "Great",
                        subTitle: 'All feedbacks are removed.',
                        buttons: ["Thanks"]
                    });
                    this._alert.present();
                    this.vibration.vibrate(500);
                  }else{
                           this._toast = this.toastCtrl.create({
                            message: 'Uh! not a valid password!',
                            duration: 2000,
                            position: 'bottom'
                        });
                        this._toast.present();
                        this.vibration.vibrate(500);
                      }
                    }
                  }
                ]
            });
            this._alert.present();                           
        }
        
    //charting
    ionViewDidLoad() { 
        if(this.excellentCount === undefined){
            this.excellentCount='';this.goodsCount='';this.averageCount='';this.badCount='';
        }
        this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
            type: 'pie',
            data: {
                labels: ['Excellent:'+this.excellentCount, "Good:"+this.goodsCount, "Average:"+this.averageCount, "Not Good:"+this.badCount],
                datasets: [{
                    label: '',
                    data: [this.excellentCount, this.goodsCount, this.averageCount, this.badCount],
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.8)',
                        'rgba(0, 204, 255, 0.8)',
                        'rgba(255, 251, 0, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    hoverBackgroundColor: [
                        "#FB2F2E",
                        "#32d6ff",
                        "#fffb00",
                        "#FFCE56"
                    ]
                }]
            }
        });
     }
    // calling the popover function from another class and Component realted to popover
      presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
        ev: myEvent
        });
    }
}

@Component({
template: `
    <ion-list>
    <button ion-item (click)="insomnia()">Keep Alive</button>
    <button ion-item (click)="share()">Share</button>
    <button ion-item (click)="close()">Reset Feedbacks</button>
    </ion-list>
`
})
export class PopoverPage   {

    counts: HomePage
    @ViewChild(HomePage) homePageObject: HomePage;
    

constructor(public viewCtrl: ViewController, private socialSharing: SocialSharing, 
            public toatCtrl:ToastController, private emailComposer: EmailComposer,
            public tts:TextToSpeech) {
}

close() {
    this.viewCtrl.dismiss();
}

insomnia(){
   
}

share(){
    this.socialSharing.share("Awesome!! In the recent session we got nice feedbacks from the attendees.","Feedback Report","","https://goo.gl/S0SmP8")
    .then(()=>{
        this.tts.speak('Thank You Ninja')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
        alert("Hey Ninja, Thank you ^_^")
    },
    () =>{
        alert("Uhh, some issues behind, retry please!!")
    })
  }
}