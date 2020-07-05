using JobTask.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Interfaces
{
    public interface IConversation
    {
        List<Conversation> getconversations(int id);

        Conversation getConversationbyUsersID(int user1Id, int user2Id);
    }
}
