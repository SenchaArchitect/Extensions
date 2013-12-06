/**
 * @class Ext.ux.LinkedComboContainer
 * @extends Ext.Container
 * @xtype linkedcombocontainer
 *
 * Provides a convenient way to link or chain ComboBoxes together. As options are chosen in prior ComboBoxes
 * the set of options available in the subsequent ComboBox is filtered down. A common use case for this is
 * choosing a car and filtering down by the Make, Model and then Trim.
 *
 * Combo configurations are passed into the `comboConfigs` configuration. For example:
    comboConfigs: [{
        name: 'parentOption',
        fieldLabel: 'Parent Option'
    },{
        name: 'childOption',
        fieldLabel: 'Child Option'
    }],
 *
 * This container supports using your own subclasses of ComboBox by passing in a custom xtype. It leverages the
 * fullness of the Ext.data package by allowing you to use custom stores, data readers and proxies.
 *
 * There are three general approaches of fetching the data to populate the options in the ComboBox. These are
 * `Independent Stores per ComboBox - On Demand`, `A Single Master Store for the LinkedComboContainer - On Demand` and
 * `Loading all Data as a List - Upfront`.
 *
 * A) Independent Stores per ComboBox - On Demand
 * Use this approach if your data for your options is at several different endpoints (urls), uses different models or
 * is in different formats. Data in each store can use a different proxy, reader or model.
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
        }]
    });
 *
 * B) A Single Master Store - On Demand
 * Use this approach when you are able to retrieve all the data from the same endpoint and will come in the same
 * format/model. Each ComboBox request will send the current field name and all of the selections in the chain
 * to date. The store will only be set on the LinkedComboContainer. Individual combos cannot have independent stores.
    var masterMockStore = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'getOptions.php',
            reader: {
                type: 'array'
            }
        },
        fields: ['name','value']
    });
    var mockLinkedCombo = Ext.create('Ext.ux.LinkedComboContainer', {
        // master store to load all combos from
        store: masterMockStore,
        // configs to be passed to all combos created.
        defaultComboConfig: {
            displayField: 'name',
            valueField: 'value'
        },
        comboConfigs: [{
            name: 'parentOption',
            fieldLabel: 'Parent Option'
        },{
            name: 'childOption',
            fieldLabel: 'Child Option'
        }]
    });
 *
 * C) Loading all Data as a List - Upfront
 * Use this approach when you have a limited data set and can load it all upfront. The dataset will be filtered automatically
 * on the client side. You should not use large datasets for this reason when taking this approach.
 *
 * This technique requires you to set the `loadMode` config to 'aslist' and to set a single master `store` config on the LinkedComboContainer.
 *
 * Noteable limitations: ComboBoxes cannot be dynamically added to the chain. ComboBoxes used in the LinkedComboContainer
 * cannot preset their value or set their queryMode.
 *
 */
