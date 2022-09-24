const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');
const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://ajp23695:Test-123@todolist.2pwjk8v.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  item: [itemSchema]
}

const List = new mongoose.model("List", listSchema);

const work = new Item({
  name: "Shopping"
});
const work1 = new Item({
  name: "Studying"
});
const work2 = new Item({
  name: "Movie Time"
});

const itemArray = [work, work1, work2];



app.get("/", function(req, res) {

  Item.find({}, function(err, allItmes) {
    if (allItmes.length === 0) {
      Item.insertMany(itemArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("All Data Saved");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        kindDay: "Today",
        itemList: allItmes
      });
    }
  });
});

app.get("/:customList", function(req, res) {
  const routeName = _.capitalize(req.params.customList);

  List.findOne({
    name: routeName
  }, function(err, listName) {
    if (!err) {
      if (!listName) {
        const list = new List({
          name: routeName,
          item: itemArray
        });

        list.save();
        res.redirect("/" + routeName);
      } else {
        res.render("list", {
          kindDay: listName.name,
          itemList: listName.item
        });
      }
    }
  });

});

app.post("/", function(req, res) {
  let item = req.body.newItem;
  let listName = req.body.list;

  const newItem = new Item({
    name: item
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundData) {
      foundData.item.push(newItem);
      foundData.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const itemId = req.body.chechbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(itemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Data Deleted");
      }
    });
    res.redirect("/");
  } else {

    List.findOneAndUpdate({name: listName}, {$pull:{item:{_id: itemId}}}, function(err){
      if(!err){
        res.redirect("/" + listName);
      }
    });

  }


});




app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started on port 3000");
});
