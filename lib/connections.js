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



var connector_defaultConnectorTextSize = 12;
var connector_defaultConnectorTextStr = "";
var connector_defaultConnectorTextFont = "Arial";
var connector_defaultConnectorTextStrokeStyle = "#000000";
var connector_defaultConnectorTextFillStyle = "#000000";
var connector_defaultConnectorTextBgStyle = "#ffffff";

/**
 *It's a connector between 2 componentConnectionPoints.
 *
 *@constructor
 *@this {Connector}
 *@param {Point} startPoint - the start of the line, where a ConnectionPoint will be added
 *@param {Point} endPoint - the end of the line, where a ConnectionPoint will be added
 *@param {String} type - the type of the Connector. It can be 'straight' or 'jagged'
 *@param {Number} id - the unique (at least among other Connectors) id this connector will have
 *@author Zack Newsham <zack_newsham@yahoo.co.uk>
 *@author Alex Gheorghiu <alex@scriptoid.com>
*/
function Connector(startPoint, endPoint, type, id){
    /**Connector's id*/
    this.id = id;
    
    /**An {Array} of {Point}s. They will be used to draw the connector*/
    this.turningPoints = [startPoint,endPoint];
    
    /**Type of connector. Ex. TYPE_STRAIGHT*/
    this.type = type;
    
    //this.text = new Text("myText", (startPoint.x + endPoint.x)/2, (startPoint.y + endPoint.y)/2);
    this.text = new Text("", startPoint.x + 50, startPoint.y - 10);

    /**An {Array} of {Object}s. Stores set of user manual changes to connector's shape.
     * Structure of instance:
     * - align: 'v' for vertical and 'h' for horizontal
     * - delta: user defined offset from default position
     * - index: index of turning point which is changed
     * Note: the changes are not store in the order of the turning points, but
     * the correspondence is made by 'index' field
     * */
    this.userChanges = [];

    /**Solution of connector's shape calculated with ConnectionManager.connector2Points.
     * It can be one of: 's0', 's1_1', 's2_2', etc. */
    this.solution = '';
    
    /**The {Style} this connector will have*/
    //this.style.strokeStyle = "#000000";
    //this.style.lineWidth = 1.005;   // fixes connector's display in Chrome for now

    this.strokeStyle = "#000000";
    this.lineWidth = 1.005;   // fixes connector's display in Chrome for now
    //this.lineStyle = Style.LINE_STYLE_CONTINOUS;    

    
    /**End style for connector. Ex: Connector.STYLE_FILLED_TRIANGLE*/
    this.endStyle = Connector.STYLE_FILLED_TRIANGLE;

    /**The {ConnectionPoint}'s id that is currently being dragged*/
    this.activeConnectionPointId = -1;

}


/**Straight connector type*/
Connector.TYPE_STRAIGHT = 'straight';
/**Jagged connector type*/
Connector.TYPE_JAGGED = 'jagged';
/**Round connector type. Orthogonal angles are smoothed. 
 *TODO: Not implemented*/
Connector.TYPE_ROUND = 'round';

/**Round connector type. The connector is drawn as a curve*/
Connector.TYPE_ORGANIC = 'organic';

/**Normal end connector style*/
Connector.STYLE_NORMAL = "Normal";

/**Arrow like end connector style*/
Connector.STYLE_ARROW = "Arrow";

/**Empty triangle end connector style*/
Connector.STYLE_EMPTY_TRIANGLE = "Empty";

/**Filled triangle end connector style*/
Connector.STYLE_FILLED_TRIANGLE = "Filled";


/**End connector arrow size*/
Connector.ARROW_SIZE = 12;

/**End connector arrow angle*/
Connector.ARROW_ANGLE = 15;

/**User change horizontal align*/
Connector.USER_CHANGE_HORIZONTAL_ALIGN = 'h';

/**User change vertical align*/
Connector.USER_CHANGE_VERTICAL_ALIGN = 'v';


