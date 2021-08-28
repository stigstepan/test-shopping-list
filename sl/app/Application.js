/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('SL.Application', {
    extend: 'Ext.app.Application',

    name: 'SL',

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true
        }
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    },

    init: function () {
        window.APP_TITLE = 'Менеджер покупок';
        document.title = window.APP_TITLE;
		Ext.Msg.buttonText.yes = 'Да';
		Ext.Msg.buttonText.no = 'Нет';
	},
});
