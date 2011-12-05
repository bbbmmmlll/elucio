class TimeZone < ActiveRecord::Migration
  def self.up
    add_column :users, :time_zone, :string
  end

  def self.down
  end
end
