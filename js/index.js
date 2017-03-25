'use strict';

var vertex = function(x, y) {
    this.x = x;
    this.y = y;
    
    this.compare = function(vert) {
        return (vert.x == this.x && vert.y == this.y);
    }
 
    this.draw = function(canvasCtx) { 
        canvasCtx.beginPath();
        canvasCtx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
        canvasCtx.fillStyle = 'green';
        canvasCtx.fill();
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#003300';
        canvasCtx.stroke();            
    }
}

var edge = function(v1, v2) {
    this.vertices = [v1, v2];
    
    // CCW
    this.compare = function(_edge) {
        return (_edge.vertices[0].compare(this.vertices[0]) && _edge.vertices[1].compare(this.vertices[1])) || 
            (_edge.vertices[0].compare(this.vertices[1]) && _edge.vertices[1].compare(this.vertices[0]));
    }
    
    this.draw = function(canvasCtx) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(this.vertices[0].x, this.vertices[0].y);
        canvasCtx.lineTo(this.vertices[1].x, this.vertices[1].y);
        canvasCtx.strokeStyle = '#0000FF';
        canvasCtx.stroke();
    }
}

var triangle = function(v1, v2, v3) {
    // CCW
    this.edges = [];
    this.vertices = [];
    
    if (CCWTest(v1, v2, v3)) {
        this.vertices = this.vertices.concat([
            new vertex(v1.x, v1.y),
            new vertex(v2.x, v2.y),
            new vertex(v3.x, v3.y)
        ]);
    }
    else {
        this.vertices = this.vertices.concat([
            new vertex(v1.x, v1.y),
            new vertex(v3.x, v3.y),
            new vertex(v2.x, v2.y)
        ]);
    }
    
    this.edges = this.edges.concat([
        new edge(this.vertices[0], this.vertices[1]),
        new edge(this.vertices[1], this.vertices[2]),
        new edge(this.vertices[2], this.vertices[0]),
    ]);
    
    this.circumCircle = circumCenter(this.vertices);
    
    this.compare = function(tri) {
        return (this.vertices[0].compare(tri.vertices[0]) || this.vertices[0].compare(tri.vertices[1]) || this.vertices[0].compare(tri.vertices[2])) &&
            (this.vertices[1].compare(tri.vertices[0]) || this.vertices[1].compare(tri.vertices[1]) || this.vertices[1].compare(tri.vertices[2])) &&
            (this.vertices[2].compare(tri.vertices[0]) || this.vertices[2].compare(tri.vertices[1]) || this.vertices[2].compare(tri.vertices[2]));
    }
    
    this.draw = function(canvasCtx) {
        this.vertices.forEach(function(v) {
            v.draw(canvasCtx);
        });
        this.edges.forEach(function(e) {
            e.draw(canvasCtx);
        });
    }
    
    this.drawCircumCircle = function(canvasCtx) {
        canvasCtx.beginPath();
        canvasCtx.arc(this.circumCircle.x, this.circumCircle.y, Math.sqrt(this.circumCircle.radius), 0, 2 * Math.PI, false);
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = '#00FF00';
        canvasCtx.stroke();        
    }
    
    function circumCenter (vertices) {
        var _val = 2 * (
            vertices[0].x * (vertices[1].y - vertices[2].y) +
            vertices[1].x * (vertices[2].y - vertices[0].y) +
            vertices[2].x * (vertices[0].y - vertices[1].y)
        );
        
        var c_x = 
            (Math.pow(vertices[0].x, 2) + Math.pow(vertices[0].y, 2)) * (vertices[1].y - vertices[2].y) +
            (Math.pow(vertices[1].x, 2) + Math.pow(vertices[1].y, 2)) * (vertices[2].y - vertices[0].y) + 
            (Math.pow(vertices[2].x, 2) + Math.pow(vertices[2].y, 2)) * (vertices[0].y - vertices[1].y);
        var c_y = 
            (Math.pow(vertices[0].x, 2) + Math.pow(vertices[0].y, 2)) * (vertices[2].x - vertices[1].x) +
            (Math.pow(vertices[1].x, 2) + Math.pow(vertices[1].y, 2)) * (vertices[0].x - vertices[2].x) + 
            (Math.pow(vertices[2].x, 2) + Math.pow(vertices[2].y, 2)) * (vertices[1].x - vertices[0].x);
        
        var _center = {x: c_x / _val, y: c_y / _val};
        // radius^2
        _center.radius = Math.pow(_center.x - vertices[0].x, 2) + Math.pow(_center.y - vertices[0].y, 2);
        
        return _center;
    }
    
    function CCWTest(v1, v2, v3) {
        var res = ((v1.x - v2.x) * (v1.y - v2.y)) + 
            ((v2.x - v3.x) * (v2.y - v3.y)) + 
            ((v3.x - v1.x) * (v3.y - v1.y));
        
        if (res > 0)
            return false;
        else return true;
    }
}

