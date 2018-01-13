"use strict";

/*
Copyright [2014] [Diagramo]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
    
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


/**
 *Stack holds all the components on the screen
 *It will also hold the groups formed on the screen
 *@this {Stack}
 *@constructor
 **/
function Stack() {

}

/**Keeps all the components on the canvas*/
Stack.components = [];

/**Keeps selected component*/
Stack.selectedComponent = null;

/**Keeps current component's Id*/
Stack.currentId = 0;

/**Keeps selected component's Id*/
Stack.selectedComponentId = -1;

/**Generates an returns a new unique ID
*@return {Number} - next id*/
Stack.generateId = function(){
    return this.currentId++;
}

Stack.addComponent = function(component){
    if (component.Name == "Box") {
        this.components.unshift(component);
    } else {
        this.components.push(component);
    }
}


Stack.getSelectedGroup = function(){
    return this.group;
}

Stack.paint = function(context){
    for(var i=0, len=Stack.components.length; i<len; i++){
        if (this.components[i] == "Box") {
            context.save();
            context.setLineDash([5,15]);
            context.beginPath();
            context.strokeStyle = 'red';
            this.components[i].paint(context);
            context.restore();            
        }
        /*context.save();
        if(this.components[i].id == CONNECTOR_MANAGER.overComponentId){
            context.strokeStyle == "FF0000";} /*red*/
        
        this.components[i].paint(context);
        //context.restore();
    
        //if we are connecting something we should paint connection points too
        //ACTIVATE IT ONLY FOR DEBUG PURPOSES
        if(state == STATE_CONNECTOR_PICK_FIRST || state == STATE_CONNECTOR_PICK_SECOND
            || state == STATE_CONNECTOR_MOVE_POINT ){
            //CONNECTOR_MANAGER.connectionPointPaint(context, this.components[i].id);
        } 
    
    }
    
    //paint connector(s)
    //if (selectedConnectorId != -1) {
    if(state == STATE_CONNECTOR_PICK_FIRST || state == STATE_CONNECTOR_PICK_SECOND
        || state == STATE_CONNECTOR_MOVE_POINT ){
            context.shadowColor = "#5DFC0A";
            context.shadowBlur = 10;
    }
        CONNECTOR_MANAGER.connectorPaint(context, selectedConnectorId);
    //console.log("stack_paint: selectedConectorId: " + selectedConnectorId);
    

    
    if(state == STATE_COMPONENT_SELECTED || state == STATE_HANDLE_SELECTED){
      var c = Stack.getComponentById(Stack.selectedComponentId);
      if (c == null) {
        console.log("null component");
      }
      if (c.Name != "Alfa" && c.Name != "Beta" && c.Name != "Text") {
          HandleManager.setComponent(c);
          HandleManager.paint(context);
      }
    }
    else if(state == STATE_GROUP_SELECTED){ //GROUP 
        HandleManager.setGroup();
        HandleManager.paint(context);
        //console.log("selectionArea.points[3] = " + selectionArea.points[3].x + "," + selectionArea.points[3].y);
    } else if(state == STATE_SELECTING_MULTIPLE){ //SELECTION
        context.save();
        context.strokeStyle = 'grey';
        context.fillStyle = 'transparent';
        selectionArea.paint(context);
        context.restore();
    }    
}

Stack.removeComponentBy = function(id){

}

 /**Deletes all the component and reset any index*/
Stack.reset = function(){
    
    Stack.components = [];
    Stack.selectedComponent = null;
    Stack.currentId = 0;
    Stack.selectedComponentId = -1;
}

/**Find the storage index of a component
 *@param {Component} component - the component you search for
 *@return {Number} - the index where you can find the Component or -1 if not founded
**/
Stack.getIndex = function(component){
    for(var i=0, len=Stack.components.length; i<len; i++){
        if(Stack.components[i]==component){
            return i;
        }
    }
    return -1;
}

/**Returns a component by id
*@param {Number} id - the id of the component
*@return {Component} - the component object or null if no component with that id found
*TODO: use idToIndex to speed up the search....well there is no search at all :)
**/
Stack.getComponentById = function(id){
    for(var i=0, len=Stack.components.length; i<len; i++){
        if(Stack.components[i].id == id){
            return Stack.components[i];
        }
    }
    return null;
}

