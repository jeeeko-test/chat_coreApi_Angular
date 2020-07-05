import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { ObservableMedia } from "@angular/flex-layout";
import { Subject, BehaviorSubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { fuseAnimations } from "@fuse/animations";
import { FuseMatSidenavHelperService } from "@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service";

import { ChatService } from "app/main/apps/chat/chat.service";
import { environment } from "environments/environment";
import { MessageVm } from "app/fake-db/ViewModels/message-vm";
import { ContactsVm } from "app/fake-db/ViewModels/contacts-vm";
import { ChatComponentsService } from "app/Services/chat-components.service";
import { SignalRService } from "app/Services/signal-r.service";

@Component({
    selector: 'chat-chats-sidenav',
    templateUrl: './chats.component.html',
    styleUrls: ['./chats.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class ChatChatsSidenavComponent implements OnInit, OnDestroy {
    chats: any[];
    chatSearch: any;
    contacts: ContactsVm[];
    searchText: string;
    user: any;
    messages: MessageVm[];

    // Private
    private _unsubscribeAll: Subject<any>;
    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     * @param {FuseMatSidenavHelperService} _fuseMatSidenavHelperService
     * @param {ObservableMedia} _observableMedia
     */
    constructor(
        private _chatService: ChatService,
        private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
        public _observableMedia: ObservableMedia,
        public _CompService: ChatComponentsService,
        public _SignalRService:SignalRService
    ) {
        // Set the defaults
        this.chatSearch = {
            name: '',
        };
        this.searchText = '';

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
        this.user = this._chatService.user;
        this.chats = this._chatService.chats;
        // this.contacts = this._chatService.contacts;
        this.getuserContacts();
        this._chatService.onChatsUpdated
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedChats) => {
                this.chats = updatedChats;
            });

        this._chatService.onUserUpdated
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedUser) => {
                this.user = updatedUser;
            });
        this._CompService.unread.subscribe((c) => {
            if (this.contacts != undefined) {
                const index = this.contacts.findIndex(
                    (u) => u.contactID == c.senderId
                );
                if(index!=-1)
                this.contacts[index].unread = c.count;
               // console.log("inside chats component unread count => "+ c.count);
            }
        });

        this._SignalRService.connectedUserStatus.subscribe(contId=>{
            this.contacts.forEach(element => {
                if(element.contactID == contId)
                element.status='Online';
            });
            
        })   
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
     * Get chat
     *
     * @param contact
     */
    // getChat(contact): void
    // {
    //     this._chatService.getChat(contact);

    //     if ( !this._observableMedia.isActive('gt-md') )
    //     {
    //         this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
    //     }
    // }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void {
        this._chatService.setUserStatus(status);
    }

    /**
     * Change left sidenav view
     *
     * @param view
     */
    changeLeftSidenavView(view): void {
        this._chatService.onLeftSidenavViewChanged.next(view);
    }

    /**
     * Logout
     */
    logout(): void {
       // console.log('logout triggered');
    }

    /////////////////////////////////////////// jEEz///////////////////
    // tslint:disable-next-line: typedef
    getuserContacts() {
        this._chatService.mygetcontacts().subscribe(
            (res: any[]) => {
                this.contacts = res;
                if (this.contacts != null) {
                    this.contacts.forEach((item) => {
                        item.imageUrl = `${environment.host}${item.imageUrl}`;
                        //console.log(item.imageUrl);
                    });
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    // tslint:disable-next-line: typedef
    getChat(contact) {
        // console.log("insidegetChat"+contactId);
        this._chatService.mygetChat(contact.contactID).subscribe(
            (res: MessageVm[]) => {
                this.messages = res;
                const data = {
                    conv: this.messages,
                    contactInfo: contact,
                };
                if (data.contactInfo != null) {
                    this._chatService.onChatSelected.next(data);
                }
                // console.log({...this.messages});
            },
            (err) => {
                console.log(err);
            }
        );
        this._CompService.clearCount(contact.contactID);
    }
}
