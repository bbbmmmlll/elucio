class AddColumns < ActiveRecord::Migration
  def self.up
     add_column :users, :fb_image, :string
     add_column :users, :fb_username, :string, :null => false
     add_column :users, :first_name, :string, :null => false
     add_column :users, :last_name, :string, :null => false
  end

  def self.down
  end
end
