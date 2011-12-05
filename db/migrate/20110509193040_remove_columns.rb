class RemoveColumns < ActiveRecord::Migration
  def self.up
    remove_column :tasks, :project_id
    remove_column :comments, :task_id
  end

  def self.down
  end
end
