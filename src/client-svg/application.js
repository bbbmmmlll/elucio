// deck

function projects_itemLoadCallback(carousel, state) {
    if (state != 'init')
        return;
 
    jQuery.getJSON('/projects.json' + '?' + Math.round(new Date().getTime()), function(data) {
        projects_itemAddCallback(carousel, carousel.first, carousel.last, data);
    });
};
 
function projects_itemAddCallback(carousel, first, last, data) {
    // Simply add all items at once and set the size accordingly.
    var items = [];

    for (i = 0; i < data.length; i++) {
        items.push(data[i].project.name);
    }
 
    for (i = 0; i < items.length; i++) {
        carousel.add(i+1, mycarousel_getItemHTML(items[i]));
    }
 
    carousel.size(items.length);
};

// Item html creation helper.
function mycarousel_getItemHTML(s) {
    return '<li>' + s + '</li>';
};

// 
// matrix
//

var elucio = {
    // TODO: too many globals
    STATE_COLORS: ({ Done: "green", Open: "white", Late: "yellow", Started: "blue", Blocked: "red", New: "light blue" }),
    HEIGHT_TO_WIDTH_RATIO: 0.6,
    CELL_MARGIN: 0.1,
    CELL_BORDER: 1,
    paper: null,
    div: null,
    canvas_width: 0,
    canvas_height: 0,
    tasks: [],
    zoom: 0,
    zoom_factor: 0,
    matrix_width: 0,
    matrix_height: 0,
    cell_width: 0,
    cell_height: 0,
    cell_width_margin: 0,
    cell_height_margin: 0,

    init: function(div, canvas_width, canvas_height) {
        elucio.get_tasks(div, canvas_width, canvas_height);
    },

    setup: function(div, canvas_width, canvas_height, tasks) {
        this.div = div;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.tasks = tasks;
        this.paper = Raphael(div, canvas_width, canvas_height);
        elucio.matrix();
    },

    matrix: function() { 
        this.adjust_sizes();

        if (this.paper) {
            this.paper.clear();
        }

        elucio.draw_matrix(this.paper);
        elucio.draw_tasks(this.paper, this.tasks);
        elucio.draw_controls(this.paper, this.canvas_width - 60, 0);
    },

    adjust_sizes: function() {
        var max_coord = elucio.get_project_matrix_size(this.tasks); 
        this.matrix_width = max_coord.x;
        this.matrix_height = max_coord.y;

        if (this.zoom) {
            this.zoom_factor+= this.zoom;
            this.CELL_BORDER += this.zoom;
            this.zoom = 0;
        }

        // figure our matrix size based on needed dimensions plus a buffer 
        this.cell_width = this.canvas_width / (this.matrix_width + this.CELL_BORDER + this.CELL_BORDER);
        this.cell_height = (this.canvas_height / (this.matrix_height + this.CELL_BORDER + this.CELL_BORDER)) * this.HEIGHT_TO_WIDTH_RATIO;
        this.cell_width_margin = this.cell_width * this.CELL_MARGIN;
        this.cell_height_margin = this.cell_height * this.CELL_MARGIN;
    },

    // draw empty matrix
    draw_matrix: function(r) {
        var cell_side_width = this.cell_width - (2 * this.cell_width_margin);
        var cell_side_height = this.cell_height - (2 * this.cell_height_margin);
        var full_cell_width = this.cell_width + this.cell_width_margin;
        var full_cell_height = this.cell_height + this.cell_height_margin; 
        var full_matrix_width = this.matrix_width + this.CELL_BORDER + this.CELL_BORDER;
        var full_matrix_height = this.matrix_height + this.CELL_BORDER + this.CELL_BORDER;

        for (var w = 0; w < full_matrix_width; w++) {
            for (var h = 0; h < full_matrix_height; h++) {
                var shape = r.rect(w * full_cell_width, h * full_cell_height, cell_side_width, cell_side_height, 10);
                shape.attr({fill: "gray", stroke: "gray", "fill-opacity": 0, "stroke-width": 1, cursor: "move"});

                // save values which are relative to the tasks and not the matrix
                shape.node.matrix_x = w - this.CELL_BORDER;
                shape.node.matrix_y = h - this.CELL_BORDER;
                shape.dblclick(elucio.handler_doubleclick_add_task);
            }
        }
    },

    // draw tasks on matrix
    draw_tasks: function(r, tasks) {
        var cell_side_width = this.cell_width - (2 * this.cell_width_margin);
        var cell_side_height = this.cell_height - (2 * this.cell_height_margin);
        var full_cell_width = this.cell_width + this.cell_width_margin;
        var full_cell_height = this.cell_height + this.cell_height_margin; 

        for (var i = 0; i < tasks.length; i++) {
            //alert("coords:" + tasks[i].task.matrix_x + "," + tasks[i].task.matrix_y);
            var x = (tasks[i].task.matrix_x + this.CELL_BORDER) * full_cell_width;
            var y = (tasks[i].task.matrix_y + this.CELL_BORDER) * full_cell_height;
            var shape = r.rect(x, y, cell_side_width, cell_side_height, 10);

            shape.node.id = tasks[i].task.id;

            // task cells overwrite the empty shape so set these again
            // these are relative to the tasks and not the matrix
            shape.node.matrix_x = tasks[i].task.matrix_x;
            shape.node.matrix_y = tasks[i].task.matrix_y;

            var task_state = tasks[i].task.status;

            if (!task_state) {
                task_state = "Open";
            }

            shape.attr({fill: this.STATE_COLORS[task_state], stroke: this.STATE_COLORS[task_state], "fill-opacity": 50, "stroke-width": 2, cursor: "move"});

            // add text
            var bbox = shape.getBBox();

            if (bbox.width > 50 || bbox.height > 50) {
                t = r.text(x + (2 * this.cell_width_margin), y + this.cell_height_margin, tasks[i].task.name); // BUG: offset don't make sense, but are working
            }

            // attach an event
            shape.dblclick(elucio.handler_doubleclick_task);
       }
    },

    draw_controls: function(r, x, y) {
        icon_plus = "M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z";
        icon_minus = "M25.979,12.896,19.312,12.896,5.979,12.896,5.979,19.562,25.979,19.562z";

        shape = r.rect(x, 0, 25, 25);
        shape.attr({fill: "white" , stroke: "white" , "fill-opacity": 50, "stroke-width": 2, cursor: "move"});
        icon = r.path(icon_plus).attr({fill: "#000", stroke: "none"});
        icon.translate(x - 3, -4);
        shape.click(elucio.handler_click_zoomin);
        icon.click(elucio.handler_click_zoomin);

        shape = r.rect(x+28, 0, 25, 25);
        shape.attr({fill: "white" , stroke: "white" , "fill-opacity": 50, "stroke-width": 2, cursor: "move"});
        icon = r.path(icon_minus).attr({fill: "#000", stroke: "none"});
        icon.translate(x+25, -4);
        shape.click(elucio.handler_click_zoomout);
        icon.click(elucio.handler_click_zoomout);
    },

    //
    // event handlers
    //

    handler_click_zoomin: function(event) {
        elucio.zoom++;
        elucio.matrix();
    },

    handler_click_zoomout: function(event) {
        elucio.zoom--;
        elucio.matrix();
    },

    handler_doubleclick_task: function(event) {
        var task_id = this.node.id;
        var matrix_x = this.node.matrix_x;
        var matrix_y = this.node.matrix_y;

        $('<div align="center" style="width: 320px; height: 720px; overflow: hidden"><iframe src="/tasks/' 
          + task_id + '/edit?x=' + matrix_x + "&y=" + matrix_y 
          + '" width="320" frameborder="0" height="720"></iframe></d iv>').dialog({
            width: 320,
            height: 720,
            title: 'Task Editor - Edit Task'
        })

    },

    handler_doubleclick_add_task: function(event) {
        var matrix_x = this.node.matrix_x;
        var matrix_y = this.node.matrix_y;

        $('<div align="center" style="width: 320px; height: 720px; overflow: hidden"><iframe src="/tasks/new?x='
          + matrix_x + "&y=" + matrix_y + '" width="320" frameborder="0" height="720"></iframe></div>').dialog({
            width: 320,
            height: 720,
            title: 'Task Editor - New Task'
        })
    },

    // figure out the cell width and height of the project
    get_project_matrix_size: function(tasks) {
        var max_x = 0;
        var max_y = 0;

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].task.matrix_x > max_x) {
                max_x = tasks[i].task.matrix_x;
            }
            if (tasks[i].task.matrix_y > max_y) {
                max_y = tasks[i].task.matrix_y;
            }
        }

        // adjust for zero based index
        max_x++;
        max_y++;

        return {x: max_x, y: max_y};
    },

    get_tasks: function(div, canvas_width, canvas_height) {
        jQuery.getJSON('/tasks.json' + '?' + Math.round(new Date().getTime()), function(data) {
            elucio.get_tasks_callback(div, canvas_width, canvas_height, data);
        });
    },

    get_tasks_callback: function(div, canvas_width, canvas_height, data) {

        //for (i = 0; i < data.length; i++) {
        //    alert("get_tasks_callback: " + data[i].task.name);
        //}

        elucio.setup(div, canvas_width, canvas_height, data);
    }

}