Connector.prototype = {
    
    constructor : Connector,
    
     /**
     *Compares to another Connector
     *
     *@param {Connector} anotherConnector - the other connector
     **/
    equals:function(anotherConnector){
        if(!anotherConnector instanceof Connector){
            return false;
        }

        //test turning points
        for(var i=0; i<this.turningPoints.length; i++){
            if( !this.turningPoints[i].equals(anotherConnector.turningPoints[i]) ){
                return false;
            }
        }

        //test properties
        /*for(var i=0; i<this.properties.length; i++){
            if(!this.properties[i].equals(anotherConnector.properties[i])){
                return false;
            }
        }*/

        //test user changes
        for(var i=0; i<this.userChanges.length; i++){
            if(this.userChanges[i].align != anotherConnector.userChanges[i].align
                || this.userChanges[i].index != anotherConnector.userChanges[i].index
                || this.userChanges[i].delta != anotherConnector.userChanges[i].delta){
                return false;
            }
        }

        if(this.id != anotherConnector.id
            || this.type != anotherConnector.type
            || this.solution != anotherConnector.solution
            || this.endStyle != anotherConnector.endStyle
            || this.activeConnectionPointId != anotherConnector.activeConnectionPointId ){
            return false;
        }

        return true;
    },
    getTurningPoints : function(){
        return this.turningPoints;
    },
    
    /**
     *Creates an arrow like component, pointed down \/, at a certain position
     * @param {Number} x - the X coordinates of the point
     * @param {Number} y - the X coordinates of the point
     * @return {Path} the arrow as a {Path} object
     * @author Zack
     **/
    getArrow:function(x,y){
        var startPoint = new Point(x,y);
        var line = new Line(startPoint.clone(),Util.getEndPoint(startPoint,Connector.ARROW_SIZE, Math.PI/180*Connector.ARROW_ANGLE));
        var line1 = new Line(startPoint.clone(),Util.getEndPoint(startPoint,Connector.ARROW_SIZE, Math.PI/180*-Connector.ARROW_ANGLE));
   
        var path = new Path();

        path.addPrimitive(line);
        path.addPrimitive(line1);
        
        return path;
    },

    /**Creates a triangle like component, pointed down \/, at a certain position
     * @param {Number} x - the X coordinates of the point
     * @param {Number} y - the X coordinates of the point
     * @param {Boolean} fill - if true fill the triangle
     * @return {Path} the arrow as a {Path} object
     * @author Zack, Alex
     * */
    getTriangle:function(x,y,fill){

        var startPoint = new Point(x,y);
        var point2 = Util.getEndPoint(startPoint,Connector.ARROW_SIZE, Math.PI/180*Connector.ARROW_ANGLE);
        var point3 = Util.getEndPoint(startPoint, Connector.ARROW_SIZE, - Math.PI/180*Connector.ARROW_ANGLE);
        
        var tri = new Polygon();
        tri.addPoint(startPoint);
        tri.addPoint(point2);
        tri.addPoint(point3);
        
        return tri;
    },


    
    /**Paints the connector
     *@param {CanvasRenderingContext2D} context - the 2D context of the canvas
     *@author Alex, Zack, Artyom
     **/
    paint:function(context){
        //Do the start and end point match?
        if (this.areStartEndPointsMatch()) {
            // then not paint Connector at all
            return;
        }

        context.save();
        
        //this.style.setupContext(context);
            context.lineWidth = 2;

            context.beginPath();

            //paint connector's line
            context.moveTo(this.turningPoints[0].x, this.turningPoints[0].y);
    
            for(var i=1; i< this.turningPoints.length; i++){
                    context.lineTo(this.turningPoints[i].x, this.turningPoints[i].y);
            }
            context.stroke();

        

        //this.paintStart(context);
        this.paintEnd(context);

        if(this.text.str != ''){
            this.paintText(context);
        }
        
        context.restore();
    },
    


 /*   paintStart : function(context){
        //paint start style
        var path = null;
        if(this.startStyle == Connector.STYLE_ARROW){
            path = this.getArrow(this.turningPoints[0].x, this.turningPoints[0].y);
        }

        if(this.startStyle == Connector.STYLE_FILLED_TRIANGLE){
            path = this.getTriangle(this.turningPoints[0].x, this.turningPoints[0].y, true);
        }


        //move start path(arrow, triangle, etc) into position
        if(path){
            var transX = this.turningPoints[0].x;
            var transY = this.turningPoints[0].y;

            var lineAngle = Util.getAngle(this.turningPoints[0], this.turningPoints[1], 0);
            path.transform(Matrix.translationMatrix(-transX, -transY));
            path.transform(Matrix.rotationMatrix(lineAngle));
            path.transform(Matrix.translationMatrix(transX,transY));

            context.save();

            //context.lineJoin = "miter";
            context.lineJoin = "round";
            context.lineCap = "round";
            path.paint(context);
            
            context.restore();
        }
    },*/
    
    paintEnd : function(context){
        //paint end style
        var path = null;
        if(this.endStyle == Connector.STYLE_ARROW){
            path = this.getArrow(this.turningPoints[this.turningPoints.length-1].x, this.turningPoints[this.turningPoints.length-1].y);
        }
        if(this.endStyle == Connector.STYLE_FILLED_TRIANGLE){
            path = this.getTriangle(this.turningPoints[this.turningPoints.length-1].x, this.turningPoints[this.turningPoints.length-1].y, true);
        }

        //move end path (arrow, triangle, etc) into position
        if(path){
            var transX = this.turningPoints[this.turningPoints.length-1].x;
            var transY = this.turningPoints[this.turningPoints.length-1].y;
            var lineAngle = Util.getAngle(this.turningPoints[this.turningPoints.length-1], this.turningPoints[this.turningPoints.length-2], 0);
            

            /*path.transform(Matrix.translationMatrix(-transX, -transY));
            path.transform(Matrix.rotationMatrix(lineAngle));
            path.transform(Matrix.translationMatrix(transX, transY));*/         
            
            path.transform(Matrix.generateTranslationMatrix(-transX, -transY));
            path.transform(Matrix.generateRotationMatrix(lineAngle));
            path.transform(Matrix.generateTranslationMatrix(transX, transY));

            context.save();

            context.lineJoin = "round";
            context.lineCap = "round";

            path.paint(context);

            context.restore();
        }
    },
    
    setText : function(str){
        this.text.setString(str);
    },
    
    isVertical : function(p1, p2){
        if (p1.x == p2.x && p1.y != p2.y) {
            return true;
        }
        return false;
    },
    
    paintText : function(context){
        if(this.text.str != ''){
            context.save();
            
            context.lineWidth = 2;
            var p1 = this.turningPoints[0];
            var p2 = this.turningPoints[1];
            var l = new Line(this.turningPoints[0],this.turningPoints[1]);
            
            context.beginPath();
            
            if (Util.distance(p1,p2) < 20 && this.turningPoints[2] != null){
                p1 = p2;
                p2 = this.turningPoints[2];
            }
            
//            if (l.contains(new Point(p1.x, p1.y - 20))) { //upward /
            if (p1.x == p2.x && p1.y > p2.y) { //upward /
                //console.log("Upward");
                context.moveTo(p1.x - 5, p1.y - 20);
                context.lineTo(p1.x + 5, p1.y - 20);
                this.text.updatePosition(p1.x + 20, p1.y - 20);
            }
//            else if(l.contains(new Point(p1.x, p1.y + 20))) { //downward \/
            else if (p1.x == p2.x && p1.y < p2.y) { //upward /
                //console.log("Downward");
                context.moveTo(p1.x - 5, p1.y + 20);
                context.lineTo(p1.x + 5, p1.y + 20);
                this.text.updatePosition(p1.x - 20, p1.y + 20);
            }
//            else if(l.contains(new Point(p1.x - 20, p1.y))) { // to leftt >
            else if (p1.x > p2.x && p1.y == p2.y) { //upward /
                //console.log("Left through");
                context.moveTo(p1.x - 20, p1.y - 5);
                context.lineTo(p1.x - 20, p1.y + 5);
                this.text.updatePosition(p1.x + 20, p1.y - 20);
            }
            //else if(l.contains(new Point(p1.x + 20, p1.y))) { // to right <
            else if (p1.x < p2.x && p1.y == p2.y) { //upward /
                //console.log("Right through");
                context.moveTo(p1.x + 20, p1.y - 5);
                context.lineTo(p1.x + 20, p1.y + 5);
                this.text.updatePosition(p1.x + 20, p1.y - 20);
            }
            else{
                console.log("THIS SHOULDN'T HAPPEN");
            }
            
            context.closePath();
            context.stroke();
            
            context.restore();
            
            context.save();
            this.text.paint(context);
            context.restore();
        }
    },    
    
    /**
     *Apply a transformation to this Connector
     *@param {Matrix} matrix - a matrix of numbers
     **/
    transform : function(matrix){

        //are we moving the whole Connector, or just one point?
        if(this.activeConnectionPointId != -1){
            var point = CONNECTOR_MANAGER.connectionPointGetById(this.activeConnectionPointId);
            point.transform(matrix);
        } else {
            for(var i=0; i<this.turningPoints.length; i++){
                this.turningPoints[i].transform(matrix);
            }
        this.text.transform(matrix);
        //this.startText.transform(matrix);
        //this.endText.transform(matrix);
        }

    },

    /**
     *Creates as jagged(zig-zag) line between 2 ConnectionPoints
     *@author Zack Newsham <zack_newsham@yahoo.co.uk>
     *@deprecated
     **/
    jagged:function(){
        this.jaggedReloaded();
        return;

    },


    /**A rework of jagged method
     *Just creates all turning points for Connector that has a StartPoint and an EndPoint
     *@author Alex Gheorghiu <alex@scriptoid.com>
     **/
    jaggedReloaded:function(){
        
        //reference to the start and end
        var startPoint = this.turningPoints[0];
        var startExitPoint = null; //next turning point after the startPoint (if start component present)
        var endExitPoint = null; //the last turning point before endPoint (if end component present)
        var endPoint = this.turningPoints[this.turningPoints.length-1];
        
        

        //START COMPONENT
        var startConnectionPointOnConnector = CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[0]; //fist ConnectionPoint on the Connector
        var glue  = CONNECTOR_MANAGER.glueGetByConnectionPointId(startConnectionPointOnConnector.id)[0];//the (only) Glue tied to ConnectionPoint

        if(glue != null){ //only if there is a Component glued
            //get ConnectionPoint on Component
            var startComponentConnectionPoint = CONNECTOR_MANAGER.connectionPointGet(glue.id1 == startConnectionPointOnConnector.id ? glue.id2 : glue.id1);
            var startComponent = Stack.getComponentById(startComponentConnectionPoint.parentId);

            var startAngle = Util.getAngle(startComponent.rotationCoords[0], startPoint, Math.PI/2);
            switch(startAngle){
                case 0: //north exit
                    startExitPoint = new Point(startPoint.x, startComponent.getBounds()[1]-20);
                    break;
                case Math.PI/2: //east exit
                    startExitPoint = new Point(startComponent.getBounds()[2]+20, startPoint.y);
                    break;
                case Math.PI: //south exit
                    startExitPoint = new Point(startPoint.x, startComponent.getBounds()[3]+20);
                    break;
                case 3 * Math.PI/2: //west exit
                    startExitPoint = new Point(startComponent.getBounds()[0]-20, startPoint.y);
                    break;                                            
            }
        }


        //END COMPONENT
        var endConnectionPointOnConnector = CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[1]; //last ConnectionPoint on Connector
        glue  = CONNECTOR_MANAGER.glueGetByConnectionPointId(endConnectionPointOnConnector.id)[0];//there will only be one for this
        
        if(glue != null){ //only if there is a Component glued
            //get ConnectionPoint on Component
            var endComponentConnectionPoint = CONNECTOR_MANAGER.connectionPointGet(glue.id1 == endConnectionPointOnConnector.id ? glue.id2 : glue.id1);
            var endComponent = Stack.getComponentById(endComponentConnectionPoint.parentId);

            var endAngle = Util.getAngle(endComponent.rotationCoords[0], endPoint, Math.PI/2);
            switch(startAngle){
                case 0: //north exit
                    endExitPoint = new Point(endPoint.x, endComponent.getBounds()[1]-20);
                    break;
                case Math.PI/2: //east exit
                    endExitPoint = new Point(endComponent.getBounds()[2]+20, endPoint.y);
                    break;
                case Math.PI: //south exit
                    endExitPoint = new Point(endPoint.x, endComponent.getBounds()[3]+20);
                    break;
                case 3 * Math.PI/2: //west exit
                    endExitPoint = new Point(endComponent.getBounds()[0]-20, endPoint.y);
                    break;
            }
        }

        alert('jaggedReloaded:Connector has ' + this.turningPoints.length + " points");
        this.turningPoints.splice(1,0, startExitPoint, endExitPoint);
        alert('jaggedReloaded:Connector has ' + this.turningPoints.length + " points");
    },

    /**This function simply tries to create all possible intermediate points that can be placed
     *between 2 points to create a jagged connector
     *@param {Point} p1 - a point
     *@param {Point} p2 - the other point*/
    connect2Points:function(p1, p2){
        var solutions = [];

        //1. is p1 == p2?
        if(p1.equals(p2)){
            
        }
        
        //2. is p1 on a vertical or horizontal line with p2? S0
        //3. can we have a single intermediate point? S1
        //4. can we have 2 intermediate points? S2
        return solutions;
    },

    /**
     *Remove redundant points (we have just ajusted one of the handles of this component, so)
     **/
    redraw:function(){
        if(this.type=='jagged'){
            var changed=true;
            while(changed==true){
                changed=false;
                for(var i=1; i<this.turningPoints.length-2; i++){
                    if(this.turningPoints[i].x == this.turningPoints[i-1].x && this.turningPoints[i-1].x == this.turningPoints[i+1].x){
                        this.turningPoints.splice(i,1);
                        changed=true;
                    }
                    if(this.turningPoints[i].y == this.turningPoints[i-1].y && this.turningPoints[i-1].y == this.turningPoints[i+1].y){
                        this.turningPoints.splice(i,1);
                        changed=true;
                    }
                }
            }
            
        }
    },

    /**
     * Transform a ConnectionPoint by a matrix. Usually called only by ConnectionManager.connectionPointTransform(),
     * when a component is being moved, so it's more or less start point or end point of a connector.
     * Important to remember is that by moving and edge turning point all ther might be cases when more than one
     * points need to change
     * Once a component is changed its ConnectionPoints got tranformed...so the glued Connector must
     * change...it's like a cascade change
     * @param {Matrix} matrix - the transformation to be used
     * @param {Point} point - the point to start from (could be end or start). It is the point that
     * triggered the adjustement
     */
    adjust:function(matrix, point){
        

            //Log.info("jagged ");
            var oldX = point.x;
            var oldY = point.y;
            
            var tempConPoint = CONNECTOR_MANAGER.connectionPointGetByParentAndCoordinates(this.id, point.x, point.y);
            tempConPoint.transform(matrix);
            
            //are we starting from beginning or end, so we will detect the interval and direction
            var start,end,direction;
            if(point.equals(this.turningPoints[0])){//if the point is the starting Point
                //Log.info("It is the starting point");
                
                //adjust first turning point
                this.turningPoints[0].x = tempConPoint.point.x;
                this.turningPoints[0].y = tempConPoint.point.y;
            
                start = 1;
                end = this.turningPoints.length;
                direction = 1;
            } else if(point.equals(this.turningPoints[this.turningPoints.length -1])) { //if the point is the ending Point
                //Log.info("It is the ending point");

                //adjust last turning point
                this.turningPoints[this.turningPoints.length -1].x = tempConPoint.point.x;
                this.turningPoints[this.turningPoints.length -1].y = tempConPoint.point.y;
                
                start = this.turningPoints.length - 2;
                end = -1;
                direction = -1;
            } else {
                Log.error("Connector:adjust() - this should never happen for point " + point + ' and connector ' + this.toString());
            }

            //TODO: the only affected turning point should be ONLY the next one (if start point) or previous one (if end point)
            for(var i=start; i!=end; i+=direction){
                //If this turningPoints X==last turningPoints X (or Y), prior to transformation, then they used to be the same, so make them the same now
                //dont do this if they are our start/end point
                //we don't want to use them if they are on he exact spot
                if(this.turningPoints[i].y != oldY
                    && this.turningPoints[i].x == oldX //same x
                    && this.turningPoints[i] != CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[0].point 
                    && this.turningPoints[i] != CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[1].point )
                    {
                    oldX = this.turningPoints[i].x;
                    oldY = this.turningPoints[i].y;
                    this.turningPoints[i].x = this.turningPoints[i-direction].x;
                } else if(this.turningPoints[i].x != oldX
                    && this.turningPoints[i].y == oldY 
                    && this.turningPoints[i] != CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[0].point 
                    && this.turningPoints[i] != CONNECTOR_MANAGER.connectionPointGetAllByParent(this.id)[1].point )
                    {
                    oldX = this.turningPoints[i].x;
                    oldY = this.turningPoints[i].y;
                    this.turningPoints[i].y = this.turningPoints[i-direction].y;
                }
            }
    },


    /**Applies solution from ConnectionManager.connector2Points() method.
     *@param {Array} solutions - value returned from ConnectionManager.connector2Points()
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     *@author Alex
     **/
    applySolution: function(solutions) {
        // solution category: 's0', 's1_1', 's2_2', etc.
        var solutionCategory = solutions[0][1];

        /*We should check if solution changed from previous.
        * Solution determined by it's category (s1_2, s2_1) and number of turning points.*/
        if (!this.solution //No solution?
                || this.solution != solutionCategory   // Did category changed?
                || this.turningPoints.length != solutions[0][2].length) {   // Did number of turning points changed?
            this.solution = solutionCategory;   // update solution
            this.clearUserChanges();  // clear user changes
            this.turningPoints = Point.cloneArray(solutions[0][2]);  // update turning points
        } else { //same solution (category and turning points no)
            this.turningPoints = Point.cloneArray(solutions[0][2]);    // get turning points from solution
            this.applyUserChanges();    // apply user changes to turning points
        }

    },


    /**Applies user changes to turning points.
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    applyUserChanges: function() {
        var changesLength = this.userChanges.length;
        var currentChange;
        var translationMatrix;

        // go through and apply all changes
        for (var i = 0; i < changesLength; i++) {
            currentChange = this.userChanges[i];

            // generate translation matrix
            if (currentChange.align == Connector.USER_CHANGE_HORIZONTAL_ALIGN) {    // Do we have horizontal change?
                translationMatrix = Matrix.translationMatrix(currentChange.delta, 0);   // apply horizontal delta
            } else if (currentChange.align == Connector.USER_CHANGE_VERTICAL_ALIGN) {       // Do we have vertical change?
                translationMatrix = Matrix.translationMatrix(0, currentChange.delta);   // apply vertical delta
            }
            // apply change
            this.turningPoints[currentChange.index].transform(translationMatrix);
        }
    },


    /**Adds user change.
     *@param {Object} userChange - user change to add. It's form is
     * {align : '', delta: '', index: ''} where 
     *  align:  Connector.USER_CHANGE_VERTICAL_ALIGN | Connector.USER_CHANGE_HORIZONTAL_ALIGN
     *  delta: Numeric
     *  index : the index of turning point     
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    addUserChange: function(userChange) {
        var changesLength = this.userChanges.length;
        var currentChange;
        
        /*First seach if we need to merge current change with existing one,
         * if no existing one present we will simply add it.*/

        // Go through all changes (Merge option)
        for (var i = 0; i < changesLength; i++) {
            currentChange = this.userChanges[i];

            // Do we have change with such align and index?
            if (currentChange.align == userChange.align && currentChange.index == userChange.index) {
                /* update delta of previous change
                 * we should accumulate delta value, not replace
                 * because current step here based on previous*/
                currentChange.delta += userChange.delta;
                return; // work is done - exit function
            }
        }

        // we have new change and add it to array (new change)
        this.userChanges.push(userChange);
    },


    /**Clears user changes.
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    clearUserChanges: function() {
        this.userChanges = [];
    },


    /**Clones array of user changes.
     *@return {Array} - array containing current user changes
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    cloneUserChanges: function() {
        var clonedArray = [];
        var changesLength = this.userChanges.length;

        // go through and clone all user changes
        for (var i = 0; i < changesLength; i++) {
            // create new instance of user changes
            // set values equal to current user change
            // push new instance in result array with cloned user changes
            clonedArray.push({
                align: this.userChanges[i].align,
                index: this.userChanges[i].index,
                delta: this.userChanges[i].delta
            });
        }

        return clonedArray;
    },


    /**Check if start and end members of turningPoints match/are the same.
     *@return {Boolean} - match or not
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    areStartEndPointsMatch: function() {
        return this.turningPoints[0].equals(this.turningPoints[this.turningPoints.length - 1]);
    },
    

    /**
     * See if a file is on a connector
     * @param {Number} x - coordinate
     * @param {Number} y - coordinate
     * @author alex
     */
    contains:function(x,y){
        var r = false;
                
        for(var i=0; i<this.turningPoints.length-1; i++){
            var l = new Line(this.turningPoints[i],this.turningPoints[i+1]);
            if( l.contains(x, y) ){
                r = true;
                break;
            }
        }

        return r;
    },

    /**Tests if a point defined by (x,y) is within a radius
     *@param {Number} x - x coordinates of the point
     *@param {Number} y - y coordinates of the point
     *@param {Number} radius - the radius to seach within
     *@author alex
     **/
    near:function(x,y,radius){
        var r = false;
            
        for(var i=0; i<this.turningPoints.length-1; i++){
            var l = new Line(this.turningPoints[i],this.turningPoints[i+1]);
            if( l.near(x, y, radius) ){
                r = true;
                break;
            }
        }
                
        return r;                
    },


    /**Returns the middle of a connector
     *Usefull for setting up the middle text
     *@return {Array} of 2 {Number}s - the x and y of the point
     *@author Alex Gheorghiu <alex@scriptoid.com>
     **/
    middle:function(){
        if(this.type == Connector.TYPE_STRAIGHT){
            var middleX = (this.turningPoints[0].x + this.turningPoints[1].x)/2;
            var middleY = (this.turningPoints[0].y + this.turningPoints[1].y) /2;
            return [middleX, middleY];
        } else if(this.type == Connector.TYPE_JAGGED){
            /** Algorithm:
             * Find the lenght of the connector. Then go on each segment until we will reach half of the
             * connector's lenght.
             **/

            //find total distance
            var distance = 0;
            for(var i=0; i<this.turningPoints.length-1; i++){
                distance += Util.getLength(this.turningPoints[i], this.turningPoints[i+1]);
            }

            //find between what turning points the half distance is
            var index = -1;
            var ellapsedDistance = 0;
            for(var i=0; i<this.turningPoints.length-1; i++){
                index = i;
                var segment = Util.getLength(this.turningPoints[i], this.turningPoints[i+1]);
                if(ellapsedDistance + segment < distance /2){
                    ellapsedDistance += segment;
                } else {
                    break;
                }
            }

            //we have the middle distance somewhere between i(ndex) and i(ndex)+1
            if(index != -1){
                var missingDistance = distance / 2 - ellapsedDistance;
                if( Util.round(this.turningPoints[index].x, 3) == Util.round(this.turningPoints[index + 1].x, 3) ){ //vertical segment (same x)
                    return [this.turningPoints[index].x, Math.min(this.turningPoints[index].y, this.turningPoints[index + 1].y) + missingDistance];
                } else if( Util.round(this.turningPoints[index].y, 3) == Util.round(this.turningPoints[index + 1].y, 3) ) { //horizontal segment (same y)
                    return [Math.min(this.turningPoints[index].x, this.turningPoints[index + 1].x) + missingDistance, this.turningPoints[index].y];
                } else{
                    Log.error("Connector:middle() - this should never happen " + this.turningPoints[index] + " " + this.turningPoints[index + 1]
                        + " nr of points " + this.turningPoints.length
                        );
                }

            }
        } else if(this.type === Connector.TYPE_ORGANIC){
            //TODO: Either compute the middle using pure NURB algorithm (and use t=0.5) or 
            //base it on the curves already computed (but they might no be evenly distributes
            //(or might not have the same length) to pick the middle of middle curve 
            //(if no. of curves is odd) or joining
            //point (if number of curves is even)
            var n = new NURBS(this.turningPoints);
            
            var middle = n.getMiddle();
            Log.info("Middle is " + middle);
            
            return [middle.x, middle.y];
        }

        return null;
    },


    /**Founds the bounds of the connector
     *@return {Array} - the [minX, minY, maxX, maxY]
     **/
    getBounds:function(){
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;
        for(var i=0; i<this.turningPoints.length; i++){
            if(this.turningPoints[i].x<minX || minX==null)
                minX = this.turningPoints[i].x;
            if(this.turningPoints[i].x>maxX || maxX==null)
                maxX = this.turningPoints[i].x;
            if(this.turningPoints[i].y<minY || minY==null)
                minY = this.turningPoints[i].y;
            if(this.turningPoints[i].y>maxY || maxY==null)
                maxY = this.turningPoints[i].y;
        }
        return [minX, minY, maxX, maxY];
    }
    

}

