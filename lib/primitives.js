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
  * Creates an instance of Point
  *
  *
  * @constructor
  * @this {Point}
  * @param {Number} x The x coordinate of point.
  * @param {Number} y The y coordinate of point.
  * @author Alex Gheorghiu <alex@scriptoid.com>
  * Note: Even if it is named Point this class should be named Dot as Dot is closer
  * then Point from math perspective.
  **/
function Point(x,y) {
    /**The x coordinate of point*/
    this.x = x;
    /**The y coordinate of point*/
    this.y = y;
}


/**Clones an array of points
 *@param {Array} v - the array of {Point}s
 *@return an {Array} of {Point}s
 **/
Point.cloneArray = function(v){
    var newPoints = [];
    for(var i=0; i< v.length; i++){
        newPoints.push(v[i].clone());
    }
    return newPoints;
}


Point.prototype = {
    constructor : Point,
    
    
    /**Tests if this point is similar to other point
     *@param {Point} anotherPoint - the other point
     **/
    equals:function(anotherPoint){
        if(! (anotherPoint instanceof Point) ){
            return false;
        }
        return (this.x == anotherPoint.x)
        && (this.y == anotherPoint.y)
    },    
    
    /*
     *Transform a point by a tranformation matrix. 
     *It is done by multiplication
     *Pay attention on the order of multiplication: The tranformation {Matrix} is
     *multiplied with the {Point} matrix.
     * P' = M x P
     *@param matrix is a 3x3 matrix
     *@see <a href="http://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations">http://en.wikipedia.org/wiki/Transformation_matrix#Affine_transformations</a>
     **/
    transform : function(matrix){
        if(this.style!=null){
            this.style.transform(matrix);
        }
        var oldX = this.x;
        var oldY = this.y;
        this.x = matrix[0][0] * oldX + matrix[0][1] * oldY + matrix[0][2];
        this.y = matrix[1][0] * oldX + matrix[1][1] * oldY + matrix[1][2];
    },
    
    paint : function(context){
        
       context.lineWidth = 2;
       context.fillStyle = '#8ED6FF';
       var width = 1;
       
       context.beginPath();
       context.arc(this.x, this.y, width, 0,Math.PI/180*360,false);
       context.fill();
    },
    
    getPoints:function(){
        return [this];
    },
    
    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },
    /**Clone current Point
     **/
    clone: function(){
        var newPoint = new Point(this.x, this.y);
        return newPoint;
    },
    /**Tests to see if a point (x, y) is within a range of current Point
     *@param {Numeric} x - the x coordinate of tested point
     *@param {Numeric} y - the x coordinate of tested point
     *@param {Numeric} radius - the radius of the vicinity
     *@author Alex Gheorghiu <alex@scriptoid.com>
     **/
    near:function(x, y, radius){
        var distance = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));

        return (distance <= radius);
    },
    
    contains: function(x,y){
        return this.x == x && this.y == y;
    }
   
}

/**
  * Creates an instance of a Line. A Line is actually a segment and not a pure
  * geometrical Line
  *
  * @constructor
  * @this {Line}
  * @param {Point} startPoint - starting point of the line
  * @param {Point} endPoint - the ending point of the line
  * @author Alex Gheorghiu <alex@scriptoid.com>
  **/
function Line(startPoint, endPoint){
    //this.id = id;
    
    /**Starting {@link Point} of the line*/
    this.startPoint = startPoint;
    
    /**Ending {@link Point} of the line*/
    this.endPoint = endPoint;
}