var DelanunayTriangulation = new function() {
    this.edges = [];
    this.triangles = [];
    this.vertices = [];
    this.canvasCtx;
    this.canvas;
    
    this.checkInCircle = function(v, triangle) {
        var dist = Math.pow(triangle.circumCircle.x - v.x, 2) + Math.pow(triangle.circumCircle.y - v.y, 2);
        
        // in circle
        if (dist - triangle.circumCircle.radius < 0)
            return true;
        else
            return false;
    }
    
    this.superTriangle = function() {
        // make a supertriangle
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        this.vertices.forEach(function(elem) {
            if (elem.x < minX) minX = elem.x;
            if (elem.y < minY) minY = elem.y;
            if (elem.x > maxX) maxX = elem.x;
            if (elem.y > maxY) maxY = elem.y;
        });
        var dx = maxX - minX, dy = maxY - minY,
            deltaMax = (dx > dy) ? dx : dy, 
            midx = (minX + maxX) / 2, midy = (minY + maxY) / 2;

        var p1 = new vertex(midx - 20 * deltaMax, midy - deltaMax);
        var p2 = new vertex(midx, midy + 20 * deltaMax);
        var p3 = new vertex(midx + 20 * deltaMax, midy - deltaMax);	
        
        return new triangle(p1, p2, p3);
    }
    
    this.addPoint = function(v) {
        this.vertices.push(v);
        var s_triangle = this.superTriangle();
        this.triangles = [];
        // insert super triangle
        this.triangles.unshift(s_triangle);
        
        this.vertices.forEach(function(pt) {
            // find bad triangles
            var badTriangles = [];
            this.triangles.forEach(function(tr) {
                if (this.checkInCircle(pt, tr))
                    badTriangles.push(tr);
            }, this);
            
            // add polygon edges
            var polygonEdges = [];
            badTriangles.forEach(function(badTri) {
                badTri.edges.forEach(function(ed) {
                    var tmpIdx;
                    var tmp = polygonEdges.every(function(polyEd, idx) {
                        if (ed.compare(polyEd)) {
                            tmpIdx = idx;
                            //break;
                            return false;
                        }
                        return true;
                    });
                    if (tmp) polygonEdges.push(ed);
                    else polygonEdges.splice(tmpIdx, 1);
                });
            });
            
            // remove bad triangle
            this.triangles = this.triangles.filter(function(tri) {
                return badTriangles.every(function(badTri) {
                    if (tri.compare(badTri)) {
                        //break;
                        return false;
                    } else return true;
                }, this);
            }, this);
            
            // triangulate
            polygonEdges.forEach(function(ed) {
                this.triangles.push(new triangle(ed.vertices[0], ed.vertices[1], pt));
            }, this);
        }, this);
        
        // remove triangles that contains vertices of super-triangle
        this.triangles = this.triangles.filter(function(tri) {
            return (!((tri.vertices[0].compare(s_triangle.vertices[0]) || tri.vertices[0].compare(s_triangle.vertices[1]) || tri.vertices[0].compare(s_triangle.vertices[2])) ||
            (tri.vertices[1].compare(s_triangle.vertices[0]) || tri.vertices[1].compare(s_triangle.vertices[1]) || tri.vertices[1].compare(s_triangle.vertices[2])) ||
            (tri.vertices[2].compare(s_triangle.vertices[0]) || tri.vertices[2].compare(s_triangle.vertices[1]) || tri.vertices[2].compare(s_triangle.vertices[2]))));
        }, this);
    }
    
    this.draw = function() {
        this.clear();

        // draw triangles
        if (document.getElementById('delaunay').checked) {
            this.triangles.forEach(function(tr) {
                tr.draw(this.canvasCtx);
            }, this);
        }
        
        // draw circumcircle
        if (document.getElementById('circumcircle').checked) {
            this.triangles.forEach(function(tr) {
                tr.drawCircumCircle(this.canvasCtx);
            }, this);            
        }

        // draw vertex
        this.vertices.forEach(function(pt) {
            pt.draw(this.canvasCtx);
        }, this);
        
        document.getElementById('triangle_number').textContent = this.triangles.length;
    }
    
    this.clear = function() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function drawVoronoi(canvasCtx, tri) {
    canvasCtx.beginPath();
    tri.forEach(function(prev) {
        tri.forEach(function(curr) {
            var tmp = 0;
            prev.vertices.forEach(function(e) {
                if (!curr.vertices.every(function(v) {
                    if (v.compare(e))
                        return false;
                    else return true;
                }))
                    tmp++;
            });

            if (tmp == 2) {
                canvasCtx.moveTo(prev.circumCircle.x, prev.circumCircle.y);
                canvasCtx.lineTo(curr.circumCircle.x, curr.circumCircle.y);
                canvasCtx.strokeStyle = '#FF0000';
                canvasCtx.stroke();        
            }
        });
    });
}

function init() {
    DelanunayTriangulation.canvas = document.getElementById("triangulation");
    DelanunayTriangulation.canvasCtx = DelanunayTriangulation.canvas.getContext('2d');
    
    document.getElementById("triangulation").addEventListener("click", function(e) {
        DelanunayTriangulation.addPoint(new vertex(
            e.pageX - (document.getElementById("triangulation").offsetLeft - window.pageXOffset),
            e.pageY - (document.getElementById("triangulation").offsetTop - window.pageYOffset)
        ));
    });
    
    animate();
}

function render() {
    DelanunayTriangulation.draw();
    if (document.getElementById('voronoi').checked)
        drawVoronoi(DelanunayTriangulation.canvasCtx, DelanunayTriangulation.triangles);
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
