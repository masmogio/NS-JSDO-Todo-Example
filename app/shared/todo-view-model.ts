import { Observable } from 'data/observable';
import { ObservableArray } from 'data/observable-array';
import {Page} from "ui/page";
import {Todo} from  "./todo";

var frameModule = require("ui/frame");


import "progress-jsdo/src/progress.util";
import { progress } from "progress-jsdo";
import * as sessionStorage from "nativescript-localstorage" ;

var view;


class ViewModel extends Observable {
    
    item: Todo;
    newTodo:string;
    theFilter: boolean = null;
    selectAll: boolean = false;
    todos: ObservableArray<Todo>;    
    jsdo;
    

    constructor() {
        super();
        this.todos = new ObservableArray<Todo>();
        view = this;
        var that = this;
        var hosturl = 'Please introduce host name of JSDO';


        // Configuring service, catalog for using jsdo 
        try {
            progress.data.getSession({
              serviceURI: hosturl + "/todo",
              catalogURI: hosturl + "/todo/rest/static/todoService.json",      
              authenticationModel: "anonymous"
            }).done(function () {
               that.jsdo = new progress.data.JSDO({name: "todo"}); //Name of the resource
               that._get();
         
            }).fail(function (result, info) {
                console.log("Error creating session.");
                console.log(result);
                console.log(info);
            });
          } catch (e) {
             console.log("Exception: " + e);
          }
     
    }
   
    public _get() 
    {
        
        var that =this;
        //Reading the records from JSDO
        //More information in https://tinyurl.com/y7pgqlqe

        this.jsdo.fill().done(function () {
           var todosjsdo = that.jsdo.getData();
           todosjsdo.forEach(record => {
                that.todos.push(record); // Pushing todo record to Todo Observable
            });
            // Refreshing List View
            var myPage = frameModule.topmost().currentPage;
            myPage.getViewById("items").refresh(); //Refreshing todos list
          }).fail(function () {
            console.log("Error reading records.");
          });

    }
    

    public add() {
       
        if (this.newTodo.trim().length > 0) {
           var that = this;

           this.item = new Todo(); // Create a new todo item
           //Initialize the values of the new todo
           this.item.id = 0;
           this.item.task = this.newTodo;
           this.item.completed = false;
           // Adding records using JSDO
            // More information in https://tinyurl.com/yajyzpjb
  
           this.jsdo.tttodo.subscribe('afterCreate', this.onAfterCreate);

           this.jsdo.add(this.item);
           this.jsdo.saveChanges(false)
           .done(function(jsdo,request,success){
                console.log("Item added!")
           }).fail(function(jsdo,request,success){
              console.log("Error adding item");
           });
        }
        

    }
    
    public remove(todo: Todo) {
        var that=this;

        
        var index = this.todos.indexOf(todo); //Getting the index of the record which trigger the delete

        //Deleting record in jsdo
        //More information in https://tinyurl.com/y89uyywm
        var todorecord = this.jsdo.find(function(record) { //Find the record which need to be deleted
            return (record.data.id === todo.id);
          });

        if (todorecord) {
            todorecord.remove(); //Delete record
        }

        this.jsdo.saveChanges(false).done(function(jsdo,request,success){
            console.log("Item delete!");
            that.todos.splice(index, 1); //Remove the item in the page
           }).fail(function(jsdo,request,success){
             console.log("Error deleting item");
         });
 
       
        
    }
    
    public check(todo: Todo) {
        todo.completed = !todo.completed;

        // Executing the Invoke operation for changing the completed value
        // More info in https://tinyurl.com/yajyzpjb
        this.jsdo.subscribe('afterInvoke', 'ChangeCompleted', 
        this.onAfterInvokeChange); 
        var index = this.todos.indexOf(todo);

        this.jsdo.ChangeCompleted({pId:todo.id})
      
    }
    
    hasItems() {
        return this.todos.length > 0;
    }
    // Invoke subscription method for upgrading completed field
    private onAfterInvokeChange (jsdo  , success , request ) {
        
        /* check for errors on any Invoke operation */
        if (success) {
           var myPage = frameModule.topmost().currentPage;
           console.log("Item update successfully!");
          myPage.getViewById("items").refresh();
          
        }
        else {
            console.log("Invoke fail");
        }
    }
    // Create subcription method for pushing the todo record from JSDO, because id field is a sequence
    private onAfterCreate (jsdo , record , success , request ) {
        
        /* check for errors on any Create operation */
        if (success) {
          view.todos.push(record.data);
          view.todos.set('newTodo', ''); // Empty the todo
          console.log(view.todos.newTodo);
          console.log(record);
        }
        else {
            
        }
    }
    
}


export default ViewModel;
