using JobTask.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Interfaces
{
    public interface IMessages
    {
        List<Message> GetMessagesByConvId(int id);
    }
}
