/*
 * matrix
 *
 * prototype quality code
 *
 */

var elucio = {
    /*
     * terms =
     *   matrix = grid of all tasks in row/column form
     *   canvas = where we draw our task tiles 
     *   view = the section of the matrix that fits on the canvas in row/column form
     *   tiles = the view is broken down into tiles with one task per tile
     * 
     */
    TASK_STATE_COLORS: ({ Finished: "green", Started: "white", Waiting: "grey", Late: "red", Behind: "yellow" }),
    TILE_MARGIN: 0.1,
    TILE_BORDER: 1,
    context: null,
    canvas: null,
    div: null,
    empty_tiles: [],
    task_tiles: [],
    tasks: [],
    projects: [],
    current_task: 0,
    current_project: 0,
    current_project_name: "No projects found",
    last_sign_in_at: 0,
    zoom: 0,
    zoom_factor: 0,
    canvas_width: 0,
    canvas_height: 0,
    matrix: [],
    matrix_cols: 0,
    matrix_rows: 0,
    matrix_row_offset: 0, 
    matrix_col_offset: 0,
    view_cols: 0,
    view_rows: 0,
    tile_width: 0,
    tile_height: 0,
    tile_width_margin: 0,
    tile_height_margin: 0,
    shake_count: 0,

    init: function(div, canvas_width, canvas_height) {
        this.div = div;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.get_tasks();
    },

    setup: function(data) {
        this.tasks = data.tasks;
        this.projects = data.projects;
        this.last_sign_in_at = data.last_sign_in_at;
        this.canvas = document.getElementById(this.div);
        this.context = this.canvas.getContext("2d");

        $('#matrix').bind('dblclick', function(e) {
            var x;
            var y;

            if (e.pageX != undefined && e.pageY != undefined) {
	        x = e.pageX;
	        y = e.pageY;
            }
            else {
	        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            x -= elucio.canvas.offsetLeft;
            y -= elucio.canvas.offsetTop;

            console.log('click: ' + x + '/' + y);
            var box = elucio.collides(x, y);

            if (box) {
                console.log('collision: ' + box.x + '/' + box.y + " " + box.matrix_x + "," + box.matrix_y);
                if (box.id) {
                    elucio.popup_task(box);
                }
                else {
                    elucio.popup_add_task(box);
                }
            } else {
                console.log('no collision');
            }
        });

        $('#matrix').bind('mousewheel', function(e, delta) {
            elucio.zoom_view(delta);
        });

        $(document).keydown(function(e) {
            //console.log("got key: " + e.keyCode);
            switch (e.keyCode) {
                case 37: /* left arrow */
                    elucio.scroll_left();
                    break;
                case 39: /* right arrow */
                    elucio.scroll_right();
                    break;
                case 38: /* up arrow */
                    elucio.scroll_up();
                    break;
                case 40: /* down arrow */
                    elucio.scroll_down();
                    break;
            }
            console.log("matrix_rows: " + elucio.matrix_rows + " view_rows: " + elucio.view_rows);
            console.log("matrix_cols: " + elucio.matrix_cols + " view_cols: " + elucio.view_cols);
            console.log("matrix_col_offset: " + elucio.matrix_col_offset+ " matrix_row_offset: " + elucio.matrix_row_offset);
        });

        elucio.draw();
    },

    scroll_left: function() {
        if (elucio.matrix_col_offset > 0) {
            elucio.matrix_col_offset--;
            elucio.draw();
        }
        else {
            elucio.scroll_stop_feedback();
        }
    },

    scroll_right: function() {
        if (elucio.matrix_col_offset < (elucio.matrix_cols - elucio.view_cols)) {
            elucio.matrix_col_offset++;
            elucio.draw();
        }
        else {
            elucio.scroll_stop_feedback();
        }
    },

    scroll_up: function() {
        if (elucio.matrix_row_offset > 0) {
            elucio.matrix_row_offset--;
            elucio.draw();
        }
        else {
            elucio.scroll_stop_feedback();
        }
    },

    scroll_down: function() {
        if (elucio.matrix_row_offset < (elucio.matrix_rows - elucio.view_rows)) {
            elucio.matrix_row_offset++;
            elucio.draw();
        }
        else {
            elucio.scroll_stop_feedback();
        }
    },

    zoom_view: function(delta) {
        elucio.zoom = elucio.zoom + delta;
        elucio.draw();
    },

    scroll_stop_feedback: function() {
        console.log("scroll_stop_feedback() called");
        var ctx = elucio.context;
        this.shake_count = 0;
        ctx.save();
        setTimeout("elucio.shake_canvas()", 40);
        setTimeout("elucio.shake_canvas()", 80);
        setTimeout("elucio.shake_canvas()", 120);
        setTimeout("elucio.shake_canvas()", 180);
        setTimeout("elucio.draw()", 220);
        ctx.restore();
        elucio.draw();
    },

    shake_canvas: function() {
        var ctx = elucio.context;

        ctx.clearRect(0, 0, elucio.canvas_width, elucio.canvas_height);

        ctx.translate(elucio.canvas_width/2, elucio.canvas_height/2);
        if (this.shake_count % 2) {
            ctx.rotate(0.03);
        }
        else {
            ctx.rotate(-0.03);
        }
        ctx.translate(-elucio.canvas_width/2, -elucio.canvas_height/2);

        this.shake_count++;
        elucio.draw_view(elucio.context, elucio.tasks);
    },

    draw: function() { 
        console.log("draw() called");
        this.adjust_view_sizes(this.tasks);

        if (this.context) {
            this.canvas.width = this.canvas.width // reset the canvas
        }

        elucio.draw_view(this.context, this.tasks);
    },

    /* determine size of the view and tiles */
    adjust_view_sizes: function(tasks) {
        var max_coord = this.get_project_matrix_size(this.projects, this.tasks);
        this.matrix_cols = max_coord.x;
        this.matrix_rows = max_coord.y;

        console.log("adjust_view_sizes() called");

        if (this.matrix_cols >= this.matrix_rows) {
            this.tile_width = this.canvas_width / (this.matrix_cols + this.TILE_BORDER);
            this.tile_height = this.tile_width;

            /* adjust number of rows in the grid */ 
            this.view_rows = (this.canvas_height / this.tile_height);

            if ((this.canvas_width / this.tile_width) > this.view_cols) {
                this.view_cols = (this.canvas_width / this.tile_width);
            }
            else {
                this.view_cols = this.matrix_cols + this.TILE_BORDER;
            }
        }
        else {
            this.tile_height = this.canvas_height / (this.matrix_rows + this.TILE_BORDER);
            this.tile_width = this.tile_height;

            /* adjust number of cols in the grid */
            this.view_cols = (this.canvas_width / this.tile_width);

            if ((this.canvas_height / this.tile_height) > this.view_rows) {
                this.view_rows = (this.canvas_height / this.tile_height);
            }
            else {
                this.view_rows = this.matrix_rows + this.TILE_BORDER;
            }
        }

        console.log("vc: " + this.view_cols + " vr: " + this.view_rows);

        this.tile_width_margin = this.tile_width * this.TILE_MARGIN;
        this.tile_height_margin = this.tile_height * this.TILE_MARGIN;

        /* initialize to zero draw from top to bottom, then left to right */
        this.grid = new Array(this.matrix_cols);
        for (var w = 0; w < this.matrix_cols; w++) {
            this.grid[w] = new Array(this.matrix_rows);
            for (var h = 0; h < this.matrix_rows; h++) {
                //console.log("grid[" + w + "][" + h + "]");
                this.grid[w][h] = -1; 
            }
        }

        for (var i = 0; i < tasks.length; i++) {

            if (tasks[i].task.project_id != this.current_project) {
                continue;
            }

            var x = tasks[i].task.matrix_x;
            var y = tasks[i].task.matrix_y;

            this.grid[x][y] = i;
            //console.log("grid[" + x + "][" + y + "] = " + i);
        }

        console.log("current zoom_factor = " + this.zoom_factor);
        console.log("tasks.length = " + this.tasks.length);

        /* if no tasks, then start with a useful view */
        if (this.tasks.length == 0) {
            this.zoom = -2;
        }

        if (this.zoom) {
            if (this.zoom < 0 && ((this.zoom_factor < -this.matrix_rows) || (this.zoom_factor < -this.matrix_cols))) {
                this.zoom = 0;
                return;
            }
            this.zoom_factor+= this.zoom;
            this.TILE_BORDER += this.zoom;
            //if (this.TILE_BORDER < 0) this.TILE_BORDER = 0;
            //if (this.TILE_BORDER > 8) this.TILE_BORDER = 8;
            this.zoom = 0;
            console.log("new zoom_factor = " + this.zoom_factor);
        }

        //console.log("TILE_BORDER: " + this.TILE_BORDER);
        //console.log("cwm: " + this.tile_width_margin + " chm: " + this.tile_height_margin);
        //console.log("cw: " + this.tile_width + " ch: " + this.tile_height);

    },

    draw_view: function(r, tasks) {
        var cell_side_width = this.tile_width - (2 * this.tile_width_margin);
        var cell_side_height = this.tile_height - (2 * this.tile_height_margin);

        console.log("draw_view() called");
        console.log("draw_view::matrix_col_offset: " + this.matrix_col_offset + " matrix_row_offset: " + this.matrix_row_offset);

        var img_alert = document.getElementById("image_alert");
        var task_id = 0;
        var now_d = new Date();
        var now = now_d.getTime();
        console.log("now:" + now);
        console.log("last_sign_in_at:" + this.last_sign_in_at);
        var last_sign_in_at = Date.parse(this.last_sign_in_at);
        console.log("last_sign_in_at:" + last_sign_in_at);
        for (var x = 0; x < this.view_rows; x++) {
            for (var y = 0; y < this.view_cols; y++) {
                //console.log("draw_view at " + x + "," + y);

                task_id = -1;
                var task_row = y + this.matrix_row_offset;
                var task_col = x + this.matrix_col_offset;

                /* check if we're past the data */
                //console.log("draw_view():task_row: " + task_row + " matrix_rows: " + this.matrix_rows + " task_col: " + task_col + " matrix_cols: " + this.matrix_cols);
                if (task_row < this.matrix_rows && task_col < this.matrix_cols) {
                    task_id = this.grid[task_col][task_row]; 
                }

                if (task_id > -1) {
                    task = tasks[task_id].task;

                    var task_state = task.status;

                    if (!task_state) {
                        task_state = "Waiting";
                    }

                    var date_due = Date.parse(task.date_due);
                    var start_date = Date.parse(task.start_date);
                    if (task_state == 'Started' && now > date_due) {
                        r.fillStyle = this.TASK_STATE_COLORS['Late'];
                    }
                    else if (0 == 1) { // TODO: fix to work with progress
                        r.fillStyle = this.TASK_STATE_COLORS['Behind'];
                    }
                    else {
                        r.fillStyle = this.TASK_STATE_COLORS[task_state];
                    }

                    var tile_x = x * this.tile_width + this.tile_width_margin;
                    var tile_y = y * this.tile_height + this.tile_height_margin;

                    // shadow on
                    r.shadowOffsetX = 5;
                    r.shadowOffsetY = 5;
                    r.shadowBlur = 4;
                    r.shadowColor = 'rgba(0, 0, 0, 0.5)';

                    r.roundRect(tile_x, tile_y, cell_side_width, cell_side_height, 10, true, false);

                    // shadow off
                    r.shadowOffsetX = 0;
                    r.shadowOffsetY = 0;
                    r.shadowBlur = 0;

                    //console.log("task tile_x = " + tile_x + " tile_y = " + tile_y + " w = " + cell_side_width + " h = " + cell_side_height);

                    // drawn image if available
                    var img = document.getElementById("image_" + task.assigned_to);
                    if (img) {
                        r.drawImage(img, x * this.tile_width + this.tile_width_margin + 4, y * this.tile_height + this.tile_height_margin + 4, this.tile_width/4, this.tile_height/4);
                    }

                    // draw notification icon
                    // TODO: add logic to only display if new comment or status change
                    //console.log("datetime: " + Date.parse(task.updated_at) + " from: " + task.updated_at); 
                    var updated_at = Date.parse(task.updated_at);
                    console.log("task.id = " + task.id + " updated_at: " + updated_at + " last_sign_in_at: " + last_sign_in_at + " diff = " + (updated_at - last_sign_in_at));
                    if (img_alert && (updated_at > last_sign_in_at)) {
                        r.drawImage(img_alert, (x + 1) * this.tile_width - (this.tile_width_margin * 4), y * this.tile_height + (this.tile_height_margin) + 4, this.tile_width/4, this.tile_height/4);
                    }
                     
                    // add text for task name
                    r.fillStyle = "black";
                    r.font = "bold 60% sans-serif";
                    r.fillText(task.name, x * this.tile_width + (this.tile_width_margin * 2), y * this.tile_height + (this.tile_height_margin * 6), cell_side_width - (this.tile_width_margin * 2));

                    // draw progress bar
                    if (task_state in { Started: 1, Waiting: 1 }) {
                        r.strokeStyle = "black";
                        r.fillStyle = "black";
                        r.lineWidth = 1;
                        var progress_full_width = this.tile_width - (this.tile_height_margin * 4);
                        var progress = parseInt(task.percent_complete); 
                        if (progress > 0) progress /= 100;
                        var progress_adjusted_width = progress_full_width * progress;
                        r.strokeRect(x * this.tile_width + (this.tile_width_margin * 2), y * this.tile_height + (this.tile_height_margin * 6) + this.tile_height_margin/2, progress_full_width, this.tile_height/8);
                        r.fillRect(x * this.tile_width + (this.tile_width_margin * 2), y * this.tile_height + (this.tile_height_margin * 6) + this.tile_height_margin/2, progress_adjusted_width, this.tile_height/8);
                    }

                    var rect = [];
                    rect.x = tile_x;
                    rect.y = tile_y;
                    rect.w = cell_side_width;
                    rect.h = cell_side_height;
                    rect.matrix_x = task.matrix_x;
                    rect.matrix_y = task.matrix_y;
                    rect.id = task.id;
                    this.task_tiles.push(rect);
                }
                else {
                    r.strokeStyle = "#736F6E"; // gray
                    r.fillStyle = "#D0D0D0"; // light gray
                    r.roundRect(x * this.tile_width + this.tile_width_margin, y * this.tile_height + this.tile_height_margin, cell_side_width, cell_side_height);

                    var rect = [];
                    rect.x = x * this.tile_width + this.tile_width_margin;
                    rect.y = y * this.tile_height + this.tile_height_margin;
                    rect.w = cell_side_width;
                    rect.h = cell_side_height;
                    rect.matrix_x = x;
                    rect.matrix_y = y;
                    this.empty_tiles.push(rect);

                    // add default text 
                    r.fillStyle = "#736F6E";
                    r.font = "bold 110% sans-serif";
                    r.fillText("Double click in this square to create a new task", x * this.tile_width + (this.tile_width_margin * 2), y * this.tile_height + (this.tile_height_margin * 4), cell_side_width - (this.tile_width_margin * 2));
                }

            }
        }
        
    },

    collides: function(x, y) {
        var isCollision = false;

        console.log("collides = " + x + "," + y);

        // check task cells first
        var rects = this.task_tiles;
        for (var i = 0, len = rects.length; i < len; i++) {
            var left = rects[i].x, right = rects[i].x + rects[i].w;
            var top = rects[i].y, bottom = rects[i].y + rects[i].h;
            //console.log("task left = " + left + " right = " + right + " top = " + top + " bottom = " + bottom);
            if (right >= x && left <= x && bottom >= y && top <= y) {
                return rects[i];
            }
        }

        // check empty cells
        rects = this.empty_tiles;
        for (var i = 0, len = rects.length; i < len; i++) {
            var left = rects[i].x, right = rects[i].x + rects[i].w;
            var top = rects[i].y, bottom = rects[i].y + rects[i].h;
            //console.log("empty left = " + left + " right = " + right + " top = " + top + " bottom = " + bottom);
            if (right >= x && left <= x && bottom >= y && top <= y) {
                return rects[i];
            }
        }

        return isCollision;
    },

    //
    // event handlers
    //

    popup_task: function(rect) {
        var task_id = rect.id;
        var matrix_x = rect.matrix_x;
        var matrix_y = rect.matrix_y;

        $('<div align="left" style="width: 440px; height: 720px; overflow: hidden"><iframe src="/tasks/' 
          + task_id + '/edit?x=' + matrix_x + "&y=" + matrix_y 
          + '&iframe=true "width="440" frameborder="0" height="720"></iframe></d iv>').dialog({
            width: 440,
            height: 720,
            resizable: false,
            modal: true,
            title: 'Task Editor - Edit Task',
            close: function() { console.log("dialog closed"); elucio.get_tasks(); } 
        })

    },

    popup_add_task: function(rect) {
        var matrix_x = rect.matrix_x;
        var matrix_y = rect.matrix_y;

        $('<div align="left" style="width: 440px; height: 720px; overflow: hidden"><iframe src="/tasks/new?x='
          + matrix_x + "&y=" + matrix_y + '&iframe=true "width="440" frameborder="0" height="720"></iframe></div>').dialog({
            width: 440,
            height: 720,
            resizable: false,
            modal: true,
            title: 'Task Editor - New Task',
            close: function() { console.log("dialog closed"); elucio.get_tasks(); } 
        })
    },

    popup_new_project: function() {

        $('<div align="left" style="width: 440px; height: 720px; overflow: hidden"><iframe src="/projects/new?'
           + 'iframe=true "width="440" frameborder="0" height="720"></iframe></div>').dialog({
            width: 440,
            height: 720,
            resizable: false,
            modal: true,
            title: 'Project Editor - New Project',
            close: function() { console.log("dialog closed"); elucio.get_tasks(); }
        })
    },

    popup_delete_project: function() {

        $('<div>Delete project \'' + elucio.current_project_name + '\' and all associated tasks?</div>').dialog({ 
            width: 440,
            height: 240,  
            resizable: false,
            modal: true,
            title: 'Project Editor - Delete Project',
            buttons: {
                "Delete project": function() {
                    elucio.delete_project(elucio.current_project);
                    $(this).dialog("close");
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            }
        });
    },

    delete_project: function(project_id) {
        if (project_id) {
            $.ajax({
                    url: "http://" + window.location.host + "/projects/" + project_id,
	            dataType: "json",
                    async: false,
	            type: "POST",
	            processData: false,
	            contentType: "application/json",
	            beforeSend: function(xhr) { xhr.setRequestHeader("X-Http-Method-Override", "DELETE"); },
                    error: function() { },
                    sucess: function() { },
                    complete: function() { elucio.get_tasks(); },
            });

        }
    },

    // figure out the width and height of the project in cells
    get_project_matrix_size: function(projects, tasks) {
        var max_x = 0;
        var max_y = 0;

        var current_project = this.get_current_project(projects, tasks);

        for (var i = 0; i < tasks.length; i++) {

            if (tasks[i].task.project_id != current_project) {
                continue;
            }

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

        console.log("matrix size set to " + max_x + "," + max_y);

        return {x: max_x, y: max_y};
    },

    get_current_project: function(projects, tasks) {
        var project_id = $.Storage.get("current_project");

        console.log("found project in browser =  " + project_id);

        // check if that project still exists
        if (projects && project_id) {
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].project.id == project_id) {
                   this.current_project = project_id;
                   console.log("current_project =  " + project_id);
                   this.current_project_name = projects[i].project.name;
                   $("#project_name").text(elucio.current_project_name).button("refresh");
                   return project_id; 
                }
            }
        }

        // no project id or a stale id so pick the first good project id
        if (tasks[0]) { 
            project_id = tasks[0].task.project_id;
        }
        else {
            project_id = 0; // no projects or tasks found
        }

        console.log("current_project =  " + project_id);

        this.current_project = project_id;
        $.Storage.set("current_project", project_id.toString());

        for (var i =0; i < projects.length; i++) {
            if (projects[i].project.id == project_id) {
                this.current_project_name = projects[i].project.name;
                $("#project_name").text(elucio.current_project_name).button("refresh");
            }
        }

        return project_id;
    },

    get_next_project: function() {
        var current_project = elucio.current_project;
        var projects = elucio.projects;
        var new_project = null;
 
        if (projects) {
            for (var i = 0; i < projects.length; i++) {
               if (new_project == i) {
                   // this is the next project
                   elucio.current_project = projects[i].project.id;
                   elucio.current_project_name = projects[i].project.name;
                   $("#project_name").text(elucio.current_project_name).button("refresh");
                   $.Storage.set("current_project", projects[i].project.id.toString());
                   console.log("next project =  " + projects[i].project.id + " from " + current_project);
                   return projects[i].project.id;
               } 
               if (projects[i].project.id == current_project) {
                   new_project = i + 1;
               }
            } 
        }
    },

    get_previous_project: function() {
        var current_project = elucio.current_project;
        var projects = elucio.projects;
        var new_project = -1;

        if (projects) {
            for (var i = 0; i < projects.length; i++) {
               if (projects[i].project.id == current_project) {
                   // this is the previous project
                   if (new_project >= 0) {
                       elucio.current_project = projects[new_project].project.id;
                       elucio.current_project_name = projects[new_project].project.name;
                       $("#project_name").text(elucio.current_project_name).button("refresh");
                       $.Storage.set("current_project", projects[new_project].project.id.toString());
                       console.log("previous project =  " + projects[new_project].project.id + " from " + current_project);
                       return new_project;
                   }
               }
               new_project = i;
            }
        }
    },

    get_tasks: function() {
        jQuery.getJSON('/tasks.json' + '?' + Math.round(new Date().getTime()), function(data) {
            elucio.get_tasks_callback(data);
        });
    },

    get_tasks_callback: function(div, canvas_width, canvas_height, data) {
        elucio.setup(div, canvas_width, canvas_height, data);
    },

    toolbar: function() {
    	$("#project_name").button({
	}).css({ width: '200px', 'padding-top': '5px', 'padding-bottom': '5px' }).text(elucio.current_project_name).button("refresh");


    	$("#previous").button({
		text: false,
		icons: {
			primary: "ui-icon-triangle-1-w"
		}
	}).click(function() { elucio.get_previous_project(); $("#project_name").text(elucio.current_project_name).button("refresh"); elucio.draw(); });

	$("#next").button({
		text: false,
		icons: {
			primary: "ui-icon-triangle-1-e"
		}
	}).click(function() { elucio.get_next_project(); $("#project_name").text(elucio.current_project_name).button("refresh"); elucio.draw(); });

	$("#new").button({
		text: false,
		icons: {
			primary: "ui-icon-plusthick"
		}
	}).click(function() { elucio.popup_new_project(); });

	$("#zoomin").button({
		text: false,
		icons: {
			primary: "ui-icon-zoomin"
		}
	}).click(function() { elucio.zoom_view(-1); });

	$("#zoomout").button({
		text: false,
		icons: {
			primary: "ui-icon-zoomout"
		}
	}).click(function() { elucio.zoom_view(1); });

	$("#left").button({
		text: false,
		icons: {
			primary: "ui-icon-circle-arrow-w"
		}
	}).click(function() { elucio.scroll_left(); });

	$("#right").button({
		text: false,
		icons: {
			primary: "ui-icon-circle-arrow-e"
		}
	}).click(function() { elucio.scroll_right(); });

	$("#up").button({
		text: false,
		icons: {
			primary: "ui-icon-circle-arrow-n"
		}
	}).click(function() { elucio.scroll_up(); });

	$("#down").button({
		text: false,
		icons: {
			primary: "ui-icon-circle-arrow-s"
		}
	}).click(function() { elucio.scroll_down(); });

	$("#delete").button({
		text: false,
		icons: {
			primary: "ui-icon-trash"
		}
	}).click(function() { elucio.popup_delete_project(); });
    }

};

