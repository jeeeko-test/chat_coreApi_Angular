using JobTask.Model;
using JobTask.Repo.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Classes
{
    public class MessagesRepo : IMessages
    {
        private readonly JobTaskDbContext ctx;

        public MessagesRepo(JobTaskDbContext ctx)
        {
            this.ctx = ctx;
        }

        

        public List<Message> GetMessagesByConvId(int id)
        {
            var messages = ctx.Messages.Where(m => m.Conversation_ID == id).OrderByDescending(m=>m.ID).Take(15).OrderBy(m=>m.ID).ToList<Message>();
            return messages;
        }
    }
}
