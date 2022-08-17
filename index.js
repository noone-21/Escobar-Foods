const express= require('express');
const app=express();
var mongo=require('mongodb'); 
const bodyParser= require('body-parser'); 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/FoodDelivery', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});

app.use(express.static('public'));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.urlencoded())

//-----------DEFINING SCHEMAS--------------//

//Customer
const signUpSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    }, 
    lastName: {
        type:String,
        required:true
    }, 
    email:{
        type:String,
        required:true,
        unique:true
    },  
    password:{
        type:String,
        required:true
    }, 
    phoneNo: {
        type:String,
        required:true,
        unique:true
    },
    address: {
        type:String,
        required:true
    },
});
const Customer =mongoose.model('Customer', signUpSchema);
// Customer Login
const loginSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },  
    password:{
        type:String,
        required:true
    }
});
const CustomerLogin =mongoose.model('login', loginSchema);

//Admin
const addAdminSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    }, String,
    password:{
        type:String,
        required:true
    },
});
const admin = mongoose.model('admin', addAdminSchema);


//GROCERY
const grocerySchema = new mongoose.Schema({
    itemId: String,
    itemName: String,
    categoryId: String,
    price: String
})
const GroceryItem = mongoose.model('GroceryItem', grocerySchema);

// FAST FOOD
const menusSchema = new mongoose.Schema({
    itemId: String,
    foodName: String,
    categoryId: String,
    price: String
})
const MenuItem = mongoose.model('MenuItem', menusSchema);

//DESI
const desiMenuSchema = new mongoose.Schema({
    itemId: String,
    foodName: String,
    categoryId: String,
    price: String
})
const DesiItem = mongoose.model('DesiItem', desiMenuSchema);

//CHINESE
const chineseMenuSchema = new mongoose.Schema({
    itemId: String,
    foodName: String,
    categoryId: String,
    price: String
})
const ChineseItem = mongoose.model('ChineseItem', chineseMenuSchema);

//CART
const cartSchema = new mongoose.Schema({
    itemName: String,
    itemCategory: String,
    itemQuantity: String
})
const Cart = mongoose.model('Cart', cartSchema);


//-------------DEFINING ROUTES-------------------//
//---------------USER SECTION--------------------//

//Home Page
app.get('/',(req,res)=>{
    res.render('home.ejs')
})

//Login Page
app.get('/login',(req,res)=>{
    res.render('Login.ejs')
})
app.post('/login',async (req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        var currentUser= new CustomerLogin(req.body);
        const user=await Customer.findOne({email:email});
        if(user.password===password){
            res.status(201).render("Profile.ejs",{user});
            currentUser.save();
        }
        else{
            res.send("Invalid Login!");
        }

    }
    catch{
        res.status(400).send("Invalid Login!")
    }

})

//SignUp Page
app.get('/Sign-Up',(req,res)=>{
    res.render('Signup.ejs')
})
app.post('/Sign-Up',async(req,res)=>{
    var customerData= new Customer(req.body);
    customerData.save().then(()=>{
        res.render("Login.ejs")
    }).catch(()=>{
        res.status(400).send("Registration Unsuccessful!")
    });
})

//Profile Page
app.get('/profile',(req,res)=>{
    res.render('Profile.ejs')
})

//ProfileEdit Page
app.get('/profile/edit',async(req,res)=>{
    const user=await Customer.findOne({})
    res.render('Profile Edit.ejs',{user})
})
app.post('/profile/edit',async(req,res)=>{
    try{
        const fName=req.body.fName;
        const lName=req.body.lName;
        const email=req.body.mail;
        const password=req.body.pass;;
        const pNo=req.body.pNo;
        const add=req.body.add;
        
        const user=await Customer.findOne({})

        const newData=await Customer.updateOne({firstName:user.firstName},{$set:{firstName:fName,lastName:lName,email:email,password:password,phoneNo:pNo,address:add}});
        res.render("Profile.ejs",{user})
    }
    catch(err){
        res.status(400).send(err)
    }

})

//Categories Page
app.get('/categories',(req,res)=>{
    res.render('Categories.ejs')
})

app.get('/categories/food',(req,res)=>{
    res.render('Food.ejs')
})

app.get('/categories/grocery',(req,res)=>{
    res.render('Grocery.ejs')
})

