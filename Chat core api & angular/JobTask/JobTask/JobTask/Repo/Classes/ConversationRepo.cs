using JobTask.Model;
using JobTask.Repo.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Classes
{
    public class ConversationRepo : MainOperation<Conversation>, IConversation
    {
        public ConversationRepo(JobTaskDbContext ctx):base(ctx)
        {

        }

        public Conversation getConversationbyUsersID(int user1Id, int user2Id)
        {
            Conversation conv = ctx.Conversations.Where(c => (c.user1_ID == user1Id && c.User2_ID == user2Id) || (c.user1_ID == user2Id && c.User2_ID == user1Id)).FirstOrDefault();

            return conv;
        }

        public List<Conversation> getconversations(int id)
        {
            
            List<Conversation> coversations = ctx.Conversations.Where(c => c.user1_ID == id || c.User2_ID == id).ToList<Conversation>();
            return coversations;
            
        }
    }
}
