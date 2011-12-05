require 'spec_helper'

describe "comments/new.html.erb" do
  before(:each) do
    assign(:comment, stub_model(Comment,
      :owner => 1,
      :task_owner => 1,
      :commenter => "MyString",
      :status => "MyString",
      :body => "MyText",
      :public_flag => false,
      :group_flag => false,
      :task => nil
    ).as_new_record)
  end

  it "renders new comment form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => comments_path, :method => "post" do
      assert_select "input#comment_owner", :name => "comment[owner]"
      assert_select "input#comment_task_owner", :name => "comment[task_owner]"
      assert_select "input#comment_commenter", :name => "comment[commenter]"
      assert_select "input#comment_status", :name => "comment[status]"
      assert_select "textarea#comment_body", :name => "comment[body]"
      assert_select "input#comment_public_flag", :name => "comment[public_flag]"
      assert_select "input#comment_group_flag", :name => "comment[group_flag]"
      assert_select "input#comment_task", :name => "comment[task]"
    end
  end
end
