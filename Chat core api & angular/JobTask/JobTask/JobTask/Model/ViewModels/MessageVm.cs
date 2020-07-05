using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model.ViewModels
{
    public class MessageVm
    {
        
        public String Body { get; set; }
        public int senderId { get; set; }
        public String SenderImgUrl { get; set; }
    }
}
