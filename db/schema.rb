# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20110802161911) do

  create_table "comments", :force => true do |t|
    t.integer  "owner"
    t.integer  "task_owner"
    t.string   "commenter"
    t.string   "status"
    t.text     "body"
    t.boolean  "public_flag"
    t.boolean  "group_flag"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "task_id",     :null => false
  end

  create_table "projects", :force => true do |t|
    t.integer  "owner"
    t.string   "status"
    t.string   "description"
    t.boolean  "public_flag"
    t.boolean  "group_flag"
    t.boolean  "send_email"
    t.boolean  "send_sms"
    t.boolean  "send_facebook"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "assigned_to",   :null => false
    t.string   "name",          :null => false
  end

  create_table "task_states", :force => true do |t|
    t.string   "state"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tasks", :force => true do |t|
    t.integer  "owner"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "project_id",                          :null => false
    t.string   "name",                                :null => false
    t.integer  "matrix_x"
    t.integer  "matrix_y"
    t.datetime "date_due"
    t.integer  "percent_complete", :default => 0
    t.text     "description"
    t.integer  "assigned_to"
    t.boolean  "public_flag",      :default => false
    t.boolean  "group_flag",       :default => false
    t.boolean  "send_email",       :default => false
    t.boolean  "send_facebook",    :default => false
    t.datetime "start_date"
  end

  create_table "users", :force => true do |t|
    t.string   "email",                               :default => "",                           :null => false
    t.string   "encrypted_password",   :limit => 128, :default => "",                           :null => false
    t.string   "password_salt",                       :default => "",                           :null => false
    t.string   "reset_password_token"
    t.string   "remember_token"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                       :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "api_key"
    t.string   "fb_image"
    t.string   "fb_username",                                                                   :null => false
    t.string   "first_name",                                                                    :null => false
    t.string   "last_name",                                                                     :null => false
    t.string   "time_zone",                           :default => "Pacific Time (US & Canada)", :null => false
    t.integer  "current_project"
    t.integer  "current_task"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
