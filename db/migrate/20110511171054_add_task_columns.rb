class AddTaskColumns < ActiveRecord::Migration
  def self.up
    add_column :tasks, :matrix_x, :integer
    add_column :tasks, :matrix_y, :integer
  end

  def self.down
  end
end
