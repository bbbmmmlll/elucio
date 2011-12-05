class SetNoteDefaults < ActiveRecord::Migration
  def self.up
    remove_column :tasks, :public_flag
    remove_column :tasks, :group_flag
    remove_column :tasks, :send_email
    remove_column :tasks, :send_facebook
    remove_column :tasks, :send_sms
    add_column :tasks, :public_flag, :boolean, :default => 0
    add_column :tasks, :group_flag, :boolean, :default => 0
    add_column :tasks, :send_email, :boolean, :default => 0
    add_column :tasks, :send_facebook, :boolean, :default => 0
  end

  def self.down
  end
end
