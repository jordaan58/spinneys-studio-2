// Scanner owns only the barcode video; photography capture remains separate.
// The camera starts before any optional decoder is loaded.
let stream=null, timer=null, active=false, busy=false, detector=null, reader=null, canvas=null;
let token=0;
const CDN='https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js';
function loadDecoder(){
 if(window.ZXing?.MultiFormatReader && window.ZXing?.RGBLuminanceSource)return Promise.resolve(window.ZXing);
 return new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=CDN;s.async=true;
  s.onload=()=>window.ZXing?.MultiFormatReader && window.ZXing?.RGBLuminanceSource ? resolve(window.ZXing) : reject(new Error('ZXing decoder unavailable'));
  s.onerror=()=>reject(new Error('Decoder download failed; check internet access'));
  document.head.appendChild(s);
 });
}
function decodeFrame(video){
 const w=video.videoWidth,h=video.videoHeight;if(!w||!h)return null;
 if(!canvas)canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(video,0,0,w,h);
 const pixels=ctx.getImageData(0,0,w,h);
 const ZX=window.ZXing;
 const luminance=new ZX.RGBLuminanceSource(pixels.data,w,h);
 const bitmap=new ZX.BinaryBitmap(new ZX.HybridBinarizer(luminance));
 try{return reader.decode(bitmap).getText();}catch(e){
  const name=String(e?.name||'');const msg=String(e?.message||'');
  if(/NotFound|Checksum|Format|No MultiFormat Readers|not found/i.test(name+' '+msg))return null;
  throw e;
 }finally{reader.reset();}
}
export async function startScanner(video,onCode,onStatus){
 stopScanner(video);const myToken=++token;active=true;onStatus('Opening rear camera…');
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires HTTPS');
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});
  if(!active||token!==myToken){stream?.getTracks().forEach(t=>t.stop());stream=null;return false;}
  video.srcObject=stream;await video.play();
  if(!active||token!==myToken)return false;
  onStatus('Camera ready. Loading barcode reader…');
  // Decoder initialization cannot block the live camera preview.
  try{
   const ZX=await loadDecoder();if(!active||token!==myToken)return false;
   reader=new ZX.MultiFormatReader();
   const formats=[ZX.BarcodeFormat.EAN_13,ZX.BarcodeFormat.EAN_8,ZX.BarcodeFormat.UPC_A,ZX.BarcodeFormat.UPC_E,ZX.BarcodeFormat.CODE_128,ZX.BarcodeFormat.CODE_39,ZX.BarcodeFormat.ITF];
   const hints=new Map();hints.set(ZX.DecodeHintType.POSSIBLE_FORMATS,formats);hints.set(ZX.DecodeHintType.TRY_HARDER,true);reader.setHints(hints);
   onStatus('Scanning… Hold the complete barcode steady and allow the camera to focus.');
  }catch(e){
   // Optional native detection can still work without the external library.
   if('BarcodeDetector' in window){
    try{const supported=await BarcodeDetector.getSupportedFormats();const formats=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'].filter(f=>supported.includes(f));if(formats.length)detector=new BarcodeDetector({formats});}catch{}
   }
   if(!detector){onStatus('Camera works, but the barcode reader could not load: '+(e.message||e)+'. Manual entry remains available.');return true;}
   onStatus('Scanning using browser barcode detection…');
  }
  const scan=async()=>{
   if(!active||token!==myToken)return;
   if(!busy&&video.readyState>=2){busy=true;try{
    let code=null;
    if(reader)code=decodeFrame(video);
    else if(detector){const hits=await detector.detect(video);code=hits.find(x=>/^\d+$/.test(x.rawValue||''))?.rawValue||null;}
    if(code&&/^\d+$/.test(code)){onCode(code);stopScanner(video);return;}
   }catch(e){onStatus('Reader error: '+(e.message||e)+'. Camera remains available.');}finally{busy=false;}}
   if(active&&token===myToken)timer=setTimeout(scan,300);
  };scan();return true;
 }catch(e){onStatus('Camera unavailable: '+(e.message||e.name)+'. Enter barcode manually.');stopScanner(video);return false;}
}
export function stopScanner(video){active=false;token++;clearTimeout(timer);timer=null;busy=false;reader=null;detector=null;canvas=null;
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
 if(video){try{video.pause();video.srcObject=null;}catch{}}
}
