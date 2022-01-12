const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let users = [
    {
        username : "huehue",
        password: "jajaj",
        isAdmin: true
    },
    {
        username : "hqhqhq",
        password: "jajaja",
        isAdmin: false
    }
];

let refreshTokens = [];

function createAccessToken(user){
     return jwt.sign(
        {"username":user.username, "isAdmin":user.isAdmin} ,
        "chhotaSaRaaz",
        { expiresIn : "30s"}
    );
}
function createRefreshToken(user){
     return jwt.sign(
        {"username":user.username, "isAdmin":user.isAdmin} ,
        "refreshKrneKaRaaz"
    );
}

app.post("/api/login", (req, res)=>{
    console.log(req.body);
    const {username, password} = req.body;
    const user = users.find((u) =>{
        return u.username === username && u.password === password;
    })
    if(user){
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.status(200).json(
            {
                username,
                "isAdmin":user.isAdmin,
                accessToken,
                refreshToken
            }
        );
    }else{
        res.status(403).json("Incorrect username or password");
    }
})

app.post("/api/refresh", (req, res)=>{
    const token = req.body.token;
    if(!token){
        return res.status(401).json("You are not authorized");
    }
    if(!refreshTokens.includes(token))
    return res.status(401).json("Refresh Token invalid");
    jwt.verify(token, "refreshKrneKaRaaz", (err, user)=>{
        if(err)
        console.log(err);
        refreshTokens = refreshTokens.filter((f)=> f!== token);
        const newRefreshToken = createRefreshToken(user);
        const newAccessToken = createAccessToken(user);
        refreshTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken : newAccessToken,
            refreshToken : newRefreshToken
        })
    })
})

const verify = (req, res, next)=>{
    const token = req.headers.authorization;
    console.log(token);
    if(token){
        const authToken  = token.split(" ")[1];
        jwt.verify(authToken, "chhotaSaRaaz", (err, user)=>{
            if(err){
                console.log("Invalid Token");
                return res.status(403).json("Token invalid");
            }
            req.user = user;
            next();
        })
    }else{
        console.log("Not authenticated");
        res.status(403).json("You are not authenticated!");
    }
}

app.delete("/api/users/:userid", verify, (req, res)=>{
    console.log(req.user.username == req.params.userid);
    if(req.user.username == req.params.userid || req.user.isAdmin){
        // users = users.filter((userrr)=>{
        //     if(userrr.username != req.user.username){
        //         return userrr;
        //     }
        // })
        res.status(200).json("User deleted");
    }else{
        console.log("Not allowed");
        res.status(403).json("Permission Denied");
    }
})

app.post("/api/logout", verify, (req, res)=>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.status(200).json("Logged Out Successfully!");
})

app.listen(5000, ()=>{
    console.log("Server is up and running.");
})