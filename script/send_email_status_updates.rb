#!/home/elucio/website/script/rails runner

#Task.find(:all).each { |t| puts t.name }
#Task.due_projects

task = Task.find(41)
puts task.assigned_to
puts task.owner

#@users = User.find(task.assigned_to, task.owner)
@users = User.where("id = ? OR id = ?", task.assigned_to, task.owner)
@users.each do |user|
  puts user.id
  puts user.email
end
