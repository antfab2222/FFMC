import {useEffect,useRef,useState} from 'react';
import {FileUp,FileText,CheckCircle2} from 'lucide-react';
import {supabase} from './lib/backend';
import {toast} from 'sonner';

type Props={onImported?:()=>void};
type Report={id:string;file_name:string;uploaded_at:string;status:string;analysis:any};

export default function MeetingReportImport({onImported}:Props){
 const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[reports,setReports]=useState<Report[]>([]);
 async function load(){if(!supabase)return;const {data}=await supabase.from('ca_meeting_reports').select('id,file_name,uploaded_at,status,analysis').order('uploaded_at',{ascending:false}).limit(8);setReports((data||[]) as Report[])}
 useEffect(()=>{load()},[]);
 async function upload(file?:File){
  if(!file||!supabase)return;
  if(file.type!=='application/pdf'){toast.error('Choisissez un fichier PDF.');return}
  if(file.size>15*1024*1024){toast.error('PDF trop volumineux (15 Mo maximum).');return}
  setBusy(true);
  try{
   const {data:{user}}=await supabase.auth.getUser();if(!user)throw Error('Connexion expirée.');
   const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'-');const path=user.id+'/'+Date.now()+'-'+safe;
   const up=await supabase.storage.from('ca-meeting-reports').upload(path,file,{contentType:'application/pdf',upsert:false});if(up.error)throw up.error;
   const ins=await supabase.from('ca_meeting_reports').insert({file_name:file.name,storage_path:path,uploaded_by:user.id,status:'À analyser'}).select('id').single();
   if(ins.error){await supabase.storage.from('ca-meeting-reports').remove([path]);throw ins.error}
   toast.success('Compte rendu PDF déposé.');await load();onImported?.();
  }catch(e){toast.error(e instanceof Error?e.message:'Import impossible.')}finally{setBusy(false);if(input.current)input.current.value=''}
 }
 return <section className="meeting-import">
  <div className="section-head"><div><h2>Comptes rendus PDF</h2><p className="muted">Dépose le PDF original ici. Il reste privé dans l’espace CA et sera préparé pour analyse.</p></div>
  <button className="primary" disabled={busy} onClick={()=>input.current?.click()}><FileUp size={18}/>{busy?'Import…':'Importer un PDF'}</button></div>
  <input ref={input} hidden type="file" accept="application/pdf,.pdf" onChange={e=>upload(e.target.files?.[0])}/>
  {reports.length>0&&<div className="cards">{reports.map(r=><div className="record" key={r.id}><div className="record-top"><span className="badge">{r.status}</span>{r.status==='Analysé'?<CheckCircle2 size={17}/>:<FileText size={17}/>}</div><h3>{r.file_name}</h3><p>{r.analysis?.summary||'PDF conservé — analyse à venir.'}</p><div className="record-bottom"><span>Compte rendu CA</span><span>{new Date(r.uploaded_at).toLocaleDateString('fr-FR')}</span></div></div>)}</div>}
 </section>
}