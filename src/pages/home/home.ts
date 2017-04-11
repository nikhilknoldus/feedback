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
import { Screenshot } from '@ionic-native/screenshot';



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
     _dateTime:any;

    constructor(public navCtrl: NavController, public storage:Storage, public alertCtrl:AlertController,
                public toastCtrl:ToastController, public popoverCtrl:PopoverController,
                public tts:TextToSpeech, public vibration: Vibration, public scrnshot: Screenshot) {

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
        this.ionViewDidLoad();      
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

//This is commented due the issue with this plugin, it cann't click the canvas & its elements on that.
    // screenshot(){
    //     this._dateTime= new Date();
    //     this.scrnshot.save('jpg', 100, 'feedback_'+this._dateTime).then(() =>{
    //     this.tts.speak('Done');
    //     this._toast = this.toastCtrl.create({
    //         message: 'Screenshot saved!!, check your gallery',
    //         duration: 4000,
    //         position: 'top'
    //     });
    //     this._toast.present(); 
    //  },
    //  () => {
    //     alert("uhh!! some issue here, try later")
    //  })
    // }
    resetFeedback(){
            this.vibration.vibrate(300);
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
                    this.vibration.vibrate(300);
                  }else{
                           this._toast = this.toastCtrl.create({
                            message: 'Uh! not a valid password!',
                            duration: 2000,
                            position: 'bottom'
                        });
                        this._toast.present();
                        this.vibration.vibrate(300);
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
                labels: ['Excellent', "Good", "Average", "Not Good"],
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
        <button ion-item (click)="share()">Share</button>
        <button ion-item (click)="emailStats()">Email Stats</button> 
        <button ion-item (click)="support()">Support/ Help</button>
    </ion-list>
`
})
export class PopoverPage   {

   _date:any;
   feedbackResponses:any=[];
   initialData=["excellent","good","average","notgood"];

    excellentCount:any;averageCount:any; goodsCount:any; badCount:any;

constructor(public viewCtrl: ViewController, private socialSharing: SocialSharing, 
            public toatCtrl:ToastController, private emailComposer: EmailComposer,
            public tts:TextToSpeech, public scrshot:Screenshot, public storage : Storage) {
        
        //when the user will click options, fetch data from storage and do calculations.
            storage.ready().then(() => {  
                this.storage.get('feedback').then((data) => {
                    if(data != null){
                        this.storage.get('feedback').then((data) => {
                        this.feedbackResponses = data;
                    });
                    }else{
                        console.log("feedbacks not found, putting initials");
                        this.storage.set('feedback', this.initialData);
                    }
                })
            });
    }

close() {
    this.viewCtrl.dismiss();
}


 calculateFeedbacks():any{
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

emailStats(){
    this._date=new Date();
    this.calculateFeedbacks();

// Check if sharing via email is supported
    this.socialSharing.canShareViaEmail().then(() => {
        this.socialSharing.shareViaEmail('Statistics of Meetup/ Session: Excellent: '+this.excellentCount+' -Good: '+this.goodsCount+' -Average: '+this.averageCount+' -Not Good: '+this.badCount, 'Feedback For Session :dated: '+this._date, ['']).then(() => {
        }).catch(() => {
            alert("Uh!! Seems like some issues right now, please try later");
            });
        }).catch(() => {
        alert("Ohh!! Email client is not configured in your device");
    });
      this.viewCtrl.dismiss();
}


support(){
    this._date=new Date();
    this.calculateFeedbacks();

// Check if sharing via email is supported
    this.socialSharing.canShareViaEmail().then(() => {
        this.socialSharing.shareViaEmail('Hi Feedback App, ... your message', 'Issue(s) :Dated: '+this._date, ['ignitesofthelp@gmail.com']).then(() => {
        }).catch(() => {
            alert("Uh!! Seems like some issues right now, please try later");
            });
        }).catch(() => {
        alert("Ohh!! Email client is not configured in your device");
    });
      this.viewCtrl.dismiss();
}

share(){
    this.socialSharing.share("Awesome!! In the recent session we got nice feedbacks from the attendees using this cool app","Feedback Report","","https://goo.gl/x0MKWu")
    .then(()=>{
        this.tts.speak('Thank You Ninja')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
        alert("Hey Ninja, Thank you ^_^")
    },
    () =>{
       alert("Uhh, some issues behind, retry please!!")
    })
      this.viewCtrl.dismiss();
  }
}

