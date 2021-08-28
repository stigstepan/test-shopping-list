/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * 2021.
 * @author Stepan Ignatov.
 */
Ext.define('SL.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',
    referenceHolder: true,
    
    requires: [
        'SL.view.main.MainController',
        'SL.widget.ListGrid',
        'SL.widget.ItemsList'
    ],

    controller: 'main',

    layout: 'border',

    items: [{
        width: 400,
        region: 'west',
        title: 'Списки покупок',
        split: true,
        collapsible: true,
        xtype: 'sl-list-grid'
    }, {
        region: 'center',
        xtype: 'sl-items-grid'
    }]
});
