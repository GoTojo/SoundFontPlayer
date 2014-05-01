//
// soundfont_debug.js
//
function debugDumpPdta(pdta) {
	for (key in pdta.chunks) {
		var achunkinfo=pdta.chunks[key];
		var ptr=achunkinfo.datatop;
		var data="";
		for (i=0;i<achunkinfo.size;i++) {
			data+=buf[ptr++].toString(16);
		}
		console.log("key:"+key+",data:"+data);
	}
}

function debugShowPhdr(preset) {
	var phdr=preset.phdr;
	for (var i=0;i<phdr.length-1;i++) {
		console.log(phdr[i].preset+" "+phdr[i].name+":");
		debugShowPbag(preset,phdr[i].index,phdr[i+1].index);
	}
}

function debugShowPbag(preset,st,ed) {
	var pbag=preset.pbag;
	for (var i=st;i<ed;i++) {
		debugShowPgen(preset,pbag[i].genIndex,pbag[i+1].genIndex);
		debugShowPmod(preset,pbag[i].modIndex,pbag[i+1].modIndex);
	}
}

function debugShowPgen(preset,st,ed) {
	var pgen=preset.pgen;
	for (var i=st;i<ed;i++) {
		var op=pgen[i].op;
		var val=pgen[i].value;
		console.log(op+":"+eSFGenerator[op]+"="+val);
	}
}

function debugShowPmod(preset,st,ed) {

}