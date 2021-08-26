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
	controller: 'sl-items-grid-controller',
    cls: 'large-font-grid',

	viewConfig: {
		stripeRows: true
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
		xtype: 'textfield',
		width: 400,
		emptyText: 'Найти'
    }, '->', {
		text: 'Добавить',
		iconCls: 'x-fa fa-plus',
		handler: 'addItem'
	}, {
		iconCls: 'x-fa fa-question-circle-o',
		handler: 'showAppInfo'
	}],

	store: {
		fields: ['name', 'count', 'units'],
        sorters: [{
			property: 'name',
			direction: 'ASC' // or 'DESC'
		}],
	},

	columns: [{
		dataIndex: 'name',
		text: 'Имя',
		flex: 6,
		editor: {
			allowBlank: false
		}
	}, {
		dataIndex: 'count',
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
		text: 'Единицы измерения',
		flex: 1,
		editor: {
			xtype: 'combo',
			// width: 440,
			displayField: 'name',
			valueField: 'name',
			editable: false,
			store: {
				fields: ['name'],
				data: [{name: 'шт'}, {name: 'кг'}, {name: 'л'}, {name: 'бан'}]
			}
		}
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

		// data.push({
		// 	name: null, count: null, units: '+'
		// })

		store.loadData(data);
	}
});

Ext.define('SL.widget.ItemsListController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-items-grid-controller',

	addItem: function () {
		const view = this.getView(), store = view.getStore();

		const record = store.add({name: '', count: 1, units: 'шт'});
		view.getSelectionModel().select(record);
		view.getView().focusRow(record[0]);

		//emulate click on 'name' cell
	},

	onCellEdit: function (editor, context) {
		const data = context.record.data;
		// update data in localStorage
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
			width: 300,
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
	}
});
