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
 * A matrix math library.
 * Instead of creating of a so called Object we will only use matrixes as
 * array or arrays so Matrix will function more like a namespace instead
 * as an object.
 *
 * All function are "static" / class methods...so no need to instanciate a Matrix object
 * 
 * @namespace
 */

var Matrix = {      

    generateMoveMatrix : function(x,y){
    
        var dx = x - lastMove[0];
        var dy = y - lastMove[1];
    
        var moveMatrix = [
                [1, 0, dx],
                [0, 1, dy],
                [0, 0, 1]
                ];
        
        return moveMatrix;
    },

    /**Creates a translation matrix
     *@param {Number} dx - variation of movement on [Ox axis
     *@param {Number} dy - variation of movement on [Oy axis
     *@return {Array} - the ready to use translation matrix
    **/        
    generateTranslationMatrix : function(dx, dy){
        
        return [
            [1, 0, dx],
            [0, 1, dy],
            [0, 0,  1]
        ];
    },
    
    /**Creates a scale matrix
     *@param {Number} sx - scale factor by which the x will be multiply
     *@param {Number} sy - scale factor by which the y will be multiply
     *@return {Array} - the ready to use scale matrix
     *@see <a href="http://en.wikipedia.org/wiki/Transformation_matrix#Scaling">http://en.wikipedia.org/wiki/Transformation_matrix#Scaling</a>
 **/
    generateScaleMatrix : function(sx, sy){
    
        return [
            [sx, 0, 0],
            [0, sy, 0],
            [0,  0, 1]
        ];
        
    },
    
    generateRotationMatrix : function(angle){
        
        return [
            [Math.cos(angle), -Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1]
        ];
            

    }
    
    
}
