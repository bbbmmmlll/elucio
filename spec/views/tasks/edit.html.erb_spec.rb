require 'spec_helper'

describe "tasks/edit.html.erb" do
  before(:each) do
    @task = assign(:task, stub_model(Task,
      :owner => 1,
      :task_owner => 1,
      :status => "MyString",
      :description => "MyString",
      :public_flag => false,
      :group_flag => false,
      :send_email => false,
      :send_sms => false,
      :send_facebook => false,
      :api_key => "MyString",
      :project => nil
    ))
  end

  it "renders the edit task form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => tasks_path(@task), :method => "post" do
      assert_select "input#task_owner", :name => "task[owner]"
      assert_select "input#task_task_owner", :name => "task[task_owner]"
      assert_select "input#task_status", :name => "task[status]"
      assert_select "input#task_description", :name => "task[description]"
      assert_select "input#task_public_flag", :name => "task[public_flag]"
      assert_select "input#task_group_flag", :name => "task[group_flag]"
      assert_select "input#task_send_email", :name => "task[send_email]"
      assert_select "input#task_send_sms", :name => "task[send_sms]"
      assert_select "input#task_send_facebook", :name => "task[send_facebook]"
      assert_select "input#task_api_key", :name => "task[api_key]"
      assert_select "input#task_project", :name => "task[project]"
    end
  end
end
