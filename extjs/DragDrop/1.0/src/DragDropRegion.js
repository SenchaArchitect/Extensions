Ext.define('Ext.ux.DragDropRegion', {
    alias: 'plugin.dragdropregion',

    config: {
        drag: true,
        drop: true,
        group: "ddg",
        notifyEnterCls: "highlightDropZone",
        dragLabel: 'Untitled Region',
        frameSwapped: true,
        frameColor: "#99FF99",
        frameCount: 2
    },

    init: function(component) {
		var me = this;

        //start working on setting up the drag and drop functionality
        component.on('afterlayout', me.setDragDrop, me, {single: true});
	},
    
    //setup passed configs if any
    constructor: function(config) {

        this.initConfig(config);
    },

    //when panels are swapped, we need to forcefully swap some properties 
    //if center, north or south regions have been targeted. I could see 
    //some of these mandates becoming options in the future
    swapProperties: function(source, target) {

        //setup the orig configs for the source
		source.originalConfig = {
            height: source.getHeight(), 
            width: source.getWidth(), 
            collapsible: source.collapsible, 
            collapseDirection: source.collapseDirection, 
            split: source.split
        };

        //setup the orig configs for the target
        target.originalConfig = {
            height: target.getHeight(), 
            width: target.getWidth(), 
            collapsible: target.collapsible, 
            collapseDirection: target.collapseDirection, 
            split: target.split
        };

        //swap the source configs
        source.split = target.originalConfig.split;
        source.setSize(target.originalConfig.width, target.originalConfig.height);

        //swap the target configs
        target.split = source.originalConfig.split;  
        target.setSize(source.originalConfig.width, source.originalConfig.height);

    }, 

    mapCollapseDirs: function(region, op) {
        var collapseDirs = {};

        //dictionary of directions based on region
        collapseDirs.north = {"dir":"up", "expanderDir": "top"};
        collapseDirs.south = {"dir":"down", "expanderDir": "bottom"};
        collapseDirs.west = {"dir":"left", "expanderDir": "left"};
        collapseDirs.east = {"dir":"right", "expanderDir": "right"};

        return collapseDirs[region][op];
	},

    evaluateCollapseFunctionality: function(panel, region) {
        var me = this,
            header = panel.getHeader(),
            tools = header ? panel.getHeader().getTools() : null,
            toolTypes = ["left","right","up","down","collapse-left","collapse-right","collapse-top","collapse-bottom"],
			dir, expanderDir;

        //if we're dropping in the center region; we want to hide the collapse tool
        if (region === "center") {

            //we have to loop through the tools and find the collapse tool
            Ext.Array.each(tools, function(tool, index, countriesItSelf) {
                //perform a lookup against our acceptable toolTypes.
                //if we match it in this condition; lets hide it.
                if (toolTypes.indexOf(tool.type) >= 0) {
                    tool.hide();
                }
            });

        } else {

            //make sure the panel is collapsible before executing
            if (panel.collapsible) {

                //we only want to manipulate 
                if (!panel.collapseMode || panel.collapseMode === "placeholder") {

                    //if there is a placeholder, we need to delete it so we can 
                    //create one with proper orientation and collapse direction
                    if (panel.placeholder) {
                        delete panel.placeholder;  
                    }

                    //create a new placeholder
                    panel.placeholder = panel.createReExpander(me.mapCollapseDirs(region, 'expanderDir'));
                }

                //we have to loop through the tools and find the collapse tool
                Ext.Array.each(tools, function(tool, index, countriesItSelf) {
                    //perform a lookup against our acceptable toolTypes
                    if (toolTypes.indexOf(tool.type) >= 0) {
                        //we may have hid the tool dragging to center
                        if (tool.isHidden()) tool.show();
                        //change the tool type
                        tool.setType(me.mapCollapseDirs(region, 'dir'));
                    }
                });
            }
        }
        
        return panel;
    },

    setDragDrop: function(component) {
        var me = this,
            parentLayout = component.ownerCt,

            setDragZones = function() {

                //create a drag source for the component. The component is the region that
                //is being initialized via the plugin
                var dragSource = Ext.create('Ext.dd.DragSource', component.el, {ddGroup: me.group, dragData: {component: component}}),
                    handleId = component.getHeader() ? component.getHeader().getId() : null;

                //if we have a handleId, assign a handle to the dragSource
                dragSource.setHandleElId(handleId);

                //setup the handler for the drag event
                dragSource.onInitDrag = function() {
                    var compEl = component.getEl(),
                        label = component.title ? component.title : me.dragLabel;
                    //update the proxy 
                    dragSource.proxy.update('<div>' + label + '</div>');  
                };
            },
            setDropZones = function() {

                //create a drop target for the component. The component is the region that
                //is being initialized via the plugin
                component.dropTarget = Ext.create('Ext.dd.DropTarget', component.el, {ddGroup: me.group});

                //setup the handler for the drop event
                component.dropTarget.notifyDrop = function(source, evt, data) {
                    var sourcePanel = source.getDragData().component,
                        fromRegion = sourcePanel.region,
                        fromRegionXY = sourcePanel.getEl().getLocalXY(),
                        toRegion = component.region ? component.region : null,
                        toRegionXY = component.getLocalXY();  

                    //reset the border to none after a drop
                    component.getEl().removeCls(me.notifyEnterCls);

                    //if north or south is part of the drag operation, we'll want to swap some configs                
                    if (sourcePanel.region === "north" || sourcePanel.region === "south" || sourcePanel.region === "center" || 
                        component.region === "north" || component.region === "south" || component.region === "center") {
                        me.swapProperties(sourcePanel, component);
                    }

                    //remove the source panel before we reassign the region
                    parentLayout.remove(sourcePanel, false);
                    //reassign the region
                    sourcePanel.region = toRegion;
                    //setup the collpase functionality
                    sourcePanel = me.evaluateCollapseFunctionality(sourcePanel, toRegion);
                    //add the source panel back with the new region
                    parentLayout.add(sourcePanel);  
                    
                    //remove the target panel before we reassign the region
                    parentLayout.remove(component, false);
                    //change the region to that of the source panels
                    //orignal region.
                    component.region = fromRegion;
                    //setup the collpase functionality
                    component = me.evaluateCollapseFunctionality(component, fromRegion);
                    //add the target panel back with the new region
                    parentLayout.add(component); 
                    //bring a bit of attention to the swapped region
                    if (me.frameSwapped) {
                        //suspend any existing animation
                        sourcePanel.getEl().stopAnimation();
                        component.getEl().stopAnimation();
                        //frame the component
                        component.getEl().frame(me.frameColor, me.frameCount);
                    }
                    //rerender the layout
                    Ext.defer(parentLayout.doLayout, 3, parentLayout);

                };

                //setup the handler for the enter event
                component.dropTarget.notifyEnter = function(source, evt, data) {
                    var sourcePanel = source.panel;

                    //highlight the target so the user knows they can drop the source
                    component.getEl().addCls(me.notifyEnterCls);
                    
                };

                //setup the handler for the out event
                component.dropTarget.notifyOut = function(source, evt, data) {

                    //if the user drags the source back out of the target
                    component.getEl().removeCls(me.notifyEnterCls);
                };

            }; 

        //set the drag zones
        if (me.drag) setDragZones();

        //setup the drop zones
        if (me.drop) setDropZones();

    }
});