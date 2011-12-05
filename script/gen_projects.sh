rails generate scaffold Project owner:integer status:string description:string created:timestamp updated:timestamp public_flag:boolean group_flag:boolean send_email:boolean send_sms:boolean send_facebook:boolean api_key:string user:references

rails generate scaffold Task owner:integer task_owner:integer status:string description:string created:timestamp updated:timestamp public_flag:boolean group_flag:boolean send_email:boolean send_sms:boolean send_facebook:boolean api_key:string project:references

rails generate scaffold Comment owner:integer task_owner:integer commenter:string status:string body:text created:timestamp updated:timestamp public_flag:boolean group_flag:boolean task:references
