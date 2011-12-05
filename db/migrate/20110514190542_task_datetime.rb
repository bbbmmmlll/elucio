class TaskDatetime < ActiveRecord::Migration
  def self.up
    add_column :tasks, :due_date, :datetime
  end

  def self.down
  end
end
