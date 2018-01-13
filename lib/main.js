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

/**This is the main JavaScript module.
 *We move it here so it will not clutter the index.php with a lot of JavaScript
 *
 *ALL VARIABLES DEFINED HERE WILL BE VISIBLE IN ALL OTHER MODULES AND INSIDE INDEX.PHP
 *SO TAKE CARE!
**/


/**the default application state*/
var STATE_NONE = 'none';

/**we have component to be created**/
var STATE_CREATE_COMPONENT = 'component_create';

/**we selected a component */
var STATE_COMPONENT_SELECTED = 'component_selected';

/**we selected a group */
var STATE_GROUP_SELECTED = 'group_selected';

/**we are dragging the mouse over a group of components.*/
var STATE_SELECTING_MULTIPLE = "selecting_multiple";

/**we selected a component's/groups's handle */
var STATE_HANDLE_SELECTED = 'handle_selected';
/**we are editing a text object */
var STATE_TEXT_EDITING = "text_editing";

/**we are selecting the start of a connector*/
var STATE_CONNECTOR_PICK_FIRST = 'connector_pick_first';

/**we are selecting the end of a connector*/
var STATE_CONNECTOR_PICK_SECOND = 'connector_pick_second'; 

/**we selected a connector (for further editing for example)*/

var STATE_CONNECTOR_SELECTED = 'connector_selected';

/**move a connection point of a connector*/
var STATE_CONNECTOR_MOVE_POINT = 'connector_move_point';

/**we have box to be created */
var STATE_CREATE_BOX = "create_box";

/**we are resizing a box */
var STATE_RESIZE_BOX = "resize_box";


var state;
var componentToCreate;
var mouseIsDown = false;
var lastMove = null;
//var selectedComponentId = -1;
//Stack.components;

//var Stack = new Stack();

var GROUP = new Group();

/**Current selecte connector (-1 if none selected)*/
var selectedConnectorId = -1;

/**Currently selected ConnectionPoint (-1 if none is selected)*/
var selectedConnectionPointId = -1;

/**the distance by which the connectors will escape Component's bounds*/
var COMPONENT_ESCAPE_DISTANCE = 30; 

/**the distance by which the connectors will be able to connect with Component*/
var COMPONENT_CLOUD_DISTANCE = 4;

/**An currentCloud - {Array} of 2 {ConnectionPoint} ids.
 * Cloud highlights 2 {ConnectionPoint}s whose are able to connect. */
var currentCloud = [];

var CONNECTOR_MANAGER = new ConnectorManager();
/**Current connector. It is null if no connector selected
 * @deprecated
 * TODO: we should base ONLY on selectedConnectorId
 **/
var connector = null;

/**Connector type
 * TODO: this should not be present here but retrieved from Connector object
 **/
var connectorType = '';

/**Default line width*/
var defaultLineWidth = 2;

/**Default handle line width*/
var defaultThinLineWidth = 1;
var currentTextEditor = null;


/**The (current) selection area*/
var selectionArea = new Polygon(); 
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));


/*
 *Remember: mouse click → document-relative coordinates →
 *canvas-relative coordinates → application-specific code. 
*/
function getCanvasCoords(e) {
  var rect = this.getBoundingClientRect();
  return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
  };
}



HTMLCanvasElement.prototype.getCanvasCoords = getCanvasCoords;




function resetAll(){
  //TODO: empty stack, empty group, cancel all!
  var sure = confirm("Are you sure to remove all?");
  if(sure){
    GROUP.reset();
    CONNECTOR_MANAGER.reset();
    Stack.reset();
    reset(getCanvas());
  }
}

function printPDF() {
  //TODO: unselect components before saving
  var canvas = getCanvas();
  var imgData = canvas.toDataURL();
  var pdf = new jsPDF('p', 'pt', [1055,560]);
  
  pdf.addImage(imgData, 'PNG', 0, 0);
  pdf.save("poproject.pdf");
}




function createComponent(component, coord) {
    var context = getContext();
    var x = coord.x;
    var y = coord.y;
    var c;
    switch(component){
        case "Memoria":
            c = component_Memoria(x, y);
            break;
        case "Registro":
            c = component_Registro(x, y);
            break;
        case "Commutatore":
            c = component_Commutatore(x, y);
            break;
        case "Selettore":
            c = component_Selettore(x, y);
            break;
        case "ALU":
            c = component_ALU(x, y);
            break;
        case "Box":
          c = component_Box(x,y);
          break;  
        case "RDY_R":
            c = component_RDYR(x, y);
            break;
        case "RDY_L":
            c = component_RDYL(x, y);
            break;
        case "ACK_R":
            c = component_ACKR(x, y);
            break;
        case "ACK_L":
            c = component_ACKL(x, y);
            break;          
        case "Alfa":
            c = component_Alfa(x, y);
            break;
        case "Beta":
            c = component_Beta(x, y);
            break;
        case "Text":
            c = component_Text(x, y);
            break;

    }

    Stack.addComponent(c);
    Stack.selectedComponentId = c.id;
    Stack.selectedComponent = c;
}


function getCanvas(){
    var canvas = document.getElementById("a");
    return canvas;
}


function getContext() {
    var canvas = document.getElementById("a");
    if(canvas.getContext){
        return canvas.getContext("2d");
    }
    else{
        alert('Your browser doesn\'t support HTML5');
    }
}


function reset(canvas){
	var context = canvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);   
}



function draw() {
    var context = getContext();
    reset(getCanvas());
    Stack.paint(context);
}



function onDoubleClick(e) {
  /* if clicked to a connector:
   *    get connector, get text element,
   *    create pop up window for text editing.
   * if clicked to a text of a component:
   *    (a component can have only one text)
   *    get the component, get the text element,
   *    create pop up window for text editing.*/
  
    var coord = this.getCanvasCoords(e);  
    var x = coord[0];
    var y = coord[1];
    
    var connector;
    var id = CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y);
    
    if (id != -1) { //double clicked on a connector
      selectedConnectorId = id;
      connector = CONNECTOR_MANAGER.connectorGetById(id);
      Stack.selectedComponentId = -1
      Stack.selectedComponent = null;
      state = STATE_TEXT_EDITING;
      draw();
      setUpTextEditorPopup(connector);
    } else {
      id = Stack.getComponentByCoord(coord.x, coord.y);
      if (id != -1) {
          var component = Stack.getComponentById(id);
          Stack.selectedComponentId = -1;
          Stack.selectedComponent = null;
          state = STATE_TEXT_EDITING;
          draw();
          setUpTextEditorPopup(component);
      }     
    }
    
    //redraw
    //draw();
}

