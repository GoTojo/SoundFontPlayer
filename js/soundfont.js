//
// soundfont.js
//	

var listinfo = function() {
	this.type="";
	this.size=0;
	this.datatop=0;
	this.chunks=[];
};
var chunkinfo = function() {
	this.type="";
	this.datatop=0;
	this.size=0;
};

function Soundfont() {};

Soundfont.prototype = {
	// public
	getLists:function(buf) {
		var ptr=0;
		this.lists=[];
		this.property.init();
		// get and check
		if (String.fromCharCode(buf[ptr++],buf[ptr++],buf[ptr++],buf[ptr++]) != "RIFF") { 
			alert("can't find 'RIFF'"); 
			return; 
		}
		fileinfo.size = buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		console.log(fileinfo.size.toString(16));
		if (String.fromCharCode(buf[ptr++],buf[ptr++],buf[ptr++],buf[ptr++]) != "sfbk") { 
			alert("can't find 'sfbk'"); 
			return; 
		}
		do {
			var result=this.getListChunk(ptr);
			if (result.false) break;
			this.lists[result.listinfo.type]=result.listinfo;
			ptr=result.nextChunkTop;
		} while(ptr<fileinfo.size);
		for(key in this.lists) console.log(this.lists[key]); // check for debug
		// get property
		this.getProperty(buf);
		console.log(this.property);
		// get preset
	},
	getProperty:function(buf) {
		var ptr;
		var achunkinfo;
		achunkinfo=this.lists["INFO"].chunks["ifil"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			this.property.version=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		}
		achunkinfo=this.lists["INFO"].chunks["INAM"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.name=str;
		}
		achunkinfo=this.lists["INFO"].chunks["isng"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.engine=str;
		}
		achunkinfo=this.lists["INFO"].chunks["IENG"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.engineer=str;
		}
		achunkinfo=this.lists["INFO"].chunks["ICMT"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.comment=str;
		}
		achunkinfo=this.lists["INFO"].chunks["ICOP"];
		if (achunkinfo) {
			ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
		}
		this.property.copyright=str;
	},
	// private
	lists:[],
	property: {
		version:256,
		name:"hello world",
		engine:"",
		engineer:"",
		tools:"",
		comment:"",
		copyright:"",
		init:function() {
			this.version=0;
			this.name="";
			this.engine="",
			this.engineer="",
			this.tools="",
			this.comment="",
			this.copyright=""
		},
	},
	getListChunk:function(ptr) {
		var buf=fileinfo.buf;
		if (String.fromCharCode(buf[ptr++],buf[ptr++],buf[ptr++],buf[ptr++]) != "LIST") { 
			alert("illegal LIST chunk at 0x"+ptr.toString(16));
			return {result:false,list:undefined};
		}
		var alistinfo=new listinfo;
		alistinfo.size=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		alistinfo.type=String.fromCharCode(buf[ptr++],buf[ptr++],buf[ptr++],buf[ptr++]);
		alistinfo.datatop=ptr;
		var nextChunkTop=alistinfo.datatop-4+alistinfo.size;
		while (ptr<nextChunkTop) {
			var ainfo = this.getChunk(ptr);
			alistinfo.chunks[ainfo.info.type]=ainfo.info;
			ptr=ainfo.nextChunkTop;
		}
		return {result:true,listinfo:alistinfo,nextChunkTop:nextChunkTop};
	},
	getChunk:function(ptr) {
		var buf=fileinfo.buf;
		var ainfo = new chunkinfo;
		ainfo.type=String.fromCharCode(buf[ptr++],buf[ptr++],buf[ptr++],buf[ptr++]);
		ainfo.size=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		ainfo.datatop=ptr;
		return {info:ainfo,nextChunkTop:ainfo.datatop+ainfo.size};
	},
};
