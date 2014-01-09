{
    "classAlias": "widget.linkedcombocontainer",
    "className": "Ext.ux.LinkedComboContainer",
    "inherits": "Ext.container.Container",
    "autoName": "MyLinkedComboContainer",
    "helpText": "A linked combo container",

    "toolbox": {
        "name": "Linked Combo Container",
        "category": "Form Fields",
        "groups": ["Forms"]
    },

    "configs": [{
        "name":"disclosureMode",
        "type":"string",
        "initialValue":"enable"
    },{
        "name":"loadMode",
        "type":"string",
        "initialValue":"ondemand"
    },{
        "name":"listeners",
        "type":"object",
        "initialValue":null
    },{
        "name": "comboConfigs",
        "type": "refgroup",
        "initialValue":null
    }],

    listeners: [{
        name: "create",
        fn: "onCreate"
    }],

    onCreate: function(instance) {
        console.log('created',instance);
    }

}