function updateComponent(component, value) {
  if (component.Name == "Text") {
    var text = component.getTextPrim();
  
    component.setText(value);
    draw();
    
    var textNew = component.getTextPrim();
    var newWidth = text.getWidth2(text.getString());
    var newHeight = text.getHeight();   
    var pos = text.getPosition();
    
    component.updatePrimitive(0, new Point(pos.x - 10, pos.y - 24));
    component.updatePrimitive(1, new Point(pos.x - 10, pos.y + 24*(newHeight-1) ));
    component.updatePrimitive(2, new Point(pos.x + newWidth*2.5, pos.y + 24*(newHeight-1)));
    component.updatePrimitive(3, new Point(pos.x + newWidth*2.5, pos.y - 24));
 
    draw();
    
  } else {
    component.setText(value);
    draw();
  }
  
}


function setUpTextEditorPopup(element) {
    var tagTextEditor = document.getElementById('text-editor'); //a <div> inside editor page
    //tagTextEditor.style.display = "block";
    currentTextEditor = new TextEditorPopup(tagTextEditor, element);
    currentTextEditor.init();
    
}


/**Pick the first connector we can get at (x,y) position
 *@param {Number} x - the x position 
 *@param {Number} y - the y position 
 *@param {Event} ev - the event triggered
 *@author Alex, Artyom
 **/
function connectorPickFirst(x, y, ev){
    //console.log("connectorPickFirst");
    //create connector
    var conId = CONNECTOR_MANAGER.connectorCreate(new Point(x, y),new Point(x+10,y+10) /*fake cp*/, connectorType);
    //console.log("CREATED CONNECTOR conId " + conId);
    selectedConnectorId = conId;
    var con = CONNECTOR_MANAGER.connectorGetById(conId);
    //console.log("SELECTED CONNECTOR " + con.id + "," + con.turningPoints[0].x + "," + con.turningPoints[0].y + con.type );
    
    //TRY TO GLUE IT
    //1.get CP of the connector
    var conCps = CONNECTOR_MANAGER.connectionPointGetAllByParent(conId);
    

    //get Component's id if over it
    var cOverId = Stack.getComponentByCoord(x,y);
    
    //get the ConnectionPoint's id if we are over it (and belonging to a component)
    var cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXY(x, y, ConnectionPoint.TYPE_COMPONENT);

    //see if we can snap to a component
    if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
        var cCp = CONNECTOR_MANAGER.connectionPointGetById(cCpOverId);
        CONNECTOR_MANAGER.overComponentId = cOverId;

        //update connector' cp
        conCps[0].point.x = cCp.point.x;
        conCps[0].point.y = cCp.point.y;

        //update connector's turning point
        con.turningPoints[0].x = cCp.point.x;
        con.turningPoints[0].y = cCp.point.y;

        var g = CONNECTOR_MANAGER.glueCreate(cCp.id, conCps[0].id, false);
        //console.log("First glue created : " + g);
        //alert('First glue ' + g);
    }
    else if (cOverId !== -1) { //Are we, at least, over the {Component}?
        
        CONNECTOR_MANAGER.overComponentId = cOverId;
        /*As we are over a {Component} but not over a {ConnectionPoint} we will switch
         * to automatic connection*/
        var point = new Point(x,y);
        /*var candidate = CONNECTOR_MANAGER.getClosestPointsOfConnection(
            true,    // automatic start
            true,    // automatic end 
            cOverId, //start component's id
            point,   //start point 
            cOverId, //end component's id
            point    //end point
        );
        //console.log("connectorPickFirst, candidates.len: " + candidate.length);

        var connectionPoint = candidate[0];
        */
        
        var closestPointInfo = CONNECTOR_MANAGER.getClosestPointToConnector(cOverId, point);
        var connectionPoint = closestPointInfo[0];
        
        //update connector' cp
        conCps[0].point.x = conCps[1].point.x = connectionPoint.x;
        conCps[0].point.y = conCps[1].point.y = connectionPoint.y;

        //update connector's turning point
        con.turningPoints[0].x = con.turningPoints[1].x = connectionPoint.x;
        con.turningPoints[0].y = con.turningPoints[1].y = connectionPoint.y;

        var g = CONNECTOR_MANAGER.glueCreate(closestPointInfo[1], conCps[0].id, true);
        //console.log("First glue created : " + g);
    }
    else{
        CONNECTOR_MANAGER.overComponentId = -1;
    }
    state = STATE_CONNECTOR_PICK_SECOND;
    //Log.groupEnd();
}



/**Pick the second {ConnectorPoint}  we can get at (x,y) position
 *@param {Number} x - the x position 
 *@param {Number} y - the y position 
 *@param {Event} ev - the event triggered
 **/
