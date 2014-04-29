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
		console.log(this.preset);
		//for (key in this.lists["pdta"].chunks) {
		//	var achunkinfo=this.lists["pdta"].chunks[key];
		//	var ptr=achunkinfo.datatop;
		//	var data="";
		//	for (i=0;i<achunkinfo.size;i++) {
		//		data+=buf[ptr++].toString(16);
		//	}
		//	console.log("key:"+key+",data:"+data);
		//}
		this.getPreset(buf);
	},
	getProperty:function(buf) {
		this.property.init();
		var achunkinfo;
		achunkinfo=this.lists["INFO"].chunks["ifil"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			this.property.version=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		}
		achunkinfo=this.lists["INFO"].chunks["INAM"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.name=str;
		}
		achunkinfo=this.lists["INFO"].chunks["isng"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.engine=str;
		}
		achunkinfo=this.lists["INFO"].chunks["IENG"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.engineer=str;
		}
		achunkinfo=this.lists["INFO"].chunks["ICMT"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
			this.property.comment=str;
		}
		achunkinfo=this.lists["INFO"].chunks["ICOP"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var str="";
			for(i=0;i<achunkinfo.size;i++) { 
				str+=String.fromCharCode(buf[ptr++]); 
			}
		}
		this.property.copyright=str;
	},
	getPreset: function(buf) {
		this.preset.init();
		var pdta=this.lists["pdta"];
		var achunkinfo;
		var str="";
		// header The Preset Headers
		achunkinfo=pdta.chunks["phdr"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			var phdr=this.preset.phdr;
			for(i=0;i<20;i++) {
				phdr.name+=String.fromCharCode(buf[ptr++]);
			}
			phdr.preset=buf[ptr++]+(buf[ptr++]<<8);
			phdr.bank=buf[ptr++]+(buf[ptr++]<<8);
			phdr.index=buf[ptr++]+(buf[ptr++]<<8);
			phdr.library=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
			phdr.genre=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
			phdr.morphology=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
		}
		// pbag The Preset Index list
		achunkinfo=pdta.chunks["pbag"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var genIndex=buf[ptr++]+(buf[ptr++]<<8);
				var modIndex=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.pbag.push({genIndex:genIndex,modIndex:modIndex});				
			}
		}
		// pmod The Preset Modulator list
		achunkinfo=pdta.chunks["pmod"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var modSrc=buf[ptr++]+(buf[ptr++]<<8);
				var modDest=buf[ptr++]+(buf[ptr++]<<8);
				var modAmount=buf[ptr++]+(buf[ptr++]<<8);
				var modAmountSrc=buf[ptr++]+(buf[ptr++]<<8);
				var ModTarnsform=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.pmod.push(
					{modSrc:modSrc,
					modDest:modDest,
					modAmount:modAmount,
					modAmountSrc:modAmountSrc,
					ModTarnsform:ModTarnsform
					});							
			}
		}
		// pgen The Preset Generator list
		achunkinfo=pdta.chunks["pgen"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var lo=buf[ptr++];
				var hi=buf[ptr++];
				var amount=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.pgen.push({rangeLo:lo,rangeHi:hi,amount:amount});				
			}
		}		
		// inst The Instrument Names and Indices
		achunkinfo=pdta.chunks["inst"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var str="";
				for(i=0;i<20;i++) {
					str+=String.fromCharCode(buf[ptr++]); 
				}
				var index=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.inst.push({name:str,index:index});
			}
		}
		// ibag The Instrument Index list
		achunkinfo=pdta.chunks["ibag"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var genIndex=buf[ptr++]+(buf[ptr++]<<8);
				var modIndex=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.ibag.push({genIndex:genIndex,modIndex:modIndex});				
			}
		}		
		// igen The Instrument Generator list
		achunkinfo=pdta.chunks["igen"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var lo=buf[ptr++];
				var hi=buf[ptr++];
				var amount=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.igen.push({rangeLo:lo,rangeHi:hi,amount:amount});				
			}
		}		
		// imod The Instrument Modulator list
		achunkinfo=pdta.chunks["imod"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var modSrc=buf[ptr++]+(buf[ptr++]<<8);
				var modDest=buf[ptr++]+(buf[ptr++]<<8);
				var modAmount=buf[ptr++]+(buf[ptr++]<<8);
				var modAmountSrc=buf[ptr++]+(buf[ptr++]<<8);
				var ModTarnsform=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.imod.push(
					{modSrc:modSrc,
					modDest:modDest,
					modAmount:modAmount,
					modAmountSrc:modAmountSrc,
					ModTarnsform:ModTarnsform
					});							
			}
		}
		// shdr The Sample Headers
		achunkinfo=pdta.chunks["shdr"];
		if (achunkinfo) {
			var ptr=achunkinfo.datatop;
			while (ptr<achunkinfo.datatop+achunkinfo.size) {
				var name="";
				for(i=0;i<20;i++) {
					name+=String.fromCharCode(buf[ptr++]); 
				}
				var st=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
				var ed=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
				var stlp=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
				var edlp=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
				var rate=buf[ptr++]+(buf[ptr++]<<8)+(buf[ptr++]<<16)+(buf[ptr++]<<24);
				var orgpitch=buf[ptr++];
				var pitchCorrection=buf[ptr++];
				var link=buf[ptr++]+(buf[ptr++]<<8);
				var type=buf[ptr++]+(buf[ptr++]<<8);
				this.preset.shdr.push(
					{
						start:st,
						end:ed,
						startLoop:stlp,
						endLoop:edlp,
						sampleRate:rate,
						originalPitch:orgpitch,
						pitchCorrection:pitchCorrection,
						sampleLink:link,
						sampleType:type
					});
			}
		}
	},
	// private
	lists:[],
	property: {
		version:0,
		name:"",
		engine:"",
		engineer:"",
		tools:"",
		comment:"",
		copyright:"",
		init:function() {
			this.version=0;
			this.name="";
			this.engine="";
			this.engineer="";
			this.tools="";
			this.comment="";
			this.copyright="";
		}
	},
	preset: {
		inst:[], // {name:str,index:index}
		pbag:[], // {rangeLo:lo,rangeHi:hi,amount:amount}
		pgen:[], // {genIndex:genIndex,modIndex:modIndex}
		phdr:{name:"",preset:0,bank:0,index:0,library:0,genre:0,morphology:0},
		pmod:[], // {modDest:,modDest:,modAmount:,modAmountSrc:,ModTarnsform:}
		ibag:[], // {genIndex:0,modIndex:0}
		imod:[], // {modDest:,modDest:,modAmount:,modAmountSrc:,ModTarnsform:}
		igen:[], // {genIndex:genIndex,modIndex:modIndex}
		shdr:[],
		init:function() {
			ibag=[];
			igen=[];
			imod=[];
			inst=[];
			pbag=[{genNdx:0,modNdx:0}];
			pgen=[];
			phdr={name:"",bank:0,preset:0,index:0,library:0,genre:0,morphology:0};
			pmod=[];
			shdr=[];
		}
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