/**
 * Storage plugin
 *
 * Distributed under the MIT License
 *
 * Copyright (c) 2010 Dave Schindler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function($) {
	// Private data
	var isLS=typeof window.localStorage!=='undefined';
	// Private functions
	function wls(n,v){var c;if(typeof n==="string"&&typeof v==="string"){localStorage[n]=v;return true;}else if(typeof n==="object"&&typeof v==="undefined"){for(c in n){if(n.hasOwnProperty(c)){localStorage[c]=n[c];}}return true;}return false;}
	function wc(n,v){var dt,e,c;dt=new Date();dt.setTime(dt.getTime()+31536000000);e="; expires="+dt.toGMTString();if(typeof n==="string"&&typeof v==="string"){document.cookie=n+"="+v+e+"; path=/";return true;}else if(typeof n==="object"&&typeof v==="undefined"){for(c in n) {if(n.hasOwnProperty(c)){document.cookie=c+"="+n[c]+e+"; path=/";}}return true;}return false;}
	function rls(n){return localStorage[n];}
	function rc(n){var nn, ca, i, c;nn=n+"=";ca=document.cookie.split(';');for(i=0;i<ca.length;i++){c=ca[i];while(c.charAt(0)===' '){c=c.substring(1,c.length);}if(c.indexOf(nn)===0){return c.substring(nn.length,c.length);}}return null;}
	function dls(n){return delete localStorage[n];}
	function dc(n){return wc(n,"",-1);}

	/**
	* Public API
	* $.Storage - Represents the user's data store, whether it's cookies or local storage.
	* $.Storage.set("name", "value") - Stores a named value in the data store.
	* $.Storage.set({"name1":"value1", "name2":"value2", etc}) - Stores multiple name/value pairs in the data store.
	* $.Storage.get("name") - Retrieves the value of the given name from the data store.
	* $.Storage.remove("name") - Permanently deletes the name/value pair from the data store.
	*/
	$.extend({
		Storage: {
			set: isLS ? wls : wc,
			get: isLS ? rls : rc,
			remove: isLS ? dls :dc
		}
	});
})(jQuery);

// http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius, fill, stroke) {
  var small_side = 0;

  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 10;
  }

  if (width > height) {
      small_side = height;
  }
  else {
      small_side = width;
  }

  if (small_side < radius * 1.5) {
      radius = 0;
  }

  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  if (stroke) {
    this.stroke();
  }
  if (fill) {
    this.fill();
  }        
}
