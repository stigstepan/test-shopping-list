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
		width: 300,
		emptyText: 'Найти'
    }],


	store: {
		fields: ['name', {name: 'count', type: 'int'}, 'units'],
		data: [
            {name: 'Хлеб', count: 1, units: 'шт'},
            {name: 'Помидоры', count: 2, units: 'кг'},
            {name: 'Огурцы', count: 2, units: 'кг'},
            {name: 'Пиво', count: 6, units: 'бан'}
        ],
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
			width: 440,
			displayField: 'name',
			valueField: 'name',
			editable: false,
			store: {
				fields: ['name'],
				data: ['шт', 'кг', 'л', 'бан']
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
	}
});

Ext.define('SL.widget.ItemsListController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-items-grid-controller',

	onCellEdit: function (editor, context) {
		const data = context.record.data;
		// update data in localStorage
	}
});
