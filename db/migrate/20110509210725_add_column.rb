class AddColumn < ActiveRecord::Migration
  def self.up
    add_column :projects, :name, :string, :null => false
    add_column :tasks, :name, :string, :null => false
  end

  def self.down
  end
end
