class CreateProjects < ActiveRecord::Migration
  def self.up
    create_table :projects do |t|
      t.integer :owner
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
      t.references :user

      t.timestamps
    end
  end

  def self.down
    drop_table :projects
  end
end