function connectorPickSecond(x, y, ev){
    //console.log("connectorPickSecond");
    
    //current connector
    //console.log("connectorPickSecond, selectedConnectorId:" + selectedConnectorId);
    var con = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId); //it should be the last one
    var cps = CONNECTOR_MANAGER.connectionPointGetAllByParent(con.id);

    //get the ConnectionPoint's id if we are over it (and belonging to a component)
    var cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXY(x, y, ConnectionPoint.TYPE_COMPONENT); //find component's CP
    //get Component's id if over it
    var cOverId = Stack.getComponentByCoord(x,y);

    //TODO: remove 
    //play with algorithm
    {
        //We will try to find the startComponent, endComponent, startPoint, endPoint, etc
        //start point
        var rStartPoint = con.turningPoints[0].clone();
        var rStartGlues = CONNECTOR_MANAGER.glueGetBySecondConnectionPointId(cps[0].id);
        var rStartComponent = Stack.componentGetAsFirstComponentForConnector(con.id);
        if(rStartComponent){
            //console.log(":) WE HAVE A START COMPONENT id = " + rStartComponent.id);
        }
        else{
            //console.log(":( WE DO NOT HAVE A START COMPONENT");
        }
        
        //end point
        var rEndPoint = new Point(x, y);
        var rEndComponent = null;
        
        
        if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
          CONNECTOR_MANAGER.overComponentId = cOverId;
            var r_componentConnectionPoint = CONNECTOR_MANAGER.connectionPointGetById(cCpOverId);
            //console.log("End Component's ConnectionPoint present id = " + cCpOverId);
            
            //As we found the connection point by a vicinity (so not exactly x,y match) we will adjust the end point too
            rEndPoint = r_componentConnectionPoint.point.clone();
            
            rEndComponent = Stack.getComponentById(r_componentConnectionPoint.parentId);
            //console.log(":) WE HAVE AN END COMPONENT id = " + rEndComponent.id);
        } else if (cOverId != -1) {  //Are we, at least, over a Component?
          CONNECTOR_MANAGER.overComponentId = cOverId;
            //console.log("End Component connected as automatic");
            var point =  new Point(x,y);
            var closestPointInfo = CONNECTOR_MANAGER.getClosestPointToConnector(cOverId, rEndPoint);
            rEndPoint = closestPointInfo[0];

            rEndComponent = Stack.getComponentById(cOverId);
            //console.log(":) WE HAVE AN END COMPONENT id = " + rEndComponent.id);
        } else{
          CONNECTOR_MANAGER.overComponentId = -1;
            //console.log(":( WE DO NOT HAVE AN END COMPONENT " );
        }
        
        
        //var closestPointInfo = CONNECTOR_MANAGER.getClosestPointToConnector(cCpOverId, rEndPoint);
        //var connectionPoint = closestPointInfo[0];
        //rEndPoint = closestPointInfo[0];
        
        var rStartBounds = rStartComponent ? rStartComponent.getBounds() : null;
        var rEndBounds = rEndComponent ? rEndComponent.getBounds() : null;


        // if start point has automatic glue => connection has automatic start
        var automaticStart = rStartGlues.length > 0 && rStartGlues[0].automatic;

        // if end point is over a {Component}'s {ConnectionPoint} => connection is not automatic
        // else if end point is over a {Component} -> connection has automatic end
        //      else -> connection has no automatic end
        var automaticEnd = cCpOverId != -1 ? false : cOverId != -1;

        /*var candidate = CONNECTOR_MANAGER.getClosestPointsOfConnection(
            automaticStart, //start automatic
            automaticEnd, //end automatic
            rStartComponent ? rStartComponent.id : -1, //start component's id
            rStartPoint, //start component's point
            rEndComponent ? rEndComponent.id : -1, //end component's id
            rEndPoint //end component's point
            );*/
        
        //console.log("c0: " + candidate[0].x + "," + candidate[0].y);
        //console.log("c1: " + candidate[1].x + "," + candidate[1].y);
        //console.log("rstartbound.len: " + rStartBounds.length);
        //console.log("rendbound.len: " + rEndBounds.length);
            //It was CONNECTOR_MANAGER.CONNECTOR_MANAGER.debugSolutions
        CONNECTOR_MANAGER.debugSolutions = CONNECTOR_MANAGER.connector2Points(
            con.type, 
            rStartPoint, /*Start point*/
            rEndPoint, /*End point*/
            rStartBounds, 
            rEndBounds
        );
        
        //console.log("debugSolutions.len: " + CONNECTOR_MANAGER.debugSolutions.length);

    }
    
    //end remove block

    //COLOR MANAGEMENT FOR {ConnectionPoint}
    //Find any {ConnectionPoint} from a component at (x,y). Change FCP (component connection points) color
    if (cCpOverId != -1 || cOverId != -1) { //Are we over a ConnectionPoint from a Component or over a Component?
        cps[1].color = ConnectionPoint.OVER_COLOR;
    } else {
        cps[1].color = ConnectionPoint.NORMAL_COLOR;
    }

    
    var firstConPoint = CONNECTOR_MANAGER.connectionPointGetFirstForConnector(selectedConnectorId);
    var secConPoint = CONNECTOR_MANAGER.connectionPointGetSecondForConnector(selectedConnectorId);
    //adjust connector
    //console.log("connectorPickSecond() -> Solution: " + CONNECTOR_MANAGER.debugSolutions[0][2]);
    
    //console.log("debug solutions[0][0] " + CONNECTOR_MANAGER.debugSolutions[0]);
    //console.log("debug solutions[0][1] " + CONNECTOR_MANAGER.debugSolutions[0][1]);
    //console.log("debug solutions[0][2] " + CONNECTOR_MANAGER.debugSolutions[0][2]);
    
    con.turningPoints = Point.cloneArray(CONNECTOR_MANAGER.debugSolutions[0][2]);
    //CONNECTOR_MANAGER.connectionPointGetFirstForConnector(selectedConnectorId).point = con.turningPoints[0].clone();
    firstConPoint.point = con.turningPoints[0].clone();
    secConPoint.point = con.turningPoints[con.turningPoints.length-1].clone();

    // MANAGE TEXT
    // update position of connector's text
    //con.updateMiddleText();

    // before defining of {ConnectionPoint}'s position we reset currentCloud
    currentCloud = [];
        
    //GLUES MANAGEMENT
    //remove all previous glues to {Connector}'s second {ConnectionPoint}
    CONNECTOR_MANAGER.glueRemoveAllBySecondId(secConPoint.id);

    //recreate new glues and currentCloud if available
    if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
        CONNECTOR_MANAGER.glueCreate(cCpOverId, CONNECTOR_MANAGER.connectionPointGetSecondForConnector(selectedConnectorId).id, false);
    } else if(cOverId != -1){ //Are we, at least, over a Component?
        CONNECTOR_MANAGER.glueCreate(closestPointInfo[1] /*end Component's ConnectionPoint Id*/, CONNECTOR_MANAGER.connectionPointGetSecondForConnector(selectedConnectorId).id, true);
    } else { //No ConnectionPoint, no Component (I'm lonely)
        cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXYRadius(x,y, COMPONENT_CLOUD_DISTANCE, ConnectionPoint.TYPE_COMPONENT, firstConPoint);
        if(cCpOverId !== -1){
            currentCloud = [cCpOverId, secConPoint.id];
        }
    }
    
}





/**
 *Alter the {Connector}  in real time
 *@param {Number} connectionPointId - the id of the current dragged {ConnectionPoint} 
 *@param {Number} x - the x position 
 *@param {Number} y - the y position 
 *@param {Event} ev - the event triggered
 **/
