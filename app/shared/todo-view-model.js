"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var observable_array_1 = require("data/observable-array");
var todo_1 = require("./todo");
var frameModule = require("ui/frame");
require("progress-jsdo/src/progress.util");
var progress_jsdo_1 = require("progress-jsdo");
var view;
var ViewModel = (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel() {
        var _this = _super.call(this) || this;
        _this.theFilter = null;
        _this.selectAll = false;
        _this.todos = new observable_array_1.ObservableArray();
        view = _this;
        var that = _this;
        // Configuring service, catalog for using jsdo 
        try {
            progress_jsdo_1.progress.data.getSession({
                serviceURI: "http://ec2-54-152-207-174.compute-1.amazonaws.com:8810/todo",
                catalogURI: "http://ec2-54-152-207-174.compute-1.amazonaws.com:8810/todo/rest/static/todoService.json",
                authenticationModel: "anonymous"
            }).done(function () {
                that.jsdo = new progress_jsdo_1.progress.data.JSDO({ name: "todo" }); //Name of the resource
                that._get();
            }).fail(function (result, info) {
                console.log("Error creating session.");
                console.log(result);
                console.log(info);
            });
        }
        catch (e) {
            console.log("Exception: " + e);
        }
        return _this;
    }
    ViewModel.prototype._get = function () {
        var that = this;
        //Reading the records from JSDO
        //More information in https://tinyurl.com/y7pgqlqe
        this.jsdo.fill().done(function () {
            var todosjsdo = that.jsdo.getData();
            todosjsdo.forEach(function (record) {
                that.todos.push(record); // Pushing todo record to Todo Observable
            });
            // Refreshing List View
            var myPage = frameModule.topmost().currentPage;
            myPage.getViewById("items").refresh(); //Refreshing todos list
        }).fail(function () {
            console.log("Error reading records.");
        });
    };
    ViewModel.prototype.add = function () {
        if (this.newTodo.trim().length > 0) {
            var that = this;
            this.item = new todo_1.Todo(); // Create a new todo item
            //Initialize the values of the new todo
            this.item.id = 0;
            this.item.task = this.newTodo;
            this.item.completed = false;
            // Adding records using JSDO
            // More information in https://tinyurl.com/yajyzpjb
            this.jsdo.tttodo.subscribe('afterCreate', this.onAfterCreate);
            this.jsdo.add(this.item);
            this.jsdo.saveChanges(false)
                .done(function (jsdo, request, success) {
                console.log("Item added!");
            }).fail(function (jsdo, request, success) {
                console.log("Error adding item");
            });
        }
    };
    ViewModel.prototype.remove = function (todo) {
        var that = this;
        var index = this.todos.indexOf(todo); //Getting the index of the record which trigger the delete
        //Deleting record in jsdo
        //More information in https://tinyurl.com/y89uyywm
        var todorecord = this.jsdo.find(function (record) {
            return (record.data.id === todo.id);
        });
        if (todorecord) {
            todorecord.remove(); //Delete record
        }
        this.jsdo.saveChanges(false).done(function (jsdo, request, success) {
            console.log("Item delete!");
            that.todos.splice(index, 1); //Remove the item in the page
        }).fail(function (jsdo, request, success) {
            console.log("Error deleting item");
        });
    };
    ViewModel.prototype.check = function (todo) {
        todo.completed = !todo.completed;
        // Executing the Invoke operation for changing the completed value
        // More info in https://tinyurl.com/yajyzpjb
        this.jsdo.subscribe('afterInvoke', 'ChangeCompleted', this.onAfterInvokeChange);
        var index = this.todos.indexOf(todo);
        this.jsdo.ChangeCompleted({ pId: todo.id });
    };
    ViewModel.prototype.hasItems = function () {
        return this.todos.length > 0;
    };
    // Invoke subscription method for upgrading completed field
    ViewModel.prototype.onAfterInvokeChange = function (jsdo, success, request) {
        /* check for errors on any Invoke operation */
        if (success) {
            var myPage = frameModule.topmost().currentPage;
            console.log("Item update successfully!");
            myPage.getViewById("items").refresh();
        }
        else {
            console.log("Invoke fail");
        }
    };
    // Create subcription method for pushing the todo record from JSDO, because id field is a sequence
    ViewModel.prototype.onAfterCreate = function (jsdo, record, success, request) {
        /* check for errors on any Create operation */
        if (success) {
            view.todos.push(record.data);
            view.todos.set('newTodo', ''); // Empty the todo
            console.log(view.todos.newTodo);
            console.log(record);
        }
        else {
        }
    };
    return ViewModel;
}(observable_1.Observable));
exports.default = ViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidG9kby12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTZDO0FBQzdDLDBEQUF3RDtBQUV4RCwrQkFBNkI7QUFFN0IsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBR3RDLDJDQUF5QztBQUN6QywrQ0FBeUM7QUFHekMsSUFBSSxJQUFJLENBQUM7QUFHVDtJQUF3Qiw2QkFBVTtJQVU5QjtRQUFBLFlBQ0ksaUJBQU8sU0F3QlY7UUEvQkQsZUFBUyxHQUFZLElBQUksQ0FBQztRQUMxQixlQUFTLEdBQVksS0FBSyxDQUFDO1FBT3ZCLEtBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxrQ0FBZSxFQUFRLENBQUM7UUFDekMsSUFBSSxHQUFHLEtBQUksQ0FBQztRQUNaLElBQUksSUFBSSxHQUFHLEtBQUksQ0FBQztRQUVoQiwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDO1lBQ0Qsd0JBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUN2QixVQUFVLEVBQUUsNkRBQTZEO2dCQUN6RSxVQUFVLEVBQUUsMEZBQTBGO2dCQUN0RyxtQkFBbUIsRUFBRSxXQUFXO2FBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLHdCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO2dCQUMxRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFZixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxNQUFNLEVBQUUsSUFBSTtnQkFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixPQUFPLENB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QUNuRCx1Q0FBbUIsR0FBM0IsVUFBNkIsSUFBSSxFQUFJLE9BQU8sRUFBRyxPQUFPO1FBRWxELDhDQUE4QztRQUM5QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQztZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV4QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBQ0Qsa0dBQWtHO0lBQzFGLGlDQUFhLEdBQXJCLFVBQXVCLElBQUksRUFBRyxNQUFNLEVBQUcsT0FBTyxFQUFHLE9BQU87UUFFcEQsOENBQThDO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztRQUVOLENBQUM7SUFDTCxDQUFDO0lBRUwsZ0JBQUM7QUFBRCxDQUFDLEFBOUpELENBQXdCLHVCQUFVLEdBOEpqQztBQUdELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdkYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnZGF0YS9vYnNlcnZhYmxlLWFycmF5JztcbmltcG9ydCB7UGFnZX0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7VG9kb30gZnJvbSAgXCIuL3RvZG9cIjtcblxudmFyIGZyYW1lTW9kdWxlID0gcmVxdWlyZShcInVpL2ZyYW1lXCIpO1xuXG5cbmltcG9ydCBcInByb2dyZXNzLWpzZG8vc3JjL3Byb2dyZXNzLnV0aWxcIjtcbmltcG9ydCB7IHByb2dyZXNzIH0gZnJvbSBcInByb2dyZXNzLWpzZG9cIjtcbmltcG9ydCAqIGFzIHNlc3Npb25TdG9yYWdlIGZyb20gXCJuYXRpdmVzY3JpcHQtbG9jYWxzdG9yYWdlXCIgO1xuXG52YXIgdmlldztcblxuXG5jbGFzcyBWaWV3TW9kZWwgZXh0ZW5kcyBPYnNlcnZhYmxlIHtcbiAgICBcbiAgICBpdGVtOiBUb2RvO1xuICAgIG5ld1RvZG86c3RyaW5nO1xuICAgIHRoZUZpbHRlcjogYm9vbGVhbiA9IG51bGw7XG4gICAgc2VsZWN0QWxsOiBib29sZWFuID0gZmFsc2U7XG4gICAgdG9kb3M6IE9ic2VydmFibGVBcnJheTxUb2RvPjsgICAgXG4gICAganNkbztcbiAgICBcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRvZG9zID0gbmV3IE9ic2VydmFibGVBcnJheTxUb2RvPigpO1xuICAgICAgICB2aWV3ID0gdGhpcztcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIC8vIENvbmZpZ3VyaW5nIHNlcnZpY2UsIGNhdGFsb2cgZm9yIHVzaW5nIGpzZG8gXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9ncmVzcy5kYXRhLmdldFNlc3Npb24oe1xuICAgICAgICAgICAgICBzZXJ2aWNlVVJJOiBcImh0dHA6Ly9lYzItNTQtMTUyLTIwNy0xNzQuY29tcHV0ZS0xLmFtYXpvbmF3cy5jb206ODgxMC90b2RvXCIsXG4gICAgICAgICAgICAgIGNhdGFsb2dVUkk6IFwiaHR0cDovL2VjMi01NC0xNTItMjA3LTE3NC5jb21wdXRlLTEuYW1hem9uYXdzLmNvbTo4ODEwL3RvZG8vcmVzdC9zdGF0aWMvdG9kb1NlcnZpY2UuanNvblwiLCAgICAgIFxuICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbk1vZGVsOiBcImFub255bW91c1wiXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgIHRoYXQuanNkbyA9IG5ldyBwcm9ncmVzcy5kYXRhLkpTRE8oe25hbWU6IFwidG9kb1wifSk7IC8vTmFtZSBvZiB0aGUgcmVzb3VyY2VcbiAgICAgICAgICAgICAgIHRoYXQuX2dldCgpO1xuICAgICAgICAgXG4gICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChyZXN1bHQsIGluZm8pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGNyZWF0aW5nIHNlc3Npb24uXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5mbyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeGNlcHRpb246IFwiICsgZSk7XG4gICAgICAgICAgfVxuICAgICBcbiAgICB9XG4gICBcbiAgICBwdWJsaWMgX2dldCgpIFxuICAgIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGF0ID10aGlzO1xuICAgICAgICAvL1JlYWRpbmcgdGhlIHJlY29yZHMgZnJvbSBKU0RPXG4gICAgICAgIC8vTW9yZSBpbmZvcm1hdGlvbiBpbiBodHRwczovL3Rpbnl1cmwuY29tL3k3cGdxbHFlXG5cbiAgICAgICAgdGhpcy5qc2RvLmZpbGwoKS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgdmFyIHRvZG9zanNkbyA9IHRoYXQuanNkby5nZXREYXRhKCk7XG4gICAgICAgICAgIHRvZG9zanNkby5mb3JFYWNoKHJlY29yZCA9PiB7XG4gICAgICAgICAgICAgICAgdGhhdC50b2Rvcy5wdXNoKHJlY29yZCk7IC8vIFB1c2hpbmcgdG9kbyByZWNvcmQgdG8gVG9kbyBPYnNlcnZhYmxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZnJlc2hpbmcgTGlzdCBWaWV3XG4gICAgICAgICAgICB2YXIgbXlQYWdlID0gZnJhbWVNb2R1bGUudG9wbW9zdCgpLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgbXlQYWdlLmdldFZpZXdCeUlkKFwiaXRlbXNcIikucmVmcmVzaCgpOyAvL1JlZnJlc2hpbmcgdG9kb3MgbGlzdFxuICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciByZWFkaW5nIHJlY29yZHMuXCIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgfVxuICAgIFxuXG4gICAgcHVibGljIGFkZCgpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubmV3VG9kby50cmltKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgdGhpcy5pdGVtID0gbmV3IFRvZG8oKTsgLy8gQ3JlYXRlIGEgbmV3IHRvZG8gaXRlbVxuICAgICAgICAgICAvL0luaXRpYWxpemUgdGhlIHZhbHVlcyBvZiB0aGUgbmV3IHRvZG9cbiAgICAgICAgICAgdGhpcy5pdGVtLmlkID0gMDtcbiAgICAgICAgICAgdGhpcy5pdGVtLnRhc2sgPSB0aGlzLm5ld1RvZG87XG4gICAgICAgICAgIHRoaXMuaXRlbS5jb21wbGV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgLy8gQWRkaW5nIHJlY29yZHMgdXNpbmcgSlNET1xuICAgICAgICAgICAgLy8gTW9yZSBpbmZvcm1hdGlvbiBpbiBodHRwczovL3Rpbnl1cmwuY29tL3lhanl6cGpiXG4gIFxuICAgICAgICAgICB0aGlzLmpzZG8udHR0b2RvLnN1YnNjcmliZSgnYWZ0ZXJDcmVhdGUnLCB0aGlzLm9uQWZ0ZXJDcmVhdGUpO1xuXG4gICAgICAgICAgIHRoaXMuanNkby5hZGQodGhpcy5pdGVtKTtcbiAgICAgICAgICAgdGhpcy5qc2RvLnNhdmVDaGFuZ2VzKGZhbHNlKVxuICAgICAgICAgICAuZG9uZShmdW5jdGlvbihqc2RvLHJlcXVlc3Qsc3VjY2Vzcyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJdGVtIGFkZGVkIVwiKVxuICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKGpzZG8scmVxdWVzdCxzdWNjZXNzKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBhZGRpbmcgaXRlbVwiKTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlbW92ZSh0b2RvOiBUb2RvKSB7XG4gICAgICAgIHZhciB0aGF0PXRoaXM7XG5cbiAgICAgICAgXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMudG9kb3MuaW5kZXhPZih0b2RvKTsgLy9HZXR0aW5nIHRoZSBpbmRleCBvZiB0aGUgcmVjb3JkIHdoaWNoIHRyaWdnZXIgdGhlIGRlbGV0ZVxuXG4gICAgICAgIC8vRGVsZXRpbmcgcmVjb3JkIGluIGpzZG9cbiAgICAgICAgLy9Nb3JlIGluZm9ybWF0aW9uIGluIGh0dHBzOi8vdGlueXVybC5jb20veTg5dXl5d21cbiAgICAgICAgdmFyIHRvZG9yZWNvcmQgPSB0aGlzLmpzZG8uZmluZChmdW5jdGlvbihyZWNvcmQpIHsgLy9GaW5kIHRoZSByZWNvcmQgd2hpY2ggbmVlZCB0byBiZSBkZWxldGVkXG4gICAgICAgICAgICByZXR1cm4gKHJlY29yZC5kYXRhLmlkID09PSB0b2RvLmlkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAodG9kb3JlY29yZCkge1xuICAgICAgICAgICAgdG9kb3JlY29yZC5yZW1vdmUoKTsgLy9EZWxldGUgcmVjb3JkXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmpzZG8uc2F2ZUNoYW5nZXMoZmFsc2UpLmRvbmUoZnVuY3Rpb24oanNkbyxyZXF1ZXN0LHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJJdGVtIGRlbGV0ZSFcIik7XG4gICAgICAgICAgICB0aGF0LnRvZG9zLnNwbGljZShpbmRleCwgMSk7IC8vUmVtb3ZlIHRoZSBpdGVtIGluIHRoZSBwYWdlXG4gICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oanNkbyxyZXF1ZXN0LHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgZGVsZXRpbmcgaXRlbVwiKTtcbiAgICAgICAgIH0pO1xuIFxuICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGNoZWNrKHRvZG86IFRvZG8pIHtcbiAgICAgICAgdG9kby5jb21wbGV0ZWQgPSAhdG9kby5jb21wbGV0ZWQ7XG5cbiAgICAgICAgLy8gRXhlY3V0aW5nIHRoZSBJbnZva2Ugb3BlcmF0aW9uIGZvciBjaGFuZ2luZyB0aGUgY29tcGxldGVkIHZhbHVlXG4gICAgICAgIC8vIE1vcmUgaW5mbyBpbiBodHRwczovL3Rpbnl1cmwuY29tL3lhanl6cGpiXG4gICAgICAgIHRoaXMuanNkby5zdWJzY3JpYmUoJ2FmdGVySW52b2tlJywgJ0NoYW5nZUNvbXBsZXRlZCcsIFxuICAgICAgICB0aGlzLm9uQWZ0ZXJJbnZva2VDaGFuZ2UpOyBcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy50b2Rvcy5pbmRleE9mKHRvZG8pO1xuXG4gICAgICAgIHRoaXMuanNkby5DaGFuZ2VDb21wbGV0ZWQoe3BJZDp0b2RvLmlkfSlcbiAgICAgIFxuICAgIH1cbiAgICBcbiAgICBoYXNJdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9kb3MubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgLy8gSW52b2tlIHN1YnNjcmlwdGlvbiBtZXRob2QgZm9yIHVwZ3JhZGluZyBjb21wbGV0ZWQgZmllbGRcbiAgICBwcml2YXRlIG9uQWZ0ZXJJbnZva2VDaGFuZ2UgKGpzZG8gICwgc3VjY2VzcyAsIHJlcXVlc3QgKSB7XG4gICAgICAgIFxuICAgICAgICAvKiBjaGVjayBmb3IgZXJyb3JzIG9uIGFueSBJbnZva2Ugb3BlcmF0aW9uICovXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgIHZhciBteVBhZ2UgPSBmcmFtZU1vZHVsZS50b3Btb3N0KCkuY3VycmVudFBhZ2U7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKFwiSXRlbSB1cGRhdGUgc3VjY2Vzc2Z1bGx5IVwiKTtcbiAgICAgICAgICBteVBhZ2UuZ2V0Vmlld0J5SWQoXCJpdGVtc1wiKS5yZWZyZXNoKCk7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkludm9rZSBmYWlsXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIENyZWF0ZSBzdWJjcmlwdGlvbiBtZXRob2QgZm9yIHB1c2hpbmcgdGhlIHRvZG8gcmVjb3JkIGZyb20gSlNETywgYmVjYXVzZSBpZCBmaWVsZCBpcyBhIHNlcXVlbmNlXG4gICAgcHJpdmF0ZSBvbkFmdGVyQ3JlYXRlIChqc2RvICwgcmVjb3JkICwgc3VjY2VzcyAsIHJlcXVlc3QgKSB7XG4gICAgICAgIFxuICAgICAgICAvKiBjaGVjayBmb3IgZXJyb3JzIG9uIGFueSBDcmVhdGUgb3BlcmF0aW9uICovXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgdmlldy50b2Rvcy5wdXNoKHJlY29yZC5kYXRhKTtcbiAgICAgICAgICB2aWV3LnRvZG9zLnNldCgnbmV3VG9kbycsICcnKTsgLy8gRW1wdHkgdGhlIHRvZG9cbiAgICAgICAgICBjb25zb2xlLmxvZyh2aWV3LnRvZG9zLm5ld1RvZG8pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBWaWV3TW9kZWw7Il19