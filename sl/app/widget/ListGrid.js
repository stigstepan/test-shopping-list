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
		markDirty: false
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
		fields: ['name']
	},

	columns: [{
		dataIndex: 'name',
		header: false,
		flex: 1,
        editor: {
			allowBlank: false
		}
	}],

	tbar: ['->', {
        text: 'Добавить',
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

		me.controller.updateListData(data);

		const names = data.map(function (list) {
			return {name: list.name};
		});

		me.store.loadData(names);

		me.setSelection(me.store.first());
	}
});

Ext.define('SL.widget.ListGridController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-list-grid-controller',

	onCellEdit: function (editor, context) {
		const me = this;

		const newName = context.record.data.name;
		const prevName = context.record.previousValues.name;

		me.updateListName(prevName, newName);
	},

	onListSelect: function (rowmodel, record) {
		const me = this, view = me.getView();

		const name = record.data.name;
		const data = me.getLocalStorageData().filter(function (list) {
			return list.name == name;
		})[0];

		view.itemsGrid.setListName(data.name)
		view.itemsGrid.setData(data.items);
	},

	getDefaultData: function () {
		return [{
			name: 'Продукты',
			items: [
				{name: 'Хлеб', count: 1, units: 'шт'},
				{name: 'Помидоры', count: 2, units: 'кг'},
				{name: 'Огурцы', count: 2, units: 'кг'},
				{name: 'Пиво', count: 6, units: 'бан'}
			]
		}, {
			name: 'Химия',
			items: [
				{name: 'Стеклоочиститель', count: 1, units: 'л'},
				{name: 'Тряпки', count: 2, units: 'шт'},
				{name: 'Стиральный порошок', count: 5, units: 'кг'}
			]
		}, {
			name: 'Машина',
			items: [
				{name: 'Покрышки', count: 4, units: 'шт'},
				{name: 'Незамерзайка', count: 5, units: 'л'},
				{name: 'Свечи зажигания', count: 12, units: 'шт'},
				{name: 'Моторное масло', count: 3, units: 'л'}
			]
		}];
	},

	addList: function () {
		const me = this, view = me.getView(), store = view.getStore();

		const empty = {name: '', id: Ext.id(), items: []};
		const record = store.add(empty);

		view.getSelectionModel().select(record);
		view.getView().focusRow(record[0]);

		//emulate click on 'name' cell

		data = me.getLocalStorageData();
		data.push({empty});
		me.updateListData(data);
	},

	updateListName: function (prevName, newName) {
		const me = this;
		const data = me.getLocalStorageData();

		data.some(function (list) {
			if (list.name == prevName) { 
				list.name = newName;
				return true;
			}
			return false;
		});

		me.updateListData(data);
		me.view.itemsGrid.setListName(newName);
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

	updateListData: function (data) {
		try {
			localStorage.setItem('sl-listgrid-data', JSON.stringify(data));
		} catch (e) {
			console.error(e.stack);
		}
	}
});
