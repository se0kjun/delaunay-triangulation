'use strict';

var vertex = function(x, y) {
    this.x = x;
    this.y = y;
}

var edge = function(v1, v2) {
    this.vertices = [v1, v2];
}

var triangle = function(v1, v2, v3) {
    
    // CCW
    this.edges = [];
    this.vertices = [];
    this.centerPos = {};
    this.radius;
    
    function circumCenter () {
    }
    
    function CCWTest() {
    }
}

var DelanunayTriangulation = new function() {
    this.triangles = [];
    this.canvasCtx;
    this.canvas;
    
    this.triangulate = function() {
    }
    
    this.checkInCircle = function(v, triangle) {
    }
    
    this.boundary = function() {
    }
    
    this.addPoint = function(v) {
    }
    
    this.draw = function() {
        this.triangles.forEach(function(elem) {
            elem.edges.forEach(function(edge) {
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(edge.v1.x, edge.v1.y, 10, 0, 2 * Math.PI, false);
                this.canvasCtx.fillStyle = 'green';
                this.canvasCtx.fill();
                this.canvasCtx.stroke();
                
                this.canvasCtx.moveTo(edge.v1.x, edge.v1.y);
                this.canvasCtx.lineTo(edge.v2.x, edge.v2.y);
                this.canvasCtx.stroke();
                
                this.canvasCtx.arc(edge.v1.x, edge.v1.y, 10, 0, 2 * Math.PI, false);
                this.canvasCtx.fillStyle = 'green';
                this.canvasCtx.fill();
                this.canvasCtx.stroke();
            }, this);
        }, this);
    }
    
    this.clear = function() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function init() {
    DelanunayTriangulation.canvas = document.getElementById("triangulation");
    DelanunayTriangulation.canvasCtx = DelanunayTriangulation.canvas.getContext('2d');
    
    document.getElementById("triangulation").addEventListener("click", function(e){
        DelanunayTriangulation.addPoint(new vertex(
            e.pageX - (document.getElementById("triangulation").offset().left - window.pageXOffset),
            e.pageY - (document.getElementById("triangulation").offset().top - window.pageYOffset),
        );
    });
}

function render() {
    DelanunayTriangulation.draw();
    DelanunayTriangulation.clear();
}
    
function animate() {
    requestAnimFrame(animate);
    render();
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(callback, element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

document.addEventListener("DOMContentLoaded", init);
