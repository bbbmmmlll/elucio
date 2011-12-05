class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.integer :owner
      t.integer :task_owner
      t.string :commenter
      t.string :status
      t.text :body
      t.timestamp :created
      t.timestamp :updated
      t.boolean :public_flag
      t.boolean :group_flag
      t.references :task

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
