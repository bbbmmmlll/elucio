class Task < ActiveRecord::Base
  has_many :comments

  def Task.due_projects
    @tasks = Task.where(["date_due < ?",  Time.new])
    @tasks.each do |task|
      @user = User.find(task.assigned_to)
      print task.name, task.date_due, "\n"
      TaskMailer.notify_task_due(@user, task).deliver
    end
  end

  def Task.notify_task_finished(task)

    print task.name, task.date_due, "\n"
      
    @users = User.where("id = ? OR id = ?", task.assigned_to, task.owner)
    @users.each do |user|
      TaskMailer.notify_task_finished(user, task).deliver
    end
  end

  def Task.notify_project_finished(task)

    print task.name, task.date_due, "\n"

    @users = User.where("id = ? OR id = ?", task.assigned_to, task.owner)
    @users.each do |user|
      TaskMailer.notify_project_finished(user, task).deliver
    end
  end

end
