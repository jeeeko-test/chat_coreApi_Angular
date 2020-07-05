import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';

import { ChatService } from 'app/main/apps/chat/chat.service';
import { ContactsVm } from 'app/fake-db/ViewModels/contacts-vm';
import { MessageVm } from 'app/fake-db/ViewModels/message-vm';
import { SignalRService } from 'app/Services/signal-r.service';
import { ChatComponentsService } from 'app/Services/chat-components.service';
import { ChatComponent } from '../chat.component';

@Component({
    selector: 'chat-view',
    templateUrl: './chat-view.component.html',
    styleUrls: ['./chat-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewInit {
    user: any;
    chat: any;
    Body: any;
    contact: ContactsVm;
    replyInput: any;
    selectedChat: any;
    messages: any;
    @ViewChild(FusePerfectScrollbarDirective)
    directiveScroll: FusePerfectScrollbarDirective;

    @ViewChildren('replyInput')
    replyInputField;

    @ViewChild('replyForm')
    replyForm: NgForm;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService,
        private _SignalRService: SignalRService,
        private _CompService: ChatComponentsService,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        //this.user = this._chatService.user;
        this._chatService.onChatSelected
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(chatData => {
                //console.log("inside chat view :" + chatData[0].lastMessage);
                if (chatData) {
                    this.messages = chatData.conv;
                    this.contact = chatData.contactInfo;
                    // this.selectedChat = true;
                    // this.contact.contactID = chatData.senderId;
                    // this.Body = chatData.Body;
                    // this.contact.imageUrl = chatData.imageUrl;
                    // this.contact.lastMessage = chatData.lastMessage; 
                    this.readyToReply();
                }
            });
        // this._SignalRService.hubConnection.on("sendfront",(msg)=>{
        //     console.log("inside chat view: "+msg.body);

        //     this.messages.push(msg);
        //     this.readyToReply();

        // });
        this._SignalRService.receivedMessage.subscribe(c => {
            //console.log("inside chat view : " + c);
            if (this.messages != null) {
                this.messages.push(c);
                this.readyToReply();
            }
            if(this.contact!=null)
            this.contact.lastMessage = c.body;
            //this.contact.unread++;
        //console.log ("inside chat view unred count => "+this.contact.unread);
            //this._CompService.nextCount(this.contact.contactID);

        });
        this._SignalRService.sameUserMessageBetweenPanel_View.subscribe(m => {
            if (this.messages != null) {
                this.messages.push(m);

                this.readyToReply();
            }
            if(this.contact!=null)
            this.contact.lastMessage = m.body;

        })
       
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Decide whether to show or not the contact's avatar in the message row
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    shouldShowContactAvatar(senderId): boolean {
        return this.contact.contactID == senderId;
    }

    /**
     * Check if the given message is the first message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isFirstMessageOfGroup(message, i): boolean {
        return i === 0;
    }

    /**
     * Check if the given message is the last message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isLastMessageOfGroup(j, i): boolean {
        return i === j;
    }

    /**
     * Select contact
     */
    selectContact(): void {
        this._chatService.selectContact(this.contact);
    }

    /**
     * Ready to reply
     */
    readyToReply(): void {
        setTimeout(() => {
            this.focusReplyInput();
            this.scrollToBottom();
        });
    }

    /**
     * Focus to the reply input
     */
    focusReplyInput(): void {
        setTimeout(() => {
            this.replyInput.focus();
        });
    }

    /**
     * Scroll to the bottom
     *
     * @param {number} speed
     */
    scrollToBottom(speed?: number): void {
        speed = speed || 400;
        if (this.directiveScroll) {
            this.directiveScroll.update();

            setTimeout(() => {
                this.directiveScroll.scrollToBottom(0, speed);
            });
        }
    }

    /**
     * Reply
     */
    reply(event): void {
        event.preventDefault();

        if (!this.replyForm.form.value.message) {
            return;
        }

        // Message
        // const message = {
        //     senderId    : localStorage.getItem('userId'),
        //     message: this.replyForm.form.value.message,
        //     time   : new Date().toISOString()
        // };
        let messagex = new MessageVm();
        messagex.senderId = Number(localStorage.getItem('userId'));
        messagex.senderImgUrl = localStorage.getItem('imageUrl');
        messagex.body = this.replyForm.form.value.message;
        // Add the message to the chat
        // this.messages.push(messagex);
        this.contact.lastMessage = messagex.body;

        this._SignalRService.sameUserMessageBetweenPanel_View.next(messagex);
        this._SignalRService.hubConnection.invoke("send", messagex, this.contact.contactID);
        //console.log('contact id  :  ' + this.contact.contactID);
        //console.log('Message  :  ' + messagex.body);
        // Reset the reply form
        this.replyForm.reset();

        // Update the server
        this._chatService.updateDialog(this.contact.contactID, messagex.body).then(response => {
            this.readyToReply();
        });
    }
    resetCount(contact){
        //this._CompService.clearCount(contact.contactID);
    }
}
