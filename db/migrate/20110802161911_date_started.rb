class DateStarted < ActiveRecord::Migration
  def self.up
    add_column :tasks, :start_date, :datetime
  end

  def self.down
  end
end
