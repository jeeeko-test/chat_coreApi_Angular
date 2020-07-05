import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SignalRService } from 'app/Services/signal-r.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { ContactsVm } from 'app/fake-db/ViewModels/contacts-vm';
import { environment } from 'environments/environment';
import { MessageVm } from 'app/fake-db/ViewModels/message-vm';
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions } from '@aspnet/signalr'
import { ChatComponentsService } from 'app/Services/chat-components.service';
@Component({
    selector: 'chat-panel',
    templateUrl: './chat-panel.component.html',
    styleUrls: ['./chat-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatPanelComponent implements OnInit, AfterViewInit, OnDestroy {
    contacts: ContactsVm[];
    chat: MessageVm[];
    selectedContact: any;
    sidebarFolded: boolean;
    user: any;
    @ViewChild('replyForm')
    set replyForm(content: NgForm) {
        this._replyForm = content;
    }

    @ViewChild('replyInput')
    set replyInput(content: ElementRef) {
        this._replyInput = content;
    }

    @ViewChildren(FusePerfectScrollbarDirective)
    private _fusePerfectScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;

    // Private
    private _chatViewScrollbar: FusePerfectScrollbarDirective;
    private _replyForm: NgForm;
    private _replyInput: ElementRef;
    private _unsubscribeAll: Subject<any>;
    public count;
    //private hubConnection :HubConnection;
    /**
     * Constructor
     *
     * @param {ChatPanelService} _chatPanelService
     * @param {HttpClient} _httpClient
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _chatPanelService: ChatPanelService,
        private _httpClient: HttpClient,
        private _fuseSidebarService: FuseSidebarService,
        private _SignalRService: SignalRService,
        private _CompService: ChatComponentsService,
    ) {

        // Set the defaults
        this.selectedContact = null;
        this.sidebarFolded = true;
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        //this.chat = [];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Load the contacts
        this._chatPanelService.loadContacts().then(() => {

            this.contacts = this._chatPanelService.contacts;
            this.contacts.forEach(item => { item.imageUrl = `${environment.host}${item.imageUrl}`; item.unread = 0; });
            this.user = this._chatPanelService.user;

        });

        // Subscribe to the foldedChanged observable
        this._fuseSidebarService.getSidebar('chatPanel').foldedChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((folded) => {
                this.sidebarFolded = folded;
            });


        // this._SignalRService.hubConnection.on("sendfront",(msg)=>{
        //     console.log("inside chat panel: "+msg.body);

        //     this.chat.push(msg);
        //     this._prepareChatForReplies();

        // });

        // this._SignalRService.hubConnection.on("UserConnected",(userStatus)=>{

        // })
        // this.hubConnection.on("UserConnected",function(connectionId){
        //     this.selectedContact.connectionId=connectionId;
        //     console.log("Inside Signal R Service :" + connectionId );
        // });
        // this._SignalRService.receivedMessage.subscribe(c=>{
        //     this.chat.push(c);
        // })
        this._SignalRService.receivedMessage.subscribe(c => {
            //console.log("inside chat panel :  " + c);
            if (this.chat != null) {
                this.chat.push(c);

                this._prepareChatForReplies();
            }
            if(this.selectedContact !=null)
            this.selectedContact.lastMessage = c.body;
            let index = this.contacts.findIndex(u => u.contactID == c.senderId)
            //this.contacts[index].unread++;
            //this._CompService.nextCount(c.senderId);
            //console.log(this.contacts[index].unread);

        });
        this._SignalRService.sameUserMessageBetweenPanel_View.subscribe(m => {
            if (this.chat != null) {
                this.chat.push(m);

                this._prepareChatForReplies();
            }
            if(this.selectedContact!=null)
            this.selectedContact.lastMessage = m.body;

        });
        this._CompService.unread.subscribe(c => {
            if (this.contacts != undefined) {
                let index = this.contacts.findIndex(u => u.contactID == c.senderId);
                //console.log('contact index inside unread =>'+ c.senderId)
                if(index !=-1)
                this.contacts[index].unread = c.count;
                //console.log("inside chat panel unread count => "+c.count);
            }
        })
        this._SignalRService.connectedUserStatus.subscribe(status=>{
            this.contacts.forEach(element => {
                if(element.contactID == status.userId)
                element.status=status.state;
                console.log('Contacts => '+this.contacts);
            });
        })

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this._chatViewScrollbar = this._fusePerfectScrollbarDirectives.find((directive) => {
            return directive.elementRef.nativeElement.id === 'messages';
        });
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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Prepare the chat for the replies
     */
    private _prepareChatForReplies(): void {
        setTimeout(() => {

            // Focus to the reply input
            // this._replyInput.nativeElement.focus();

            // Scroll to the bottom of the messages list
            if (this._chatViewScrollbar) {
                this._chatViewScrollbar.update();

                setTimeout(() => {
                    this._chatViewScrollbar.scrollToBottom(0);
                });
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fold the temporarily unfolded sidebar back
     */
    foldSidebarTemporarily(): void {
        this._fuseSidebarService.getSidebar('chatPanel').foldTemporarily();
    }

    /**
     * Unfold the sidebar temporarily
     */
    unfoldSidebarTemporarily(): void {
        this._fuseSidebarService.getSidebar('chatPanel').unfoldTemporarily();
    }

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpen(): void {
        this._fuseSidebarService.getSidebar('chatPanel').toggleOpen();
    }

    /**
     * Decide whether to show or not the contact's avatar in the message row
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    shouldShowContactAvatar(message, i): boolean {

        return message.senderId == this.selectedContact.contactID;

    }

    /**
     * Check if the given message is the first message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isFirstMessageOfGroup(message, i): boolean {
        return (i === 0);
    }

    /**
     * Check if the given message is the last message of a group
     *
     * @param message
     * @param i
     * @returns {boolean}
     */
    isLastMessageOfGroup(cl, i): boolean {
        return (i === cl);
    }

    /**
     * Toggle chat with the contact
     *
     * @param contact
     */
    toggleChat(contact): void {



        // If the contact equals to the selectedContact,
        // that means we will deselect the contact and
        // unload the chat
        if (this.selectedContact && contact.contactID === this.selectedContact.contactID) {
            // Reset
            this.resetChat();
        }
        // Otherwise, we will select the contact, open
        // the sidebar and start the chat
        else {
            // Unfold the sidebar temporarily
            this.unfoldSidebarTemporarily();

            // Set the selected contact
            this.selectedContact = contact;

            // Load the chat
            this._chatPanelService.getChat(contact.contactID).then((chat) => {

                // Set the chat
                this.chat = chat;

                // Prepare the chat for the replies
                this._prepareChatForReplies();
            });
        }
    }

    /**
     * Remove the selected contact and unload the chat
     */
    resetChat(): void {
        // Set the selected contact as null
        this.selectedContact = null;

        // Set the chat as null
        this.chat = null;
    }

    /**
     * Reply
     */
    reply(event): void {
        event.preventDefault();

        if (!this._replyForm.form.value.message) {
            return;
        }

        // Message
        // const message = {
        //     who    : this.user.id,
        //     message: this._replyForm.form.value.message,
        //     time   : new Date().toISOString()
        // };
        //
        let messagex = new MessageVm();
        messagex.senderId = Number(localStorage.getItem('userId'));
        messagex.senderImgUrl = localStorage.getItem('imageUrl');
        messagex.body = this._replyForm.form.value.message;
        // Add the message to the chat
        // this.chat.push(messagex);
        this.selectedContact.lastMessage = messagex.body;

        this._SignalRService.sameUserMessageBetweenPanel_View.next(messagex);
        //const cId = this.selectedContact.connectionId;
        //console.log("this is the connection id before send"+this.selectedContact.connectionId);
        this._SignalRService.hubConnection.invoke("send", messagex, this.selectedContact.contactID);
        // Reset the reply form
        this._replyForm.reset();

        // Update the server
        this._chatPanelService.updateChat(this.selectedContact.contactID, messagex.body).then(response => {

            // Prepare the chat for the replies
            this._prepareChatForReplies();
        });
    }

    resetCount(contact){
        //console.log("this contact from focus => "+contact);
        this._CompService.clearCount(contact.contactID);
    }
}
