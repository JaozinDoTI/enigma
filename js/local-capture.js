let captureUrl = null;

function waitForFrame(video) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('camera-timeout')),8000);
    const ready=()=>{clearTimeout(timer);resolve();};
    video.addEventListener('loadeddata',ready,{once:true});
    video.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('camera-read-error'));},{once:true});
  });
}

export async function requestLocalCapture() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera-unavailable');
  let stream=null;
  try {
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
    const video=document.createElement('video');
    video.muted=true;
    video.playsInline=true;
    video.srcObject=stream;
    const ready=waitForFrame(video);
    await video.play();
    await ready;
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,video.videoWidth||640);
    canvas.height=Math.max(1,video.videoHeight||480);
    canvas.getContext('2d',{alpha:false})?.drawImage(video,0,0,canvas.width,canvas.height);
    const blob=await new Promise((resolve)=>canvas.toBlob(resolve,'image/jpeg',0.82));
    if (!blob) throw new Error('capture-failed');
    if (captureUrl) URL.revokeObjectURL(captureUrl);
    captureUrl=URL.createObjectURL(blob);
    video.srcObject=null;
    return {width:canvas.width,height:canvas.height};
  } finally {
    stream?.getTracks().forEach((track)=>track.stop());
  }
}

export function getLocalCaptureUrl() { return captureUrl; }

export function releaseLocalCapture() {
  if (captureUrl) URL.revokeObjectURL(captureUrl);
  captureUrl=null;
}
