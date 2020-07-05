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

namespace JobTask.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConversationController : ControllerBase
    {
        private readonly MainOperation<Conversation> con;
        private readonly IConversation contactsRepo;
        private readonly IUser user;
        private readonly JobTaskDbContext ctx;
        private readonly IMessages messages;

        public ConversationController( MainOperation<Conversation> con , IConversation contactsRepo,IUser user , JobTaskDbContext ctx,IMessages messages)
        {
            this.con = con;
            this.contactsRepo = contactsRepo;
            this.user = user;
            this.ctx = ctx;
            this.messages = messages;
        }

        [AllowAnonymous]
        [HttpPost("getconv")]
        public IActionResult getConversationbyID([FromBody]int id) {

            var conversations = con.GetById(id);
            if (conversations != null)
                return Ok(conversations);
            else return BadRequest(new { message = "seems lonely here ...!" });
        }

        [Authorize]
        [HttpPost("chat")]
        public IActionResult getUserChat( [FromBody] int userId) {
            
            
            List<Conversation> conversations = contactsRepo.getconversations(userId);
            if (conversations != null)
            {
                List<User> usercontacts = user.getUsersByConversation(conversations, userId);
                List<ContactsVm> Contacts = new List<ContactsVm>();
                foreach (var item in usercontacts)
                {
                    ContactsVm contact = new ContactsVm();
                    contact.ContactID = item.ID;
                    contact.ImageUrl = item.ImageUrl;
                    contact.UserName = item.UserName;
                    contact.ConnectionId = item.ConnectionId;
                    contact.Status = item.Status;
                    //srry for this line try to change it if you have time
                    contact.LastMessage = messages.GetMessagesByConvId(contactsRepo.getConversationbyUsersID(userId, contact.ContactID).ID).LastOrDefault()?.Body;
                    Contacts.Add(contact);
                }
                return Ok(Contacts);
            }
            else return Ok(null);
            
        }
    }
}