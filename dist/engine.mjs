export const defaultFilters=()=>({q:'',regions:[],directions:[],subjects:[],avoid:[],format:'',english:'',intake:'',contact:'',overseas:false,future:false,unknown:true,grad:'',hideGrad:false});
export function tokyoToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function status(p,today=tokyoToday()){
 if(p.deadline && p.deadline<today)return {key:'closed',text:'本批次已截止',tone:'muted'};
 if(p.preDeadline && p.preDeadline<today)return {key:'preclosed',text:'前置节点已过',tone:'amber'};
 return {key:'upcoming',text:'尚有准备窗口',tone:'green'};
}
export function scope(p){return [...new Set([...p.required,...p.choices.flatMap(g=>g.options.flat())])];}
export function avoidCompatible(p,avoid,includeUnknown=true){
 if(!avoid.length)return true;
 if(!p.examKnown)return includeUnknown;
 if(p.required.some(s=>avoid.includes(s)))return false;
 if(p.examPartial&&!includeUnknown)return false;
 return p.choices.every(g=>g.options.filter(option=>!option.some(s=>avoid.includes(s))).length>=g.choose);
}
export function matches(p,f,today=tokyoToday()){
 const hay=[p.school,p.en,p.code,p.group,p.program,p.route,p.aliases||'',p.city,...p.directions].join(' ').toLowerCase();
 if(f.q.trim()&&!hay.includes(f.q.trim().toLowerCase()))return false;
 if(f.regions.length&&!f.regions.includes(p.region))return false;
 if(f.directions.length&&!f.directions.some(d=>p.directions.includes(d)))return false;
 if(f.subjects.length&&!f.subjects.every(s=>scope(p).includes(s)))return false;
 if(!avoidCompatible(p,f.avoid,f.unknown))return false;
 if(f.format&&p.format!==f.format)return false;
 if(f.english&&!p.english.includes(f.english))return false;
 if(f.intake&&p.intake!==f.intake)return false;
 if(f.contact&&p.contact!==f.contact)return false;
 if(f.overseas&&p.overseas!=='yes')return false;
 if(f.future&&status(p,today).key!=='upcoming')return false;
 if(f.hideGrad&&f.grad&&p.gradDeadline&&f.grad>p.gradDeadline)return false;
 return true;
}
export function graduationConflict(p,grad){return !!(grad&&p.gradDeadline&&grad>p.gradDeadline);}
export function pendingTasks(p){return [...p.unknown,...(!p.examKnown?['考试科目细目尚待官方确认']:p.examPartial?['除已列基础范围外，专业口试具体内容须进一步确认']:[]),...(p.contact==='unknown'?['导师联系 / 内诺是否强制尚待确认']:[]),...(!p.japaneseKnown?['日语证书门槛或实际考试语言需确认']:[])];}
