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

var TextDefaults = {
    
    style : "normal",
    
    fillStyle : "#000000",

    size : 20,

    font : "Georgia",
    
    align : "left"
};


/**A simple text class to render text on a HTML 5 canvas
 * Right now all the texts are horizontaly and verticaly centered so the (x,y) is the center of the text
 * 
 * @this {Text}
 * @constructor
 * @param {String} string - the text to display
 * @param {Number} x - the x pos
 * @param {Number} y - the y pos
 * @param {String} font - the font we are using for this text
 * @param {Number} optSize - optional size value for the font
 * @param {Color} optColor - optional color value for the font
 * 

 * @see list of web safe fonts : <a href="http://www.ampsoft.net/webdesign-l/WindowsMacFonts.html">http://www.ampsoft.net/webdesign-l/WindowsMacFonts.html</a> Arial, Verdana
 * </p>
 * @see /documents/specs/text.png
 * 
 * @author Alex Gheroghiu <alex@scriptoid.com>
 * @author Augustin <cdaugustin@yahoo.com>
 * @author Artyom Pokatilov <artyom.pokatilov@gmail.com>
 * <p/>
 * Note:<br/>
 * Canvas's metrics do not report updated width for rotated (context) text ...so we need to compute it
 * <p/>
 **/

function Text(str, x, y, optSize, optColor) {
    /**Text used to display*/
    this.str = str;
    
     /**Font used to draw text*/
    this.position = new Point(x, y);
    
     /**Size of the text*/
    this.size = (typeof optSize === 'undefined') ? TextDefaults.size : optSize;
    
     /**Color of the text*/
    this.fillStyle = (typeof optColor === 'undefined') ? TextDefaults.fillStyle : optColor;
    
     /**Height of the text*/
    this.height = this.size;
    
    /**Width of the text*/
    this.width = this.getWidth();
    //this.vector = [new Point(x,y),new Point(x,y-20)];
    //c.text = new Text("R", "normal", "Monospace", '#000000', size/5, 'center', x, y);
    
}


/**space between 2 caracters*/
Text.SPACE_BETWEEN_CHARACTERS = 2;


