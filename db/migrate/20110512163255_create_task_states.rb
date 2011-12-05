class CreateTaskStates < ActiveRecord::Migration
  def self.up
    create_table :task_states do |t|
      t.string :state

      t.timestamps
    end
  end

  def self.down
    drop_table :task_states
  end
end
