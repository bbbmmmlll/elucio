package com.elucio {
	import com.adobe.serialization.json.JSON;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	public final class Projects {
		private static var _instance:Projects = new Projects();
		
		[Bindable]
		public var projects:ArrayCollection = null;
		
		public function Projects() {
			if (_instance != null) {
				throw new Error("Projects can only be accessed through Projects.instance");
			}
			_instance = this;
			load_projects();
		}
		
		public static function get_instance():Projects {
			if (_instance == null) _instance = new Projects();
			return _instance;
		}
		
		public function get_projects():ArrayCollection {
			return projects;
		}
		
		public function load_projects():void {
			var url:String = "http://elucio.com/projects.json?" + new Date().getTime().toString();
			sendJSONRequest(url);			
		}
		
		public function sendJSONRequest(url:String):void {
			var jsonURLLoader:URLLoader = new URLLoader();
			var jsonURLRequest:URLRequest = new URLRequest();
			jsonURLRequest.url = url;
			jsonURLLoader.load(jsonURLRequest);
			jsonURLLoader.addEventListener(Event.COMPLETE, onJSONLoad);   
		}
		
		public function onJSONLoad(event:Event):void {
			trace("projects:onJSONLoad:" + String(event.target.data));
			var rawData:String = String(event.target.data);
			var arr:Array = (JSON.decode(rawData));			
			var narr:Array = new Array();
			
			trace("projects array length = " + arr.length);
			for (var i:int = 0; i < arr.length; i++) {
				for each (var value:Object in arr[i]) {
					trace("project value: " + value.name);
					narr.push(value);
				}
			}
			projects = new ArrayCollection(narr);
		}
		
		private function onJSONFault(event:FaultEvent):void {
			trace("onJSONFault Error:" + event.message);   
		}

	}
	
}