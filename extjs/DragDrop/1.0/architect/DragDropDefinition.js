{
    "classAlias": "plugin.dragdropregion",
    "className": "Ext.ux.DragDropRegion", 
    "inherits": "abstractplugin",
    "autoName": "MyDragDropRegion",
    "helpText": "Drag / Drop Region - can be applied to any Panel",
    "validParentTypes": ["abstractpanel"],

    "toolbox": {
        "name": "Drag Drop Region",
        "category": "Containers",
        "groups": ["Containers",'Views']
    },
    
	configs: [{
        name: 'drag',
        type: 'boolean',
        hidden: false,
        defaultValue: true, // set on setup.
        merge: false
    },
    {
        name: 'drop',
        type: 'boolean',
        hidden: false,
        defaultValue: true, // set on setup.
        merge: false
    },
    {
        name: 'group',
        type: 'string',
        hidden: false,
        defaultValue: 'ddg', // set on setup.
        merge: false
    },{
        name: 'notifyEnterCls',
        type: 'string',
        hidden: false,
        defaultValue: 'highlightDropZone', // set on setup.
        merge: false
    },
    {
        name: 'dragLabel',
        type: 'string',
        hidden: false,
        defaultValue: 'Untitled Region', // set on setup.
        merge: false
    },
    {
        name: 'frameSwapped',
        type: 'boolean',
        hidden: false,
        defaultValue: 'true', // set on setup.
        merge: false
    },
    {
        name: 'frameColor',
        type: 'string',
        hidden: false,
        defaultValue: '#99FF99', // set on setup.
        merge: false
    },
    {
        name: 'frameCount',
        type: 'number',
        hidden: false,
        defaultValue: 2, // set on setup.
        merge: false
    }]
}
