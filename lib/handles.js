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
 *Handles are created on-the-fly for a figure. They are completelly managed by the HandleManager
 *Each handle is responsable for an action. The {Handle} does not need to keep a reference to the parent shape
 *as the HandleManager will do that.
 *@constructor
 *@this {Handle}
 *@param {String} type - the type of handle
 **/
function Handle(type) {
    /**Type of Handle*/
    this.type = type;
    
    /**The center of the circle (x coordinates)*/
    this.x = 0;
    
    /**The center of the circle (x coordinates)*/
    this.y = 0;
    //this.visible = true;
}


/**Default handle radius*/
Handle.RADIUS = 4;

/**It's a (static) vector of handle types
 * Note: More handles might be added in the future : like handles to increase the number of edges for a hexagone
 * Those handles will be specific for a figure
 **/
//DO NOT CHANGE THE ORDER OF THESE VALUES
Handle.types = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' ];
         

Handle.prototype = {
    constructor : Handle,
    
    transform : function(matrix){
        var p = new Point(this.x,this.y)
        p.transform(matrix);
        this.x = p.x;
        this.y = p.y;       
    
    },
    
    paint : function(context){
        //context.save();
        
        //fill the handler
        context.beginPath();
        context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
        context.fillStyle = "#FF7400"; //orange
        context.closePath();
        context.fill();
        //stroke the handler
        context.beginPath();
        context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
        context.strokeStyle = "#000000";
        context.lineWidth = 1;
        context.closePath();
        context.stroke();

        //context.restore();
    },
    
    contains : function(x,y){
        var dx = this.x - x;
        var dy = this.y - y;
        return dx*dx + dy*dy <= Handle.RADIUS*Handle.RADIUS;
    },
    
    getCursor : function(){
        return this.type + "-resize";
    },
    
    action : function(lastMove,x,y){
        var offset = 5;
        var bounds;
        
        if (HandleManager.component != null) {
            bounds = HandleManager.component.getBounds();
        }
        else{ //it's group
            bounds = GROUP.getBounds();
        }
        
        var dx = 0;
        var dy = 0;
        var sx = 1; //the scale percentage on Ox
        var sy = 1; //the scale percentage on Oy
        
        var handlerPoint = new Point(this.x, this.y);
        
        switch (this.type) {
            case 'n' :
                dy = bounds[3];
                if (y < bounds[3] - offset) {
                    sy = (bounds[3] - y) / (bounds[3] - handlerPoint.y);
                }
                break;
            case 's' :
                  dy = bounds[1];
                if (y > bounds[1] + offset) {
                    sy = (y - bounds[1]) / (handlerPoint.y - bounds[1]);
                }
                break;
            case 'w' :
               dx = bounds[2];
               if(x < bounds[2] - offset){ //West(newX) must not get too close to East(bounds[2])
                   sx = (bounds[2] - x) / (bounds[2] - handlerPoint.x);
               }
               break;
            case 'e' :
               dx = bounds[0];
               if(x > bounds[0] + offset){ //West(newX) must not get too close to East(bounds[2])
                   sx = (x - bounds[0]) / (handlerPoint.x - bounds[0]);
               }
               break;
            case 'nw':
                dx = bounds[2];
                dy = bounds[3];
                if (x < bounds[2] - offset && y < bounds[3] - offset) {
                    sx = (bounds[2] - x) / (bounds[2] - handlerPoint.x);
                    sy = (bounds[3] - y) / (bounds[3] - handlerPoint.y);
                }
                break;
            case 'ne' :
                dx = bounds[0];
                dy = bounds[3];
                if (x > bounds[0] + offset && y < bounds[3] - offset) {
                    sx = (x - bounds[0]) / (handlerPoint.x - bounds[0]);
                    sy = (bounds[3] - y) / (bounds[3] - handlerPoint.y);
                }
                break;
            case 'sw' :
                dx = bounds[2];
                dy = bounds[1];
                if (x < bounds[2] - offset && y > bounds[1] + offset) {
                    sx = (bounds[2] - x) / (bounds[2] - handlerPoint.x);
                    sy = (y - bounds[1]) / (handlerPoint.y - bounds[1]);
                }
                break;
            case 'se' :
                dx = bounds[0];
                dy = bounds[1];
                if (x > bounds[0] + offset && y > bounds[1] + offset) {
                    sx = (x - bounds[0]) / (handlerPoint.x - bounds[0]);
                    sy = (y - bounds[1]) / (handlerPoint.y - bounds[1]);
                }
                break;
        }
        

        if (dx != 0 && dy != 0) {
            if(this.getCursor()=="w-resize" || this.getCursor()=="e-resize"){
                sy = sx;
            }
            else{
                sx = sy;
            }
        }

        
        var scaleMatrix = Matrix.generateScaleMatrix(sx, sy);
        var translationMatrix = Matrix.generateTranslationMatrix(dx, dy);
        var reverseTranslationMatrix = Matrix.generateTranslationMatrix(-dx, -dy);

        
        if (HandleManager.component != null) {
            var c = HandleManager.component;
            c.transform(reverseTranslationMatrix);
            c.transform(scaleMatrix);
            c.transform(translationMatrix);
        } else { //it's group
            GROUP.transform(reverseTranslationMatrix);
            GROUP.transform(scaleMatrix);
            GROUP.transform(translationMatrix);
        }       
        
        
        //c.text.transform(reverseTranslationMatrix);
        //c.text.transform(scaleMatrix);
        //c.text.transform(translationMatrix);       
        //var str = "after translate (" + c.Handles[0].x + "," + c.Handles[0].y + ")";
        //console.log(str);
    },
    

    
}    
    


