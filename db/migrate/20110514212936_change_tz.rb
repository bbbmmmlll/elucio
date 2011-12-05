class ChangeTz < ActiveRecord::Migration
  def self.up
    remove_column :users, :time_zone
    add_column :users, :time_zone, :string, {:default=>"Pacific Time (US & Canada)", :null=>false}
  end

  def self.down
  end
end