Line.prototype = {
    contructor: Line,
    
    transform : function(matrix){
        this.startPoint.transform(matrix);
        this.endPoint.transform(matrix);

    },

    paint : function(context){
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.closePath(); // added for line's correct Chrome's displaying
        context.stroke();
    },
    
    getPoints:function(){
        var points = [];
        points.push(this.startPoint);
        points.push(this.endPoint);
        return points;
    },
    
    getMiddle : function(){
        return new Point( (this.startPoint.x + this.endPoint.x)/2, (this.startPoint.y + this.endPoint.y)/2);

    },
    
    
    getLength : function(){
        return Math.sqrt( Math.pow(this.startPoint.x - this.endPoint.x, 2) + Math.pow(this.startPoint.y - this.endPoint.y, 2) );
    },
    
    getBounds : function(){
        return Util.getBounds(this.getPoints());
    },
    
    /** Tests to see if a point belongs to this line (not as infinite line but more like a segment)
     * Algorithm: Compute line's equation and see if (x, y) verifies it.
     * @param {Number} x - the X coordinates
     * @param {Number} y - the Y coordinates
     * @author Alex Gheorghiu <alex@scriptoid.com>
     **/
    contains: function(x, y){
        //console.log("(" + this.startPoint.x + "," + this.startPoint.y + "," + this.endPoint.x + "," + this.endPoint.y + ")");
        // if the point is inside rectangle bounds of the segment
        if (Math.min(this.startPoint.x, this.endPoint.x) <= x
            && x <= Math.max(this.startPoint.x, this.endPoint.x)
            && Math.min(this.startPoint.y, this.endPoint.y) <= y
            && y <= Math.max(this.startPoint.y, this.endPoint.y)) {

            // check for vertical line
            if (this.startPoint.x == this.endPoint.x) {
                return x == this.startPoint.x;
            } else { // usual (not vertical) line can be represented as y = a * x + b
                var a = (this.endPoint.y - this.startPoint.y) / (this.endPoint.x - this.startPoint.x);
                var b = this.startPoint.y - a * this.startPoint.x;
                return y == a * x + b;
            }
        } else {
            return false;
        }
    },
    
    /*
     *See if we are near a {Line} by a certain radius (also includes the extremities into computation)
     *@param {Number} x - the x coordinates
     *@param {Number} y - the y coordinates
     *@param {Number} radius - the radius to search for
     *@see http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     *@see "Mathematics for Computer Graphics, 2nd Ed., by John Vice, page 227"
     *@author Zack Newsham <zack_newsham@yahoo.co.uk>
     *@author Arty
     *@author Alex
     **/
    near:function(x,y,radius){
        
        if(this.endPoint.x === this.startPoint.x){ //Vertical line, so the vicinity area is a rectangle
            return ( (this.startPoint.y-radius<=y && this.endPoint.y+radius>=y) 
                    || (this.endPoint.y-radius<=y && this.startPoint.y+radius>=y))
            && x > this.startPoint.x - radius && x < this.startPoint.x + radius ;
        }
        
        if(this.startPoint.y === this.endPoint.y){ //Horizontal line, so the vicinity area is a rectangle
            return ( (this.startPoint.x - radius<=x && this.endPoint.x+radius>=x) 
                    || (this.endPoint.x-radius<=x && this.startPoint.x+radius>=x))
                    && y>this.startPoint.y-radius && y<this.startPoint.y+radius ;
        }


        var startX = Math.min(this.endPoint.x,this.startPoint.x);
        var startY = Math.min(this.endPoint.y,this.startPoint.y);
        var endX = Math.max(this.endPoint.x,this.startPoint.x);
        var endY = Math.max(this.endPoint.y,this.startPoint.y);
        
        /*We will compute the distance from point to the line
         * by using the algorithm from 
         * http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
         * */

        //First we need to find a,b,c of the line equation ax + by + c = 0
        var a = this.endPoint.y - this.startPoint.y;
        var b = this.startPoint.x - this.endPoint.x;        
        var c = -(this.startPoint.x * this.endPoint.y - this.endPoint.x * this.startPoint.y);

        //Secondly we get the distance "Mathematics for Computer Graphics, 2nd Ed., by John Vice, page 227"
        var d = Math.abs( (a*x + b*y + c) / Math.sqrt(Math.pow(a,2) + Math.pow(b,2)) );

        //Thirdly we get coordinates of closest line's point to target point
        //http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Cartesian_coordinates
        var closestX = (b * (b*x - a*y) - a*c) / ( Math.pow(a,2) + Math.pow(b,2) );
        var closestY = (a * (-b*x + a*y) - b*c) / ( Math.pow(a,2) + Math.pow(b,2) );

        var r = ( d <= radius && endX>=closestX && closestX>=startX && endY>=closestY && closestY>=startY ) //the projection of the point falls INSIDE of the segment
            || this.startPoint.near(x,y,radius) || this.endPoint.near(x,y,radius); //the projection of the point falls OUTSIDE of the segment 

        return  r;

    },
    
    clone : function(){
        var ret = new Line(this.startPoint.clone(), this.endPoint.clone());
        return ret;
    },

    equals : function(anotherLine){
        if(!anotherLine instanceof Line){
            return false;
        }
        return this.startPoint.equals(anotherLine.startPoint)
        && this.endPoint.equals(anotherLine.endPoint);
    },


}


