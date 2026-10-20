// Independent scanner module. Never owns the photography camera.
let stream=null,timer=null,detector=null,active=false,busy=false;
export async function startScanner(video,onCode,onStatus){stopScanner(video);active=true;onStatus('Opening rear camera…');try{
 if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires HTTPS and a compatible browser');
 if(!('BarcodeDetector' in window)){onStatus('Automatic scanning is not supported by this browser. Enter the barcode manually.');active=false;return false;}
 const supported=await BarcodeDetector.getSupportedFormats();const formats=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'].filter(f=>supported.includes(f));if(!formats.length){onStatus('No supported supermarket barcode formats. Enter manually.');active=false;return false;}
 detector=new BarcodeDetector({formats});
 stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});if(!active){stream.getTracks().forEach(t=>t.stop());stream=null;return false;}
 video.srcObject=stream;await video.play();onStatus('Point the camera at the barcode. Manual entry is also available.');
 const scan=async()=>{if(!active)return;if(!busy&&video.readyState>=2){busy=true;try{const hits=await detector.detect(video);const found=hits.find(h=>/^\d+$/.test(h.rawValue||''));if(found){onCode(found.rawValue);stopScanner(video);return;}}catch(e){onStatus('Scanner could not read the frame. Manual entry remains available.');}finally{busy=false;}}if(active)timer=setTimeout(scan,220);};scan();return true;
 }catch(e){onStatus('Camera unavailable: '+(e.message||e.name)+'. Enter barcode manually.');stopScanner(video);return false;}}
export function stopScanner(video){active=false;clearTimeout(timer);timer=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if(video){video.pause();video.srcObject=null;}}
