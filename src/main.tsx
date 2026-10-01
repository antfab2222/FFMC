import React,{Component,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Session} from '@supabase/supabase-js';
import {ShieldCheck,LogIn,LogOut} from 'lucide-react';
import {configured,supabase,SESSION_LOST_EVENT} from './lib/backend';
import Dashboard from './Dashboard';
import MemberPortal from './MemberPortal';
import VoltigeursPortal from './VoltigeursPortal';
import './styles.css';
class GlobalErrorBoundary extends Component<{children:React.ReactNode},{error:Error|null,info:string}>{
 state={error:null as Error|null,info:''};
 static getDerivedStateFromError(error:Error){return {error};}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('FFMC UI crash',error,info);this.setState({info:info.componentStack||''});}
 render(){if(!this.state.error)return this.props.children;return <main style={{minHeight:'100vh',padding:'32px',fontFamily:'system-ui',background:'#f7f7f4',color:'#171717'}}><div style={{maxWidth:900,margin:'40px auto',background:'white',padding:28,borderRadius:18,border:'1px solid #ddd'}}><p style={{fontWeight:800,color:'#176b3a'}}>FFMC 06 · DIAGNOSTIC</p><h1>Le site a rencontré une erreur d’affichage</h1><p>Copie ou prends une photo du bloc ci-dessous : il indique précisément le composant qui bloque.</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:16,background:'#111',color:'#fff',borderRadius:12,maxHeight:'50vh',overflow:'auto'}}>{this.state.error.name}: {this.state.error.message}{this.state.error.stack?'\\n\\n'+this.state.error.stack:''}{this.state.info?'\\n\\nComposants React :'+this.state.info:''}</pre><button onClick={()=>location.reload()} style={{padding:'12px 18px',fontWeight:800,borderRadius:10,cursor:'pointer'}}>Recharger la page</button></div></main>}}
