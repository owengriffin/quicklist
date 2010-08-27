// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var QuickList = {};
QuickList.Done = {};
QuickList.Done.table = (function() {
    var view, data;
    data = [];

    view = Titanium.UI.createTableView( { data: data });

    return view;
}());
QuickList.Done.tab = (function() {
    var win, tab;

    win = Titanium.UI.createWindow({  
	title:'Done',
	backgroundColor:'#fff'
    });

    tab = Titanium.UI.createTab({  
	icon:'KS_nav_ui.png',
	title:'Done',
	window: win
    });
    win.add(QuickList.Done.table);

    return tab;
}());

QuickList.Todo = {};
QuickList.Todo.table = (function() {
    var view, data, add;
    
    add = (function() { 
	var view, textfield, button;

	textfield = Titanium.UI.createTextField({
	    color: '#999',
	    hintText: 'New item...',
	    left: 0,
	    width: 236,
	    clickName: 'textbox'
	});
	
	button = Titanium.UI.createButton({
	    title: '+',
	    width: 60,
	    left: 240,
	    top: 5, 
	    bottom: 5,
	    height: 34,
	    clickName: 'add'
	});
	
	view = Titanium.UI.createTableViewRow({
	    'height' : 'auto'
	});
	
	view.add(textfield);
	view.add(button);
	
	return { view: view, button: button, textfield: textfield };
    }());

    data = [add.view];

    view = Titanium.UI.createTableView( { data: data , top: 5});
    view.addEventListener('click', function(event) {
	if (event.source.clickName === 'add') {
	    QuickList.Todo.add(add.textfield.value);
	} else if (event.source.clickName !== 'textbox') {
	    QuickList.Todo.complete(event.index, event.rowData.title);
	}
    });
    return view;
}());
QuickList.Todo.add = function(text) {
    QuickList.Todo.table.appendRow({title:text, color: '#000'});
};
QuickList.Todo.complete = function(index, item) {
    var dialog, title;

    title = item + '';

    dialog = Titanium.UI.createAlertDialog({
	title: 'Confirmation',
	message: 'Have you completed this task?',
	buttonNames: ['Yes','No']
    });

    dialog.addEventListener('click', function(event) {
	if (event.index === 0) {
	    QuickList.Done.table.appendRow({title: title});
	    QuickList.Todo.table.deleteRow(index);
	}
    });

    dialog.show();
};
QuickList.Todo.tab = (function() {
    var win, tab;

    win = Titanium.UI.createWindow({  
	title:'Todo',
	backgroundColor:'#fff'
    });

    tab = Titanium.UI.createTab({  
	icon:'KS_nav_views.png',
	title: 'Todo',
	window: win
    });
    win.add(QuickList.Todo.table);

    return tab;
}());

QuickList.init = function() {
    var tabGroup;

    tabGroup = Titanium.UI.createTabGroup();

    tabGroup.addTab(QuickList.Todo.tab);  
    tabGroup.addTab(QuickList.Done.tab);  
    tabGroup.open();
};

(function() {
    QuickList.init();
}());