import { Injectable } from "@angular/core";
import {
    HubConnection,
    HubConnectionBuilder,
    IHttpConnectionOptions,
} from "@aspnet/signalr";
import { environment } from "environments/environment";
import { BehaviorSubject, Subject } from "rxjs";
import { MessageVm } from "../fake-db/ViewModels/message-vm";
import { ChatComponentsService } from "./chat-components.service";

@Injectable({
    providedIn: "root",
})
export class SignalRService  {
    public hubConnection: HubConnection;
    public sameUserMessageBetweenPanel_View: Subject<MessageVm>;
    public connectionId;
    public message: MessageVm;
    public receivedMessage: Subject<MessageVm>;
    connectionAlive: boolean = false;
    public connectedUserStatus: Subject<any>;

    constructor(private _CompService: ChatComponentsService) {
        this.connectedUserStatus = new Subject();

        this.sameUserMessageBetweenPanel_View = new Subject<MessageVm>();
        this.message = new MessageVm();
        this.receivedMessage = new Subject<MessageVm>();
        this.Initialize();
    }


    Initialize(){


        const options: IHttpConnectionOptions = {
            accessTokenFactory: () => {
                return localStorage.getItem("token");
            },
        };
        if (!this.connectionAlive) {
            this.hubConnection = new HubConnectionBuilder()
                .withUrl(environment.BaseUri + "hub", options)
                .build();
            this.hubConnection
                .start()
                .then(() => {
                    console.log("connection started !");
                    this.connectionAlive = true;
                })
                .catch((err) => {
                    console.error(err);
                    this.connectionAlive = false;
                });
        }
        this.hubConnection.on("sendfront", (msg: MessageVm) => {
            this.message = msg;
            //console.log("Inside Signal R Service : " + this.receivedMessage);
            //this.receivedMessage=msg;
            this.receivedMessage.next(this.message);
            this._CompService.nextCount(msg.senderId);
        });

        console.log("hit1");

        this.hubConnection.on("UserDisconnected", (userID) => {
            this.connectionAlive = false;
            const status = {
                userId: userID,
                state: "Offline",
            };
            this.connectedUserStatus.next(status);
        });
        console.log("hit3");
        this.hubConnection.on("UserConnected", (userID) => {
            console.log("inside userconnected " + userID);
            const status = {
                userId: userID,
                state: "Online",
            };
            this.connectedUserStatus.next(status);
        });

    }
    
}
