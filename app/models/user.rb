class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :api_key, :fb_image, :first_name, :last_name, :fb_username, :password_confirmation, :remember_me

  def self.find_for_facebook_oauth(access_token, signed_in_resource=nil)
    data = access_token['extra']['user_hash']
    if user = User.find_by_email(data["email"])
      user
    else # Create an user with a stub password. 
      fb_image = "http://graph.facebook.com/#{data["username"]}/picture?type=square"
      User.create!(:email => data["email"], :password => Devise.friendly_token[0,20], :api_key => UUIDTools::UUID.random_create.to_s,
        :fb_image => fb_image, :first_name => data["first_name"], :last_name => data["last_name"], :fb_username => data["username"])
    end
  end

  has_many :projects
  has_many :tasks

end