function connectorMovePoint(connectionPointId, x, y, ev){

    //current connector
    var con = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId);
    var cps = CONNECTOR_MANAGER.connectionPointGetAllByParent(con.id);

    //get the ConnectionPoint's id if we are over it (and belonging to a component)
    var cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXY(x,y, ConnectionPoint.TYPE_COMPONENT);

    //get Component's id if over it
    var cOverId = Stack.getComponentByCoord(x,y);

    // MANAGE TEXT
    // update position of connector's text
    //con.updateMiddleText();
    
    //MANAGE COLOR
    //update cursor if over a component's cp
    if(cCpOverId != -1 || cOverId != -1){ //Are we over a ConnectionPoint from a Component or over a Component?
        //canvas.style.cursor = 'default';
        if(cps[0].id == selectedConnectionPointId){
            cps[0].color = ConnectionPoint.OVER_COLOR;
        }
        else{
            cps[1].color = ConnectionPoint.OVER_COLOR;
        }
    }
    else{
        //canvas.style.cursor = 'move';
        if(cps[0].id == selectedConnectionPointId){
            cps[0].color = ConnectionPoint.NORMAL_COLOR;
        }
        else{
            cps[1].color = ConnectionPoint.NORMAL_COLOR;
        }
        draw();
    }

    /*Variables used in finding solution. As we only know the ConnectionPoint's id
     * (connectionPointId) and the location of event (x,y) we need to find
     * who is the start Component, end Component, starting Glue, ending Glue, etc*/
    var rStartPoint = con.turningPoints[0].clone();
    var rStartComponent = null; //starting component (it can be null - as no Component)
    var rEndPoint = con.turningPoints[con.turningPoints.length-1].clone();
    var rEndComponent = null; //ending component (it can be null - as no Component)
    var rStartGlues = CONNECTOR_MANAGER.glueGetBySecondConnectionPointId(cps[0].id);
    var rEndGlues = CONNECTOR_MANAGER.glueGetBySecondConnectionPointId(cps[1].id);

    // before solution we reset currentCloud
    currentCloud = [];
    
    if(cps[0].id == connectionPointId){ //FIRST POINT
        if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
            var r_componentConnectionPoint = CONNECTOR_MANAGER.connectionPointGetById(cCpOverId);
                
            //start point and component
            rStartPoint = r_componentConnectionPoint.point.clone();                
            rStartComponent = Stack.getComponentById(r_componentConnectionPoint.parentId);
        }     
        else if (cOverId != -1) { //Are we, at least, over a Component?
            //start point and component
            var point = new Point(x, y);
            var closestPointInfo = CONNECTOR_MANAGER.getClosestPointToConnector(cOverId, point);
            rStartPoint = closestPointInfo[0];
            //rStartPoint = new Point(x, y);
            rStartComponent = Stack.getComponentById(cOverId);
            
        } else {
            rStartPoint = new Point(x, y);
        }
         
        //end component
        rEndComponent = Stack.componentGetAsSecondComponentForConnector(con.id);


        var rStartBounds = rStartComponent ? rStartComponent.getBounds() : null;
        var rEndBounds = rEndComponent ? rEndComponent.getBounds() : null;

        /** define connection type **/
        // if end point has automatic glue -> connection has automatic end
        var automaticEnd = rEndGlues.length && rEndGlues[0].automatic;

        // if start point is over component's connection point -> connection has no automatic start
        // else if start point is over component -> connection has automatic start
        //      else -> connection has no automatic start
        var automaticStart = cCpOverId != -1 ? false : cOverId != -1;

        /*var candidate = CONNECTOR_MANAGER.getClosestPointsOfConnection(
            automaticStart, //start automatic
            automaticEnd, //end automatic
            rStartComponent ? rStartComponent.id : -1, //start component's id
            rStartPoint, //start component's point
            rEndComponent ? rEndComponent.id : -1, //end component's id
            rEndPoint //end component's point
        );*/        

        //solutions
        CONNECTOR_MANAGER.debugSolutions = CONNECTOR_MANAGER.connector2Points(
                                              con.type, rStartPoint, rEndPoint, rStartBounds, rEndBounds);


        //UPDATE CONNECTOR 
        var firstConPoint = CONNECTOR_MANAGER.connectionPointGetFirstForConnector(selectedConnectorId);
        var secondConPoint = CONNECTOR_MANAGER.connectionPointGetSecondForConnector(selectedConnectorId);
        //adjust connector
        //Log.info("connectorMovePoint() -> Solution: " + CONNECTOR_MANAGER.debugSolutions[0][2]);

        con.turningPoints = Point.cloneArray(CONNECTOR_MANAGER.debugSolutions[0][2]);
        
        firstConPoint.point = con.turningPoints[0].clone();
        secondConPoint.point = con.turningPoints[con.turningPoints.length - 1].clone();


        //GLUES MANAGEMENT
        //remove all previous glues to {Connector}'s second {ConnectionPoint}
        CONNECTOR_MANAGER.glueRemoveAllBySecondId(firstConPoint.id);

        //recreate new glues and currentCloud if available
        if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
            CONNECTOR_MANAGER.glueCreate(cCpOverId, firstConPoint.id, false);
        } else if(cOverId != -1){ //Are we, at least, over a Component?
            CONNECTOR_MANAGER.glueCreate(closestPointInfo[1], firstConPoint.id, true);
        } else {
            cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXYRadius(x,y, COMPONENT_CLOUD_DISTANCE, ConnectionPoint.TYPE_COMPONENT, secondConPoint);
            if(cCpOverId !== -1){
                currentCloud = [cCpOverId, firstConPoint.id];
            }
        }
    }     
    else if (cps[1].id == connectionPointId){ //SECOND POINT
        if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
            var r_componentConnectionPoint = CONNECTOR_MANAGER.connectionPointGetById(cCpOverId);
                
            //end point and component
            rEndPoint = r_componentConnectionPoint.point.clone();                
            rEndComponent = Stack.getComponentById(r_componentConnectionPoint.parentId);
        }
        else if (cOverId != -1) { //Are we, at least, over a Component?
            //end point and component
            var point = new Point(x, y);
            var closestPointInfo = CONNECTOR_MANAGER.getClosestPointToConnector(cOverId, point);
            rEndPoint = closestPointInfo[0];
            //rEndPoint = new Point(x, y);
            rEndComponent = Stack.getComponentById(cOverId);
        } else {
            rEndPoint = new Point(x, y);
        }
         
        //start component
        rStartComponent = Stack.componentGetAsFirstComponentForConnector(con.id);


        var rStartBounds = rStartComponent ? rStartComponent.getBounds() : null;
        var rEndBounds = rEndComponent ? rEndComponent.getBounds() : null;


        /** define connection type **/
        // if start point has automatic glue -> connection has automatic start
        var automaticStart = rStartGlues.length && rStartGlues[0].automatic;

        // if end point is over component's connection point -> connection has no automatic end
        // else if end point is over component -> connection has automatic end
        //      else -> connection has no automatic end
        var automaticEnd = cCpOverId != -1 ? false : cOverId != -1;

        /*var candidate = CONNECTOR_MANAGER.getClosestPointsOfConnection(
            automaticStart, //start automatic
            automaticEnd, //end automatic
            rStartComponent ? rStartComponent.id : -1, //start component's id
            rStartPoint, //start component's point
            rEndComponent ? rEndComponent.id : -1, //end component's id
            rEndPoint //end component point
        );*/

        //solutions
        CONNECTOR_MANAGER.debugSolutions = CONNECTOR_MANAGER.connector2Points(
                                              con.type, rStartPoint, rEndPoint, rStartBounds, rEndBounds);


        //UPDATE CONNECTOR
        var firstConPoint = CONNECTOR_MANAGER.connectionPointGetFirstForConnector(selectedConnectorId);
        var secondConPoint = CONNECTOR_MANAGER.connectionPointGetSecondForConnector(selectedConnectorId);
        
        //adjust connector
        //Log.info("connectorMovePoint() -> Solution: " + CONNECTOR_MANAGER.debugSolutions[0][2]);

        con.turningPoints = Point.cloneArray(CONNECTOR_MANAGER.debugSolutions[0][2]);
        firstConPoint.point = con.turningPoints[0].clone();
        secondConPoint.point = con.turningPoints[con.turningPoints.length - 1].clone();


        //GLUES MANAGEMENT
        //remove all previous glues to {Connector}'s second {ConnectionPoint}
        CONNECTOR_MANAGER.glueRemoveAllBySecondId(secondConPoint.id);

        //recreate new glues and currentCloud if available
        if(cCpOverId != -1){ //Are we over a ConnectionPoint from a Component?
            CONNECTOR_MANAGER.glueCreate(cCpOverId, secondConPoint.id, false);
        } else if(cOverId != -1){ //Are we, at least, over a Component?
            CONNECTOR_MANAGER.glueCreate(closestPointInfo[1], secondConPoint.id, true);
        } else {
            cCpOverId = CONNECTOR_MANAGER.connectionPointGetByXYRadius(x,y, COMPONENT_CLOUD_DISTANCE, ConnectionPoint.TYPE_COMPONENT, firstConPoint);
            if(cCpOverId !== -1){
                currentCloud = [cCpOverId, secondConPoint.id];
            }
        }
    } else{
        throw "main:connectorMovePoint() - this should never happen";
    }   
    
    
}




