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

/** Group is ONLY a logical grouping of some figures.
 * It does not paint itself and it does not change the Z-Order of member figures
 */

function Group(){
    
    this.components = [];
    this.connectors = [];
    
}

Group.prototype = {
    
    constructor : Group,
    
    addComponents : function(componentIds){
        var len = componentIds.length;
        for(var i = 0; i < len; i++){
            this.components.push(componentIds[i]);
        }
    },
    
    addConnectors : function(connectorIds){
        var len = connectorIds.length;
        for(var i = 0; i < len; i++){
            this.connectors.push(connectorIds[i]);
        }
    },
    
    reset : function(){
        this.components = [];
        this.connectors = [];
    },
    
    contains : function(x,y){
        var len = this.components.length;
        for(var i = 0; i < len; i++){
            if(this.components[i].contains(x,y) == true){
                return true;
            }
        }
        
        len = this.connectors.length;
        for(var i = 0; i < len; i++){
            if(this.connectors[i].contains(x,y) == true){
                return true;
            }
        }        
        return false;        
    },
    
    getBounds : function(){
        var points = [];
        var len = this.components.length;
        for(var i = 0; i < len; i++){
            var c = Stack.getComponentById(this.components[i]);
            var bounds = c.getBounds();
            points.push(new Point(bounds[0], bounds[1]));
            points.push(new Point(bounds[2], bounds[3]));
        }
        
        len = this.connectors.length;
        for(var i = 0; i < len; i++){
            var c = CONNECTOR_MANAGER.connectorGetById(this.connectors[i])
            var bounds = c.getBounds();
            points.push(new Point(bounds[0], bounds[1]));
            points.push(new Point(bounds[2], bounds[3]));
        }
        return Util.getBounds(points);
    },
    
    transform : function(matrix){
        //this.rotationCoords[0].transform(matrix);
        //this.rotationCoords[1].transform(matrix);
        var len = this.components.length;
        for(var i = 0; i < len; i++){
            //we got just ids, we should get components...
            var c = Stack.getComponentById(this.components[i]);
            c.transform(matrix);
        }
        
        /*len = this.connectors.length;
        for(var i = 0; i < len; i++){
            CONNECTOR_MANAGER.connectionPointTransform(this.connectors[i], matrix);
            var c = CONNECTOR_MANAGER.connectorGetById(this.connectors[i]);
            c.transform(matrix);
            
        }*/
        
    },
    
    belongsTo : function(id, kind){
        if (kind == "component") {
            var len = this.components.length;
            for(var i=0; i<len; i++){
               if(this.components[i] == id){
                   return true;
               }
            }
        } else { //kind == connector
            var len = this.connectors.length;
            for(var i=0; i<len; i++){
               if(this.connectors[i] == id){
                   return true;
               }
            }            
        }
        return false;
        
    }
    
}

