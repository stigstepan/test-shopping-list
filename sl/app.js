/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'SL.Application',

    name: 'SL',

    requires: [
        // This will automatically load all classes in the SL namespace
        // so that application classes do not need to require each other.
        'SL.*'
    ],

    // The name of the initial view to create.
    mainView: 'SL.view.main.Main'
});