window.addEventListener('error',e=>console.error('FFMC global error',e.error||e.message));
window.addEventListener('unhandledrejection',e=>console.error('FFMC unhandled rejection',e.reason));
function App(){const [session,setSession]=useState<Session|null>(null),[checking,setChecking]=useState(configured),[member,setMember]=useState(false),[role,setRole]=useState('membre'),[permissions,setPermissions]=useState<string[]>([]),[preview,setPreview]=useState(false),[previewOpen,setPreviewOpen]=useState(false),[previewPermissions,setPreviewPermissions]=useState<string[]>([]),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[notice,setNotice]=useState(''),[sending,setSending]=useState(false),[fault,setFault]=useState(''),[retryAt,setRetryAt]=useState(0),[clock,setClock]=useState(Date.now()),[recovery,setRecovery]=useState(false),[newPassword,setNewPassword]=useState(''),[mustChange,setMustChange]=useState(false);
const retrySeconds=Math.max(0,Math.ceil((retryAt-clock)/1000));
useEffect(()=>{if(!supabase||!session?.user?.id||!member)return;const touch=()=>{void supabase.from('ca_members').update({last_activity_at:new Date().toISOString()}).eq('user_id',session.user.id)};touch();const timer=setInterval(touch,5*60*1000);const onVisible=()=>{if(document.visibilityState==='visible')touch()};document.addEventListener('visibilitychange',onVisible);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',onVisible)};},[session?.user?.id,member]);
useEffect(()=>{if(!retryAt)return;const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[retryAt]);
useEffect(()=>{if(!supabase)return;const client=supabase;let alive=true;let revision=0;async function check(s:Session|null){const checkId=++revision;setSession(s);if(!s){setRecovery(false);setMustChange(false);setNewPassword('');}setMember(false);setRole('membre');setPermissions([]);setChecking(true);setFault('');if(s){try{const {data,error}=await client.from('ca_members').select('user_id,role,must_change_password,active').eq('user_id',s.user.id).maybeSingle();if(!alive||checkId!==revision)return;if(error)setFault('Impossible de vérifier votre accès. Réessayez dans un instant.');else {setMember(Boolean(data)&&data?.active!==false);setRole(data?.role||'membre');setMustChange(Boolean(data?.must_change_password));const {data:perms}=await client.from('ca_member_permissions').select('permission').eq('user_id',s.user.id);if(alive&&checkId===revision)setPermissions((perms||[]).map((p:any)=>p.permission));}}catch{if(alive&&checkId===revision)setFault('Impossible de vérifier votre accès. Réessayez.');}}if(alive&&checkId===revision)setChecking(false);}
let authTimer:ReturnType<typeof setTimeout>|undefined;
function lostSession(){
 ++revision;setSession(null);setRecovery(false);setMustChange(false);setNewPassword('');setMember(false);setRole('membre');setChecking(false);
 setFault('Votre session a expiré. Reconnectez-vous pour retrouver vos mails et les actualités.');
}
async function restore(){
 try{const {data,error}=await client.auth.getSession();if(!alive)return;
 if(error||!data.session){await check(null);return;}
 await check(data.session);
 }catch{if(alive){setChecking(false);setFault('Connexion indisponible. Réessayez.');}}
}
function resume(){if(document.visibilityState==='visible')void restore();}
const {data:{subscription}}=client.auth.onAuthStateChange((event,s)=>{ if(event==='PASSWORD_RECOVERY')setRecovery(true);
 // Wait until the Auth callback releases its lock before querying PostgREST.
 clearTimeout(authTimer);
 authTimer=setTimeout(()=>{if(alive)void check(s);},0);
});
window.addEventListener(SESSION_LOST_EVENT,lostSession);
window.addEventListener('pageshow',resume);
document.addEventListener('visibilitychange',resume);
return()=>{alive=false;++revision;clearTimeout(authTimer);subscription.unsubscribe();window.removeEventListener(SESSION_LOST_EVENT,lostSession);window.removeEventListener('pageshow',resume);document.removeEventListener('visibilitychange',resume);};},[]);

async function login(e:React.FormEvent){e.preventDefault();if(!supabase||sending)return;setSending(true);setNotice('');try{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}catch{setNotice('Adresse email ou mot de passe incorrect, ou compte non autorisé.');}finally{setSending(false);}}
async function resetPassword(){if(!supabase||sending)return;if(!email.trim()){setNotice('Entre d’abord ton adresse email.');return;}setSending(true);setNotice('');try{const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:'https://ffmc.fabreantoine.com/'});if(error)throw error;setNotice('Email envoyé. Ouvre le lien reçu pour définir ton mot de passe.');}catch(e:any){setNotice(e?.status===429?'Trop de demandes d’email ont été faites. Attends quelques minutes puis réessaie une seule fois.':'Impossible d’envoyer l’email de réinitialisation. Réessaie.');}finally{setSending(false);}}
async function saveNewPassword(e:React.FormEvent){
 e.preventDefault();if(!supabase||sending)return;
 setNotice('');
 if(newPassword.length<8){setNotice('Choisis au moins 8 caractères.');return;}
 if(!session){setRecovery(false);setMustChange(false);setNotice('Session expirée. Connecte-toi avec le mot de passe déjà enregistré.');return;}
 setSending(true);
 try{
  const {error}=await supabase.auth.updateUser({password:newPassword});
  if(error){
   setNotice(error.code==='same_password'?'Ce mot de passe est déjà enregistré. Utilise « Revenir à la connexion » pour te connecter avec celui-ci.':error.code==='weak_password'?'Ce mot de passe ne respecte pas les exigences de sécurité. Choisis un mot de passe plus long et varié.':error.status===429?'Trop de tentatives. Patiente quelques minutes.':'Modification impossible : la session peut avoir expiré. Reviens à la connexion et utilise ton mot de passe enregistré.');
   return;
  }
  const {data,error:memberError}=await supabase.from('ca_members').update({must_change_password:false}).eq('user_id',session.user.id).select('must_change_password').maybeSingle();
  if(memberError||!data||data.must_change_password){
   setNotice('Ton mot de passe est enregistré, mais la validation du compte a échoué. Contacte le coordinateur ; inutile de réinitialiser ton compte Google.');
   return;
  }
  setRecovery(false);setMustChange(false);setNewPassword('');
  setNotice('Mot de passe enregistré.');history.replaceState({},'',location.pathname);
 }catch{setNotice('Connexion interrompue. Réessaie ou reviens à la connexion avec ton mot de passe enregistré.');}
 finally{setSending(false);}
}
async function logout(){const {error}=await supabase!.auth.signOut();if(error)setFault('Déconnexion impossible. Réessayez.');}
if(session&&!checking&&(recovery||mustChange))return <main className="login-page"><div className="login-card"><div className="brand"><span>06</span><div>FFMC<strong>ESPACE CA</strong></div></div><ShieldCheck size={30}/><h1>Définir votre mot de passe</h1><p>Choisissez le mot de passe qui servira ensuite à vous connecter à l’espace CA.</p><form onSubmit={saveNewPassword}><label>Nouveau mot de passe</label><input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button className="primary" disabled={sending||newPassword.length<8}>{sending?'Enregistrement…':'Définir le mot de passe'}</button></form><button className="secondary" disabled={sending} onClick={async()=>{await logout();setRecovery(false);setMustChange(false);setNewPassword('');}}>Revenir à la connexion</button><p className="login-help">Ce mot de passe est propre à l’espace FFMC. Il ne change pas celui de ta messagerie Google.</p>{notice&&<p className="login-notice">{notice}</p>}</div></main>;
if(session&&member&&!checking&&previewOpen)return <><div className="preview-modal-backdrop"><div className="preview-modal"><h2>Voir comme un membre du CA</h2><p>Choisis les accès à simuler. Cela ne modifie aucun compte ni aucune permission réelle.</p><div className="preview-access-grid">{[['ca','Espace CA'],['actualites','Actualités'],['votes','Votes'],['secretariat','Secrétariat'],['administration','Administration / Documents'],['tresorerie','Trésorerie'],['voltigeurs','Voltigeurs'],['rmc','RMC · gestion des relais']].map(([id,label])=><label key={id}><input type="checkbox" checked={previewPermissions.includes(id)} onChange={e=>setPreviewPermissions(v=>e.target.checked?[...new Set([...v,id])]:v.filter(x=>x!==id))}/><span>{label}</span></label>)}</div><div className="form-actions"><button className="secondary" onClick={()=>setPreviewOpen(false)}>Annuler</button><button className="primary" onClick={()=>{setPreviewOpen(false);setPreview(true)}}>Prévisualiser</button></div></div></div></>;
if(session&&member&&!checking)return <><div className="account-bar"><span>{session.user.email} · {role==='coordinateur'?'Coordinateur':role==='charge_mission_voltigeurs'?'Chargé mission Voltigeurs':role==='voltigeur'?'Voltigeur':role==='secretaire'?'Secrétaire':'Membre du CA'}</span>{role==='coordinateur'&&<button onClick={()=>{if(preview){setPreview(false)}else{setPreviewPermissions(permissions);setPreviewOpen(true)}}}>{preview?'Quitter le mode aperçu':'Voir comme un membre du CA'}</button>}<button onClick={logout}><LogOut size={14}/> Se déconnecter</button>{fault&&<span role="alert">{fault}</span>}</div>{role==='coordinateur'&&!preview?<Dashboard key={session.user.id}/>:permissions.includes('ca')?<MemberPortal key={session.user.id+'-ca'} preview={preview} permissions={preview?previewPermissions:permissions} role={preview?'membre':role}/>:permissions.includes('voltigeurs')?<main className="workspace"><div className="page"><VoltigeursPortal key={session.user.id+'-volt'} role={role}/></div></main>:<MemberPortal key={session.user.id+'-member'} preview={preview} permissions={permissions} role={role}/>}</>;
return <main className="login-page"><div className="login-card"><div className="brand"><span>06</span><div>FFMC<strong>ESPACE CA</strong></div></div><ShieldCheck size={30}/><h1>{!configured?'L’espace se prépare':checking?'Vérification de votre accès…':session?'Accès au CA requis':'Bienvenue dans l’espace CA'}</h1>{!configured?<><p>La connexion des membres et la sauvegarde partagée doivent encore être activées par le coordinateur.</p><p>Les réunions, dossiers et échéances seront accessibles ici une fois cette configuration terminée.</p></>:checking?<p>Un instant, nous vérifions votre connexion.</p>:session?<><p>{fault||'Votre compte est connecté, mais n’est pas autorisé à consulter les informations du CA. Contactez le coordinateur.'}</p>{fault&&<button className="secondary" onClick={()=>location.reload()}>Réessayer</button>}<button className="secondary" onClick={logout}>Se déconnecter</button></>:<><p>Un espace réservé aux membres autorisés du conseil d’administration de la FFMC 06.</p><form onSubmit={login}><label htmlFor="email">Compte</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre adresse email"/><label htmlFor="password">Mot de passe</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary" disabled={sending}><LogIn size={18}/>{sending?'Connexion…':'Se connecter'}</button><button type="button" className="password-link" disabled={sending} onClick={resetPassword}>Définir / mot de passe oublié</button></form><p className="login-help">Pour protéger les informations du CA, le compte et le mot de passe sont demandés à chaque nouvelle ouverture du site.</p>{notice&&<p role="status" className="login-notice">{notice}</p>}{fault&&<p role="alert">{fault}</p>}</>}</div></main>;
}
const root=document.getElementById('root');
if(!root){document.body.innerHTML='<pre style="padding:24px">FFMC 06 — erreur critique : élément #root introuvable.</pre>';}else{createRoot(root).render(<React.StrictMode><GlobalErrorBoundary><App/></GlobalErrorBoundary></React.StrictMode>);}
