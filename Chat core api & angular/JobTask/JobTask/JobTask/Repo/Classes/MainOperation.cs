using JobTask.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Repo.Classes
{
    public class MainOperation<T> where T:class
    {
        public JobTaskDbContext ctx;
        public DbSet<T> table;
        public MainOperation(JobTaskDbContext _ctx)
        {
            this.ctx = _ctx;
            table = _ctx.Set<T>();
        }
        public void Delete(object id)
        {
            T existing = table.Find(id);
            table.Remove(existing);
        }

        public IEnumerable<T> GetAll()
        {
            return table.ToList();
        }

        public T GetById(object id)
        {
            return table.Find(id);
        }

        public void Insert(T obj)
        {
            table.Add(obj);
        }

        public void Save()
        {
            ctx.SaveChanges();
        }

        public void Update(T obj)
        {
            table.Attach(obj);
            ctx.Entry(obj).State = EntityState.Modified;
        }
    }
}
