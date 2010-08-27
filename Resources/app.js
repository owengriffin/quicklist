// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var QuickList = {};
QuickList.database = (function() { 
    var db;
    try {
	db = Titanium.Database.install('../quicklist.db', 'quicklist');
	db.execute('CREATE TABLE IF NOT EXISTS DONE (title TEXT)');
	db.execute('CREATE TABLE IF NOT EXISTS TODO (title TEXT)');
    } catch (ex) {
	alert(ex);
    }
    return db;
}());
QuickList.Done = {};
QuickList.Done.data = (function() {
    var db, rows, data;
    data = [];
    db = QuickList.database;
    if (db) {
	rows = db.execute('SELECT * FROM DONE');
	while (rows.isValidRow()) {
	    data.push({title: rows.field(0), color: '#000'});
	    rows.next();
	}
	rows.close();
    }
    return data;
}());
QuickList.Done.table = (function() {
    var view, data;

    view = Titanium.UI.createTableView( { data: QuickList.Done.data });

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
QuickList.Todo.data = (function() {
    var db, rows, data;
    data = [];
    db = QuickList.database;
    if (db) {
	rows = db.execute('SELECT * FROM TODO');
	while (rows.isValidRow()) {
	    data.push({title: rows.field(0), color: '#000'});
	    rows.next();
	}
	rows.close();
    }
    return data;
}());
QuickList.Todo.save = function() {
    var db, index;

    alert('Saving database');

    db = QuickList.database;
    db.execute('DELETE FROM TODO');
    
    for (index = 0; index < QuickList.Todo.data.length; index ++) {
	item = QuickList.Todo.data[index];
	db.execute('INSERT INTO TODO VALUES("' + item.title + '")');
    }
};
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

    data = [add.view].concat(QuickList.Todo.data);

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
    QuickList.Todo.data.push({title: text});
    QuickList.Todo.table.appendRow({title:text, color: '#000'});
    QuickList.database.execute('INSERT INTO TODO (title) VALUES ("' + text + '")');
};
QuickList.Todo.complete = function(index, item) {
    var dialog, title, index;

    title = item + '';

    dialog = Titanium.UI.createAlertDialog({
	title: 'Confirmation',
	message: 'Have you completed this task?',
	buttonNames: ['Yes','No']
    });

    dialog.addEventListener('click', function(event) {
	if (event.index === 0) {
	    QuickList.database.execute('DELETE FROM TODO WHERE title = "' + title + '"');
	    QuickList.database.execute('INSERT INTO DONE (title) VALUES ("' + title + '")');
	    QuickList.Done.table.appendRow({title: title});
	    QuickList.Todo.data.splice(index + 1, 1);
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
    if (!QuickList.database) {
	alert('Unable to load database');
    }
};

(function() {
    QuickList.init();
    
}());