/**HandleManager will act like a Singleton (even not defined as one)
 * You will attach a Figure to it and he will be in charge with the figure manipulation
 * @constructor
 * @this {HandleManager}
 **/
function HandleManager(){
    
}

/**The shape (figure or connector) that the HandleManager will manage*/
HandleManager.component = null;

HandleManager.selectedHandleId = -1;
    
/**An {Array} with current handles*/
HandleManager.handles = [];
    
/**An {Array} with connector handles*/
HandleManager.connectorHandles = [];

/**Selection rectangle (the rectangle upon the Handles will stay in case of a Figure/Group)*/
//HandleManager.selectRect = [];

    
/**Distance from shape where to draw the handles*/
//HandleManager.handleOffset = 0;//JS: I want handles t  





/**Get selected handle or null if no handler selected*/
HandleManager.handleGetSelected = function(){
    if(HandleManager.selectedHandleId!=-1){
        return HandleManager.handles[HandleManager.selectedHandleId];
    }
    return null;
}




/**Use this method to set a new {Group} to this manager.
 * Every time a new group is set, old handles will dissapear (got erased by new group's handles)
 **/
HandleManager.setGroup = function(){
    HandleManager.component = null;

    //1. clear old/previous handles
    HandleManager.handles = [];

    var bounds = GROUP.getBounds();
    
    var handle = new Handle("nw"); //NW
    handle.x = bounds[0];
    handle.y = bounds[1];
    HandleManager.handles.push(handle);

    handle = new Handle("n"); //N
    handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
    handle.y = bounds[1];
    HandleManager.handles.push(handle);

    handle = new Handle("ne"); //NE
    handle.x = bounds[2];
    handle.y = bounds[1];
    HandleManager.handles.push(handle);

    handle = new Handle("e"); //E
    handle.x = bounds[2];
    handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
    HandleManager.handles.push(handle);

    handle = new Handle("se"); //SE
    handle.x = bounds[2];
    handle.y = bounds[3];
    HandleManager.handles.push(handle);

    handle = new Handle("s"); //S
    handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
    handle.y = bounds[3];
    HandleManager.handles.push(handle);

    handle = new Handle("sw"); //SW
    handle.x = bounds[0];
    handle.y = bounds[3];
    HandleManager.handles.push(handle);

    handle = new Handle("w"); //W
    handle.x = bounds[0];
    handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
    HandleManager.handles.push(handle);
}


/**Use this method to set a new {Component} to this manager.
 * Every time a new component is set, old handles will dissapear (got erased by new component's handles)
 **/