/**
  * Creates an instance of a Polygon
  *
  * @constructor
  * @this {Polygon}
  * @author Alex Gheorghiu <alex@scriptoid.com>
  **/
function Polygon(){
    /**An {Array} of {@link Point}s*/
    this.points = [];
}


Polygon.prototype = {
    constructor : Polygon,
    
    addPoint:function(point){
        this.points.push(point);            
    },

    paint:function(context){
        //context.lineWidth = 2;
        //context.fillStyle = '#8ED6FF';
        
        context.beginPath();

        if(this.points.length > 1){
            context.moveTo(this.points[0].x, this.points[0].y);
            for(var i=1; i<this.points.length; i++){
                context.lineTo(this.points[i].x, this.points[i].y)
            }
        }
        context.closePath();
        
        context.fill();
        context.stroke();

        /*//fill current path
        if(this.style.fillStyle != null && this.style.fillStyle != ""){
            context.fill();
        }

        //stroke current path 
        if(this.style.strokeStyle != null && this.style.strokeStyle != ""){
            context.stroke();
        }*/
    },


    getPoints:function(){
        var p = [];
        for (var i=0; i<this.points.length; i++){
            p.push(this.points[i]);
        }
        return p;
    },
    
    
    transform:function(matrix){
        for(var i=0; i < this.points.length; i++){
            this.points[i].transform(matrix);
        }
    },
        
    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },
    
    near:function(x,y,radius){
        var i=0;
        for(i=0; i< this.points.length-1; i++){
            var l = new Line(this.points[i], this.points[i+1]);
            if(l.near(x,y,radius)){
                return true;
            }
        }
        l=new Line(this.points[i], this.points[0]);
        if(l.near(x,y,radius)){
            return true;
        }
        return false;
    },

    equals : function(anotherPolygon){
        if(!anotherPolygon instanceof Polygon){
            return false;
        }
        if(anotherPolygon.points.length == this.points.length){
            for(var i=0; i<this.points.length; i++){
                if(!this.points[i].equals(anotherPolygon.points[i])){
                    return false;
                }
            }
        }
        //TODO: test for all Polygon members
        return true;
    },
    
    clone : function(){
        var ret=new Polygon();
        for(var i=0; i<this.points.length; i++){
            ret.addPoint(this.points[i].clone());
        }
        
        return ret;
    },
    
    contains : function(x, y, includeBorders){
        var inPath = false;
        var p = new Point(x,y);
        if(!p){
            alert('Polygon: P is null');
        }

        if (includeBorders) {
            return Util.isPointInsideOrOnBorder(p, this.points);
        } else {
            return Util.isPointInside(p, this.points);
        }
    }
}

/**
  * Creates an instance of Component
  *
  *
  * @constructor
  * @this {Component}
  * @param {Number} name Name of the component
  * @param {Number} size Size of the component
  * @param {Number} x The x coordinate of upper-left point of component.
  * @param {Number} y The y coordinate of upper-left point of component.
  **/
function Component(name, size, x, y) {
    this.id = Stack.generateId();
    this.Name = name;
    this.Size = size;
    this.primitives = [];
    this.Handles = [];
    this.rotationCoords = [];   
}


