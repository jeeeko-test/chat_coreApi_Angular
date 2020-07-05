using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JobTask.Model;
using JobTask.Model.ViewModels;
using JobTask.Repo.Classes;
using JobTask.Repo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace JobTask.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly MainOperation<Message> messagesRepo;
        private readonly JobTaskDbContext ctx;
        private readonly IConversation conv;
        private readonly IMessages messages;

        public MessagesController( MainOperation<Message> messagesRepo , JobTaskDbContext ctx, IConversation conv,IMessages messages)
        {
            this.messagesRepo = messagesRepo;
            this.ctx = ctx;
            this.conv = conv;
            this.messages = messages;
        }
        //[HttpGet]
        //[AllowAnonymous]
        //[Route("getmessages")]
        //public IActionResult getMessages (){
        //    var messages = messagesRepo.GetAll();
        //    return Ok(messages);
        //}
        [HttpPost]
        [Authorize]
        [Route("sendmessage")]
        public IActionResult sendmsg(JObject m)
        {
            var currentUserId = int.Parse(User.Identity.Name);

            dynamic json = m;
            int contactId = (int)json.contactId;
            string body = json.body;

            var conversation = conv.getConversationbyUsersID(contactId, currentUserId);

            if (conversation != null)
            {
                Message me = new Message();
                me.Body = body;
                me.Conversation_ID = conversation.ID;
                me.senderId = currentUserId;
                ctx.Messages.Add(me);
                ctx.SaveChanges();
                return Ok(m);
            }
            else
                return BadRequest();
            
        }

        [HttpPost]
        [Authorize]
        [Route("getmessages")]
        public IActionResult getmessages([FromBody]int contactId) {

            var currentUserId = int.Parse(User.Identity.Name);

            var conversation = conv.getConversationbyUsersID(contactId, currentUserId);
            List<Message> msg = new List<Message>();
            //List<string> msgbody = new List<string>();
            List<MessageVm> msgVmlist = new List<MessageVm>();

            if (conversation != null)
            {
                 msg = messages.GetMessagesByConvId(conversation.ID);
            }
            foreach (var item in msg)
            {
                MessageVm msgVm = new MessageVm();

                msgVm.Body = item.Body;
                msgVm.senderId = item.senderId;
                msgVm.SenderImgUrl = ctx.Users.Where(u => u.ID == item.senderId).Select(u => u.ImageUrl).FirstOrDefault();
                msgVmlist.Add(msgVm);
                //msgbody.Add(item.Body);
            }
            return Ok(msgVmlist);
        }
    }
}