function onMouseDown(e) {
    var coord = this.getCanvasCoords(e);
    //canvas = getCanvas();
    mouseIsDown = true;
    /*
     *if click on a component
     *  select component
     *  draw handles
     *if clicked an empty space on canvas
     *  do nothing
     */
   switch (state) {
        case STATE_TEXT_EDITING:
            if (currentTextEditor.mouseClickedInside(e)) {
                break;
            } else {
                // IE and Firefox doesn't trigger blur event when mouse clicked canvas
                // that is why we trigger this event manually
                //if (Browser.msie || Browser.mozilla) {
                    currentTextEditor.blurTextArea();
                //}
 
                currentTextEditor.destroy();
                currentTextEditor = null;

                state = STATE_NONE;
            }
            //no break because we want to run STATE_NONE case next   
        case STATE_NONE:
            var id = CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y);
            if (id != -1) { //clicked on a connector
                selectedConnectorId = id;
                state = STATE_CONNECTOR_SELECTED;
                draw();
            } else {
              id = Stack.getComponentByCoord(coord.x, coord.y);
              if (id > -1) { //clicked on a component
                 Stack.selectedComponentId = id;
                 Stack.selectedComponent = Stack.getComponentById(id);
                 state = STATE_COMPONENT_SELECTED;
                 draw();
              }
            }
            break;    
        case STATE_CREATE_COMPONENT:
            if (currentTextEditor != null) {
                currentTextEditor.blurTextArea();
                currentTextEditor.destroy();
                currentTextEditor = null;
            }
            //Stack.selectedComponentId = -1;
            //Stack.selectedComponent = null;            
            createComponent(componentToCreate, coord);
            state = STATE_COMPONENT_SELECTED;
            
            //getCanvas().style.cursor = 'pointer';
            draw();
            break;
        case STATE_GROUP_SELECTED:
          //console.log("in: onmousedown: state_group_selected");
          /* if  clicked on a handler of the group:
           *     select the current handler
           * else if clicked on a connector or component that belongs to group:
           *     stay in the state
           * else if clicked on a connector or component that doesnt belong to group:
           *     choose it
           *     and change to state connector/component selected
           * else if clicked on empty space:
           *     destroy group and move to none state
           */
          if (HandleManager.getHandle(coord.x,coord.y) != null) {
            HandleManager.selectHandleAt(coord.x,coord.y);
            draw();
          } else {//not clicked on a handler
            var id = CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y);
            //if clicked on a connector that doesnt belong to group
            if (id != -1 ){
              if(!GROUP.belongsTo(id, "connector")) {
                GROUP.reset();
                selectedConnectorId = id;
                state = STATE_CONNECTOR_SELECTED;
                //console.log("out: onmousedown: state_connector_selected");
                draw();
              } else {
                //console.log("connector belongs to group");
              }
            } else {//if clicked on a component
              id = Stack.getComponentByCoord(coord.x, coord.y);
              //nsole.log("comp over id: " + id);
              if (id != -1){
                //clicked on a component that doesn't belong to group(?)
                if(!GROUP.belongsTo(id, "component")) {
                   //console.log("component doesn't belong to group");
                   GROUP.reset();
                   Stack.selectedComponentId = id;
                   Stack.selectedComponent = Stack.getComponentById(id);
                   state = STATE_COMPONENT_SELECTED;
                   //console.log("out: onmousedown: state_component_selected");
                   draw();
                } else {
                  //console.log("component belongs to group");
                }
              } else if (id == -1) { //clicked on empty canvas
                GROUP.reset();
                state = STATE_NONE;
                //console.log("out: onmousedown: state_none");
                draw();
              }
            }          
          }
          break;
          
        case STATE_COMPONENT_SELECTED:
            if (HandleManager.getHandle(coord.x, coord.y) != null) { //clicked a handle
                //getCanvas().style.cursor = h.getCursor();
                HandleManager.selectHandleAt(coord.x, coord.y);
                state = STATE_HANDLE_SELECTED;
                //console.log("handle!");
                //draw();
                //HandleManager.selectHandleAt(x, y);
            }
            /*else if (test) {
             var id = CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y);
             if (id != -1) {
                selectedConnectorId = selectedObject.id;
                selectedComponentId = -1;
                var con = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId);
                HandleManager.setComponent(con);
                draw();
                
             }
            }*/
            else {
                var id = Stack.getComponentByCoord(coord.x, coord.y);
                if (id == -1) { //clicked on empty canvas
                    state = STATE_NONE;
                    Stack.selectedComponentId = -1;
                    Stack.selectedComponent = null;
                    draw();
                    //add stuff for drawing selecting rectangle for grouping
                    //if it's necessary !!!
                }
                //clicked on another component
                else if (id != Stack.selectedComponentId) {
                    Stack.selectedComponentId = id;
                    Stack.selectedComponent = Stack.getComponentById(id);
                    draw();
                }
                /*else {
                  state = STATE_COMPONENT_SELECTED;                  
                }*/
            }
          break;          
        case STATE_CONNECTOR_PICK_FIRST:
          //moved so it can be called from undo action
          //console.log("onMouseDown: state_connector_pick_first");
          connectorPickFirst(coord.x,coord.y,e);
          break;          
        case STATE_CONNECTOR_PICK_SECOND:
          //MOUSE_DOWN
          //console.log("onMouseDown: state_connector_pick_second");
          state  = STATE_NONE;
          break;
        case STATE_CONNECTOR_SELECTED:
            //MOUSE_DOWN
            //console.log("onMouseDown: state_connector_selected");
            var cps = CONNECTOR_MANAGER.connectionPointGetAllByParent(selectedConnectorId);
            var start = cps[0];
            var end = cps[1];
            var componentConnectionPointId;

            //did we click any of the connection points?
            if(start.point.near(coord.x, coord.y, 3)){
                //console.log("Picked the start point");
                selectedConnectionPointId = start.id;
                state = STATE_CONNECTOR_MOVE_POINT;
                getCanvas().style.cursor = 'default';

                // check if current cloud for connection point
                componentConnectionPointId = CONNECTOR_MANAGER.connectionPointGetByXYRadius(
                                                coord.x, coord.y, COMPONENT_CLOUD_DISTANCE, ConnectionPoint.TYPE_COMPONENT, end);
                if (componentConnectionPointId !== -1) {
                    currentCloud = [selectedConnectionPointId, componentConnectionPointId];
                }
            } else if(end.point.near(coord.x, coord.y, 3)){
                //console.log("Picked the end point");
                selectedConnectionPointId = end.id;
                state = STATE_CONNECTOR_MOVE_POINT;
                getCanvas().style.cursor = 'default';
                

                // check if current cloud for connection point
                componentConnectionPointId = CONNECTOR_MANAGER.connectionPointGetByXYRadius(
                                                coord.x, coord.y, COMPONENT_CLOUD_DISTANCE, ConnectionPoint.TYPE_COMPONENT, start);
                if (componentConnectionPointId !== -1) {
                    currentCloud = [selectedConnectionPointId, componentConnectionPointId];
                }
            } else { //no connection point selected
                
                //see if handler selected
                if(HandleManager.getHandle(coord.x,coord.y) != null){
                    //console.log("onMouseDown() + STATE_CONNECTOR_SELECTED - handle selected");
                    HandleManager.selectHandleAt(coord.x, coord.y);

                } else {
                    var id = CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y);
                    if (id != -1 && selectedConnectorId != id) { //clicked on a different connector
                        selectedConnectorId = id;
                        draw();
                    } else {
                        id = Stack.getComponentByCoord(coord.x, coord.y);
                        if (id != -1) { //clicked on a component
                           selectedConnectorId = -1;
                           Stack.selectedComponentId = id;
                           Stack.selectedComponent = Stack.getComponentById(id);
                           state = STATE_COMPONENT_SELECTED;
                           draw();
                        } else { //clicked on empty canvas
                            selectedConnectorId = -1;
                            state = STATE_NONE;
                            draw();
                        }
                    }            
                }                                                    
            }                      
          break;          
    }
    //draw();
}


