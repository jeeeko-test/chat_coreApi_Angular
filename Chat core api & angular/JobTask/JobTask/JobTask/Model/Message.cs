using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Model
{
    public class Message
    {
        //props
        public int ID { get; set; }
        [ForeignKey("Conversation")]
        public int Conversation_ID { get; set; }
        public String Body { get; set; }
        public int senderId { get; set; }
        //relations
        public virtual Conversation Conversation { get; set; }
    }
}
