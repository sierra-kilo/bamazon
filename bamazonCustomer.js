var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the listItems function and buy function
  buy();
});

function buy() {
  // query the database for all items being sold
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to purchase

    inquirer
      .prompt([
        {
          name: "choice",
          type: "list",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            // console.log("returning choiceArray" + choiceArray);
            return choiceArray;
          },
            message: "What product would you like buy?"
        },
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        };
        // Item is in stock
        if (parseInt(chosenItem.stock_quantity) > 0) {

          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity:  chosenItem.stock_quantity - 1
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
            //   if (error) throw err;
              console.log("Thank you for your purchase!");
              buy();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Sorry your chosen item is out of stock!");
          buy();
        }
      })
  });
}