HandleManager.setComponent = function(component){
    HandleManager.component = component;

    //1. clear old/previous handles
    HandleManager.handles = [];
    
    //HandleManager.selectRect = new Polygon();

    //console.log(HandleManager.component);
    //construct bounds of the Figure in "normal" space
    //var handles = HandleManager.component.getBounds();
    //var len = handles.length;
    
    /*for (var i = 0, len = handles.length; i < len; i++){
        alert("handle " + i + ":" + handles[i].x + "," + handles[i].y);
    }*/
    //HandleManager.selectRect.points = [];
    //HandleManager.selectRect.addPoint(new Point(bounds[0] - HandleManager.handleOffset, bounds[1] - HandleManager.handleOffset)); //top left
    //HandleManager.selectRect.addPoint(new Point(bounds[2] + HandleManager.handleOffset, bounds[1] - HandleManager.handleOffset)); //top right
    //HandleManager.selectRect.addPoint(new Point(bounds[2] + HandleManager.handleOffset, bounds[3] + HandleManager.handleOffset)); //bottom right
    //HandleManager.selectRect.addPoint(new Point(bounds[0] - HandleManager.handleOffset, bounds[3] + HandleManager.handleOffset)); //bottom left

    //bounds = HandleManager.selectRect.getBounds();
    var bounds = HandleManager.component.getBounds();
    

    /*for (var i = 0; i < len; i++){
        var htype = Handle.types[i];
        var handle = new Handle(htype);
        handle.x = handles[i].x;
        handle.y = handles[i].y;
        HandleManager.handles.push(handle);
    }*/
    
    if (component.Name == "Alfa" || component.Name == "Beta" || component.Name == "Text") {
        var handle = new Handle("se"); //SE
        handle.x = bounds[2];
        handle.y = bounds[3];
        HandleManager.handles.push(handle);       
    } else {
        var handle = new Handle("nw"); //NW
        handle.x = bounds[0];
        handle.y = bounds[1];
        HandleManager.handles.push(handle);

        handle = new Handle("n"); //N
        handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
        handle.y = bounds[1];
        HandleManager.handles.push(handle);

        handle = new Handle("ne"); //NE
        handle.x = bounds[2];
        handle.y = bounds[1];
        HandleManager.handles.push(handle);

        handle = new Handle("e"); //E
        handle.x = bounds[2];
        handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
        HandleManager.handles.push(handle);

        handle = new Handle("se"); //SE
        handle.x = bounds[2];
        handle.y = bounds[3];
        HandleManager.handles.push(handle);

        handle = new Handle("s"); //S
        handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
        handle.y = bounds[3];
        HandleManager.handles.push(handle);

        handle = new Handle("sw"); //SW
        handle.x = bounds[0];
        handle.y = bounds[3];
        HandleManager.handles.push(handle);

        handle = new Handle("w"); //W
        handle.x = bounds[0];
        handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
        HandleManager.handles.push(handle);
    } 
}


HandleManager.clear = function(){
    //HandleManager.handleSelectedIndex = -1;
    HandleManager.shape = null;
    HandleManager.handles = [];
}
    
/**Returns all handles for a component.
 *It does not mean that the HandleManager keeps records of all Handles for a
 *Component but more likely they are computed on-the-fly
 *@return an {Array} of {Handle} that you can further use to manage the component
 **/    
HandleManager.getAllHandles = function(){
    return HandleManager.handles;
}

/**Returns the handle from a certain coordinates
 *@param {Number} x - the value on Ox
 *@param {Number} y - the value on Oy
 ***/
HandleManager.getHandle = function(x,y){
    for(var i=0, len = HandleManager.handles.length; i < len; i++){
        if(HandleManager.handles[i].contains(x,y)){
            return HandleManager.handles[i];
        }
    }
    return null;
}


/**
 *Select the handle from a certain coordinates
 *@param {Number} x - the value on Ox
 *@param {Number} y - the value on Oy
 **/
HandleManager.selectHandleAt = function(x,y){
    HandleManager.selectedHandleId = -1;
    for (var i = 0, len = HandleManager.handles.length; i < len; i++){
        if(HandleManager.handles[i].contains(x,y)){
            HandleManager.selectedHandleId = i;
            //break;
        }
    }
}

/**Paint the Handles, actually the HandleManager will delegate each paint to
 *the proper Handle to paint
 *@param {Context} context - the 2D context
 **/
HandleManager.paint = function(context){
    var handles = HandleManager.getAllHandles(); //calling this sets the coordinates
    //paint first the selection rectangle
    //context.save();
    
    //first draw select rectangle
    var x = handles[0].x;
    var y = handles[0].y;
    var width = handles[4].x - handles[0].x;
    var height = handles[4].y - handles[0].y;
    
    context.strokeStyle = "#939393";
    context.setLineDash([4]);
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
    //if (context.setLineDash)
    context.setLineDash([]);
    //}

    //now paint handles
    for(var i=0; i<handles.length; i++){
        handles[i].paint(context);
    }
    //context.restore()
}



/*function scaleFunction(args) {
        var matrixes = [];
        var figBounds = HandleManager.shape.getBounds();
        var transX = 0; //the amount of translation on Ox
        var transY = 0; //the amount of translation on Oy
        var scaleX = 1; //the scale percentage on Ox
        var scaleY = 1; //the scale percentage on Oy}
}*/