//Menu Page
app.get('/menu',(req,res)=>{
    res.render('Menu.ejs')
})

app.get('/menu/grocery',async(req,res)=>{
    const groceryItems=await GroceryItem.find({})
    res.render("Grocery Items.ejs",{ groceryItems}) 
})

//MenuCategories Pages
app.get('/menu/fast-food',async(req,res)=>{
    const menuItems=await MenuItem.find({})
    res.render("Fast Food.ejs",{ menuItems}) 
})
app.get('/menu/desi',async(req,res)=>{
    const desiItems=await DesiItem.find({})
    res.render("Desi.ejs",{ desiItems}) 
})
app.get('/menu/chinese',async(req,res)=>{
    const chineseItems=await ChineseItem.find({})
    res.render("Chinese.ejs",{chineseItems}) 
})

//AddToCart Page
app.get('/menu/add-to-cart',(req,res)=>{
    res.render("Add to Cart.ejs",) 
})
app.post('/menu/add-to-cart',async(req,res)=>{
    try{
        const foodName=req.body.itemName;
        const quantity=req.body.itemQuantity;
        const category=req.body.itemCategory;
            var cartItem= new Cart(req.body);
                cartItem.save()
            console.log(cartItem)
            res.render("Add to Cart.ejs")
    }
    catch{
        res.status(400).send("Unable to Add Item")
    }
    

})

//RemoveFromCart Page
app.get('/menu/remove-from-cart',(req,res)=>{
    res.render("Remove From Cart.ejs",) 
})
app.post('/menu/remove-from-cart',async(req,res)=>{
    try{
        const foodName=req.body.itemName;
        const category=req.body.itemCategory;
        const deletedItem=await Cart.findOneAndDelete({foodName});
        res.render("Remove From Cart.ejs")

    }
    catch{
        res.status(400).send("Unable to Remove Item")
    }
    

})

//MyCart Page
app.get('/My-Cart',async(req,res)=>{
    const myCart=await Cart.find({})
    const fastFood= await MenuItem.find({})
    const desi= await DesiItem.find({})
    const chinese= await ChineseItem.find({})
    const grocery= await GroceryItem.find({})
    res.render("My Cart.ejs",{myCart,fastFood,desi,chinese,grocery})
})

//MyOrders Page
app.get('/My-Orders',async(req,res)=>{
    const user=await Customer.findOne({})
    const myCart=await Cart.find({})
    const foodName=myCart.itemName
    const fastFood= await MenuItem.find({})
    const desi= await DesiItem.find({})
    const chinese= await ChineseItem.find({})
    const grocery= await GroceryItem.find({})
    res.render('My Orders.ejs',{user,myCart,fastFood,desi,chinese,grocery})
})

//ContactUs Page
app.get('/Contact-Us',(req,res)=>{
    res.render('ContactUs.ejs')
})


//---------------ADMIN SECTION--------------------//

//Home Page
app.get('/admin/home',async(req,res)=>{
    const admins=await admin.find({})
    res.render('Admin',{admins})
})

//Login Page
app.get('/admin',(req,res)=>{
    res.render('AdminLogin')
})
app.post('/admin',async(req,res)=>{
    try{
        const uName=req.body.userName;
        const password=req.body.password;
        const admins=await admin.find({})
        const adminEmail=await admin.findOne({userName:uName});
        if(adminEmail.password===password){
            res.render('Admin',{admins});  
        }
        else{
            res.send('Invalid Login!');
        }
    }
    catch{
        res.status(400).send('Invalid Login!')
    }
})

//AddAdmin Page
app.get('/admin/add-admin',(req,res)=>{
    res.render('Add Admin')
})
app.post('/admin/add-admin',async(req,res)=>{
    const admins=await admin.find({})
    var adminData= new admin(req.body);
    adminData.save().then(()=>{
        res.render('Admin',{admins})
    }).catch(()=>{
        res.status(400).send('Failed to add a new admin!')
    });
})

