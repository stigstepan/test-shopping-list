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
		stripeRows: true
	},

	plugins: {
		cellediting: {
			clicksToEdit: 2
		}
	},

	listeners: {
		edit: 'onCellEdit'
	},

	store: {
		fields: ['name'],
		data: [
            {name: 'Химия'},
            {name: 'Продукты'},
            {name: 'Машина'}
        ]
	},

	columns: [{
		dataIndex: 'name',
		header: false,
		flex: 1,
        editor: {
			allowBlank: false
		}
	}],

	tbar: [{
        text: 'Добавить',
        iconCls: 'fa fa-plus'
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

Ext.define('SL.widget.ListGridController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.sl-list-grid-controller',

	onCellEdit: function (editor, context) {
		const data = context.record.data;
		// update data in localStorage
	}
});
