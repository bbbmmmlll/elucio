class MvProjectsUserId < ActiveRecord::Migration
  def self.up
    rename_column :projects, :user_id, :assigned_to
  end

  def self.down
  end
end
