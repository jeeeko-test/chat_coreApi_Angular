using JobTask.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Interfaces
{
    public interface IUser
    {
        User GetByMail_Password(String Mail, String Password);
        User Add(User user);
        User GetByMail(String Email);
        List<User> getUsersByConversation(List<Conversation> listOfId,int id);
    }
}
