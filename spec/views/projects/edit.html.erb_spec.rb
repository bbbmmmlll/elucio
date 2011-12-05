require 'spec_helper'

describe "projects/edit.html.erb" do
  before(:each) do
    @project = assign(:project, stub_model(Project,
      :owner => 1,
      :status => "MyString",
      :description => "MyString",
      :public_flag => false,
      :group_flag => false,
      :send_email => false,
      :send_sms => false,
      :send_facebook => false,
      :api_key => "MyString",
      :user => nil
    ))
  end

  it "renders the edit project form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => projects_path(@project), :method => "post" do
      assert_select "input#project_owner", :name => "project[owner]"
      assert_select "input#project_status", :name => "project[status]"
      assert_select "input#project_description", :name => "project[description]"
      assert_select "input#project_public_flag", :name => "project[public_flag]"
      assert_select "input#project_group_flag", :name => "project[group_flag]"
      assert_select "input#project_send_email", :name => "project[send_email]"
      assert_select "input#project_send_sms", :name => "project[send_sms]"
      assert_select "input#project_send_facebook", :name => "project[send_facebook]"
      assert_select "input#project_api_key", :name => "project[api_key]"
      assert_select "input#project_user", :name => "project[user]"
    end
  end
end
