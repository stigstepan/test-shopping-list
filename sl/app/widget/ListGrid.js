/*
 * Grid for displaying shop list names.
 *
 * 2021.
 * @author Stepan Ignatov.
 *
 * */

Ext.define('SL.widget.ListGrid', {
	extend: 'Ext.grid.Panel',
	xtype: 'sl-list-grid',
	controller: 'sl-list-grid-controller',
    cls: 'large-font-grid',

	viewConfig: {
		stripeRows: true,
		markDirty: false,
		plugins: [{
            ptype: 'gridviewdragdrop',
            dragText: 'Перенести'
        }],
		listeners: {
			drop: function(node, data, dropRec, dropPosition) {
				this.up('grid').controller.sortStorageData();
			}
		}
	},

	plugins: {
		cellediting: {
			clicksToEdit: 2
		}
	},

	listeners: {
		edit: 'onCellEdit',
		select: 'onListSelect'
	},

	store: {
		fields: ['id', 'name']
	},

	columns: [{
		dataIndex: 'name',
		header: false,
		flex: 1,
        editor: {
			allowBlank: false
		}
	}, {
		xtype: 'actioncolumn',
		width: 40,
		sortable: false,
		draggable: false,
		menuDisabled: true,
		iconCls: 'x-fa fa-minus red',
		tooltip: 'Удалить список',
		handler: 'confirmRemoveList'
	}],

	tbar: ['->', {
		tooltip: 'Сортировать по имени',
		iconCls: 'x-fa fa-sort-alpha-asc',
		handler: 'sortLists'
	}, {
        tooltip: 'Создать список',
        iconCls: 'x-fa fa-plus',
		handler: 'addList',
    }],

	afterRender: function () {
		const me = this;
		me.callParent(arguments);

		me.itemsGrid = Ext.getCmp('sl-items-grid');
		if (!me.itemsGrid) {
			console.error('Error: items grid not found by id');
			return;
		}
		me.getData();
	},

	getData: function () {
		const me = this;

		let isLSDataExist = localStorage.getItem('sl-listgrid-data');

		if (isLSDataExist) {
			data = me.controller.getLocalStorageData();
		} else {
			data = me.controller.getDefaultData();
		}
		
		me.setData(data);
	},

	setData: function (data) {
		const me = this;
		if (!Ext.isArray(data)) { data = []; }

		me.controller.setLocalStorageData(data);

		const lists = data.map(function (list) {
			return {id: list.id, name: list.name};
		});

		me.store.loadData(lists);

		me.setSelection(me.store.first());
	}
});

Ext.define('SL.widget.ListGridController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-list-grid-controller',

	onCellEdit: function (editor, context) {
		this.updateListName(context.record.data);
	},

	onListSelect: function (rowmodel, record) {
		const me = this, view = me.getView();

		const id = record.data.id;
		const data = me.getLocalStorageData().filter(function (list) {
			return list.id == id;
		})[0];

		const listid = data ? data.id : null;
		const items = data ? data.items : null;

		view.itemsGrid.setListId(listid)
		view.itemsGrid.setData(items);
	},

	getDefaultData: function () {
		return [{
			id: '1',
			name: 'Продукты',
			items: [
				{name: 'Хлеб', count: 1, units: 'шт', done: false},
				{name: 'Помидоры', count: 2, units: 'кг', done: false},
				{name: 'Огурцы', count: 2, units: 'кг', done: false},
				{name: 'Пиво', count: 6, units: 'бан', done: false}
			]
		}, {
			id: '2',
			name: 'Химия',
			items: [
				{name: 'Стеклоочиститель', count: 1, units: 'л', done: false},
				{name: 'Тряпки', count: 2, units: 'шт', done: false},
				{name: 'Стиральный порошок', count: 5, units: 'кг', done: false}
			]
		}, {
			id: '3',
			name: 'Машина',
			items: [
				{name: 'Покрышки', count: 4, units: 'шт', done: false},
				{name: 'Незамерзайка', count: 5, units: 'л', done: false},
				{name: 'Свечи зажигания', count: 12, units: 'шт', done: false},
				{name: 'Моторное масло', count: 3, units: 'л', done: false}
			]
		}];
	},

	addList: function () {
		const me = this, view = me.getView(), store = view.getStore();

		const newListName = me.getNewListName();
		const empty = {name: newListName, id: Ext.id() + (new Date()).valueOf(), items: []};
		const record = store.add(empty);

		data = me.getLocalStorageData();
		data.push(empty);
		me.setLocalStorageData(data);

		view.getSelectionModel().select(record);
		view.getView().focusRow(record[0]);
	},

	getNewListName: function () {
		const items = this.view.store.data.items;
		let count = 0, name, find = false;
		while(!find) {
			count++;
			name = 'Список ' + count;
			find = items.every(function (item) {
				return item.data.name != name;
			});
		}
		return name;
	},

	updateListName: function (info) {
		const me = this, id = info.id, newName = info.name;
		const data = me.getLocalStorageData();

		data.some(function (list) {
			if (list.id == id) { 
				list.name = newName;
				return true;
			}
			return false;
		});

		me.setLocalStorageData(data);
	},

	getLocalStorageData: function () {
		let result = localStorage.getItem('sl-listgrid-data');
		if (!result) { return []; }
		
		try {
			result = JSON.parse(result);
		} catch (e) {
			console.error(e.stack);
			return [];
		}

		if (!Ext.isArray(result)) { return []; }

		return result;
	},

	setLocalStorageData: function (data) {
		try {
			localStorage.setItem('sl-listgrid-data', JSON.stringify(data));
		} catch (e) {
			console.error(e.stack);
		}
	},

	sortStorageData: function () {
		const me = this;

		data = me.getLocalStorageData();
		data.sort(function (first, second) {
			const firstPos = me.getListPosition(first);
			const secondPos = me.getListPosition(second);
			if (firstPos > secondPos) { return 1; }
			if (firstPos < secondPos) { return -1; }
			return 0;
		});

		me.setLocalStorageData(data);	
	},

	getListPosition: function (list) {
		const me = this;
		const storeData = me.getFormatedItems();

		return storeData.indexOf(storeData.find(item => item.id == list.id));
	},

	getFormatedItems: function () {
		const me = this, view = me.view;

		const items = view.store.data.items;
		const result = items.map(function (item) {
			const res = {};
			for (d in item.data) {
				if (!Object.prototype.hasOwnProperty.call(item.data, d)) { continue; }

				res[d] = item.data[d];
			}
			return res;
		});

		return result;
	},

	sortLists: function () {
		const store = this.view.store;
		const sortedData = store.data.items.sort(function (a, b) {
			if (a.data.name > b.data.name) { return 1; }
			if (a.data.name < b.data.name) { return -1; }
			if (a.data.name == b.data.name) { return 0; }
		});
		store.loadData(sortedData);

		this.sortStorageData();
	},

	confirmRemoveList: function (tv, rowIndex, colIndex, item, e, record, row) {
		const me = this;

		Ext.Msg.confirm('Удаление списка', 'Вы уверены, что хотите удалить список "' + record.data.name + '"?',
			function (choice) {
				if (choice === 'yes') {
					me.removeList(record);
				}
			}
		);
		
	},

	removeList: function (record, row) {
		const me = this, view = me.getView(), store = view.getStore();

		data = me.getLocalStorageData();
		const index = me.getListPosition({id: record.data.id});
		data.splice(index, 1);
		me.setLocalStorageData(data);

		store.remove(record);

		const first = store.first();
		if (!first) { return; }

		view.getSelectionModel().select(first);
		view.getView().focusRow(first);
		
	}
});