Text.prototype = {
    pippo : 0,
    
    constructor: Text,
    
    transform : function(matrix){
        this.position.transform(matrix);
    },
    
    updatePosition : function(x,y){
        this.position = new Point(x,y);        
    },
       
    paint: function(context){
        context.save();
        var lines = this.str.split("\n");
        
        //var lineSpacing = 1 / 4 * this.size;
        var x = this.position.x - this.getWidth()/8;
        var y = this.position.y;
        
        
        context.fillStyle = this.fillStyle;
        context.font = TextDefaults.style + " " + this.size + "px " + TextDefaults.font;
        context.textAlign = TextDefaults.align;
        //context.textBaseline = "middle";
        
        for(var i=0; i<lines.length; i++){
            context.fillText(lines[i], x, y);
//            context.fillText(lines[i], this.position.x, y);
            y += this.size;

        }
        context.restore();
    },
    
    paint2 : function(context){
        context.save();
        context.fillStyle = this.fillStyle;
        context.font = TextDefaults.style + " " + this.size + "px " + TextDefaults.font;
        context.textAlign = TextDefaults.align;
        //context.textBaseline = "middle";
        context.fillText(this.str, this.position.x, this.position.y);
        context.restore();
    },
    
    getTopLeft : function(){
        var width = this.getWidth();
        return new Point(this.position.x - width/2, this.position.y - this.size / 2);
        
    },
    
    getHeight : function(){
        var lines = this.str.split("\n");
        return lines.length;
    },
    
    setHeight : function(h){
        this.height = h;
    },
    
    getWidth2 : function(str){
        var canvas = document.getElementById('a');
        var context = canvas.getContext('2d');
        var lines = this.str.split("\n");
        //console.log("lines.len: " + lines.length);
        var metrics = context.measureText(lines[0]);
        var maxWidth = metrics.width;
        //console.log("maxwidth of first line: " + maxWidth);
        for(var i=1; i<lines.length; i++){
            metrics = context.measureText(lines[i]);
            var width = metrics.width;
            if (width > maxWidth) {
                maxWidth = width;
            }
        }
        //console.log("maxwidth of all: " + maxWidth);
        return maxWidth;
    },
    
    getWidth : function(){
        var canvas = document.getElementById('a');
        var context = canvas.getContext('2d');
        var metrics = context.measureText(this);
        return metrics.width;
    },
    
    getString : function(){
        return this.str;
    },
    
    setString : function(str){
        this.str = str;
        var x = this.position.x - this.size/2; 
        this.updatePosition(x, this.position.y);
    },
    
    getPosition : function(){
        return this.position;
    },
    
    injectInputArea : function(DOMObject, component) {
        if(component.Name == "Text"){
            this.generateSingleTextCode(DOMObject, component);
        }
        else{
            this.generateTextCode(DOMObject, component);
        }
    },

    generateTextCode : function(DOMObject, component){
        
        var div = document.createElement("div");
        div.className = "textLine";
        //div.innerHTML = "M[?]"
        
        var p1 = document.createElement("p");
        p1.className = "textLine";
        div.appendChild(p1);
        
    if (component instanceof Connector){
        p1.innerHTML = "#";
    } else {// instance of Component
        switch (component.Name) {
            case "Memoria":
                p1.innerHTML = "M[";
                break;
            case "Registro":
                p1.innerHTML = "R";
                break;
            case "Commutatore":
                p1.innerHTML = "K";
                break;
            case "Selettore":
                p1.innerHTML = "S";
                break;
            case "ALU":
                p1.innerHTML = "ALU";
                break;
            case "Box":
                //niente
                break;
            case "RDY_R":
            case "RDY_L":
                p1.innerHTML = "RDY";
                break;
            case "ACK_R":
            case "ACK_L":
                p1.innerHTML = "ACK";
                break;            
            case "Alfa":
                p1.innerHTML = "α";
                break;
            case "Beta":
                p1.innerHTML = "β";
                break;
            case "Text":
                //da vedere
                break;
                
        }
    }
        
        //var text = document.createElement("textarea");
        var text = document.createElement("input");
        text.className = "text"; //required for onkeydown
        text.type = "text";
        //text.rows = 1;
        //text.cols = 1;
        //text.spellcheck = false;
        //text.style.width = "20px";
        text.size = "2";
        text.maxlength = "4";
        div.appendChild(text);
        
        var str = null;
        
        if (component instanceof Component && component.Name == "Memoria") {
            var p2 = document.createElement("p");
            p2.className = "textLine";
            p2.innerHTML = "]";
            div.appendChild(p2);
        }
         
        
        /*var valid = true;
        //there should be a control to get only numbers
        text.onchange = function(text){
            return function(){
                        if (text.value != parseInt(text.value, 10)){
                            alert("should be integer");
                            valid = false;
                        }
                        else valid = true;
            };
        }(text);*/

        //onblur sarebbe meglio?
        text.onblur = function(component, text){
            return function(){
                if (component instanceof Connector) {
                    str = text.value;
                    //console.log("CONNECTOR STR: " + str);
                } else {
                    switch (component.Name) {
                        case "Memoria":
                            str = "M[" + text.value + "]";
                            break;
                        case "Registro":
                            str = "R" + text.value.toLowerCase();
                            break;
                        case "Commutatore":
                            str = "K" + text.value.toLowerCase();
                            break;
                        case "Selettore":
                            str = "S" + text.value.toLowerCase();
                            break;
                        case "ALU":
                            str = "ALU" + text.value.toLowerCase();
                            break;
                        case "Box":
                            str = text.value.toLowerCase();
                            break;
                        case "RDY_R":
                        case "RDY_L":
                           str = "RDY" + text.value.toLowerCase();
                            break;
                        case "ACK_R":
                        case "ACK_L":
                           str = "ACK" + text.value.toLowerCase();
                            break;
                        case "Alfa":
                           str  = "α" + text.value.toLowerCase();
                            break;
                        case "Beta":
                           str  = "β" + text.value.toLowerCase();
                            break;
                    }
                }
                //if (text.value.localeCompare(currentValue) != 0) {
                //currentValue = text.value;
                updateComponent(component, str);
                //console.log("text value:" + text.value);
                //}                
            };
        }(component, text);
        
        //text.onmouseout = text.onchange;
        //text.onkeyup = text.blur;
        
        DOMObject.appendChild(div);
    },
    
    
    /**Generate the code to edit the text.
     *The text got updated when you leave the input area
     *
     *@param {HTMLElement} DOMObject - the div of the properties panel
     *@param {Number} figureId - the id of the figure we are using
     **/
    generateSingleTextCode:function(DOMObject, component){
        var div = document.createElement("div");
        div.className = "textLine";

        var text = document.createElement("textarea");
        //var text = document.createElement("input");
        //text.type = "text";
        text.className = "text"; //required for onkeydown
        //text.value = "Text";
        //text.rows = 1;
        //text.cols = 1;
        //text.spellcheck = false;
        //text.style.width = "20px";
        //text.size = "2";
        //text.maxlength = "4";
        div.appendChild(text);
        
        var str = null;

        text.onblur = function(component, text){
            return function(){
                if (text.value !== "") {
                str = text.value;
                updateComponent(component, str);
                }
            };
        }(component, text);

        //text.onmouseout = text.onchange;
        //text.onkeyup = text.onchange;
        DOMObject.appendChild(div);
    },
}


