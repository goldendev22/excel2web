const UserModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken")
require("dotenv").config();

const Max_Age = 3 * 24 * 60 * 60;
// Initiate Admin in database
const initializeAdmin = async () => {

    try {
        let first_name="admin";
        let last_name="Admin";
        let email=process.env.ADMIN_EMAIL;
        let password=process.env.ADMIN_PASSWORD;
        const UserData = await UserModel.find({"email": process.env.ADMIN_EMAIL})
        if(UserData.length>0){
            console.log("data exists!");
        }else{
            UserModel.create({ first_name, last_name, email, password });
        }        
    } catch (error) {
        console.log(error);
    }
}

initializeAdmin();

const createTocken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: Max_Age
    })
}

const handleErrors = (err) => {
    let errors = { name: "", email: "", password: "" };

    if (err.code === 11000) {
        errors.email = "Email is Already Registered";
        return errors;
    }

    if (err.message.includes("Users validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}


const loginhandleErrors = (err) => {
    let errors = { email: "", password: "" };

    if (err.message === "Incorrect Email")
        errors.email = "Enter valid Email"

    if (err.message === "Incorrect Password")
        errors.email = "Password is Incorrect"

    if (err.message === "Blocked")
        errors.email = "You are blocked by the admin!!!"

    return errors;
}


module.exports.register = async (req, res, next) => {
    try {

        const { first_name, last_name, email, password } = req.body;
        const user = await UserModel.create({ first_name, last_name, email, password });
        
        const token = createTocken(user._id);

        
        if(email === process.env.ADMIN_EMAIL){
            // res.cookie("token", token, {
            //     withCredentials: true,
            //     httpOnly: false,
            //     maxAge: Max_Age * 1000,
            // });
            res.status(201).json({value:true});
        } else {
            // res.cookie("jwt", token, {
            //     withCredentials: true,
            //     httpOnly: false,
            //     maxAge: Max_Age * 1000,
            // });
            res.status(201).json({ user: user._id, created: true,value:false });
        }

    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.json({ errors, created: false });
    }
};




module.exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await UserModel.login(email, password);
        const token = createTocken(user._id);
       
        if(email === process.env.ADMIN_EMAIL){
            res.cookie("token", token, {
                withCredentials: true,
                httpOnly: false,
                maxAge: Max_Age * 1000,
            });
            res.status(200).json({user: user, value:true});
        } else {
            res.cookie("jwt", token, {
                withCredentials: true,
                httpOnly: false,
                maxAge: Max_Age * 1000,
            });

            res.status(200).json({ user: user, created: true,value:false });
        }

    } catch (err) {
        const errors = loginhandleErrors(err);
        res.json({ errors, created: false });
    }
};



