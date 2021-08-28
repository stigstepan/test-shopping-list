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
		getRowClass: function (rec) {
			return rec.get('done') ? 'sl-gray-item' : ''
		},
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

	multiSelect: true,

	listeners: {
		edit: 'onCellEdit'
	},

	tbar: [{
		iconCls: 'x-fa fa-search',
		reference: 'search-btn-ref',
		style: 'background-color: white;border: none;',
		handler: 'onClearSearchField'
		
	}, {
		xtype: 'textfield',
		width: 400,
		reference: 'searchfield-ref',
		emptyText: 'Найти',
		listeners : {
			change: 'onSearchFieldChange'
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
		handler: 'showAppInfo',
		tooltip: 'О программе'
	}],

	store:  Ext.create('Ext.data.Store', {
		fields: ['done', 'id', 'name', 'count', 'units'],
		sorters: ['done']
	}),

	columns: [{
		xtype: 'checkcolumn',
		// text: '<input class="x-grid-checkcolumn" type="checkbox"/>',
		dataIndex: 'done',
		width: 50,
		listeners: {
			checkchange: 'onItemDone'
		}
	}, {
		dataIndex: 'name',
		sortable: false,
		text: 'Имя',
		flex: 5,
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

	setListId: function (id) {
		this.currentListId = id;
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

		const newItemName = me.getNewItemName();
		const emptyItem = {id: Ext.id() + (new Date()).valueOf(), name: newItemName, count: 1, units: 'шт', done: false}
		const record = store.add(emptyItem);
		view.getSelectionModel().select(record);
		view.getView().focusRow(record[0]);

		me.updateLocalStorageData();
	},

	getNewItemName: function () {
		const items = this.view.store.data.items;
		let count = 0, name, find = false;
		while(!find) {
			count++;
			name = 'Продукт ' + count;
			find = items.every(function (item) {
				return item.data.name != name;
			});
		}
		return name;
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

	onSearchFieldChange: function (cmp, newValue, oldValue, eOpts) {
		const me = this, searchBtn = me.view.lookup('search-btn-ref');

		if (newValue) {
			me.setNameFilter(newValue);
			searchBtn.setIconCls('x-fa fa-remove');
		} else {
			me.clearFilters();
			searchBtn.setIconCls('x-fa fa-search');
		}
	},

	onClearSearchField: function () {
		this.view.lookup('searchfield-ref').setValue(null);
	},

	setNameFilter: function (name) {
		const filters = this.view.store.getFilters();

		filters.add({
			key: 'name',
			id: 'name',
			property: 'name',
			value: name,
			type: 'string',
			anyMatch: true,
			caseSensitive: false
		});
	},

	clearFilters: function () {
		this.view.store.getFilters().removeAll()
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
			title: 'О программе',
			width: 400,
			height: 500,
			modal: false,
			resizable: false,
			layout: 'fit',
			referenceHolder: true,

			items: [{
				xtype: 'panel',
				grow: true,
				anchor: '100%',
				html: 
					'<div class="winabout-summary">'
					+ '<span>' + window.APP_TITLE + '</span></br>'
					+ '<span>Программа предназначена для составления списков покупок</span></br>'
					+ '<span>test2</span></br>'
					+ '<span>test1</span></br>'
					+ '<span>test2</span></br>'
					+ '<span>test1</span></br>'
					+ '<span>test2</span></br>'
					+ '</div>'
		
				
			}],

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
		const me = this, id = me.view.currentListId, items = me.getFormatedItems();

		data = me.getLocalStorageData();
		data.some(function (list) {
			if (list.id == id) { 
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

				res[d] = item.data[d];
			}
			return res;
		});

		return result;
	},

	onItemDone: function (cmp, rowIndex, checked, record, e, eOpts) {
		record.set('done', checked);
		this.updateLocalStorageData();
	}
});
