/*
 * Grid for displaying shop list items.
 *
 * 2021.
 * @author Stepan Ignatov.
 *
 * */

Ext.define('SL.widget.ItemsList', {
	extend: 'Ext.grid.Panel',
	xtype: 'sl-items-grid',
	id: 'sl-items-grid',
	referenceHolder: true,

    cls: 'large-font-grid',

	controller: 'sl-items-grid-controller',

	viewConfig: {
		stripeRows: true,
		markDirty: false,
		plugins: [{
            ptype: 'gridviewdragdrop',
            dragText: 'Перенести'
        }],
		listeners: {
			drop: function(node, data, dropRec, dropPosition) {
				this.lookupReferenceHolder().updateLocalStorageData()
			}
		}
	},

	plugins: {
		cellediting: {
			clicksToEdit: 1
		}
	},

	listeners: {
		edit: 'onCellEdit'
	},

	tbar: [{
		iconCls: 'x-fa fa-search',
		style: 'background-color: white;border: none;',
		handler: 'searchItem'
	}, {
		xtype: 'textfield',
		width: 400,
		reference: 'searchfield-ref',
		emptyText: 'Найти',
		listeners : {
			render: function(cmp) {
				const ctrl = cmp.up('grid').controller;
				cmp.getEl().on('keypress', function(e) {
					if (e.getKey() == e.ENTER) {
						ctrl.searchItem();
					}
				});
			}
		}
    }, '->', {
		text: 'Сортировать по имени',
		iconCls: 'x-fa fa-sort-alpha-asc',
		handler: 'sortItems'
	}, {
		text: 'Добавить',
		iconCls: 'x-fa fa-plus',
		handler: 'addItem'
	}, {
		iconCls: 'x-fa fa-question-circle-o',
		handler: 'showAppInfo'
	}],

	store: {
		fields: ['name', 'count', 'units']
	},

	columns: [{
		dataIndex: 'name',
		sortable: false,
		text: 'Имя',
		flex: 6,
		editor: {
			allowBlank: false
		}
	}, {
		dataIndex: 'count',
		sortable: false,
		text: 'Количество',
		flex: 1,
		editor: {
			xtype: 'numberfield',
        	minValue: 0,
			allowDecimal: true,
			allowExponential: false
		},
	}, {
		dataIndex: 'units',
		sortable: false,
		text: 'Единицы измерения',
		flex: 1,
		editor: {
			xtype: 'combo',
			displayField: 'name',
			valueField: 'name',
			editable: false,
			store: {
				fields: ['name'],
				data: [{name: 'шт'}, {name: 'кг'}, {name: 'л'}, {name: 'бан'}]
			}
		}
	}, {
		xtype: 'actioncolumn',
		width: 40,
		sortable: false,
		draggable: false,
		menuDisabled: true,
		iconCls: 'x-fa fa-minus red',
		tooltip: 'Удалить продукт',
		handler: 'removeItem'
	}],

	afterRender: function () {
		const me = this;
		me.callParent(arguments);

	},

	setListName: function (name) {
		this.currentListName = name;
	},

	setData: function (data) {
		const me = this, store = me.getStore();

		if (!Ext.isArray(data)) {
			store.loadData([]);
			return;
		}

		store.loadData(data);
	}
});

Ext.define('SL.widget.ItemsListController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-items-grid-controller',

	addItem: function () {
		const me = this, view = me.getView(), store = view.getStore();

		const record = store.add({name: '', count: 1, units: 'шт'});
		view.getSelectionModel().select(record);
		view.getView().focusRow(record[0]);

		//emulate click on 'name' cell
		me.updateLocalStorageData();

	},

	removeItem: function (tv, rowIndex, colIndex, item, e, record, row) {
		const me = this, view = me.getView(), store = view.getStore();

		store.remove(record);

		me.updateLocalStorageData();
	},

	sortItems: function () {
		const store = this.view.store;
		const sortedData = store.data.items.sort(function (a, b) {
			if (a.data.name > b.data.name) { return 1; }
			if (a.data.name < b.data.name) { return -1; }
			if (a.data.name == b.data.name) { return 0; }
		});
		store.loadData(sortedData);

		this.updateLocalStorageData();
	},

	searchItem: function () {

	},

	onCellEdit: function (editor, context) {
		const me = this;
		// const data = context.record.data;
		me.updateLocalStorageData();
	},

	showAppInfo: function () {
		const me = this, view = me.getView();

		const wnd = view.appInfoWnd;
		if (wnd) {
			if (wnd.isVisible()) {
				wnd.hide();
			} else {
				wnd.show();
			}
			return;
		}


		view.appInfoWnd = Ext.create('Ext.window.Window', {
			title: 'Справка',
			width: 400,
			height: 500,
			modal: false,
			resizable: false,
			layout: 'fit',
			referenceHolder: true,

			items: {html: ''},

			listeners: {
				close: function () {
					view.appInfoWnd = null;
				}
			}
		});
		view.appInfoWnd.show();
	},

	getLocalStorageData: function () {
		let result;

		result = localStorage.getItem('sl-listgrid-data');
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

	updateLocalStorageData: function () {
		const me = this, name = me.view.currentListName, items = me.getFormatedItems();

		data = me.getLocalStorageData();
		data.some(function (list) {
			if (list.name == name) { 
				list.items = items;
				return true;
			}
			return false;
		});

		try {
			let strData = JSON.stringify(data);
			localStorage.setItem('sl-listgrid-data', strData);
		} catch (e) {
			console.error(e.stack);
		}
	},

	getFormatedItems: function () {
		const me = this, view = me.view;

		const items = view.store.data.items;
		const result = items.map(function (item) {
			const res = {};
			for (d in item.data) {
				if (!Object.prototype.hasOwnProperty.call(item.data, d)) { continue; }
				if (d == 'id') { continue; }

				res[d] = item.data[d];
			}
			return res;
		});

		return result;
	}
});
