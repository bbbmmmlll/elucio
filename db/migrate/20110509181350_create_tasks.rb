class CreateTasks < ActiveRecord::Migration
  def self.up
    create_table :tasks do |t|
      t.integer :owner
      t.integer :task_owner
      t.string :status
      t.string :description
      t.timestamp :created
      t.timestamp :updated
      t.boolean :public_flag
      t.boolean :group_flag
      t.boolean :send_email
      t.boolean :send_sms
      t.boolean :send_facebook
      t.string :api_key
      t.references :project

      t.timestamps
    end
  end

  def self.down
    drop_table :tasks
  end
end