function onMouseUp(e) {
    mouseIsDown = true;
    switch (state) {
        case STATE_NONE:
            getCanvas().style.cursor = 'default';
            draw();
            break;
        case STATE_CREATE_COMPONENT:
            getCanvas().style.cursor = 'pointer'; 
            componentToCreate = "";
            break;
        case STATE_HANDLE_SELECTED:
            state = STATE_COMPONENT_SELECTED;
            getCanvas().style.cursor = 'pointer';
            break;
        case STATE_GROUP_SELECTED:
          //console.log("in mouseup: state_group_selected");
          HandleManager.selectedHandleId = -1;
          draw();
          break;
        case STATE_SELECTING_MULTIPLE:
          //console.log("in mouseup: state_selecting_multiple");
          state = STATE_NONE;
          
         /***************************BEGIN ADDING COMPONENTS***********************************/
          var componentsToAdd = [];
          
          for(var i = 0; i < Stack.components.length; i++){
              var points = Stack.components[i].getPoints();
              if(points.length == 0){ //if no  point at least to add bounds TODO: lame 'catch all' condition
                  points.push( new Point(Stack.components[i].getBounds()[0], Stack.components[i].getBounds()[1]) ); //top left
                  points.push( new Point(Stack.components[i].getBounds()[2], Stack.components[i].getBounds()[3]) ); //bottom right
                  points.push( new Point(Stack.components[i].getBounds()[0], Stack.components[i].getBounds()[3]) ); //bottom left
                  points.push( new Point(Stack.components[i].getBounds()[2], Stack.components[i].getBounds()[1]) ); //top right
              }

              // flag shows if figure added to figuresToAdd array
              var componentAddFlag = false;
              
              
              /**Idea: We want to select both figures completely encompassed by 
               * selection (case 1) and those that are intersected by selection (case 2)*/

              //1 - test if any figure point inside selection
              for(var a = 0; a < points.length; a++){
                  if( Util.isPointInside(points[a], selectionArea.getPoints()) ){
                      componentsToAdd.push(Stack.components[i].id);
                      // set flag not to add figure twice
                      componentAddFlag = true;
                      break;
                  }
              }
              
              //2 - test if any figure intersected by selection
              if(!componentAddFlag){ //run this ONLY if is not already proposed for addition
                  componentAddFlag = Util.polylineIntersectsRectangle(points, selectionArea.getBounds(), true);
              
                  //select figures whose line intersects selectionArea
                  if (componentAddFlag){
                      componentsToAdd.push(Stack.components[i].id);
                  }
              }
          } //end for
          
         /***************************END ADDING COMPONENTS***********************************/
         
          
        /***************************BEGIN ADDING CONNECTORS***********************************/
          var connectorsToAdd = [];
          
          for(var i = 0; i < CONNECTOR_MANAGER.connectors.length; i++){
              var points = CONNECTOR_MANAGER.connectors[i].getTurningPoints();
              if(points.length == 0){
                //console.log("CONNECTOR POINTS LEN = 0");
              }
              /*if(points.length == 0){ //if no  point at least to add bounds TODO: lame 'catch all' condition
                  points.push( new Point(CONNECTOR_MANAGER.connectors[i].getBounds()[0], Stack.components[i].getBounds()[1]) ); //top left
                  points.push( new Point(CONNECTOR_MANAGER.connectors[i].getBounds()[2], Stack.components[i].getBounds()[3]) ); //bottom right
                  points.push( new Point(Stack.components[i].getBounds()[0], Stack.components[i].getBounds()[3]) ); //bottom left
                  points.push( new Point(Stack.components[i].getBounds()[2], Stack.components[i].getBounds()[1]) ); //top right
              }*/

              // flag shows if figure added to figuresToAdd array
              var connectorAddFlag = false;
              
              
              /**Idea: We want to select both figures completely encompassed by 
               * selection (case 1) and those that are intersected by selection (case 2)*/


              //1 - test if any figure point inside selection
              for(var a = 0; a < points.length; a++){
                  if( Util.isPointInside(points[a], selectionArea.getPoints()) ){
                    //console.log("CONNECTOR IS INSIDE!");
                      connectorsToAdd.push(CONNECTOR_MANAGER.connectors[i].id);
                      // set flag not to add figure twice
                      connectorAddFlag = true;
                      break;
                  }
              }
              
              //2 - test if any figure intersected by selection
              if(!connectorAddFlag){ //run this ONLY if is not already proposed for addition
                  connectorAddFlag = Util.polylineIntersectsRectangle(points, selectionArea.getBounds(), false);
              
                  //select figures whose line intersects selectionArea
                  if (connectorAddFlag){
                      //console.log("Connectors intersects... will be added");
                      connectorsToAdd.push(CONNECTOR_MANAGER.connectors[i].id);
                  }
              }
          } //end for
          
         /***************************END ADDING CONNECTORS***********************************/          
          
          selectionArea.points.length = 0;
          
          if ((componentsToAdd.length + connectorsToAdd.length) >= 2) { //create group
            GROUP.addComponents(componentsToAdd);
            GROUP.addConnectors(connectorsToAdd);
            state = STATE_GROUP_SELECTED;
            //console.log("out: onmouseup: state_group_selected");
          }
          else if (componentsToAdd.length == 1) { //not a group, simple selection component
            Stack.selectedComponentId = componentsToAdd[0];
            Stack.selectedComponent = Stack.getComponentById(componentsToAdd[0]);
            state = STATE_COMPONENT_SELECTED;
            //console.log("out: onmouseup: state_component_selected");
          }
          else if (connectorsToAdd.length == 1) { //not a group, simple selection connector
            selectedConnectorId = connectorsToAdd[0];
            state = STATE_CONNECTOR_SELECTED;
            //console.log("out: onmouseup: state_connecto r_selected");
          }          /*else{ //there is no group, cancel selectionArea
            selectionArea.points = [];
            GROUP.reset();
            draw();
            state = STATE_NONE;
            console.log("out: onmouseup: state_none");
            selectionArea.points[0] = new Point(0,0);
            selectionArea.points[1] = new Point(0,0);
            selectionArea.points[2] = new Point(0,0);
            selectionArea.points[3] = new Point(0,0);
            
          }*/
          //selectionArea.points = []; -> this creates a new array, doesn't reset the actual one!
          draw();
          break;     
        case STATE_COMPONENT_SELECTED:
            getCanvas().style.cursor = 'default';
            //draw();
            //if we were moving or resizing a component it will stop
            //remove selectedHandleIndex
            break;
        case STATE_CONNECTOR_PICK_SECOND:
            //console.log("onMouseUp: state_connector_pick_second");
            //reset all {ConnectionPoint}s' color
            CONNECTOR_MANAGER.overComponentId = -1;
            CONNECTOR_MANAGER.connectionPointsResetColor();

            //reset current connection cloud
            currentCloud = [];

            //select the current connector
            state = STATE_CONNECTOR_SELECTED;
            //console.log("onMouseUp: state_connector_selected");
            draw();
            break;
         case STATE_CONNECTOR_MOVE_POINT:
            //console.log("onMouseUp: state_connector_move_point");
            /**
             *Description:
             *Simply alter the connector until mouse will be released 
             **/
            
            //reset all {ConnectionPoint}s' color
            CONNECTOR_MANAGER.connectionPointsResetColor();

            //reset current connection cloud
            currentCloud = [];

            state = STATE_CONNECTOR_SELECTED; //back to selected connector
            selectedConnectionPointId = -1; //but deselect the connection point
            draw();
            break;
        case STATE_CONNECTOR_SELECTED:
            //console.log("onMouseUp: state_connector_selected");
            break;   
    }
    
  mouseIsDown = false;
  //draw();
}


