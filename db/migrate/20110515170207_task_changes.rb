class TaskChanges < ActiveRecord::Migration
  def self.up
    add_column :tasks, :percent_complete, :integer, :default => 0
    remove_column :tasks, :description
    add_column :tasks, :description, :text
    remove_column :tasks, :task_owner
    add_column :tasks, :assigned_to, :integer
  end

  def self.down
  end
end
