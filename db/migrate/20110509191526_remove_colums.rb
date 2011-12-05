class RemoveColums < ActiveRecord::Migration
  def self.up
    remove_column :projects, :created
    remove_column :projects, :updated
    remove_column :projects, :api_key
    remove_column :projects, :user_id
    remove_column :tasks, :created
    remove_column :tasks, :updated
    remove_column :comments, :created
    remove_column :comments, :updated
    add_column    :users, :api_key, :string
  end

  def self.down
  end
end