Component.prototype = {
    pippo : 0,
    
    constructor: Component,
    
    transform : function(matrix){
        //transform all composing primitives
        for(var i = 0; i<this.primitives.length; i++ ){
            this.primitives[i].transform(matrix);
        }
   
    },    
    
    addPrimitive : function(primitive){
        // add id property to primitive equal its index
       // primitive.id = this.primitives.length;

        this.primitives.push(primitive);

        // update bound coordinates for gradient
        //this.style.gradientBounds = this.getBounds();
    },

    paint : function(context){
        context.save();
        if (this.Name == "Box") {
            context.setLineDash([10,15]);
            context.strokeStyle = 'red';
            context.lineWidth = 2;
            context.fillStyle = 'transparent';
        } else {
                if(this.id == CONNECTOR_MANAGER.overComponentId){
                    //context.strokeStyle = '#FF0000'/*red*/
                    context.shadowColor = "#5DFC0A";
                    context.shadowBlur = 10;
                } else {
                    context.strokeStyle = '#333';
                    context.shadowColor = '#999';
                    context.shadowBlur = 2;
                    context.shadowOffsetX = 2;
                    context.shadowOffsetY = 2;            
                }
                
            context.lineWidth = 2;
            //context.globalAlpha = 0.5;
            //context.fillStyle = '#8ED6FF';
            //context.fillStyle = '#E0ECF8';
            context.fillStyle = '#E6E6E6';
        }
        
        for(var i = 0; i<this.primitives.length; i++ ){
            this.primitives[i].paint(context)   ;
        }

        context.restore();
    },
    
    getText : function(){
        return this.primitives[this.primitives.length -1].getString();
    },
    
    getTextPrim : function(){
        return this.primitives[this.primitives.length -1];
    },
    
    setText : function(str){
        this.primitives[this.primitives.length -1].setString(str);
    },
    
    getPoints:function(){
        var points = [];
        //last primitive is Text, so we skip it
        for (var i=0; i<this.primitives.length - 1; i++){
            points = points.concat(this.primitives[i].getPoints()); //add all primitive's points in a single pass
        }
        //console.log("getPoints len:" + points.length);
        return points;
    },
    
    getBounds : function(){
        var points = [];
        for (var i = 0; i < this.primitives.length -1 ; i++) {
            var bounds = this.primitives[i].getBounds();
            points.push(new Point(bounds[0], bounds[1]));
            points.push(new Point(bounds[2], bounds[3]));
        }
        return Util.getBounds(points);        
    },
    
    getHandles : function(){
        return this.Handles;
    },
    
    
    contains:function(x,y){
        var points=[];
        for(var i=0; i<this.primitives.length - 1; i++){
            if(this.primitives[i].contains(x,y))
                return true;
            
            points = points.concat(this.primitives[i].getPoints());
        }
        return Util.isPointInside(new Point(x,y),points);
    },  
    
    
    contains2 : function(x,y){
        var p1 = this.Handles[0];
        var p2 = this.Handles[4];
        
        if ((p1.x <= x && x <= p2.x) &&
            (p1.y <= y && y <= p2.y)) {
            return true;
        }
        return false;
    },
    
    transform : function(matrix){
        //transform all composing primitives
        for(var i = 0; i<this.primitives.length; i++ ){
            this.primitives[i].transform(matrix);
        }
        
        for(var i = 0; i<this.Handles.length; i++ ){
            this.Handles[i].transform(matrix);
        }
        
        //this.generateConnectionPoints();
        CONNECTOR_MANAGER.connectionPointTransform(this.id, matrix);
        
    },
    
    generateConnectionPoints : function(){
        CONNECTOR_MANAGER.connectionPointRemoveAllByParent(this.id);
        var points = this.getPoints();
        
        switch (this.Name) {
            case "Memoria":
                var len = points.length - 2;
                //console.log("len:" + len);
        
                for (var i=0; i<len; i++){
                    //console.log(points[i].x + "," + points[i].y + ";" + points[i+1].x + "," + points[i+1].y);
                    //horizontal line
                    if (points[i+1].y == points[i].y) {
                        //console.log("horizontal line"); 
                        var segmentLen = Math.sqrt(Math.pow(points[i+1].x - points[i].x, 2) + Math.pow(points[i+1].y - points[i].y, 2));
                        var cps = segmentLen / (ConnectionPoint.RADIUS);
                        for(var j=0; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                            var px = (points[i].x < points[i+1].x) ? points[i].x : points[i+1].x;
                            CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(px + j, points[i].y), ConnectionPoint.TYPE_FIGURE);
                        }
                    } else if (points[i+1].x == points[i].x) {
                        //console.log("vertical line"); 
                        var segmentLen = Math.sqrt(Math.pow(points[i+1].x - points[i].x, 2) + Math.pow(points[i+1].y - points[i].y, 2));
                        var cps = segmentLen / (ConnectionPoint.RADIUS);
                        for(var j=5; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                            var py = (points[i].y < points[i+1].y) ? points[i].y : points[i+1].y;
                            CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(points[i].x, py + j), ConnectionPoint.TYPE_FIGURE);
                        }
                    }
            
                }                
                
                break;
            case "Registro":
            case "Commutatore":
            case "Selettore":
            case "RDY_R":
            case "RDY_L":
            case "ACK_R":
            case "ACK_L":                
                var len = points.length;
           
                //vertical lines
                var segmentLen = Math.abs(points[1].y - points[0].y);
                var cps = segmentLen / (ConnectionPoint.RADIUS);
               
                for(var j=5; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                    var cy = (points[0].y < points[1].y) ? points[0].y : points[1].y;
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(points[0].x, cy + j), ConnectionPoint.TYPE_FIGURE);
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(points[2].x, cy + j), ConnectionPoint.TYPE_FIGURE);
                }
               
                //horizontal lines
                segmentLen = Math.abs(points[1].x - points[2].x);
                cps = segmentLen / (ConnectionPoint.RADIUS);
               
                for(var j=7; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                    var cx = (points[0].x < points[1].x) ? points[0].x : points[1].x;
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(cx + j, points[1].y), ConnectionPoint.TYPE_FIGURE);
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(cx + j, points[3].y), ConnectionPoint.TYPE_FIGURE);
                }                  
                
                break;
            case "ALU":
                //horizontal under line
                var segmentLen = Math.abs(points[1].x - points[2].x);
                var cps = segmentLen / (ConnectionPoint.RADIUS);
                
                for(var j=7; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                    var cx = (points[1].x < points[2].x) ? points[1].x : points[2].x;
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(cx + j, points[1].y), ConnectionPoint.TYPE_FIGURE);
                }
                
                //horizontal up lines
                segmentLen = Math.abs(points[3].x - points[4].x);
                cps = segmentLen / (ConnectionPoint.RADIUS);
                
                for(var j=5; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                    var cx1 = (points[3].x < points[4].x) ? points[3].x : points[4].x;
                    var cx2 = (points[0].x < points[6].x) ? points[0].x : points[6].x;
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(cx1 + j, points[3].y), ConnectionPoint.TYPE_FIGURE);
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(cx2 + j, points[6].y), ConnectionPoint.TYPE_FIGURE);
                }
                
                //left&right side lines
                //x = x1 + (x2-x1) * t
                //y = y1 + (y2-y1) * t
                segmentLen = Util.distance(points[1], points[0]);
                for(var j=5; j<segmentLen; j+=(ConnectionPoint.RADIUS*2)){
                    var t = j / segmentLen;
                    var x = points[0].x + (points[1].x - points[0].x) * t
                    var y = points[0].y + (points[1].y - points[0].y) * t
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(x,y), ConnectionPoint.TYPE_FIGURE);
                    x = points[2].x + (points[3].x - points[2].x) * t
                    y = points[2].y + (points[3].y - points[2].y) * t
                    CONNECTOR_MANAGER.connectionPointCreate(this.id, new Point(x,y), ConnectionPoint.TYPE_FIGURE);
                }
                break;
        }

    },
    
    updatePrimitive : function(i, val){
        this.primitives[i] = val;
    },
    
    //TODO: UPDATE TRANSFORM FUNCTIONS!!!
    finalise : function(){
        var bounds = this.getBounds();

        if(bounds == null){
            throw 'Component bounds are null !!!';
            return;
        }
        
        //central point of the figure
        this.rotationCoords[0] = new Point(
            bounds[0] + (bounds[2] - bounds[0]) / 2,
            bounds[1] + (bounds[3] - bounds[1]) / 2
        );

        //the middle of upper edge
        this.rotationCoords[1] = new Point(this.rotationCoords[0].x, bounds[1]);        
    }

}




