class DeleteTime < ActiveRecord::Migration
  def self.up
    remove_column :tasks, :time_due
  end

  def self.down
  end
end
