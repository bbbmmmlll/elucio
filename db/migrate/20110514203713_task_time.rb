class TaskTime < ActiveRecord::Migration
  def self.up
    remove_column :tasks, :due_date
    add_column :tasks, :date_due, :datetime
    add_column :tasks, :time_due, :datetime
  end

  def self.down
  end
end
