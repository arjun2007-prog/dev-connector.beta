const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true}));
app.set( "view engine" , "ejs" );

//This is used to setup the express session with some inital configuration
app.use(session({
    secret: 'keyboard cat is our secret.',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());//Here we are initalizing the passport package 
app.use(passport.session());//And after we are enabling passport to deal with our sessions



mongoose.connect("mongodb://localhost:27017/devConnect" , { useNewUrlParser : true , useUnifiedTopology : true });
mongoose.set("useCreateIndex" , true);

//this is the schema for staoring a user in th db
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    about:String,
    password:String, 
    skills:[Object],
    experience:[Object],
    projects:[Object],
});

userSchema.plugin(passportLocalMongoose) //Here we are using the passportLocalMongoose package as plugin for our schema

const User = mongoose.model("user",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Now in this object will tell how a user skill should be structured
class Skill{
    constructor(skill){
        this.skill = skill ;
    };
};

//Now this is a constructor object that creates a new object user has entered for experince
class Experience{
    constructor(companyName,summary){
        this.jobName = companyName ;
        this.jobDescription = summary ;
    };
};

class Project{
    constructor(projectName , summary , projectLink){
        this.projectName = projectName ;
        this.summary = summary ;
        this.projectLink = projectLink;
    };
};

class Comments{
    constructor(commentWriter , comment ){
        this.commentWriter = commentWriter
        this.comment = comment;
    }
}


app.get("/",(req,res)=>{
    res.render("home");
});


app.route("/signin")
   .get((req,res)=>{
       res.render("signin");
   })
   .post((req,res)=>{
       
   })


app.route("/register")
  .get((req,res)=>{
    res.render("register")
})
  .post((req,res)=>{
        //here we are goona get the data from the register form and save it in db
    
// This is the place where the user is able to update there profile after he is registered

app.route("/skills")
   .post((req,res)=>{
       const skill = req.body.skill;
       const userToUpdate = req.body.userEmail; 
       var userSkill = new Skill(skill);

       Users.updateOne( { email:userToUpdate } ,{ $push: {"skills":{userSkill}}} , (err)=>{
           res.render("register-2" , { currentUserEmail : userToUpdate })
       })
       
      
    });


    app.route("/projects")
    .post((req,res)=>{
        const projectName = req.body.projectName;
        const userToUpdate = req.body.userEmail
        const summary = req.body.summary; 
        const projectLink = req.body.link
        
        var userProject = new Project(projectName,summary,projectLink);
 
        Users.updateOne( { email:userToUpdate } ,{ $push: {"projects":{userProject}}} , (err)=>{
            res.render("register-2" , { currentUserEmail : userToUpdate })
        })
        
       
     })    

     app.route("/experience")
     .post((req,res)=>{
         const companyName = req.body.companyName;
         const userToUpdate = req.body.userEmail
         const summary = req.body.summary; 

         var userExperience = new Experience(companyName,summary);
  
         Users.updateOne({ email:userToUpdate } ,{ $push: {"experience":{userExperience}}} , (err)=>{
             res.render("register-2" , { currentUserEmail : userToUpdate })
         })
         
        
      });
      
//this is the place on the home screen i need to display similar users of the signined account niche      

    
    app.route("/coders")
       .get((req,res)=>{
          Users.find((err,dataFound)=>{
            res.render("home-2" , { others : dataFound } )
          }).limit(10)   
        })

//Now this is the place users can see others profile
app.route("/profile/:profileId")
   .get((req,res)=>{
      const profileId = req.params.profileId;
      
      Users.findOne( { _id : profileId } , (err , dataFound)=>{
          console.log(dataFound);
           res.render("profile",{profile : dataFound})
      } )
   });

app.route("/post")
   .get((req,res)=>{
       res.render("post", {userWhoPosted:currentUser});
   }) 
   .post((req,res)=>{
       console.log(req.body);
       const userPosted = req.body.user;
       const post = req.body.post;
       var name ;

       Users.findOne({email:userPosted},(err,dataFound)=>{
           name = dataFound.name;
           console.log(dataFound);
           console.log(name);
           const newPost = new Posts({
            author: name,
            post: post
         });
         newPost.save();
         res.redirect("/coders")
       })
      

       
   })  

//This is the place user can see others posts

app.route("/feed")
   .get((req,res)=>{
      Posts.find((er,dataFound)=>{
          console.log(dataFound);
         res.render("feed",{posts: dataFound})
      }).limit(20)
   })
})

app.listen(3000,()=>{
    console.log("Sucesfully hosted the files to the port 3000");
});