Ext.define('Ext.ux.LinkedComboContainer', {
    extend: 'Ext.Container',
    requires: ['Ext.form.field.ComboBox'],
    alias: 'widget.linkedcombocontainer',

    /**
     * @cfg {String} disclosureMode
     * Defines how the next combobox will be disclosed. Valid options are 'enable' and 'show'.
     * Defaults to 'enable'.
     * In 'enable' mode, ComboBoxes will be disabled until earlier combos have been selected.
     * In 'show' mode, ComboBoxes will be hidden until earlier combos have been selected.
     */
    disclosureMode: 'enable',

    /**
     * @cfg {String} loadMode
     * Defines how the options for the chain of comboboxes will be loaded. Valid values are
     * 'ondemand', 'aslist' and 'astree'. Defaults to 'ondemand'.
     * In 'ondemand' mode, the options for ComboBoxes will be loaded on an as needed basis by
     * making a request to the server. 'ondemand' mode supports both a single store which the server
     * chooses what to return based off of the current combo 'field' or independent stores for each
     * combobox.
     * In 'aslist' mode, the options for ComboBoxes will all be loaded with the first combo request
     * and then filtered in-memory. 'aslist' mode only supports a single master store defined on the
     * LinkedComboContainer.
     * 'astree' mode has yet to be implemented.
     */
    loadMode: 'ondemand',

    /**
     * @cfg {String/Object} layout
     * Designed to support hbox and vbox layouts. Defaults to 'vbox'.
     * If you pass in the configuration 'hbox', all items will automatically get a 'defaultComboPadding'
     * of 10.
     */
    layout: 'vbox',

    /**
     * @cfg {String/Ext.data.Store} store
     * The master store to use for each request if you are not defining individual stores on each
     * combo.
     */
    store: null,

    /**
     * @cfg {Object[]} comboConfigs
     * An array of configurations to be passed to each combo that is created.
     * Most standard ComboBox configurations are supported. Noteable exceptions are 'value' and 'queryMode'.
     * Setting the 'name' configuration is required. This will generate a formfield and cause it to
     * be submitted with a value of the current 'valueField' during a form submit. When loading data on demand,
     * this will be sent as the field (configurable by setting 'fieldParam' on the LinkedComboContainer).
     * Other configurations that will often be set: 'fieldLabel', 'displayField', 'valueField', 'emptyText'.
     * Note that you can also set your own xtype here to use a custom ComboBox. You cannot pass in an instance of
     * an existing ComboBox.
     */
    comboConfigs: null,

    /**
     * @cfg {Object} defaultComboConfig
     * defaults to be copied into each combo configuration. Any instance or complex types in this object
     * may trigger the component to not behave properly.
     */
    defaultComboConfig: null,

    /**
     * @cfg {String} fieldParam
     * This configuration is only used when loadMode is set to 'ondemand' (the default).
     * This is the key of the param that will be sent indicating what combo was just selected.
     * Defaults to 'field'.
     * The request might look like `myUrl.php?field=model&make=Mitsubishi`. To change the 'field'
     * param, set this configuration.
     */
    fieldParam: 'field',

    /**
     * @cfg {Boolean} trimNullValues
     * This configuration will trim out null values when invoking the getValue method. Defaults to true
     * and will trim out all null values.
     * This configuration also comes into play when using loadMode 'ondemand' as the value is sent with
     * each subsequent request for more option. If you prefer to always have these form fields sent,
     * set this configuration to false.
     */
    trimNullValues: true,

    /**
     * @cfg {String} defaultEmptyText
     * emptyText to be used by all combos that do not have an emptyText specified in comboConfigs.
     * Defaults to 'Please choose an option for {0}'. {0} will be replaced by the 'name' config of
     * the combo.
     */
    defaultEmptyText: 'Please choose an option for {0}',

    /**
     * @cfg {Number} defaultComboPadding
     * defaultComboPadding is set to 0 in all cases but when a layout of 'hbox' is set when it becomes 10.
     * If you set a complex layout configuration like layout: {type: 'hbox'} it will default to 0. In this
     * case you can manually set the padding in the defaultComboConfig.
     */
    defaultComboPadding: 0,

    /**
     * @private
     * maxDisclosedIndex tracks the index of the highest combo that has already been disclosed
     */
    maxDisclosedIndex: 0,

    initComponent: function() {
        // automatically provide some padding when user sets layout to hbox
        if (this.layout === 'hbox') {
            this.defaultComboPadding = this.defaultComboPadding || 10;
        }
        this.callParent(arguments);
        this.combos = new Ext.util.MixedCollection({
            getKey: function(combo) {
                return combo.name;
            }
        });
        this.addEvents(
            /**
             * @event subselect
             * Fires when any combo is selected in the chain.
             * @param {Ext.ux.LinkedComboContainer} this The LinkedComboContainer
             * @param {Object} value Result of combo.getValue()
             * @param {Ext.form.field.ComboBox} combo The combobox that was just selected.
             */
            'subselect',
            /**
             * @event select
             * Fires when the final selection is made in the chain of Combos.
             * @param {Ext.ux.LinkedComboContainer} this The LinkedComboContainer
             * @param {Object} value Result of this.getValue()
             */
            'select'
        );
        var comboConfigs = this.comboConfigs || [],
            userComboConfig,
            comboConfig,
            combo,
            store,
            i = 0, ln = comboConfigs.length;

        this.maxIndex = ln - 1;

        // <debug>
        if (!comboConfigs || !ln) {
            Ext.Error.raise("Ext.ux.LinkedComboContainer: No valid comboConfigs supplied. Please pass in an array of comboConfigs.");
        }
        if (!this.store && this.loadMode === 'aslist') {
            Ext.Error.raise("Ext.ux.LinkedComboContainer: No store was provided to LinkedComboContainer and loadMode is set to 'aslist'.");
        }
        // </debug>
        if (this.store) {
            this.store = Ext.StoreMgr.lookup(this.store);
        }


        for (; i < ln; i++) {
            userComboConfig = comboConfigs[i];
            Ext.applyIf(userComboConfig, this.defaultComboConfig);
            // <debug>
            if (!userComboConfig.name) {
                Ext.Error.raise("Ext.ux.LinkedComboContainer: Combo was provided but was not given a name. The 'name' configuration is required.");
            }
            if (userComboConfig.store && this.loadMode === 'aslist') {
                Ext.Error.raise("Ext.ux.LinkedComboContainer: Providing your own store for each combo with a loadMode of 'aslist' is not supported.");
            }
            if (userComboConfig.queryMode) {
                Ext.Error.raise("Ext.ux.LinkedComboContainer: Combos cannot be configured with a queryMode.");
            }
            if (userComboConfig.value) {
                Ext.Error.raise("Ext.ux.LinkedComboContainer: Setting a combo to a default value is not supported.");
            }
            if (this.combos.containsKey(userComboConfig.name)) {
                Ext.Error.raise("Ext.ux.LinkedComboContainer: Combo already registered with this name: " + userComboConfig.name + " Duplicates are not allowed.");
            }
            // </debug>

            if (userComboConfig.store) {
                store = userComboConfig.store;
            } else {
                store = new Ext.data.Store({
                    proxy: {
                        type: 'memory'
                    },
                    // we are re-using the model from the master store
                    model: this.store.model.modelName
                });
            }

            comboConfig = {
                xtype: 'combobox',
                store: store,
                // tracks whether we generated the store or userProvided store
                userProvidedStore: !!userComboConfig.store,
                emptyText: Ext.String.format(this.defaultEmptyText, userComboConfig.name),
                padding: this.defaultComboPadding,
                queryMode: 'local'
            };

            // this helps comboboxes line up when only the first one has the label
            if (this.layout.type === "vbox") {
                if (!Ext.isDefined(userComboConfig.fieldLabel)) {
                    userComboConfig.fieldLabel = '&nbsp;';
                    userComboConfig.labelSeparator = "";
                }
            }

            // lets hide or disable all of the combos that aren't the first one
            // (based off of the disclosureMode)
            if (i !== 0) {
                var disclosureModeIsEnable = this.disclosureMode === 'enable';
                comboConfig[disclosureModeIsEnable ? 'disabled' : 'hidden'] = true;
            }

            Ext.apply(comboConfig, userComboConfig);
            combo = this.add(comboConfig);
            // no events are exposed onTriggerClick and we'd like users to be able to use any subclass
            // of combobox without subclassing a custom one, therefore we hijack triggerClick
            combo.onTriggerClick = Ext.Function.createInterceptor(combo.onTriggerClick, this.onBeforeComboTriggerClick, this);
            combo.on('select', this.onComboSelect, this);

            this.combos.add(combo);
        }
    },

    /**
     * @private
     */
    onBeforeComboTriggerClick: function() {
        // grab the combo that generated the triggerClick via .target (tagged on by Ext.Function.createInterceptor)
        var combo = arguments.callee.target,
            comboIndex = this.combos.indexOf(combo);

        // the first combo is the only one that load is triggered by clicking on the combo trigger
        // all of the others are loaded once a selection has been made.
        if (comboIndex === 0 && combo.store.getCount() === 0) {
            this.doLoad(combo);
        }
    },

    /**
     * @private
     */
    onMasterStoreLoad: function(records, operation, success) {
        if (success && Ext.isDefined(operation.comboIndex)) {
            var subRecords = records,
                combo = this.combos.getAt(operation.comboIndex);

            if (operation.comboIndex === 0) {
                combo.expand();
            }

            if (this.loadMode === 'aslist') {
                subRecords = this.getSubListRecords(records, combo);
            }

            combo.store.removeAll();
            combo.store.add(subRecords);
        }
    },

    /**
     * @private
     * Used only when using loadMode 'aslist'. This prunes the entire recordset from the master
     * store to records that are only relevant based off the decision tree the user has made in
     * the chain.
     */
    getSubListRecords: function(records, combo) {
        var newRecords = [],
            // used to prevent dups and determine if we already included
            hitMap = {},
            data,
            i = 0, ln = records.length,
            recordData;

        for (; i < ln; i++) {
            recordData = records[i].data;
            // if it hasnt already been included
            if (!hitMap[recordData[combo.valueField]]) {
                var value = this.getValue(true),
                    keys = Ext.Object.getKeys(value),
                    j = 0,
                    keysLn = keys.length,
                    okForInclusion = true;

                // check each key to make sure it should be included
                for (; j < keysLn; j++) {
                    key = keys[j];
                    if (recordData[key] !== value[key]) {
                        okForInclusion = false;
                        break;
                    }
                }

                if (okForInclusion) {
                    data = {};
                    // track duplicates
                    hitMap[recordData[combo.valueField]] = true;
                    // note we only copy out valueField and displayField for this
                    // particular combo; any additional data that may be present is
                    // dropped.
                    data[combo.valueField] = recordData[combo.valueField];
                    data[combo.displayField] = recordData[combo.displayField];
                    newRecords.push(data);
                }
            }
        }
        return newRecords;
    },

    /**
     * @private
     */
    doLoad: function(combo) {
        var comboIndex = this.combos.indexOf(combo),
            comboStore = combo.store;

        if (this.loadMode === 'ondemand') {
            var params = {};
            params[this.fieldParam] = combo.name;
            if (comboIndex !== 0) {
                Ext.apply(params, this.getValue());
            }
            /// try to load from userProvidedStore
            if (combo.userProvidedStore) {
                comboStore.load({
                    params: params,
                    comboIndex: comboIndex,
                    callback: function(records, operation, success) {
                        if (operation.comboIndex === 0) {
                            combo.expand();
                        }
                    }
                });
            // try to load from a master store
            } else {
                this.store.load({
                    params: params,
                    scope: this,
                    callback: this.onMasterStoreLoad,
                    comboIndex: comboIndex
                });
            }
        } else if (this.loadMode === 'aslist') {
            if (comboIndex === 0) {
                this.store.load({
                    scope: this,
                    callback: this.onMasterStoreLoad,
                    comboIndex: comboIndex
                });
            } else {
                var subRecords = this.getSubListRecords(this.store.getRange(), combo);
                comboStore.removeAll();
                comboStore.add(subRecords);
            }
        }
    },

    /**
     * @private
     * When a combo is chosen determine where the user is in the chain and fire the subselect and select events
     */
    onComboSelect: function(combo, records) {
        var comboIndex = this.combos.indexOf(combo),
            nextComboIndex = comboIndex + 1;

        // user went backwards
        if (comboIndex < this.maxDisclosedIndex) {
            this.resetComboByIndex(nextComboIndex);
        }

        this.fireEvent('subselect', this, combo.getValue(), combo);

        // disclose the next combo
        if (comboIndex < this.maxIndex) {
            var nextCombo = this.combos.getAt(nextComboIndex);
            this.discloseComboByIndex(nextComboIndex);
            this.doLoad(nextCombo);
        // a final choice has been made
        } else if (comboIndex === this.maxIndex) {
            this.fireEvent('select', this, this.getValue());
        }
    },

    /**
     * Returns the value of all the completed combos in the LinkedComboContainer. The configuration
     * 'trimNullValues' being set to true (the default) will trim all null values out of the result.
     * @param {Boolean} trimNullValues Pass in true or false to override the default behavior set by 'trimNullValues' configuration
     * @return {Object} an object containing all combo name & value pairs
     */
    getValue: function(trimNullValues) {
        if (!Ext.isDefined(trimNullValues)) {
            trimNullValues = this.trimNullValues;
        }
        var value = {};
        this.combos.each(function(combo) {
            var comboValue = combo.getValue();
            // if the comboValue is not null or we aren't trimming out the nullValues
            if (comboValue !== null || !trimNullValues) {
                value[combo.name] = comboValue;
            }
        }, this);
        return value;
    },

    /**
     * @private
     * Disclosing combos will show or enable combos which are now valid because a user has completed
     * a step. This is the opposite of resetComboByIndex.
     */
    discloseComboByIndex: function(index) {
        var combo = this.combos.getAt(index),
            disclosureModeIsEnable = this.disclosureMode === 'enable',
            mth = disclosureModeIsEnable ? 'enable' : 'show';

        combo[mth]();
        if (index > this.maxDisclosedIndex) {
            this.maxDisclosedIndex = index;
        }
    },

    /**
     * @private
     * Resetting combos will hide or disable combos which are no longer valid because a user has
     * gone back to a previous step. This is the opposite of discloseComboByIndex.
     */
    resetComboByIndex: function(index) {
        var i = index,
            combo,
            disclosureModeIsEnable,
            mth;

        for (; i <= this.maxIndex; i++) {
            combo = this.combos.getAt(i);
            combo.reset();
            disclosureModeIsEnable = this.disclosureMode === 'enable';
            mth = disclosureModeIsEnable ? 'disable' : 'hide';
            combo[mth]();
        }
        this.maxDisclosedIndex = index;
    }

});