/**
 *A connection point that is attached to a component and can accept connectors
 *
 *@constructor
 *@this {ConnectionPoint}
 *@param {Number} parentId - the parent to which this ConnectionPoint is attached. It can be either a {Component} or a {Connector}
 *@param {Point} point - coordinate of this connection point, better than using x and y, because when we move "snap to" this
 * connectionPoint the line will follow
 *@param {Number} id - unique id to the parent component
 *@param {String} type - the type of the parent. It can be either 'component' or 'connector'
 *
 *@author Zack Newsham <zack_newsham@yahoo.co.uk>
 *@author Alex Gheorghiu <alex@scriptoid.com>
 */
function ConnectionPoint(parentId,point,id, type){
    /**Connection point id*/
    this.id = id;
    
    /**The {Point} that is behind this ConnectionPoint*/
    this.point = point.clone(); //we will create a clone so that no side effect will appear
    
    /**Parent id (id of the Component or Connector)*/
    this.parentId = parentId;
    
    /**Type of ConnectionPoint. Ex: ConnectionPoint.TYPE_COMPONENT*/
    this.type = type;
    
    /**Current connection point color*/
    this.color = ConnectionPoint.NORMAL_COLOR;
    
    /**Radius of the connection point*/
    this.radius = 3;


}

/**Color used by default to draw the connection point*/
ConnectionPoint.NORMAL_COLOR = "#5DFC0A"; // "#FFFF33"; //yellow.

