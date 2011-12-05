class References < ActiveRecord::Migration
  def self.up
    add_column :projects, :user_id, :integer, :null => false
    add_column :tasks, :project_id, :integer, :null => false
    add_column :comments, :task_id, :integer, :null => false 
  end

  def self.down
  end
end
