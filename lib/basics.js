"use strict";



var Components = [
        {Name: "Memoria", image: "memoria.png"},
        {Name: "Registro", image: "registro2.png"},
        {Name: "Commutatore", image: "commutatore2.png"},
        {Name: "Selettore", image: "selettore2.png"},
        {Name: "ALU", image: "alu.png"},
        {Name: "Box", image: "box.png"},
        {Name: "RDY_R", image: "rdy_r.png"},
        {Name: "RDY_L", image: "rdy_l.png"},
        {Name: "ACK_R", image: "ack_r.png"},
        {Name: "ACK_L", image: "ack_l.png"},        
        {Name: "Alfa", image: "alfa.png"},
        {Name: "Beta", image: "beta.png"},
        {Name: "Connettore", image: "connector.png"},
        {Name: "Text", image: "text2.png"}
];

    
var COMPONENT_SIZE = 120;


function component_Memoria(x,y) {    
    var c = new Component("Memoria", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 5;
    var px = x - size/2;
    var py = y - size/2;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px - offset, py + offset));
    r.addPoint(new Point(px - offset, py + size ));
    r.addPoint(new Point(px, py + size + offset));
    r.addPoint(new Point(px + size, py + size + offset));
    r.addPoint(new Point(px + size, py));
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size + offset));
    
    c.addPrimitive(r);
   
    var text = new Text("M[]", x - offset/2, y + offset);
    c.addPrimitive(text);

    c.generateConnectionPoints();
    
    c.finalise();
    return c;
    
}


function component_Registro(x,y) {    
    var c = new Component("Registro", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
  
    c.addPrimitive(r);
    
    var text = new Text("R", x, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();
        
    c.finalise();
    return c;
}


function component_Commutatore(x,y) {    
    var c = new Component("Commutatore", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
       
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
  
    c.addPrimitive(r);
    
    var text = new Text("K", x, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();   
    
    c.finalise();
    return c;
}


function component_Selettore(x,y) {

    var c = new Component("Selettore", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
  
    c.addPrimitive(r);
    
    var text = new Text("S", x, y - size/16);
    c.addPrimitive(text);    
    
    c.generateConnectionPoints();
    
    c.finalise();
    return c;
}


function component_ALU(x,y) {
    
    var c = new Component("ALU", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 6;
    var px = x - size/2;
    var py = y - size/2;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px + offset, py + size/2));
    r.addPoint(new Point(px + size - offset, py + size/2));
    r.addPoint(new Point(px + size, py));
    r.addPoint(new Point(px + size/2 + offset, py));
    r.addPoint(new Point(px + size/2, py + offset));
    r.addPoint(new Point(px + size/2 - offset, py));
  
    c.addPrimitive(r);
    
    var text = new Text("ALU", x - offset/2, y - size/15);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();   
 
    c.finalise();
    return c;
   
}


function component_Box(x, y) {
    var c = new Component("Box", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var px = x - size/2;
    var py = y - size/2;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size));
    r.addPoint(new Point(px + size, py + size));
    r.addPoint(new Point(px + size, py));
    
    c.addPrimitive(r);
    
    var text = new Text("boxName", px+10, py-5, TextDefaults.size, "#FF0000");
    c.addPrimitive(text);
    
    c.finalise();
    return c;
}

function component_RDYL(x,y) {
    var c = new Component("RDY_L", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 6;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
    
    var l = new Line(new Point(px + offset, py), new Point(px + offset, py + size/4));
  
    c.addPrimitive(r);
    c.addPrimitive(l);
    
    var text = new Text("RDY", x - size/8, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();
    
    c.finalise();
    return c;
}



function component_RDYR(x,y) {
    var c = new Component("RDY_R", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 6;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
    
    var l = new Line(new Point(px + size - offset, py), new Point(px + size - offset, py + size/4));
    
    c.addPrimitive(r);
    c.addPrimitive(l);
    
    var text = new Text("RDY", x - size/4, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();
    
    c.finalise();
    return c;
}


function component_ACKL(x,y) {
    var c = new Component("ACK_L", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 6;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));

    
    var l = new Line(new Point(px + offset, py), new Point(px + offset, py + size/4));
  
    c.addPrimitive(r);
    c.addPrimitive(l);
    
    var text = new Text("ACK", x - size/8, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();
    
    c.finalise();
    return c;
}



function component_ACKR(x,y) {
    var c = new Component("ACK_R", COMPONENT_SIZE, x, y);
    
    var size = COMPONENT_SIZE;
    var offset = COMPONENT_SIZE / 6;
    var px = x - size/2;
    var py = y - size/4;
    
    var r = new Polygon();
    
    r.addPoint(new Point(px, py));
    r.addPoint(new Point(px, py + size/4 ));
    r.addPoint(new Point(px + size, py + size/4));
    r.addPoint(new Point(px + size, py));
    
    var l = new Line(new Point(px + size - offset, py), new Point(px + size - offset, py + size/4));
    
    c.addPrimitive(r);
    c.addPrimitive(l);
    
    var text = new Text("ACK", x - size/4, y - size/16);
    c.addPrimitive(text);
    
    c.generateConnectionPoints();
    
    c.finalise();
    return c;
}



function component_Alfa(x,y){    
    var c = new Component("Alfa", TextDefaults.size, x, y);
    var size = TextDefaults.size + 10;
    var px = x - size/2;
    var py = y - size;
    
    var r = new Polygon();
    
    c.addPrimitive(new Point(px, py));
    c.addPrimitive(new Point(px, py + size));
    c.addPrimitive(new Point(px + size, py + size));
    c.addPrimitive(new Point(px + size, py));    
    
    var text = new Text("α", x, y, 32);
    c.addPrimitive(text);
    
    c.finalise();
    return c;
}


function component_Beta(x,y){    
    var c = new Component("Beta", COMPONENT_SIZE, x, y);
    var size = TextDefaults.size + 10;
    var px = x - size/2;
    var py = y - size;
    
    c.addPrimitive(new Point(px, py));
    c.addPrimitive(new Point(px, py + size ));
    c.addPrimitive(new Point(px + size, py + size));
    c.addPrimitive(new Point(px + size, py));        
    
    var text = new Text("β", x, y, 32);
    c.addPrimitive(text);
    
    c.finalise();
    return c;
}


function component_Text(x,y) {
    var c = new Component("Text", x, y, 24);
    var size = 24;
    var px = x - size/2;
    var py = y - size;
    
    c.addPrimitive(new Point(px, py));
    c.addPrimitive(new Point(px, py + size));
    c.addPrimitive(new Point(px + size*2 + 10, py + size));
    c.addPrimitive(new Point(px + size*2 + 10, py));
    
    var text = new Text("Text", x, y, 24);
    c.addPrimitive(text);
    
    c.finalise();
    return c;
}