/**Returns a component by id
 *@param {Number} x - the value on Ox axis
 *@param {Number} y - the value on Oy axis
 *@return {Component} - the component object or null if no component with that id found
 *TODO: use idToIndex to speed up the search....well there is no search at all :)
**/
Stack.getComponentByCoord = function(x,y){
    var id = -1;
    for(var i=Stack.components.length-1; i>=0; i--){
        if(Stack.components[i].contains(x, y)){
            id = Stack.components[i].id;
            break;
        } 
    }
    return id;
}

/**Removes a component by it's id
 *@param {Number} id - the {Component}'s id
 *@author Alex Gheorghiu <alex@scriptoid.com>
**/
Stack.removeComponentById = function(id){
        var index = -1;
        for(var i=Stack.components.length-1; i>=0; i--){
            if(Stack.components[i].id == id){
                index = i;
                break;
            }
        }
        if (index > -1)
            this.components.splice(index, 1);
}

/**Test if an (x,y) is over a component
 *@param {Number} x - the x coordinates
 *@param {Number} y - the y coordinates
 *@return {Boolean} - true if over a component, false otherwise
**/
Stack.isOverComponent = function(x, y){
        for(var i=Stack.components.length-1; i>=0; i--){
            if(Stack.components[i].contains(x, y))
                return true;
        }
        return false;
}

/**
 *Returns first component glued to a connector
 *@param {Number} connectorId - the id of the connector
 *@return {Component} - the component connected, or null if none 
**/
Stack.componentGetAsFirstComponentForConnector = function(connectorId){
        //console.log("Stack:componentGetAsFirstComponentForConnector");
        
        /*Algorithm
         *Connector -> first Connector's ConnectionPoint-> Glue -> Component's ConnectionPoint -> Component
         **/
        var component = null;
        
        //var connector = CONNECTOR_MANAGER.connectorGetById(connectorId);        
        //console.log("Connector id = " + connectorId);
        
        var startConnectionPoint = CONNECTOR_MANAGER.connectionPointGetFirstForConnector(connectorId);
        //console.log("ConnectionPoint id = " + startConnectionPoint.id);
        
        var startGlue = CONNECTOR_MANAGER.glueGetBySecondConnectionPointId(startConnectionPoint.id)[0];
        if(startGlue){
            //console.log("Glue id1 = (" + startGlue.id1 + ", " + startGlue.id2 + ')');

            var componentConnectionPoint = CONNECTOR_MANAGER.connectionPointGetById(startGlue.id1);
            //console.log("Component's ConnectionPoint id = " + componentConnectionPoint.id);

            component = this.getComponentById(componentConnectionPoint.parentId);
        } else {
            //console.log("no glue");
        }
                                
        return component;
}
    
    
/**
 *Returns second component glued to a connector
 *@param {Number} connectorId - the id of the connector
 *@return {Component} - the component connected, or null if none 
**/
Stack.componentGetAsSecondComponentForConnector = function(connectorId){
        //console.log("Stack:componentGetAsSecondComponentForConnector");
        
        /*Algorithm
         *Connector -> first Connector's ConnectionPoint-> Glue -> Component's ConnectionPoint -> Component
         **/
        var component = null;
        
        //var connector = CONNECTOR_MANAGER.connectorGetById(connectorId);        
        //console.log("Connector id = " + connectorId);
        
        var endConnectionPoint = CONNECTOR_MANAGER.connectionPointGetSecondForConnector(connectorId);
        //console.log("ConnectionPoint id = " + endConnectionPoint.id);
        
        var startGlue = CONNECTOR_MANAGER.glueGetBySecondConnectionPointId(endConnectionPoint.id)[0];
        if(startGlue){
            //console.log("Glue id1 = (" + startGlue.id1 + ", " + startGlue.id2 + ')');

            var componentConnectionPoint = CONNECTOR_MANAGER.connectionPointGetById(startGlue.id1);
            //console.log("Component's ConnectionPoint id = " + componentConnectionPoint.id);

            component = this.getComponentById(componentConnectionPoint.parentId);
        } else {
            //console.log("no glue");
        }

        return component;
}

    
