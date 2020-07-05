using JobTask.Helpers;
using JobTask.Model;
using JobTask.Model.ViewModels;
using JobTask.Repo.Classes;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace JobTask.Services.Classes
{
    public class UserServices:IUserServices
    {
        private readonly AppSettings appSettings;
        private readonly UserRepository userRepository;
        private readonly MainOperation<User> userRepo;
        private readonly MainOperation<Role> roleRepo;
        private readonly JobTaskDbContext ctx;
        private readonly FileUploadService fileUploadService;

        public UserServices(IOptions<AppSettings> _appSettings, UserRepository userRepository, MainOperation<User> userRepo , MainOperation<Role> roleRepo, JobTaskDbContext ctx, FileUploadService fileUploadService)
        {
            appSettings = _appSettings.Value;
            this.userRepository = userRepository;
            this.userRepo = userRepo;
            this.roleRepo = roleRepo;
            this.ctx = ctx;
            this.fileUploadService = fileUploadService;
        }

        public UserVM Authenticate(string Email, string password)
        {

            var user = userRepository.GetByMail_Password(Email, password);


            // return null if user not found
            if (user == null)
                return null;
            var role = ctx.Role.Where(r => r.ID == user.Role_id).FirstOrDefault();

            UserVM uservm = new UserVM();
            uservm.Email = user.Email;
            uservm.ID = user.ID;
            uservm.ImageUrl = user.ImageUrl;
            uservm.Role = role.Name;
            uservm.UserName = user.UserName;
            // authentication successful so generate jwt token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, uservm.ID.ToString()),
                    new Claim(ClaimTypes.Role, uservm.Role),
                    new Claim(ClaimTypes.NameIdentifier,uservm.ID.ToString()),
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            uservm.Token = tokenHandler.WriteToken(token);



            return uservm;
        }



        public UserVM register(RegisterVM register)
        {
            var role = ctx.Role.Where(r => r.Name == register.Role).FirstOrDefault();
            User user = new User();
            user.Email = register.Email;
            //user.Password = Encrypt.GenerateSha256Hash(register.Password);
            user.Password = register.Password;
            user.Role = role;
            user.Role_id = role.ID;
            user.UserName = register.UserName;
            if (register.ImageUrl != null)
            {
                user.ImageUrl = fileUploadService.upload(register.ImageUrl);
            }
            //else add a profile avatar image
            else {
                user.ImageUrl = "profile.jpg";
            }

            var createduser = userRepository.Add(user);
            return Authenticate(createduser.Email, createduser.Password);
        }


    }
}
