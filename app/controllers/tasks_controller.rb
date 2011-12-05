class TasksController < ApplicationController

  before_filter :require_login

  def require_login
    unless logged_in?
      flash[:error] = "You must be logged in to access this section"
      authenticate_user!
    end
  end

  def logged_in?
    !!current_user
  end

  before_filter :set_timezone

  def set_timezone
    Time.zone = current_user.time_zone || 'Pacific Time (US & Canada)'
  end

  layout :determine_layout

  def determine_layout
     if params["iframe"] == "true"
       "brief"
     else
       "application"
     end
  end

  def thanks
    render :layout => "brief"
  end

  def update_task_states(tasks)
    # this is really really not optimized
    project_ids = {};
    # loop by tasks.project_id and by tasks.matrix_x
    # get list of project_ids
    max_x = 0;
    for task in @tasks do
      if !project_ids[task.project_id] or project_ids[task.project_id] < task.matrix_x
        project_ids[task.project_id] = task.matrix_x; 
      end
      # make sure percent_complete and status match
      if task.percent_complete >= 100 or task.status == 'Finished'
        if task.percent_complete < 100 or task.status != 'Finished'
          # TODO: notify
          task.percent_complete = 100;
          task.status = 'Finished';
          puts "loop 1 task id #{task.id} is Finished"
          task.update_attributes(params[:task])
          Task.notify_task_finished(task);
        end
      end
      if task.matrix_x > max_x
         max_x = task.matrix_x;
      end
    end

    puts "max_x = #{max_x}\n";

    # TODO: optimize
    project_ids.each do|project_id,dx|
      finished = 0;
      fully_finished = 0;
      last_unfinished = -1;
      for x in 0..max_x
        #puts "project_id found #{project_id} #{x}\n";  
        puts "x = #{x}\n";
        for task in @tasks do
          if task.project_id == project_id and task.matrix_x == x
            puts "task match: id = #{task.id} x = #{x} finished = #{finished} fully_finished = #{fully_finished} last_unfinished = #{last_unfinished}\n";  

            if task.percent_complete >= 100 or task.status == 'Finished'
              if fully_finished == x and last_unfinished == -1
                finished = x + 1;
                fully_finished = finished;
              end
            end

            if task.status != 'Finished' and task.matrix_x == finished and last_unfinished <= x
              if task.status != 'Started' and task.status != 'Finished'
                puts "task id #{task.id} is Started"
                # TODO: notify
                task.status = 'Started';
                task.update_attributes(params[:task])
              end
            end            

            if task.status != 'Finished' and last_unfinished == -1  # keep the lowest column with an unfished task
              puts "found unfinished task id #{task.id} at x = #{x}"
              last_unfinished = x;
            end

          end
        end
      end
    end
  end

  # GET /tasks
  # GET /tasks.xml
  # GET /tasks.json
  def index
    @tasks = Task.where("owner = ? OR assigned_to = ?", current_user.id, current_user.id);
    update_task_states(@tasks);

    @projects = Project.where("owner = ? OR assigned_to = ?", current_user.id, current_user.id);
    @data = {};
    @data["tasks"] = @tasks;
    @data["projects"] = @projects;
    @data["last_sign_in_at"] = current_user.last_sign_in_at 

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @data }
      format.json { render :json => @data }
    end
  end

  # GET /tasks/1
  # GET /tasks/1.xml
  # GET /tasks/1.json
  def show
    @task = Task.find(params[:id])
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @task }
      format.json { render :json => @task }
    end
  end

  # GET /tasks/new
  # GET /tasks/new.xml
  # GET /tasks/new.json
  def new
    @task = Task.new
    @projects = Project.find(:all) # bml: for drop down menu
    @users = User.find(:all) # bml: for drop down menu
    @task_states = TaskStates.find(:all) # bml: for drop down menu

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @task }
      format.json { render :json => @task }
    end
  end

  # GET /tasks/1/edit
  def edit
    @projects = Project.find(:all) # bml: for drop down menu
    @users = User.find(:all) # bml: for drop down menu
    @task = Task.find(params[:id])
    @task_states = TaskStates.find(:all) # bml: for drop down menu
  end

  # POST /tasks
  # POST /tasks.xml
  # POST /tasks.json
  def create

    if !params[:project_id]
      @project = Project.where(:name => "default").first
      #set_current_project(@project.id)
      params[:task][:project_id] = @project.id
    end

    @task = Task.new(params[:task])

    respond_to do |format|
      if @task.save
        if params["iframe"] == "true"
          format.html { redirect_to("/task_thanks", :notice => 'Task was successfully created.') }
        else
          format.html { redirect_to(@task, :notice => 'Task was successfully created.') }
        end
        format.xml  { render :xml => @task, :status => :created, :location => @task }
        format.json { render :json => @task, :status => :created, :location => @task }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @task.errors, :status => :unprocessable_entity }
        format.json { render :json => @task.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /tasks/1
  # PUT /tasks/1.xml
  # PUT /tasks/1.json
  def update
    @task = Task.find(params[:id])

    respond_to do |format|
      if @task.update_attributes(params[:task])
        if params["iframe"] == "true"
          format.html { redirect_to("/task_thanks", :notice => 'Task was successfully created.') }
        else
          format.html { redirect_to(@task, :notice => 'Task was successfully created.') }
        end
        format.xml  { head :ok }
        format.json { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @task.errors, :status => :unprocessable_entity }
        format.json { render :json => @task.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.xml
  # DELETE /tasks/1.json
  def destroy
    @task = Task.find(params[:id])
    @task.destroy

    respond_to do |format|
      format.html { redirect_to(tasks_url) }
      format.xml  { head :ok }
      format.json { head :ok }
    end
  end
end
