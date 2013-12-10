{
    "className": "sencha.select.CountryStateSelect", 
    "classAlias": "widget.countrystateselect",
    "inherits": "formpanel",
    "autoName": "MyCountryStateSelect",
    "noSetup": true,
    "helpText": "Country and State/Province selector with built in data",

    "toolbox": {
        "name": "Country / State Select",
        "category": "Containers",
        "groups": ["Containers"] 
    },

    //add custom configs
    configs: [],

    //define listeners
    listeners: [{
        name: "create",
        fn: "onCreate"
    }],

    //define handlers
    onCreate: function() {
        var me = this,
            promise, countryModel, CountryStore,
            stateModel, stateStore;

        /**
         ******************** Notice *************************
         * This package uses the GeoNames Web services.
         * If you use this package please sign up for your
         * own free account and replace our account name for
         * your own. 
         *
         * http://www.geonames.org/login
         * http://www.geonames.org/export/web-services.html
         *
         *****************************************************
         *
         * Promise chain order of operation:
         * create country model
         * create country store
         * create state model
         * create state store
         * configure form panel
         */
        promise = me.createTopLevelInstance({
                type: 'Ext.data.Model',
                configs: {
                    idProperty : 'YourIdField',
                    userClassName: 'CountryModel'
                },
                items: [{
                    type: 'datafield',
                    configs: {
                        name: 'countryName'
                    }
                },{
                    type: 'datafield',
                    configs: {
                        name: 'countryCode'
                    }
                }]
            }).then(function(model) {
                //find our country model
                countryModel = model.snapshot.userConfig['designer|userClassName'];
                //return our next promise
                 return me.createTopLevelInstance({
                    type: 'Ext.data.Store',
                    items:[{
                        type: 'jsonpproxy',
                        configs: {
                            //please sign up for your own (free) username to use. 
                            //http://www.geonames.org/login
                            url: 'http://api.geonames.org/postalCodeCountryInfoJSON?username=sencha'
                        },
                        items: [{
                            type:'jsonreader',
                            configs: {
                                rootProperty: 'geonames'
                            }
                        }]
                    }],
                    configs: {
                        userClassName: 'CounrtyStore',
                        autoLoad: true,
                        model: countryModel
                    }
                });
            }).then(function(store) {
                //find our country store
                countryStore = store.snapshot.userConfig['designer|userClassName'];
                //return the promise
                return me.createTopLevelInstance({
                    type: 'Ext.data.Model',
                    configs: {
                        idProperty : 'YourIdField',
                        userClassName: 'StateModel',
                        minHeight: 30
                    },
                    items: [{
                        type: 'datafield',
                        configs: {
                            name: 'name'
                        }
                    }]
                });
            }).then(function(model) {
                //find our state model
                stateModel = model.snapshot.userConfig['designer|userClassName'];
                //return our next promise in the chain
                 return me.createTopLevelInstance({
                    type: 'Ext.data.Store',
                    items:[{
                        type: 'jsonpproxy',
                        configs: {
                            url: 'http://ws.geonames.org/searchJSON',
                            extraParams: {
                                formatted: true,
                                q: '',
                                maxRows: 200,
                                country: 'AF',
                                featureCode: 'ADM1'
                            }
                        },
                        items: [{
                            type:'jsonreader',
                            configs: {
                                rootProperty: 'geonames'
                            }
                        }]
                    }],
                    configs: {
                        userClassName: 'StateStore',
                        autoLoad: false,
                        model: stateModel
                    }
                });
            }).then(function(store) {
                //find our state store
                stateStore = store.snapshot.userConfig['designer|userClassName'];
                //create the country select box
                me.createInstance({
                    type: 'selectfield',
                    configs: {
                        label: 'Country',
                        displayField: 'countryName',
                        valueField: 'countryCode',
                        store: countryStore,
                        minHeight: 30
                    },
                    "items": [{
                        "type": "basiceventbinding",
                        "configs": {
                            "fn": "onChangeCountry",
                            "name": "change",
                            "implHandler": "var countryCode = selectfield.getValue(),\n\tform = selectfield.up('formpanel'),\n\tstatePicker = form.down('[itemId=statepicker]'),\n\tstore = statePicker.getStore(),\n\tproxy = store.getProxy();\n\nproxy._extraParams.country = countryCode;\nstore.load();\n\nExt.Viewport.setMasked({\n\txtype: 'loadmask',\n\tmessage: 'Loading States...'\n});\n\nstore.on('load', function() {\n\tExt.Viewport.unmask();\n\tstore.un('load');\n});"
                        }
                    }]
                });
                //create the state/prov select box
                me.createInstance({
                    type: 'selectfield',
                    configs: {
                        itemId:'statepicker',
                        label: 'State',
                        displayField: 'name',
                        valueField: 'name',
                        margin: '10 0 0 0',
                        store: stateStore
                    }
                });
            })
    }
}
