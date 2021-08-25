/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * @author Stepan Ignatov.
 */
Ext.define('SL.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'SL.view.main.MainController'
    ],

    controller: 'main',

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: []
    }],

    items: [{
        html: 'lorem ipsum'
    }]
});
