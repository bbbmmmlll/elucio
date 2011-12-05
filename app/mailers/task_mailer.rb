class TaskMailer < ActionMailer::Base
  default :from => "\"elucio notification\" <notify@elucio.com>"

  def notify_task_due(user, task)
    @task = task;
    mail(:to => user.email, :subject => "You have a task that is due")
    print "Sending: " + user.email + "\n"
  end

  def notify_task_finished(user, task)
    @task = task;
    mail(:to => user.email, :subject => "A task has been finished")
    print "Sending: " + user.email + "\n"
  end

  def notify_project_finished(user, task)
    @task = task;
    mail(:to => user.email, :subject => "A project has been finished")
    print "Sending: " + user.email + "\n"
  end

end