/*Color used to signal that the 2 connection points are about to glue*/
ConnectionPoint.OVER_COLOR = "#5DFC0A"; //"#FF9900"; //orange

/*Color used to draw connected (glued) connection points*/
ConnectionPoint.CONNECTED_COLOR = "#5DFC0A"; //"#ff0000"; //red

/**Connection point default radius*/
ConnectionPoint.RADIUS = 4;

/**Connection point (liked to)/ type component*/
ConnectionPoint.TYPE_COMPONENT = 'component';

/**Connection point (liked to)/ type connector*/
ConnectionPoint.TYPE_CONNECTOR = 'connector';



/**Clones an array of {ConnectionPoint}s
 *@param {Array} v - the array of {ConnectionPoint}s
 *@return an {Array} of {ConnectionPoint}s
 **/
ConnectionPoint.cloneArray = function(v){
    var newConnectionPoints = [];
    for(var i=0; i< v.length; i++){
        newConnectionPoints.push(v[i].clone());
    }
    return newConnectionPoints;
}


ConnectionPoint.prototype = {
    constructor : ConnectionPoint,

    
    /**Clone current {ConnectionPoint}
     **/
    clone: function(){
        //parentId,point,id, type
        return new ConnectionPoint(this.parentId, this.point.clone(), this.id, this.type );
    },
    
    /**Compares to another ConnectionPoint
     *@param {ConnectionPoint} anotherConnectionPoint - the other connection point
     *@return {Boolean} - true if equals, false otherwise
     **/
    equals:function(anotherConnectionPoint){

        return this.id == anotherConnectionPoint.id
        && this.point.equals(anotherConnectionPoint.point)
        && this.parentId == anotherConnectionPoint.parentId
        && this.type == anotherConnectionPoint.type
        && this.color == anotherConnectionPoint.color
        && this.radius == anotherConnectionPoint.radius;    
    },

    /**
     *Paints the ConnectionPoint into a Context
     *@param {Context} context - the 2D context
     **/
    paint:function(context){
        context.save();
        context.fillStyle = this.color;
        context.strokeStyle = '#000000';
        context.shadowColor = "#5DFC0A";
        context.shadowBlur = 10;
        context.lineWidth = defaultThinLineWidth;
        context.beginPath();
        context.arc(this.point.x, this.point.y, ConnectionPoint.RADIUS, 0, (Math.PI/180)*360, false);
        context.stroke();
        context.fill();
        context.restore();
    },


    /**
     *Transform the ConnectionPoint through a Matrix
     *@param {Matrix} matrix - the transformation matrix
     **/
    transform:function(matrix){
        this.point.transform(matrix);
    },

    
    /**Highlight the connection point*/
    highlight:function(){
        this.color = ConnectionPoint.OVER_COLOR;
    },

    /**Un-highlight the connection point*/
    unhighlight:function(){
        this.color = ConnectionPoint.NORMAL_COLOR;
    },


    /**Tests to see if a point (x, y) is within a range of current ConnectionPoint
     *@param {Numeric} x - the x coordinate of tested point
     *@param {Numeric} y - the x coordinate of tested point
     *@return {Boolean} - true if inside, false otherwise
     *@author Alex Gheorghiu <alex@scriptoid.com>
     **/
    contains:function(x, y){
        return this.near(x, y, ConnectionPoint.RADIUS);
    },

    /**Tests to see if a point (x, y) is within a specified range of current ConnectionPoint
     *@param {Numeric} x - the x coordinate of tested point
     *@param {Numeric} y - the x coordinate of tested point
     *@param {Numeric} radius - the radius around this point
     *@return {Boolean} - true if inside, false otherwise
     *@author Alex Gheorghiu <alex@scriptoid.com>
     **/
    near:function(x, y, radius){
        return new Point(this.point.x,this.point.y).near(x,y,radius);
    }
    

}



