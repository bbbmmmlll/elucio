class ProjectsController < ApplicationController

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

  def set_current_project(project_id)
    current_user.current_project = project_id
    current_user.save
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

  # GET /projects
  # GET /projects.xml
  # GET /projects.json
  def index
    @projects = Project.where("owner = ? OR assigned_to = ?", current_user.id, current_user.id);

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @projects }
      format.json { render :json => @projects }
    end
  end

  # GET /projects/deck
  def deck
    @projects = Project.where("owner = ? OR assigned_to = ?", current_user.id, current_user.id);

    respond_to do |format|
      format.html # deck.html.erb
    end
  end

  # GET /projects/matrix
  def matrix
    @projects = Project.where("owner = ? OR assigned_to = ?", current_user.id, current_user.id);

    # create a default project if none exist
    if @projects.empty?
      @project = Project.new( :owner => current_user.id, :assigned_to => current_user.id, :name => "default")
      @project.save
    end

    @image_list = User.find_by_sql("SELECT users.id, users.fb_image FROM users INNER JOIN tasks ON users.id = tasks.assigned_to OR users.id = tasks.owner GROUP BY users.id")

    @image_list.each do |obj|
        puts obj.fb_image
    end

    respond_to do |format|
	      format.html # matrix.html.erb
	    end
	  end
	 
	  # GET /projects/1
	  # GET /projects/1.xml
	  # GET /projects/1.json
	  def show
	    # TODO: verify access first
	    @project = Project.find(params[:id])
	    set_current_project(@project.id)

	    respond_to do |format|
	      format.html # show.html.erb
	      format.xml  { render :xml => @project }
	      format.json { render :json => @projects }
	    end
	  end

	  # GET /projects/new
	  # GET /projects/new.xml
	  # GET /projects/new.json
	  def new
	    @project = Project.new
	    set_current_project(@project.id)
	    @users = User.find(:all) # bml: for drop down menu

	    respond_to do |format|
	      format.html # new.html.erb
	      format.xml  { render :xml => @project }
	      format.json { render :json => @projects }
	    end
	  end

	  # GET /projects/1/edit
	  def edit
	    # TODO: verify access
	    @users = User.find(:all) # bml: for drop down menu
	    @project = Project.find(params[:id])
	    set_current_project(@project.id)
	  end

	  # POST /projects
	  # POST /projects.xml
	  # POST /projects.json
	  def create
	    @project = Project.new(params[:project])
	    set_current_project(@project.id)

	    respond_to do |format|
	      if @project.save
		if params["iframe"] == "true"
		  format.html { redirect_to("/project_thanks", :notice => 'Project was successfully created.') }
		else
		  format.html { redirect_to(@project, :notice => 'Project was successfully created.') }
		end
		format.xml  { render :xml => @project, :status => :created, :location => @project }
		format.json { render :json => @project, :status => :created, :location => @project }
	      else
		format.html { render :action => "new" }
		format.xml  { render :xml => @project.errors, :status => :unprocessable_entity }
		format.json { render :json => @project.errors, :status => :unprocessable_entity }
	      end
	    end
	  end

  # PUT /projects/1
  # PUT /projects/1.xml
  # PUT /projects/1.json
  def update
    # TODO: verify access
    @project = Project.find(params[:id])
    set_current_project(@project.id)

    respond_to do |format|
      if @project.update_attributes(params[:project])
        if params["iframe"] == "true"
          format.html { redirect_to("/project_thanks", :notice => 'Project was successfully created.') }
        else
          format.html { redirect_to(@project, :notice => 'Project was successfully updated.') }
        end
        format.xml  { head :ok }
        format.json  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @project.errors, :status => :unprocessable_entity }
        format.json { render :json => @project.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.xml
  # DELETE /projects/1.json
  def destroy
    # TODO: verify access
    # TODO: delete associated tasks 
    @project = Project.find(params[:id])
    @project.destroy

    respond_to do |format|
      format.html { redirect_to("/project_thanks", :notice => 'Project was successfully deleted.') }
      format.xml  { head :ok }
      format.json { head :ok }
    end
  end
end
