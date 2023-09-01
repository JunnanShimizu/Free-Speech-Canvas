var socket;
const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear -canvas"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

// function mousemove(event){
//     console.log("pageX: ",event.pageX, 
//     "pageY: ", event.pageY, 
//     "clientX: ", event.clientX, 
//     "clientY:", event.clientY)
// }

function setup(){
    // createCanvas(600, 400);

    socket = io.connect('http://localhost:3000');
    socket.on('mouse', newDrawing);
}

function newDrawing(data){
    if(data.mousePressed){
        console.log(data);
        ctx.lineTo(data.x, data.y); 
        ctx.stroke();
    }

    // noStroke();
    // fill(0);
    // ellipse(data.x, data.y, 10, 10);

    // if(data.selectedTool === "brush"){
    //     // fill(0);
    //     // ellipse(data.x, data.y, 10, 10);

    // }else if(data.selectedTool === "rectangle"){
    //     canvas.background(0);
    //     // if(!fillColor.checked){
    //     //     return ctx.strokeRect(data.offsetX, data.offsetY, data.prevMouseX - data.offsetX, data.prevMouseY - data.offsetY);
    //     // }
    //     // ctx.fillRect(data.offsetX, data.offsetY, data.prevMouseX - data.offsetX, data.prevMouseY - data.offsetY);
    // }
    
}


// function mouseDragged(){
//     console.log('Sending: ' + mouseX + ', ' + mouseY);

//     var data = {
//         x: mouseX,
//         y: mouseY
//     }
    
//     socket.emit('mouse', data);

//     noStroke();
//     fill(0);
//     ellipse(mouseX, mouseY, 10, 10);
// }

function mouseDragged(e){
    if (mouseIsPressed) {
        var data = {
            mousePressed: mouseIsPressed,
            x: e.offsetX,
            y: e.offsetY
        }

        socket.emit('mouse', data);

        console.log('Sending: ' + e.offsetX + ', ' + e.offsetY);
        // fill(0);
        // ellipse(mouseX, mouseY, 10, 10);
        // ellipse(e.pageX, e.pageY, 10, 10);

        ctx.lineTo(e.offsetX, e.offsetY); 
        ctx.stroke();
    }
    

}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
})

const drawRect = (e) => {
    console.log('Sending: rectangle, ' + e.offsetX + ', ' + e.offsetY + ', ' + prevMouseX + ', ' + prevMouseY);

    var data = {
        name: 'rectangle',
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        prevMouseX: prevMouseX,
        prevMouseY: prevMouseY
    }

    socket.emit('mouse', data);

    if(!fillColor.checked){
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath();
    // setting radius depending on mouse position
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked, fill
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY); // creates first line of the triangle given mouse pointer
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // creates bottom of the triangle
    ctx.closePath(); // connects the first line and the bottom line
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked, fill
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath(); // creates new path to draw
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor; 
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) return; 
    ctx.putImageData(snapshot, 0, 0);
 
    if(selectedTool === "brush" || selectedTool === "eraser"){
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); 
        ctx.stroke();
    } else if(selectedTool === "rectangle"){
        drawRect(e);
    } else if(selectedTool === "circle"){
        drawCircle(e);
    } else if(selectedTool === "triangle"){
        drawTriangle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // passing slider value as Brush size

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // gets btn background color and sets it to brush
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    // gets picked color value from color picker and passes it to btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
})

// clearCanvas.addEventListener("click", () => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height); // clears whole canvas
// })

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
// canvas.addEventListener("mousemove", mousemove);
canvas.addEventListener("mousemove", mouseDragged);
canvas.addEventListener("mouseup", () => isDrawing = false);