//RemoveAdmin Page
app.get('/admin/remove-admin',(req,res)=>{
    res.render('Remove Admin')
})
app.post('/admin/remove-admin',async(req,res)=>{
    const userName=req.body.userName;
    const password=req.body.password;
    const admins=await admin.find({})
    const adminEmail=await admin.findOne({userName:userName});
    const deleteAdmin=async(userName,password,adminEmail)=>{
        try{
            if(adminEmail.password===password){
                const deleted=await admin.deleteOne({userName});
                console.log(deleted)
            }
            else{
                res.send('Invalid Login!')
            }

        }catch{
            res.status(400).send('Invalid')
        }
    }
    deleteAdmin(userName,password,adminEmail);
    res.render('Admin',{admins});
})

//Orders Page
app.get('/admin/orders',async(req,res)=>{
    const user=await Customer.findOne({})
    const myCart=await Cart.find({})
    const foodName=myCart.itemName
    const fastFood= await MenuItem.find({})
    const desi= await DesiItem.find({})
    const chinese= await ChineseItem.find({})
    const grocery= await GroceryItem.find({})
    res.render('Orders',{user,myCart,fastFood,desi,chinese,grocery})
})

//AddItems Page
app.get('/admin/add-items',(req,res)=>{
    res.render('Add Items')
})
app.post('/admin/add-items',async(req,res)=>{
    const admins=await admin.find({})
    const foodCategory=req.body.categoryId;
    if(foodCategory==1){
        var newItem= new MenuItem(req.body);
        console.log(newItem);
    }
    else if(foodCategory==2){
        var newItem= new DesiItem(req.body);
        console.log(newItem);
    }
    else if(foodCategory==3){
        var newItem= new ChineseItem(req.body);
        console.log(newItem);
    }
    else if(foodCategory==4){
        var newItem= new GroceryItem(req.body);
        console.log(newItem);
    }
    newItem.save().then(()=>{
        res.render('Admin',{admins})
    }).catch(()=>{
        res.status(400).send('Failed to add a new Item!')
    });
})

//RemoveItems Page
app.get('/admin/remove-items',(req,res)=>{
    res.render('Remove Items')
})
app.post('/admin/remove-items',async(req,res)=>{
    const admins=await admin.find({})
    const foodCategory=req.body.categoryId;
    const foodName=req.body.foodName;
    try{
        if(foodCategory==1){
            const deletedItem=await MenuItem.deleteOne({foodName});
            console.log(deletedItem)
        }
        else if(foodCategory==2){
            const deletedItem=await DesiItem.deleteOne({foodName});
            console.log(deletedItem)
        }
        else if(foodCategory==3){
            const updatedItem=await ChineseItem.updateOne
            ({foodName},{$set:{foodName:newName,price:newPrice}});
            console.log(updatedItem)
        }
        else if(foodCategory==3){
            const deletedItem=await ChineseItem.deleteOne({foodName});
            console.log(deletedItem)
        }
        else if(foodCategory==4){
            const deletedItem=await GroceryItem.deleteOne({foodName});
            console.log(deletedItem)
        }
    }
    catch{
        res.status(400).send('Failed to add a new Item!')
    }
})

//UpdateItems Page
app.get('/admin/update-items',(req,res)=>{
    res.render('Update Items')
})
app.post('/admin/update-items',async(req,res)=>{
    const admins=await admin.find({})
    const foodCategory=req.body.categoryId;
    const foodName=req.body.itemName;
    const newName=req.body.newName;
    const newPrice=req.body.price;
    try{
        if(foodCategory==1){
            const updatedItem=await MenuItem.updateOne
            ({foodName},{$set:{foodName:newName,price:newPrice}});
            console.log(updatedItem)
        }
        else if(foodCategory==2){
            const updatedItem=await DesiItem.updateOne
            ({foodName},{$set:{foodName:newName,price:newPrice}});
            console.log(updatedItem)
        }
        else if(foodCategory==3){
            const updatedItem=await ChineseItem.updateOne
            ({foodName},{$set:{foodName:newName,price:newPrice}});
            console.log(updatedItem)
        }
        else if(foodCategory==4){
            const updatedItem=await GroceryItem.updateOne
            ({foodName},{$set:{foodName:newName,price:newPrice}});
            console.log(updatedItem)
        }
        res.render('Admin',{admins})
    }
    catch{
        res.status(400).send('Failed to add a new Item!')
    }
})

//---------------ESTABLISHING CONNECTIONS--------------------//
app.listen(3000,()=>{
    console.log('Server Started Successfully! Listening at Port:3000');
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Successfully connected to Database');
});
