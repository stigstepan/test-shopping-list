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
        }]	
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

		me.getData();
	},

	getData: function () {
		const me = this;
		// load from local storage
        // or from file
		me.setData([
            {name: 'Хлеб', count: 1, units: 'шт'},
            {name: 'Помидоры', count: 2, units: 'кг'},
            {name: 'Огурцы', count: 2, units: 'кг'},
            {name: 'Пиво', count: 6, units: 'бан'}
        ]);
	},

	setData: function (data) {
		const me = this, store = me.getStore();
		if (!Ext.isArray(data)) { data = []; }


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

	updateLocalStorageData: function () {
		const items = this.view.store.data.items;
		const formatedData = items.map(function (item) {
			const obj = {};
			for (d in item.data) {
				if (!Object.prototype.hasOwnProperty.call(item.data, d)) { continue; }
				if (d == 'id') { continue; }

				obj[d] = item.data[d];
			}
			return obj;
		});

		let formatedStr = ''
		try {
			formatedStr = JSON.stringify(formatedData);
		} catch (e) {
			console.error(e.stack);
		}

		// set localStorage data
	}
});