function onMouseMove(e) {
    var coord = this.getCanvasCoords(e);
    //if (!mouseIsDown) {
        switch (state) {
            case STATE_NONE:
                var id = Stack.getComponentByCoord(coord.x, coord.y);
                if (id > -1) { //over a component
                     getCanvas().style.cursor = 'pointer';
                } else {
                     getCanvas().style.cursor = 'default';
                     if (mouseIsDown) {
                        //console.log("draw selecting rectangle for group selecting");
                        state = STATE_SELECTING_MULTIPLE;
                        selectionArea.points[0] = new Point(coord.x,coord.y);
                        selectionArea.points[1] = new Point(coord.x,coord.y);
                        selectionArea.points[2] = new Point(coord.x,coord.y);
                        selectionArea.points[3] = new Point(coord.x,coord.y);                        
                     }
                }
                break;
            case STATE_CREATE_COMPONENT:
                getCanvas().style.cursor = 'crosshair';
                //doNothing();
                break;  
            case STATE_SELECTING_MULTIPLE:
                selectionArea.points[1].x = coord.x; //top right
                selectionArea.points[2].x = coord.x; //bottom right
                selectionArea.points[2].y = coord.y;
                selectionArea.points[3].y = coord.y; //bottom left
                draw();
                break;
            case STATE_GROUP_SELECTED:
              /*if mouse is pressed:
               *  if over group's handler:
               *        execute handler action
               *  else if over a component that belongs to group:
               *        move the whole group
               *if mouse is not pressed:
               *        if over a figure/connector/group:
               *                change cursor type to "move" 
               *        if over nothing:
               *                "default"    
              */
              if (mouseIsDown) {
                if (lastMove != null) {
                  //if over handle, do handle action
                  //console.log("do handle action");
                  var handle = HandleManager.handleGetSelected();
                  if (handle != null) {
                    getCanvas().style.cursor = handle.getCursor();
                    handle.action(lastMove, coord.x, coord.y);
                    draw();
                  } else { //not over any so it must move the whole group
                      getCanvas().style.cursor = 'move';
                      var translateMatrix = Matrix.generateMoveMatrix(coord.x, coord.y);
                      GROUP.transform(translateMatrix);
                      draw();
                  }
                }
                
              } else { //mouse is not pressed
                
                if(HandleManager.getHandle(coord.x, coord.y) != null){
                     getCanvas().style.cursor = HandleManager.getHandle(coord.x, coord.y).getCursor();
                }
                else if(CONNECTOR_MANAGER.connectorGetByXY(coord.x, coord.y) != -1){
                    getCanvas().style.cursor = 'pointer';
                    //nothing for now
                }
                else if(Stack.isOverComponent(coord.x, coord.y)){
                    getCanvas().style.cursor = 'pointer';
                } else {
                    getCanvas().style.cursor = 'default';
                }                
              }
              break;
            case STATE_HANDLE_SELECTED:
                //it means it's already mouse down
                //var context = getContext();
                if (lastMove != null) {
                    var handle = HandleManager.handleGetSelected();
                    //var str = "before translate (" + Stack.selectedComponent.Handles[0].x + "," + Stack.selectedComponent.Handles[0].y + ")";
                    //console.log(str);
                    handle.action(lastMove, coord.x, coord.y);
                    draw();
                }
                break;
            case STATE_COMPONENT_SELECTED:
               getCanvas().style.cursor = 'pointer';
               var h = HandleManager.getHandle(coord.x, coord.y);
               //ATTENTION HERE!! NOT GETTING IN HANDLE ACTION STATE
               if (h != null) { //over a handle
                   getCanvas().style.cursor = h.getCursor();
                   if (mouseIsDown && lastMove != null) {
                      //handle.action(lastMove,coord.x,coord.y)
                      draw();
                   }
               } else {
                   //getCanvas().style.cursor = 'pointer';
                    var id = Stack.getComponentByCoord(coord.x,coord.y);
                    if (id == -1)  //over empty canvas
                      getCanvas().style.cursor = 'default';
                    else if (id == Stack.selectedComponentId) {
                      //over the selected component
                      if (mouseIsDown && lastMove != null) {
                       var translateMatrix = Matrix.generateMoveMatrix(coord.x, coord.y);
                       var c = Stack.getComponentById(id);
                       c.transform(translateMatrix);
                       draw();
                      } else {
                        getCanvas().style.cursor = 'pointer';
                      }
                    }
                  
              }
              break; 
          case STATE_CONNECTOR_PICK_FIRST:
            //change CCP (component connection points) color
            CONNECTOR_MANAGER.overComponentId = Stack.getComponentByCoord(coord.x, coord.y);
            var cCpId = CONNECTOR_MANAGER.connectionPointGetByXY(coord.x, coord.y, ConnectionPoint.TYPE_COMPONENT); //find component's CP

            if(cCpId != -1){ //we are over a component's CP
                var cCp = CONNECTOR_MANAGER.connectionPointGetById(cCpId);
                cCp.color = ConnectionPoint.OVER_COLOR;
                //canvas.style.cursor = 'crosshair';
                selectedConnectionPointId = cCpId;
            } else { //change back old connection point to normal color
                if(selectedConnectionPointId != -1){
                    var oldCp = CONNECTOR_MANAGER.connectionPointGetById(selectedConnectionPointId);
                    oldCp.color = ConnectionPoint.NORMAL_COLOR;
                    // canvas.style.cursor = 'normal';
                    selectedConnectionPointId = -1;
                }
            }
            //redraw = true;
            draw();
            break;
          case STATE_CONNECTOR_PICK_SECOND:
            connectorPickSecond(coord.x,coord.y,e);
            //redraw = true;
            draw();
            break;
          
          
        case STATE_CONNECTOR_SELECTED:
            /*Description:
             *In case you move the mouse and you have the connector selected:
             *  - if adjusting the endpoints
             *      - alter the shape of connector in real time (gluing and unglued it, etc)
             *      (EXTRA option: do as little changes as possible to existing shape
             *  - if adjusting the handlers
             *      - alter the shape of connector in real time
             **/
            
            //alert('Move but we have a connector');
            //change cursor to move if over a connector's CP
            //var connector = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId);
            var cps = CONNECTOR_MANAGER.connectionPointGetAllByParent(selectedConnectorId);
            var start = cps[0];
            var end = cps[1];
            if(start.point.near(coord.x, coord.y, 3) || end.point.near(coord.x, coord.y, 3)){
                getCanvas().style.cursor = 'move';
            }
            else if(HandleManager.getHandle(coord.x, coord.y) != null){ //over a handle?. Handles should appear only for selected components
                getCanvas().style.cursor = HandleManager.getHandle(coord.x, coord.y).getCursor();
            }
            else{
                getCanvas().style.cursor = 'default';
            }
            
            /*if we have a handle action*/
            if(mouseIsDown == true && lastMove != null && HandleManager.handleGetSelected() != null){
                //Log.info("onMouseMove() + STATE_CONNECTOR_SELECTED - trigger a handler action");
                var handle = HandleManager.handleGetSelected();
//                alert('Handle action');

                /*We need completely new copies of the turningPoints in order to restore them,
                 *this is simpler than keeping track of the handle used, the direction in which the handle edits
                 *and the turningPoints it edits*/

                //store old turning points
                var turns = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId).turningPoints;
                var oldTurns = [turns.length];
                for(var i = 0; i < turns.length; i++){
                    oldTurns[i] = turns[i].clone();
                }


                //DO the handle action
                handle.action(lastMove, coord.x, coord.y);

                //store new turning points
                turns = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId).turningPoints;
                var newTurns = [turns.length];
                for(var i = 0; i < turns.length; i++){
                    newTurns[i] = turns[i].clone();
                }


                //see if old turning points are the same as the new turning points
                var difference = false;
                for(var k=0;k<newTurns.length; k++){
                    if(! newTurns[k].equals(oldTurns[k])){
                        difference = true;
                    }
                }

//                //store the Command in History
//                if(difference && doUndo){
//                    currentMoveUndo = new ConnectorHandleCommand(selectedConnectorId, History.OBJECT_CONNECTOR, null, oldTurns, newTurns);
//                    History.addUndo(currentMoveUndo);
//                }

                draw();
            }
            break;          
         case STATE_CONNECTOR_MOVE_POINT:
          //MouseMove
            /**
             *Description: 
             *Adjust on real time - WYSIWYG
             *-compute the solution
             *-update connector shape
             *-update glues
             *TODO: add description*/
            //Log.info("Easy easy easy....it's fragile");
            if(mouseIsDown){ //only if we are dragging
                //console.log("onMouseMove(mouseIsDown): " + state);
                
                /*update connector - but not unglue/glue it (Unglue and glue is handle in onMouseUp)
                 *as we want the glue-unglue to produce only when mouse is released*/   
                connectorMovePoint(selectedConnectionPointId, coord.x, coord.y, e);

                draw();
            } else {
              //console.log("onMouseMove(mouse is not down): " + state);
            }
            break;         
        }     
    lastMove = [coord.x, coord.y];
    
}


