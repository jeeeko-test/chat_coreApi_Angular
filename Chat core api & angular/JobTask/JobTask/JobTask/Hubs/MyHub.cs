using JobTask.Model;
using JobTask.Model.ViewModels;
using JobTask.Repo.Classes;
using JobTask.Services.Classes;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Hubs
{
    [Authorize(AuthenticationSchemes =JwtBearerDefaults.AuthenticationScheme)]
    public class MyHub:Hub
    {
        private readonly MainOperation<User> _userRepository;
        public String user;

        public MyHub(UserRepository userRepository , UserResolverService userService)
        {
            _userRepository = userRepository;
            this.user = userService.GetUser();
        }


        public void send(MessageVm message, string contactId)
        {
            User user = _userRepository.GetById(int.Parse(contactId));
            if (user.ConnectionId != null)
            //Clients.All.SendAsync("sendfront", message);
            Clients.Client(user.ConnectionId).SendAsync("sendfront", message);
            //sendpanel(message, contactId);
        }
        //public void sendpanel(MessageVm message, string contactId) {
        //    User user = _userRepository.GetById(int.Parse(contactId));

        //    //Clients.All.SendAsync("sendfront", message);
        //    Clients.Client(user.ConnectionId).SendAsync("sendpanel", message);
        //    send(message, contactId);
        //}

        public override async Task OnConnectedAsync() 
        {
            //get user identity cause this one isn't working
            string CurrentUserid = Context.User.Identity.Name;
            //string CurrentUserId = this.user;
            User user = _userRepository.GetById(int.Parse(CurrentUserid));
            user.ConnectionId = Context.ConnectionId;
            user.Status = "Online";
            _userRepository.Save();
            await Clients.All.SendAsync("UserConnected",user.ID );
                                   
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string CurrentUserid = Context.User.Identity.Name;
            string CurrentUserId = this.user;
            User user = _userRepository.GetById(int.Parse(CurrentUserId));
            user.ConnectionId = null;
            user.Status = "Offline";
            _userRepository.Save();
            await Clients.All.SendAsync("UserDisconnected", user.ID);
            await base.OnDisconnectedAsync(ex);
        }
    }
}
