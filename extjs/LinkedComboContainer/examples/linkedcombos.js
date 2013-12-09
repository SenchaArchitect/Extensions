Ext.require([
    'Ext.window.MessageBox'
]);

Ext.onReady(function() {
    // Example One - Shows using a different store per ComboBox and use JsonP
    var carQueryApiUrl = 'http://www.carqueryapi.com/api/0.3/?year=2000&sold_in_us=1&';
    var makeStore = new Ext.data.Store({
        proxy: {
            type: 'jsonp',
            url: carQueryApiUrl + 'cmd=getMakes',
            reader: {
                root: 'Makes',
                type: 'json'
            }
        },
        fields: ['make_id','make_display']
    });
    
    var modelStore = new Ext.data.Store({
        proxy: {
            type: 'jsonp',
            url: carQueryApiUrl + 'cmd=getModels',
            reader: {
                root: 'Models',
                type: 'json'
            }
        },
        fields: ['model_name']
    });
    var trimStore = new Ext.data.Store({
        proxy: {
            type: 'jsonp',
            url: carQueryApiUrl + 'cmd=getTrims',
            reader: {
                root: 'Trims',
                type: 'json'
            }
        },
        fields: [{
            name: 'model_trim',
            convert: function(v, record) {
                // Some vehicles only come in one trim and the API returns "".
                // Lets provide a meaningful trim option.
                return v || 'Standard';
            }
        }]
    });
    
    var carComboCt = Ext.create('Ext.ux.LinkedComboContainer', {
        renderTo: 'test',
        // vertical layout, try 'vbox' and 'hbox'
        // layout: 'hbox',
        // show the combos as they are available
        // (hide them at first). Another option here is 'enable'
        disclosureMode: 'show',
        // configs to be passed to all combos created.
        defaultComboConfig: {
            width: 350
        },
        comboConfigs: [{
            name: 'make',
            valueField: 'make_id',
            displayField: 'make_display',
            fieldLabel: 'Choose a Car',
            store: makeStore
        },{
            name: 'model',
            valueField: 'model_name',
            displayField: 'model_name',
            store: modelStore
        },{
            name: 'trim',
            displayField: 'model_trim',
            valueField: 'model_trim',
            store: trimStore
        }],
        listeners: {
            subselect: function(comboCt, value, combo) {
                // console.log('Chose ' + combo.getValue() + ' from ' + combo.name);
            },
            select: function(comboCt, value, combo) {
                Ext.Msg.alert("A Fine Selection!", Ext.encode(value));
            }
        }
    });

    // Example two - Using a single master store
    // As it stands, this example just goes and grabs the mockdata, if you look at the request
    // in the browser you can see how the params sent would allow you to filter the data sent
    // back.
    var masterMockStore = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'getMockData.json',
            reader: {
                type: 'array'
            },
            pageParam: undefined,
            startParam: undefined,
            limitParam: undefined
        },
        fields: ['name','value']
    });
    var mockLinkedCombo = Ext.create('Ext.ux.LinkedComboContainer', {
        renderTo: 'test',
        // master store to load all combos from
        store: masterMockStore,
        // configs to be passed to all combos created.
        defaultComboConfig: {
            displayField: 'name',
            valueField: 'value'
        },
        comboConfigs: [{
            name: 'parentOption',
            fieldLabel: 'Parent Option',
            emptyText: 'Parent...'
        },{
            name: 'childOption',
            fieldLabel: 'Child Option',
            emptyText: 'Child...'
        }],
        listeners: {
            subselect: function(comboCt, value, combo) {
                // console.log('Chose ' + combo.getValue() + ' from ' + combo.name);
            },
            select: function(comboCt, value, combo) {
                Ext.Msg.alert("A Fine Selection!", Ext.encode(value));
            }
        }
    });

    // Example three - Using a single store and a flat list
    var stateCountyStore = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'asList.json',
            reader: {
                type: 'json'
            }
        },
        fields: ['state','county','city']
    });
    var stateCountyPnl = Ext.create('Ext.panel.Panel', {
        renderTo: 'test',
        width: 400,
        height: 150,
        title: 'City Drilldown',
        layout: 'fit',
        items: [{
            xtype: 'linkedcombocontainer',
            padding: 20,
            // master store to load all combos from
            store: stateCountyStore,
            defaultEmptyText: 'Please choose a {0}...',
            loadMode: 'aslist',
            comboConfigs: [{
                name: 'state',
                width: '100%',
                displayField: 'state',
                valueField: 'state',
                fieldLabel: 'State'
            },{
                name: 'county',
                width: '100%',
                displayField: 'county',
                valueField: 'county',
                fieldLabel: 'County'
            },{
                name: 'city',
                width: '100%',
                displayField: 'city',
                valueField: 'city',
                fieldLabel: 'City'
            }],
            listeners: {
                subselect: function(comboCt, value, combo) {
                    // console.log('Chose ' + combo.getValue() + ' from ' + combo.name);
                },
                select: function(comboCt, value, combo) {
                    Ext.Msg.alert("A Fine Selection!", Ext.encode(value));
                }
            }
        }]
    });

});
