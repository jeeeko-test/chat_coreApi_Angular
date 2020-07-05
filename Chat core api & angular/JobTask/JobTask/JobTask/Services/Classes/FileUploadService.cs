using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace JobTask.Services.Classes
{
    public class FileUploadService
    {
        public String upload(IFormFile file)
        {
            string filename = null;
            filename = Guid.NewGuid().ToString() + "_" + file.FileName;
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/Images", filename);
            var stream = new FileStream(path, FileMode.Create);
            file.CopyToAsync(stream);
            return filename;
        }
    }
}
