class AddCurrentUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :current_project, :integer
    add_column :users, :current_task, :integer
  end

  def self.down
  end
end
