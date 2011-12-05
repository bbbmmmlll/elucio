package com.elucio {	
	import com.adobe.serialization.json.JSON;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	
	public class Tasks {
			private static var _instance:Tasks = new Tasks();
			
			[Bindable]
			public var tasks:ArrayCollection = null;
	
			public function Tasks() {
				if (_instance != null) {
					throw new Error("Tasks can only be accessed through Tasks.instance");
				}
				_instance = this;
				load_tasks();
			}
			
			public static function get_instance():Tasks {
				if (_instance == null) _instance = new Tasks();
				return _instance;
			}
			
			public function get_tasks():ArrayCollection {
				return tasks;
			}
			
			public function load_tasks():void {
				var url:String = "http://elucio.com/tasks.json?" + new Date().getTime().toString();
				sendJSONRequest(url);
			}			
			
			public function sendJSONRequest(url:String):void {
				var jsonURLLoader:URLLoader = new URLLoader();
				var jsonURLRequest:URLRequest = new URLRequest();
				jsonURLRequest.url = url;
				jsonURLLoader.load(jsonURLRequest);
				jsonURLLoader.addEventListener(Event.COMPLETE, onJSONLoad);   
			}
			
			private function onJSONLoad(event:Event):void {
				trace("tasks:onJSONLoad:" + String(event.target.data));
				var rawData:String = String(event.target.data);
				var arr:Array = (JSON.decode(rawData));			
				var narr:Array = new Array();
				
				trace("tasks array length = " + arr.length);
				for (var i:int = 0; i < arr.length; i++) {
					for each (var value:Object in arr[i]) {
						trace("task value: " + value.name);
						narr.push(value);
					}
				}
				tasks = new ArrayCollection(narr);
			}
			
			private function onJSONFault(event:FaultEvent):void {
				trace("onJSONFault Error:" + event.message);   
			}

		}	

}