import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';
import { ContactsVm } from 'app/fake-db/ViewModels/contacts-vm';
import { environment } from 'environments/environment';

@Injectable()
export class ChatService implements Resolve<any>
{
    contacts: ContactsVm[];
    chats: any[];
    user: any;
    onChatSelected: BehaviorSubject<any>;
    onContactSelected: BehaviorSubject<any>;
    onChatsUpdated: Subject<any>;
    onUserUpdated: Subject<any>;
    onLeftSidenavViewChanged: Subject<any>;
    onRightSidenavViewChanged: Subject<any>;
    // httpOptions:any;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
        // this.httpOptions= {headers: new HttpHeaders({
        //     'Content-Type': 'application/json'
        //      ,'Authorization': `Bearer ${localStorage.getItem('token')}`
        //     })};  
        // Set the defaults
        this.onChatSelected = new BehaviorSubject(null);
        this.onContactSelected = new BehaviorSubject(null);
        this.onChatsUpdated = new Subject();
        this.onUserUpdated = new Subject();
        this.onLeftSidenavViewChanged = new Subject();
        this.onRightSidenavViewChanged = new Subject();
        
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContacts(),
                this.getChats(),
                this.getUser()
            ]).then(
                ([contacts, chats, user]) => {
                    //this.contacts = contacts;
                    this.chats = chats;
                    this.user = user;
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    // getChat(contactId): Promise<any>
    // {
    //     const chatItem = this.user.chatList.find((item) => {
    //         return item.contactId === contactId;
    //     });

    //     // Create new chat, if it's not created yet.
    //     if ( !chatItem )
    //     {
    //         this.createNewChat(contactId).then((newChats) => {
    //             this.getChat(contactId);
    //         });
    //         return;
    //     }

    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get('api/chat-chats/' + chatItem.id)
    //             .subscribe((response: any) => {
    //                 const chat = response;

    //                 const chatContact = this.contacts.find((contact) => {
    //                     return contact.contactID === contactId;
    //                 });

    //                 const chatData = {
    //                     chatId : chat.id,
    //                     dialog : chat.dialog,
    //                     contact: chatContact
    //                 };

    //                 this.onChatSelected.next({...chatData});

    //             }, reject);

    //     });

    // }

    /**
     * Create new chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    createNewChat(contactId): Promise<any>
    {
        return new Promise((resolve, reject) => {

            const contact = this.contacts.find((item) => {
                return item.contactID === contactId;
            });

            const chatId = FuseUtils.generateGUID();

            const chat = {
                id    : chatId,
                dialog: []
            };

            const chatListItem = {
                contactId      : contactId,
                id             : chatId,
                lastMessageTime: '2017-02-18T10:30:18.931Z',
                name           : contact.userName,
                unread         : null
            };

            // Add new chat list item to the user's chat list
            this.user.chatList.push(chatListItem);

            // Post the created chat
            this._httpClient.post('api/chat-chats', {...chat})
                .subscribe((response: any) => {

                    // Post the new the user data
                    this._httpClient.post('api/chat-user/' + this.user.id, this.user)
                        .subscribe(newUserData => {

                            // Update the user data from server
                            this.getUser().then(updatedUser => {
                                this.onUserUpdated.next(updatedUser);
                                resolve(updatedUser);
                            });
                        });
                }, reject);
        });
    }

    /**
     * Select contact
     *
     * @param contact
     */
    selectContact(contact): void
    {
        this.onContactSelected.next(contact);
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void
    {
        this.user.status = status;
    }

    /**
     * Update user data
     *
     * @param userData
     */
    updateUserData(userData): void
    {
        this._httpClient.post('api/chat-user/' + this.user.id, userData)
            .subscribe((response: any) => {
                    this.user = userData;
                }
            );
    }

    /**
     * Update the chat dialog
     *
     * @param chatId
     * @param dialog
     * @returns {Promise<any>}
     */
    updateDialog(senderId, messagebody): Promise<any>
    {
        return new Promise((resolve, reject) => {

            const newData = {
                contactId: senderId,
                body: messagebody
             };

             const httpOptions= {headers: new HttpHeaders({
                'Content-Type': 'application/json'
                 ,'Authorization': `Bearer ${localStorage.getItem('token')}`
                })};  
            this._httpClient.post(`${environment.ApiUri}Messages/sendmessage`, newData,httpOptions )
                .subscribe(updatedChat => {
                    resolve(updatedChat);
                }, reject);
        });
    }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts() :Promise<any>
    {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type': 'application/json'
             ,'Authorization': `Bearer ${localStorage.getItem('token')}`
            })};
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environment.ApiUri}Conversation/chat`,localStorage.getItem('userId'),httpOptions)
                .subscribe((response: any) => {
                    console.log(response);
                    resolve( response);
                }, reject);
        });
    }

    /**
     * Get chats
     *
     * @returns {Promise<any>}
     */
    getChats(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/chat-chats')
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Get user
     *
     * @returns {Promise<any>}
     */
    getUser(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/chat-user')
                .subscribe((response: any) => {
                    resolve(response[0]);
                }, reject);
        });
    }


    ////////////////////////////////jEEz/////////////////////////////
    mygetcontacts(){
        const httpOptions= {headers: new HttpHeaders({
                'Content-Type': 'application/json'
                 ,'Authorization': `Bearer ${localStorage.getItem('token')}`
                })};         
                 return this._httpClient.post(`${environment.ApiUri}Conversation/chat`,localStorage.getItem('userId'),httpOptions);
    }
    mygetChat(contactId:number){
        // console.log(contactId);
        const httpOptions= {headers: new HttpHeaders({
            'Content-Type': 'application/json'
             ,'Authorization': `Bearer ${localStorage.getItem('token')}`
            })};  
            
        return this._httpClient.post(`${environment.ApiUri}Messages/getmessages`,contactId,httpOptions)
    }
}


