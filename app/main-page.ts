import { Page } from 'ui/page';
import * as view from 'ui/core/view';
import { EventData } from 'data/observable';
import { ObservableArray } from 'data/observable-array';
import { SegmentedBar } from 'ui/segmented-bar';

import ViewModel from './shared/todo-view-model';
import {Todo} from './shared/todo';
 
var viewModel = new ViewModel();

let pageLoaded = (args: EventData) => {
    let page = <Page>args.object;
    page.bindingContext = viewModel;
}

let add = (args: EventData) => {
   console.log("add");
   viewModel.add();
}

let remove = (args: EventData) => {
    // Just getting the todo from the binding context. 
    // This weird syntax is just casting objects to please the TypeScript compiler. 
    var todo = <Todo>(<view.View>args.object).bindingContext;
    viewModel.remove(todo);
}

let check = (args: EventData) => {
    var todo = <Todo>(<view.View>args.object).bindingContext;
    console.log("checked");
    viewModel.check(todo);
}

export { pageLoaded, add , check, remove}
