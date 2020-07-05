using JobTask.Model.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Services
{
    public interface  IUserServices
    {
         UserVM Authenticate(string username, string password);
         UserVM register(RegisterVM register);
    }
}