function TextEditorPopup(editor, component){
    this.editor = editor;
    this.component = component;
}


/**Default top&bottom padding of Text editor's textarea*/
var defaultEditorPadding = 6;

/**Default border width of Text editor's textarea*/
var defaultEditorBorderWidth = 1;


TextEditorPopup.prototype = {
  
  constructor : TextEditorPopup,
  
  init : function(){
    var textElement;
    if (this.component instanceof Connector) {
        //alert("connector case");
        this.component.text.injectInputArea(this.editor, this.component);
        
    }
    else if (this.component instanceof Component) {
        //this.component.text.injectInputArea(this.editor, this.component);
        this.component.primitives[this.component.primitives.length -1].injectInputArea(this.editor, this.component);
    }
    
    //console.log("string: " + textPrimitive.getString());
    if (this.component instanceof Component && this.component.Name == "Text") {
        textElement = this.editor.getElementsByTagName('textarea')[0];
    }
    else{
        textElement = this.editor.getElementsByTagName('input')[0];        
    }
    
    // remove all <br> tags from text-editor as they were added by injectInputArea method 
    removeNodeList(this.editor.getElementsByTagName('br'));
    
    //this.setProperty(curProperty, curValue);
  
    this.editor.className = 'active';
    this.placeAndAutoSize();
    
    setSelectionRange(textElement, 0, textElement.value.length);
  },
  
  /*getValue : function(id){
    var component = Stack.getComponentById(id);
    
  },*/

  destroy : function (){
     this.editor.className = '';
     this.editor.style.cssText = '';
     this.editor.innerHTML = '';

  },
  
  mouseClickedInside : function (e) {
       var target = e.target;

       // check if user fired mouse down on the part of editor, it's tools or active color picker
       // actually active color picker in that moment can be only for Text edit
       var inside = target.id === this.editor.id
           || target.parentNode.id === this.editor.id
           || target.parentNode.parentNode.id === this.editor.id
   
       return inside;
    },
    
    placeAndAutoSize : function(){
        /*var text = this.component.primitives[this.component.primitives.length -1 ];
        var textPoint = text.getPosition();
        console.log(textPoint.x + "," + textPoint.y);*/
        
        var offset = 20;
        var textarea = this.editor.getElementsByTagName('input')[0];
    
        if (this.component instanceof Connector) {
            var textPoint = this.component.turningPoints[0];
            this.editor.style.left = textPoint.x - offset + "px";
            this.editor.style.top = textPoint.y - offset + "px";
        } else {
            
            var textPoint = this.component.primitives[this.component.primitives.length-1].getTopLeft();
            
            //console.log("top left: " + textPoint.x + "," + textPoint.y);
            
            //var textareaWidth = 30;
            //var textareaHeight = 10;
            //textarea.style.size = textareaWidth + "px";
            //textarea.style.height = textareaHeight + "px";
            if (this.component.Name == "Memoria") {
                this.editor.style.left = textPoint.x + "px";
                this.editor.style.top = textPoint.y - offset + "px";
            } else if (this.component.Name == "ALU") {
                this.editor.style.left = textPoint.x + "px";
                this.editor.style.top = textPoint.y - offset + "px";
            } else if (this.component.Name == "Box") {
                this.editor.style.left = textPoint.x + "px";
                this.editor.style.top = textPoint.y - offset + "px";
            } else {
                this.editor.style.left = textPoint.x + 12 + "px";
                this.editor.style.top = textPoint.y - offset + "px";
            }
        }
    },
    
     /**
     *Places and sets size to the property panel
     *@author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    placeAndAutoSize2 : function () {
        //get text area
        //get text bounds
        //calculate leftCoord, topCoord, width, height
        //browser specific configuration
        //modify editor.style.top,left,etc
        var offset = 20;
        var textarea = this.editor.getElementsByTagName('textarea')[0];
        
        //ci servono; leftCoord, topCord, textAreaWidth, textAreaHeight;
        
        var textPoint = this.component.primitives[this.component.primitives.length -1 ].getTopLeft();

        // set edit dialog position to top left (first) bound point of Text primitive
        //the height of the text in pixels is equal to the font size in pts

        

        // change coordinates of editing Text primitive to include padding and border of Text Editor
        var leftCoord = textBounds[0] - defaultEditorBorderWidth - defaultEditorPadding;
        var topCoord = textBounds[1] - defaultEditorBorderWidth - defaultEditorPadding;
        
        var textareaWidth = textBounds[2] - textBounds[0];
        var textareaHeight = textBounds[3] - textBounds[1];

        // Firefox includes border & padding as part of width and height,
        // so width and height should additionally include border and padding twice
        // (similar to "feather" option in Fireworks)
        if (Browser.mozilla) {
            textareaHeight += (defaultEditorPadding) * 2;
            topCoord -= (defaultEditorPadding);
            textareaWidth += (defaultEditorPadding) * 2;
            leftCoord -= (defaultEditorPadding);
        }

        // some of IE magic:
        // enough to add half of font-size to textarea's width to prevent auto-breaking to next line
        // which is wrong in our case
        // (similar to "feather" option in Fireworks)
        if (Browser.msie) {
            var fontSize = parseInt(textarea.style['font-size'], 10);
            textareaWidth += fontSize / 2;
            leftCoord -= fontSize / 4;
        }

        this.editor.style.left = leftCoord + "px";
        this.editor.style.top = topCoord + "px";


        // visibility: 'hidden' allows us to get proper size but 
        // without getting strange visual artefacts (tiggered by settings positions & other)
        this.tools.style.visibility = 'hidden';
        
        // We set it to the left upper corner to get it's objective size
        this.tools.style.left = '0px';
        this.tools.style.top = '0px';

        // Get toolbox height and width. Notice that clientHeight differs from offsetHeight.
        //@see https://developer.mozilla.org/en/docs/DOM/element.offsetHeight
        //@see http://stackoverflow.com/questions/4106538/difference-between-offsetheight-and-clientheight
        var toolboxHeight = this.tools.offsetHeight;
        var toolboxWidth = this.tools.offsetWidth;

        // define toolbox left position
        var toolboxLeft = leftCoord;
        
        // get width of work area (#container <div> from editor)
        var workAreaWidth = getWorkAreaContainer().offsetWidth;

        // If it's not enough place for toolbox at the page right side
        if (toolboxLeft + toolboxWidth >= workAreaWidth - scrollBarWidth) {
            // then shift toolbox to left before it can be placed
            toolboxLeft = workAreaWidth - toolboxWidth - scrollBarWidth;
        }

        // define toolbox top position
        var toolboxTop = topCoord - toolboxHeight;
        // If it's not enough place for toolbox at the page top
        if (toolboxTop <= 0) {
            // then place toolbox below textarea
            toolboxTop = topCoord + toolboxHeight + defaultEditorBorderWidth + defaultEditorPadding;
        }

        this.tools.style.left = toolboxLeft + "px";
        this.tools.style.top = toolboxTop + "px";
        
        // return normal visibility to toolbox
        this.tools.style.visibility = 'visible';

        textarea.style.width = textareaWidth + "px";
        textarea.style.height = textareaHeight + "px";
    },  //end of placeAndAutosize 
  
    /**
     * Manually triggers onblur event of textarea inside TextEditor.
     * @author Artyom Pokatilov <artyom.pokatilov@gmail.com>
     **/
    blurTextArea : function () {
        var textElement;
        
        if (this.component instanceof Component && this.component.Name == "Text") {
            textElement = this.editor.getElementsByTagName('textarea')[0];
        }
        else{
            textElement = this.editor.getElementsByTagName('input')[0];
        }
        
        textElement.onblur();
    }
};


function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
}


function removeNodeList(list) {
    var i;
    var length = list.length;

    for (i = 0; i < length; i++) {
        removeElement(list[i]);
    }
}


function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        //console.log("selectionrange")
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
}
