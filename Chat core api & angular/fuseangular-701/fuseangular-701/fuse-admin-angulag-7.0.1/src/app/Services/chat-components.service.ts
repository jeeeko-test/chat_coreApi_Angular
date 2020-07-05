import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { SignalRService } from './signal-r.service';

@Injectable({
  providedIn: 'root'
})
export class ChatComponentsService  {
public unreadCount:number;
public userUnread:any;
public unread:BehaviorSubject<any>;
  constructor( ) { 
    this.unreadCount=0;
    this.unread = new BehaviorSubject<any>(this.unreadCount);
  }
   
  nextCount(id){
     // console.log("inside chat component service unread count on next => " + this.unreadCount);
    this.unreadCount++;
    this.userUnread ={
      senderId :id,
      count:this.unreadCount
    }
    this.unread.next(this.userUnread);
  }
  clearCount(id){
    this.unreadCount=0;
    this.userUnread ={
      senderId :id,
      count:this.unreadCount
    }
    this.unread.next(this.userUnread);
    //console.log("inside clear count unread count => "+ this.unreadCount);
  }

  

  
}