/*
var el;
function initMatrix(div, canvas_width, canvas_height) {
    getTasks(div, canvas_width, canvas_height);
}

CELL_BORDER = 2; // should be an even number

function elucioMatrix(div, canvas_width, canvas_height, tasks, zoom) {
    STATE_COLORS = ({ Done: "green", Open: "white", Late: "yellow", Started: "blue", Blocked: "red", New: "light blue" });
    HEIGHT_TO_WIDTH_RATIO = 0.6;
    CELL_MARGIN = 0.1;
    zoom = 6; // for testing

    r = Raphael(div, canvas_width, canvas_height);

    // TODO: adjust for odd sizes

    var max_coord = get_project_matrix_size(tasks); 
    matrix_width = max_coord.x;
    matrix_height = max_coord.y;

    if (zoom != null) {
        CELL_BORDER += zoom;
    }
 
    // figure our matrix size based on needed dimensions plus a buffer 
    cell_width = canvas_width / (matrix_width + CELL_BORDER);
    cell_height = (canvas_height / (matrix_height + CELL_BORDER)) * HEIGHT_TO_WIDTH_RATIO;
    cell_width_margin = cell_width * CELL_MARGIN;
    cell_height_margin = cell_height * CELL_MARGIN;

    // draw empty matrix
    for (var w = 0; w < matrix_width + CELL_BORDER; w++) {
        for (var h = 0; h < matrix_height + CELL_BORDER; h++) {
            shape = r.rect(w * cell_width + cell_width_margin, h * cell_height + cell_height_margin, cell_width - (2 * cell_width_margin), cell_height - (2 * cell_height_margin), 10);            
            shape.attr({fill: "gray", stroke: "gray", "fill-opacity": 0, "stroke-width": 1, cursor: "move"});
            // these are relative to the tasks and not the matrix
            shape.node.matrix_x = w - CELL_BORDER / 2;
            shape.node.matrix_y = h - CELL_BORDER / 2;
            shape.dblclick(handler_doubleclick_add_task);
        }
    }

    // draw tasks on matrix
    for (var i = 0; i < tasks.length; i++) {
         //alert("coords:" + tasks[i].task.matrix_x + "," + tasks[i].task.matrix_y);
         x = (tasks[i].task.matrix_x + CELL_BORDER/2) * cell_width + cell_width_margin;
         y = (tasks[i].task.matrix_y + CELL_BORDER/2) * cell_height + cell_height_margin;
         shape = r.rect(x, y, cell_width - (2 * cell_width_margin), cell_height - (2 * cell_height_margin), 10);
         shape.node.id = tasks[i].task.id;
         task_state = tasks[i].task.status;
         // task cells overwrite the empty shape so set these again
         // these are relative to the tasks and not the matrix
         shape.node.matrix_x = tasks[i].task.matrix_x;
         shape.node.matrix_y = tasks[i].task.matrix_y;
         if (task_state == null) {
             task_state = "Open";
         }
         shape.attr({fill: STATE_COLORS[task_state], stroke: STATE_COLORS[task_state], "fill-opacity": 50, "stroke-width": 2, cursor: "move"});
         // add text
         var bbox = shape.getBBox();
         if (bbox.width > 50 || bbox.height > 50) {
             t = r.text(x + (2 * cell_width_margin), y + cell_height_margin, tasks[i].task.name); // BUG: offset don't make sense, but are working
         }
         // attach an event
         shape.dblclick(handler_doubleclick_task);
    }

    zoom_buttons(r, canvas_width - 60, 0, div, canvas_width, canvas_height, tasks);
};

function zoom_buttons(r, x, y) {
    icon_plus = "M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z";
    icon_minus = "M25.979,12.896,19.312,12.896,5.979,12.896,5.979,19.562,25.979,19.562z";

    shape = r.rect(x, 0, 25, 25);
    shape.attr({fill: "white" , stroke: "white" , "fill-opacity": 50, "stroke-width": 2, cursor: "move"});
    icon = r.path(icon_plus).attr({fill: "#000", stroke: "none"});
    icon.translate(x - 3, -4);
    shape.click(handler_click_zoomin);
    icon.click(handler_click_zoomin);

    shape = r.rect(x+28, 0, 25, 25);
    shape.attr({fill: "white" , stroke: "white" , "fill-opacity": 50, "stroke-width": 2, cursor: "move"});
    icon = r.path(icon_minus).attr({fill: "#000", stroke: "none"});
    icon.translate(x+25, -4);
    shape.click(handler_click_zoomout);
    icon.click(handler_click_zoomout);

}

function handler_doubleclick_task(event) {
    task_id = this.node.id;
    matrix_x = this.node.matrix_x;
    matrix_y = this.node.matrix_y;

    $('<div align="center" style="width: 320px; height: 720px; overflow: hidden"><iframe src="/tasks/' + task_id + '/edit?x=' + matrix_x + "&y=" + matrix_y + '" width="320" frameborder="0" height="720"></iframe></div>').dialog({
        width: 320,
        height: 720,
        title: 'Task Editor - Edit Task'
    })

}

function handler_doubleclick_add_task(event) {
    matrix_x = this.node.matrix_x;
    matrix_y = this.node.matrix_y;

    $('<div align="center" style="width: 320px; height: 720px; overflow: hidden"><iframe src="/tasks/new?x=' + matrix_x + "&y=" + matrix_y + '" width="320" frameborder="0" height="720"></iframe></div>').dialog({
        width: 320,
        height: 720,
        title: 'Task Editor - New Task'
    })
}

function handler_click_on_matrix(event) {
    alert(event.which);
}

// figure out the cell width and height of the project
function get_project_matrix_size(tasks) {
    var max_x = 0;
    var max_y = 0;
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].task.matrix_x > max_x) {
            max_x = tasks[i].task.matrix_x;        
        }
        if (tasks[i].task.matrix_y > max_y) {
            max_y = tasks[i].task.matrix_y;
        }
    }
    // adjust for zero based index
    max_x++;
    max_y++;

    return {x: max_x, y: max_y};
}


// Misc Calls

function getTasks(div, canvas_width, canvas_height) {
    jQuery.getJSON('/tasks.json' + '?' + Math.round(new Date().getTime()), function(data) {
        get_tasks_callback(div, canvas_width, canvas_height, data);
    });
};

function get_tasks_callback(div, canvas_width, canvas_height, data) {
    // Simply add all items at once and set the size accordingly.
    var items = [];

    //for (i = 0; i < data.length; i++) {
    //    alert("get_tasks_callback: " + data[i].task.name);
    //}

    var tasks = data;
    elucioMatrix(div, canvas_width, canvas_height, tasks);

};


// OLD
function elucioProjectCanvas() {
    var canvas = document.getElementById("elucioCanvas");  
    var ctx = canvas.getContext("2d");  
    ctx.fillRect(160, 120, 320, 480);
}
*/
