using JobTask.Model;
using JobTask.Repo.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Classes
{
    public class UserRepository:MainOperation<User>,IUser
    {
        public UserRepository(JobTaskDbContext ctx) : base(ctx)
        {

        }

        public User Add(User user)
        {
            ctx.Users.Add(user);
            ctx.SaveChanges();
            return user;
        }
        public User GetByMail_Password(string Mail, string Password)
        {
            var user = ctx.Users.SingleOrDefault(u => u.Email == Mail && u.Password == Password);
            return user;
        }
        public User GetByMail(String Email)
        {
            var user = ctx.Users.SingleOrDefault(u => u.Email == Email);
            return user;
        }
        public List<User> getUsersByConversation (List<Conversation> listOfConvs,int id)
        {
            List<User> contacts = new List<User>();
            foreach (var item in listOfConvs)
            {
                User user;
                if (item.user1_ID == id)
                {
                     user = ctx.Users.Where(u => u.ID == item.User2_ID).FirstOrDefault();
                }
                else
                     user = ctx.Users.Where(u => u.ID == item.user1_ID).FirstOrDefault();
                if (user!=null)
                {
                    contacts.Add(user);
                }

            }
            return contacts;
        }
    }
}
