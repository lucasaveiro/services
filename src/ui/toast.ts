type Kind = "success"|"error";
let inited=false;
function ensureRoot(){
if(inited) return;
const root=document.createElement("div");
root.id="toast-root";
Object.assign(root.style,{
position:"fixed", left:"50%", bottom:"16px", transform:"translateX(-50%)",
display:"grid", gap:"8px", zIndex:"9999", pointerEvents:"none"
});
document.body.appendChild(root); inited=true;
}
export function showToast(msg:string, kind:Kind="success"){
ensureRoot();
const el=document.createElement("div");
Object.assign(el.style,{
background: kind==="success"?"#1a7f37":"#b42318",
color:"#fff", padding:"10px 12px", borderRadius:"6px", minWidth:"200px",
boxShadow:"0 2px 8px rgba(0,0,0,0.2)", fontSize:"14px", pointerEvents:"auto"
});
el.textContent=msg;
document.getElementById("toast-root")!.appendChild(el);
setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .2s"; }, 2600);
setTimeout(()=> el.remove(), 3000);
}
export const toastSuccess=(m:string)=>showToast(m,"success");
export const toastError=(m:string)=>showToast(m,"error");