/**A Glue just glues together 2 ConnectionPoints.
 *Glued ConnectionPoints usually belongs to a Connector and a Component.
 *
 *@constructor
 *@this {Glue}
 *@param {Number} cp1Id - the id of the first {ConnectionPoint} (usually from a {Component})
 *@param {Number} cp2Id - the id of the second {ConnectionPoint} (usualy from a {Connector})
 *@param {Boolean} automatic - type of connection connector to a component:
 * if true - {Connector} connects a {Component} itself
 * else - {Connector} connects specific {ConnectionPoint} of {Component}
 **/
function Glue(cp1Id,cp2Id,automatic){
    /**First shape's id (usually from a {Component})*/
    this.id1 = cp1Id;    
    
    /**Second shape's id (usualy from a {Connector})*/
    this.id2 = cp2Id;

    /*By default all the Glues are created with the first number as Component's id and second number as
     *Connector's id. In the future glues can be used to glue other types as well*/
    
    /**First id type (usually 'component')*/
    this.type1 = 'component';
    
    /**First id type (usually 'connector')*/
    this.type2 = 'connector';


    /**Type of connector's behaviour:
     * if it's true - connector connects the whole component and touches it's optimum connection point
     * if it's false - connector connects one fixed connection point of the component
     * */
    this.automatic = automatic;
}



/**Clones an array of points
 *@param {Array} v - the array of {Glue}s
 *@return an {Array} of {Glue}s
 **/
Glue.cloneArray = function(v){
    var newGlues = [];
    for(var i=0; i< v.length; i++){
        newGlues.push(v[i].clone());
    }
    return newGlues;
}

Glue.prototype = {
    
    constructor : Glue,
    
    
    /**Clone current {Glue}
     **/
    clone: function(){
        return new Glue(this.id1, this.id2, this.automatic);
    },
    
    /**Compares to another Glue
     *@param {Glue} anotherGlue -  - the other glue
     *@return {Boolean} - true if equals, false otherwise
     **/
    equals:function(anotherGlue){
        if(!anotherGlue instanceof Glue){
            return false;
        }

        return this.id1 == anotherGlue.id1
        && this.id2 == anotherGlue.id2
        && this.automatic == anotherGlue.automatic
        && this.type1 == anotherGlue.type1
        && this.type2 == anotherGlue.type2;
    }

}