/*function drawCanvas() {
    reset(getCanvas());
    getContext();
    Stack.paint(context);
}
*/

/*function reset(canvas){
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);   
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0,0,canvas.width,canvas.height);			
}
*/

function onKeyDown(e) {
    switch(e.keyCode){
        case 46: //KEY.DELETE
          switch (state) {
            case STATE_CONNECTOR_SELECTED:
              var c = CONNECTOR_MANAGER.connectorGetById(selectedConnectorId);
              CONNECTOR_MANAGER.connectorRemove(c);
              selectedConnectorId = -1;
              break;
            case STATE_COMPONENT_SELECTED:
              Stack.removeComponentById(Stack.selectedComponentId);
              Stack.selectedComponentId = -1;
              Stack.selectedComponent = null;
              break; 
          }
          state = STATE_NONE;
          draw();
          break;
    }
}



function init(){
   var canvas = getCanvas();
   canvas.width = canvas.width;
   canvas.height = canvas.height;
   var context = canvas.getContext('2d');
   canvas.addEventListener('dblclick', onDoubleClick, false);
   canvas.addEventListener('mousedown', onMouseDown, false);
   canvas.addEventListener('mousemove', onMouseMove, false);
   canvas.addEventListener('mouseup', onMouseUp, false);
   document.addEventListener('keydown', onKeyDown, false);
   state = STATE_NONE;
   componentToCreate = "";
   alert("Welcome to the PO Editor!");
}
